"""
Karnataka Police Crime Analytics Platform - Unified Prediction CLI Script
==========================================================================
Provides unified command-line inference across all trained ML models:
1. DBSCAN Geospatial Crime Hotspot Detection
2. Composite Crime Risk Index (CCRI) Station Scoring
3. Time-Series Daily Crime Forecasting

Author: Karnataka Police Analytics ML Engineering Team
"""

import os
import sys
import argparse
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, Optional

# File Paths Configuration
MODEL_DIR = "models"
OUTPUT_DIR = "outputs"
DBSCAN_MODEL_PATH = os.path.join(MODEL_DIR, "dbscan_hotspots.joblib")
RISK_MODEL_PATH = os.path.join(MODEL_DIR, "crime_risk_model.joblib")
FORECAST_MODEL_PATH = os.path.join(MODEL_DIR, "crime_forecasting_model.joblib")

HOTSPOTS_CSV_PATH = os.path.join(OUTPUT_DIR, "hotspots.csv")
HOTSPOT_SUMMARIES_CSV_PATH = os.path.join(OUTPUT_DIR, "hotspot_summaries.csv")
STATION_RISK_CSV_PATH = os.path.join(OUTPUT_DIR, "station_risk_scores.csv")
FORECAST_CSV_PATH = os.path.join(OUTPUT_DIR, "crime_forecasts.csv")

EARTH_RADIUS_KM = 6371.0088


