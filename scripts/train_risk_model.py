import os
import joblib
import numpy as np
import pandas as pd

# Crime Severity Weights mapping (Harm-Weighted Policing standard)
SEVERITY_WEIGHTS = {
    'Murder': 5.0,
    'POCSO': 5.0,
    'NDPS': 4.0,
    'Assault': 3.0,
    'Burglary': 3.0,
    'Vehicle Theft': 2.0,
    'Theft': 2.0,
    'Cyber Crime': 1.5
}

# AHP-Derived Feature Weights
AHP_WEIGHTS = {
    'Severity_Load': 0.30,      # 30% Weight: Direct physical harm & crime severity load
    'FIR_Count': 0.20,          # 20% Weight: Operational crime frequency
    'Hotspot_Count': 0.20,      # 20% Weight: Spatial hotspot clustering density
    'Population_Density': 0.10, # 10% Weight: Environmental exposure & population density
    'Personnel_Deficit': 0.10,  # 10% Weight: Police personnel coverage shortfall
    'Patrol_Deficit': 0.10      # 10% Weight: Patrol vehicle mobility shortfall
}

def train_composite_risk_model(
    stations_path="datasets/stations.csv",
    districts_path="datasets/districts.csv",
    firs_path="datasets/firs.csv",
    hotspots_path="outputs/hotspots.csv",
    output_scores_path="outputs/station_risk_scores.csv",
    model_output_path="models/crime_risk_model.joblib"
):
    print("=" * 60)
    print("STARTING MODULE 2: COMPOSITE CRIME RISK SCORING (CCRI)")
    print("=" * 60)

    # 1. Load Data
    print("[1/5] Loading metadata datasets and spatial hotspot outputs...")
    stations = pd.read_csv(stations_path)
    districts = pd.read_csv(districts_path)
    
    if os.path.exists(hotspots_path):
        firs = pd.read_csv(hotspots_path)
        print("      Loaded spatial hotspots dataset.")
    else:
        firs = pd.read_csv(firs_path)
        firs['Cluster'] = -1
        print("      Loaded raw FIR dataset.")

    print(f"      Loaded {len(stations)} police stations across {len(districts)} districts.")

    # Map severity weights to FIR records
    firs['Severity_Weight'] = firs['Crime_Head'].map(lambda x: SEVERITY_WEIGHTS.get(x, 1.0))

    # 2. Station-Level Feature Aggregation
    print("[2/5] Engineering station-level risk features...")
    
    # Aggregate FIR metrics per station
    station_firs = firs.groupby('Station_ID').agg(
        FIR_Count=('FIR_ID', 'count'),
        Severity_Load=('Severity_Weight', 'sum'),
        Hotspot_Count=('Cluster', lambda s: (s[s != -1]).nunique())
    ).reset_index()

    # Merge with stations dataframe
    station_df = pd.merge(stations, station_firs, on='Station_ID', how='left')
    station_df['FIR_Count'] = station_df['FIR_Count'].fillna(0)
    station_df['Severity_Load'] = station_df['Severity_Load'].fillna(0.0)
    station_df['Hotspot_Count'] = station_df['Hotspot_Count'].fillna(0)

    # Merge with district demographics
    station_df = pd.merge(station_df, districts[['District', 'Population', 'Population_Density']], on='District', how='left')

    # Personnel and patrol response ratios
    stations_per_district = station_df.groupby('District')['Station_ID'].transform('count')
    estimated_pop_per_station = station_df['Population'] / np.maximum(stations_per_district, 1)
    
    # Police per 10,000 station population
    station_df['Personnel_Ratio'] = (station_df['Personnel_Strength'] / np.maximum(estimated_pop_per_station, 1)) * 10000.0
    # Patrol vehicles per 100 crimes
    station_df['Patrol_Ratio'] = (station_df['Patrol_Vehicles'] / (station_df['FIR_Count'] + 1.0)) * 100.0

    # 3. Min-Max Normalization & Deficit Calculation
    print("[3/5] Computing Min-Max normalized indicator scores and deficit indices...")
    
    def min_max_scale(series):
        min_v = series.min()
        max_v = series.max()
        if max_v == min_v:
            return pd.Series(0.0, index=series.index), min_v, max_v
        return (series - min_v) / (max_v - min_v), min_v, max_v

    norm_dict = {}
    
    # Positive risk features (higher = higher risk)
    station_df['z_Severity'], s_min, s_max = min_max_scale(station_df['Severity_Load'])
    station_df['z_FIR'], f_min, f_max = min_max_scale(np.log1p(station_df['FIR_Count']))
    station_df['z_Hotspot'], h_min, h_max = min_max_scale(station_df['Hotspot_Count'])
    station_df['z_PopDensity'], d_min, d_max = min_max_scale(station_df['Population_Density'])
    
    # Mitigating features (higher = lower risk -> convert to deficit index)
    z_personnel_raw, p_min, p_max = min_max_scale(station_df['Personnel_Ratio'])
    station_df['z_Personnel_Deficit'] = 1.0 - z_personnel_raw
    
    z_patrol_raw, v_min, v_max = min_max_scale(station_df['Patrol_Ratio'])
    station_df['z_Patrol_Deficit'] = 1.0 - z_patrol_raw

    scaler_limits = {
        'Severity_Load': (s_min, s_max),
        'FIR_Count_Log': (f_min, f_max),
        'Hotspot_Count': (h_min, h_max),
        'Population_Density': (d_min, d_max),
        'Personnel_Ratio': (p_min, p_max),
        'Patrol_Ratio': (v_min, v_max)
    }

    # 4. Composite Risk Index (CCRI) Calculation
    print("[4/5] Computing Composite Crime Risk Index (0-100 scale)...")
    
    raw_ccri = (
        AHP_WEIGHTS['Severity_Load'] * station_df['z_Severity'] +
        AHP_WEIGHTS['FIR_Count'] * station_df['z_FIR'] +
        AHP_WEIGHTS['Hotspot_Count'] * station_df['z_Hotspot'] +
        AHP_WEIGHTS['Population_Density'] * station_df['z_PopDensity'] +
        AHP_WEIGHTS['Personnel_Deficit'] * station_df['z_Personnel_Deficit'] +
        AHP_WEIGHTS['Patrol_Deficit'] * station_df['z_Patrol_Deficit']
    )

    # Scale to 0 - 100
    station_df['Risk_Score'] = (raw_ccri * 100.0).round(2)

    # Assign operational Risk Tier
    def assign_risk_tier(score):
        if score >= 75.0:
            return 'Critical'
        elif score >= 50.0:
            return 'High'
        elif score >= 25.0:
            return 'Medium'
        else:
            return 'Low'

    station_df['Risk_Tier'] = station_df['Risk_Score'].map(assign_risk_tier)

    # Sort stations by Risk Score descending
    station_df = station_df.sort_values(by='Risk_Score', ascending=False).reset_index(drop=True)
    station_df['Risk_Rank'] = station_df.index + 1

    # 5. Save Outputs & Model Serialization
    print(f"[5/5] Saving station risk scores to {output_scores_path}...")
    os.makedirs(os.path.dirname(output_scores_path), exist_ok=True)
    
    output_cols = [
        'Risk_Rank', 'Station_ID', 'Station_Name', 'District', 'Zone', 'Station_Type',
        'FIR_Count', 'Severity_Load', 'Hotspot_Count', 'Personnel_Strength', 'Patrol_Vehicles',
        'Risk_Score', 'Risk_Tier', 'z_Severity', 'z_FIR', 'z_Hotspot', 'z_Personnel_Deficit'
    ]
    station_df[output_cols].to_csv(output_scores_path, index=False)

    print(f"      Serializing risk model artifact to {model_output_path}...")
    os.makedirs(os.path.dirname(model_output_path), exist_ok=True)
    
    model_artifact = {
        'model_type': 'AHP-Weighted Composite Crime Risk Index (CCRI)',
        'ahp_weights': AHP_WEIGHTS,
        'severity_weights': SEVERITY_WEIGHTS,
        'scaler_limits': scaler_limits,
        'station_risk_lookup': station_df.set_index('Station_ID')[['Risk_Score', 'Risk_Tier', 'Risk_Rank']].to_dict(orient='index')
    }
    joblib.dump(model_artifact, model_output_path)

    print("\nSUCCESS: Module 2 Composite Crime Risk Scoring Completed.")
    print("=" * 60)
    print("TOP 5 HIGHEST RISK POLICE STATIONS IN KARNATAKA:")
    top5 = station_df[['Risk_Rank', 'Station_ID', 'Station_Name', 'District', 'FIR_Count', 'Severity_Load', 'Risk_Score', 'Risk_Tier']].head(5)
    print(top5.to_string(index=False))
    print("=" * 60)

if __name__ == "__main__":
    train_composite_risk_model()