class CrimeAnalyticsInferenceEngine:
    """Unified Inference Engine for Karnataka Police Crime Analytics Platform."""

    def __init__(self) -> None:
        """Initialize the inference engine and load all serialized model artifacts."""
        self.dbscan_meta: Optional[Dict[str, Any]] = None
        self.risk_meta: Optional[Dict[str, Any]] = None
        self.forecast_meta: Optional[Dict[str, Any]] = None

        self._load_models()

    def _load_models(self) -> None:
        """Load trained models from disk with error checking."""
        missing_models = []
        for path, name in [
            (DBSCAN_MODEL_PATH, "DBSCAN Hotspot Model"),
            (RISK_MODEL_PATH, "Crime Risk Model"),
            (FORECAST_MODEL_PATH, "Crime Forecasting Model")
        ]:
            if not os.path.exists(path):
                missing_models.append(f"{name} ({path})")

        if missing_models:
            print(f"[ERROR] Missing required trained model files: {', '.join(missing_models)}")
            print("Please run the training pipeline scripts under scripts/ first.")
            sys.exit(1)

        try:
            self.dbscan_meta = joblib.load(DBSCAN_MODEL_PATH)
            self.risk_meta = joblib.load(RISK_MODEL_PATH)
            self.forecast_meta = joblib.load(FORECAST_MODEL_PATH)
        except Exception as e:
            print(f"[ERROR] Failed to load model artifacts: {str(e)}")
            sys.exit(1)

    def query_station_risk(self, station_id: str) -> None:
        """Query and display risk metrics for a specific Police Station ID.

        Args:
            station_id (str): Police Station Identifier (e.g., PS0069)
        """
        station_id_clean = station_id.strip().upper()
        if not os.path.exists(STATION_RISK_CSV_PATH):
            print(f"[ERROR] Risk scores dataset not found at {STATION_RISK_CSV_PATH}")
            return

        df = pd.read_csv(STATION_RISK_CSV_PATH)
        station_row = df[df['Station_ID'].str.upper() == station_id_clean]

        if station_row.empty:
            valid_ids = df['Station_ID'].head(5).tolist()
            print(f"[ERROR] Police Station ID '{station_id}' not found.")
            print(f"Sample valid Station IDs: {', '.join(valid_ids)}")
            return

        row = station_row.iloc[0]
        rank = row['Risk_Rank']
        name = row['Station_Name']
        district = row['District']
        zone = row['Zone']
        score = row['Risk_Score']
        tier = row['Risk_Tier']
        firs = row['FIR_Count']
        severity = row['Severity_Load']
        hotspots = row['Hotspot_Count']
        personnel = row['Personnel_Strength']
        vehicles = row['Patrol_Vehicles']

        print("\n" + "=" * 65)
        print(f"POLICE STATION CRIME RISK REPORT: {station_id_clean}")
        print("=" * 65)
        print(f"Station Name     : {name}")
        print(f"District / Zone  : {district} ({zone} Zone)")
        print(f"Risk Rank        : #{rank} out of {len(df)} Stations")
        print(f"Composite Risk   : {score:.2f} / 100 ({tier} Tier)")
        print("-" * 65)
        print("KEY RISK CONTRIBUTING FACTORS:")
        print(f"  - Total FIR Count        : {firs} incidents")
        print(f"  - Total Crime Severity   : {severity:.1f} severity load")
        print(f"  - Spatial Hotspots       : {hotspots} DBSCAN clusters")
        print(f"  - Police Personnel       : {personnel} officers assigned")
        print(f"  - Patrol Mobility        : {vehicles} patrol vehicles available")
        print("-" * 65)
        print("FACTOR CONTRIBUTION BREAKDOWN:")
        print(f"  - Severity Weight Impact : {row.get('z_Severity', 0)*30:.1f} / 30 pts")
        print(f"  - Incident Volume Impact : {row.get('z_FIR', 0)*20:.1f} / 20 pts")
        print(f"  - Spatial Hotspot Impact : {row.get('z_Hotspot', 0)*20:.1f} / 20 pts")
        print(f"  - Personnel Shortfall    : {row.get('z_Personnel_Deficit', 0)*10:.1f} / 10 pts")
        print("=" * 65 + "\n")

    def query_location_hotspot(self, lat: float, lon: float) -> None:
        """Query if a geographic coordinate falls inside a DBSCAN hotspot.

        Args:
            lat (float): Latitude coordinate in degrees
            lon (float): Longitude coordinate in degrees
        """
        # Coordinate boundary validation for Karnataka region
        if not (11.0 <= lat <= 19.0 and 74.0 <= lon <= 79.0):
            print(f"[WARNING] Coordinates ({lat:.6f}, {lon:.6f}) fall outside Karnataka state boundaries.")

        centroids: Dict[int, Tuple[float, float]] = self.dbscan_meta['cluster_centroids']
        eps_km: float = self.dbscan_meta['eps_km']

        # Find nearest centroid using Haversine distance
        min_dist = float('inf')
        nearest_cluster = -1

        lat1, lon1 = np.radians(lat), np.radians(lon)

        for c_id, (c_lat, c_lon) in centroids.items():
            lat2, lon2 = np.radians(c_lat), np.radians(c_lon)
            dlat = lat2 - lat1
            dlon = lon2 - lon1
            a = np.sin(dlat / 2.0)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2.0)**2
            dist_km = 2 * EARTH_RADIUS_KM * np.arcsin(np.sqrt(a))

            if dist_km < min_dist:
                min_dist = dist_km
                nearest_cluster = c_id

        is_inside_hotspot = min_dist <= eps_km

        print("\n" + "=" * 65)
        print(f"GEOSPATIAL HOTSPOT ANALYSIS: ({lat:.6f}, {lon:.6f})")
        print("=" * 65)
        print(f"Hotspot Status        : {'INSIDE HOTSPOT CLUSTER' if is_inside_hotspot else 'OUTSIDE ACTIVE HOTSPOT'}")
        
        if is_inside_hotspot:
            print(f"Assigned Cluster ID   : Cluster #{nearest_cluster}")
            print(f"Distance to Centroid  : {min_dist:.3f} km (Cluster Radius: {eps_km:.1f} km)")
            
            # Fetch cluster metadata from summary CSV if available
            if os.path.exists(HOTSPOT_SUMMARIES_CSV_PATH):
                summary_df = pd.read_csv(HOTSPOT_SUMMARIES_CSV_PATH)
                c_row = summary_df[summary_df['Cluster_ID'] == nearest_cluster]
                if not c_row.empty:
                    cr = c_row.iloc[0]
                    print(f"Primary Crime Type    : {cr['Primary_Crime_Head']}")
                    print(f"District Jurisdiction : {cr['Primary_District']}")
                    print(f"Total Cluster Crimes  : {cr['Total_Crimes']} incidents")
                    print(f"Cluster Severity Load : {cr['Total_Severity_Score']:.1f}")
        else:
            print(f"Nearest Cluster ID    : Cluster #{nearest_cluster}")
            print(f"Distance to Centroid  : {min_dist:.3f} km (Outside {eps_km:.1f} km threshold)")
        print("=" * 65 + "\n")

    def query_forecast(self, forecast_days: int) -> None:
        """Query crime forecasts for N days ahead.

        Args:
            forecast_days (int): Number of days to forecast (1 to 30)
        """
        if not (1 <= forecast_days <= 30):
            print("[ERROR] --forecast_days must be an integer between 1 and 30.")
            return

        if not os.path.exists(FORECAST_CSV_PATH):
            print(f"[ERROR] Forecast output file not found at {FORECAST_CSV_PATH}")
            return

        df = pd.read_csv(FORECAST_CSV_PATH).head(forecast_days)
        total_predicted = df['Forecasted_Crime_Count'].sum()
        avg_predicted = df['Forecasted_Crime_Count'].mean()

        print("\n" + "=" * 65)
        print(f"DAILY CRIME FORECAST REPORT (NEXT {forecast_days} DAYS)")
        print("=" * 65)
        print(f"Selected Model        : {self.forecast_meta.get('model_name', 'Linear Regression')}")
        print(f"Total Predicted Crimes: {total_predicted:.1f} incidents")
        print(f"Average Daily Volume  : {avg_predicted:.1f} incidents / day")
        print("-" * 65)
        print(f"{'Date':<14} {'Day of Week':<15} {'Predicted Daily Crime Volume'}")
        print("-" * 65)
        for _, r in df.iterrows():
            print(f"{r['Date']:<14} {r['Day_of_Week']:<15} {r['Forecasted_Crime_Count']:>8.2f} incidents")
        print("=" * 65 + "\n")

    def print_summary(self) -> None:
        """Display an operational dashboard summary across all ML pipeline components."""
        print("\n" + "=" * 70)
        print("      KARNATAKA POLICE CRIME ANALYTICS PLATFORM - SYSTEM SUMMARY")
        print("=" * 70)

        # 1. Dataset & Spatial Hotspots
        n_clusters = self.dbscan_meta.get('n_clusters', 0)
        eps_km = self.dbscan_meta.get('eps_km', 1.0)
        min_samples = self.dbscan_meta.get('min_samples', 10)

        print("\n[1] GEOSPATIAL CRIME HOTSPOT ANALYSIS (DBSCAN)")
        print(f"    - Spatial Distance Metric : Haversine (Spherical)")
        print(f"    - Search Radius (eps)     : {eps_km} km")
        print(f"    - Minimum Cluster Samples : {min_samples} incidents")
        print(f"    - Total Hotspot Clusters  : {n_clusters} active clusters")

        # 2. Risk Scores
        if os.path.exists(STATION_RISK_CSV_PATH):
            risk_df = pd.read_csv(STATION_RISK_CSV_PATH)
            n_stations = len(risk_df)
            n_critical = len(risk_df[risk_df['Risk_Tier'] == 'Critical'])
            n_high = len(risk_df[risk_df['Risk_Tier'] == 'High'])
            n_med = len(risk_df[risk_df['Risk_Tier'] == 'Medium'])
            n_low = len(risk_df[risk_df['Risk_Tier'] == 'Low'])

            print("\n[2] COMPOSITE CRIME RISK INDEX (CCRI)")
            print(f"    - Total Police Stations   : {n_stations}")
            print(f"    - Risk Tier Breakdown     : Critical: {n_critical} | High: {n_high} | Medium: {n_med} | Low: {n_low}")
            print("\n    TOP 5 HIGHEST RISK POLICE STATIONS:")
            top5 = risk_df[['Risk_Rank', 'Station_ID', 'Station_Name', 'District', 'Risk_Score', 'Risk_Tier']].head(5)
            for _, r in top5.iterrows():
                print(f"      #{r['Risk_Rank']:<2} [{r['Station_ID']}] {r['Station_Name']:<38} {r['District']:<15} Score: {r['Risk_Score']:>5.2f} ({r['Risk_Tier']})")

        # 3. Forecasting Evaluation
        f_eval = self.forecast_meta.get('evaluation_metrics', {})
        f_name = self.forecast_meta.get('model_name', 'N/A')

        print("\n[3] TIME-SERIES CRIME FORECASTING")
        print(f"    - Selected Model Algorithm: {f_name}")
        print(f"    - Model Performance Metrics: MAE = {f_eval.get('MAE', 'N/A')} | RMSE = {f_eval.get('RMSE', 'N/A')} | R^2 = {f_eval.get('R2_Score', 'N/A')}")
        
        if os.path.exists(FORECAST_CSV_PATH):
            fc_df = pd.read_csv(FORECAST_CSV_PATH)
            tot_30 = fc_df['Forecasted_Crime_Count'].sum()
            avg_30 = fc_df['Forecasted_Crime_Count'].mean()
            print(f"    - 30-Day Forecast Volume  : {tot_30:.1f} total incidents (Avg: {avg_30:.1f} / day)")

        print("=" * 70 + "\n")


def build_cli_parser() -> argparse.ArgumentParser:
    """Build and configure the command-line argument parser."""
    parser = argparse.ArgumentParser(
        description="Karnataka Police Crime Analytics Platform - Unified Inference CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument("--station", type=str, help="Police Station ID to query risk profile (e.g. PS0069)")
    parser.add_argument("--lat", type=float, help="Latitude coordinate (e.g. 11.858652)")
    parser.add_argument("--lon", type=float, help="Longitude coordinate (e.g. 77.054035)")
    parser.add_argument("--forecast_days", type=int, help="Number of days ahead to forecast crime volume (1 to 30)")
    parser.add_argument("--summary", action="store_true", help="Display full operational platform summary")

    return parser


def main() -> None:
    """Main execution function for prediction CLI."""
    parser = build_cli_parser()
    args = parser.parse_args()

    # If no arguments provided, print help
    if not (args.station or (args.lat is not None and args.lon is not None) or args.forecast_days or args.summary):
        parser.print_help()
        sys.exit(0)

    # Initialize Engine
    engine = CrimeAnalyticsInferenceEngine()

    # Handle Station Risk Query
    if args.station:
        engine.query_station_risk(args.station)

    # Handle Geospatial Hotspot Query
    if args.lat is not None or args.lon is not None:
        if args.lat is None or args.lon is None:
            print("[ERROR] Both --lat and --lon coordinates must be provided together.")
            sys.exit(1)
        engine.query_location_hotspot(args.lat, args.lon)

    # Handle Forecast Query
    if args.forecast_days:
        engine.query_forecast(args.forecast_days)

    # Handle Summary Query
    if args.summary:
        engine.print_summary()


if __name__ == "__main__":
    main()
