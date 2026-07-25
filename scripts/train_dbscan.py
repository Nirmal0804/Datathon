import os
import joblib
import numpy as np
import pandas as pd
from sklearn.cluster import DBSCAN

# Earth radius in kilometers
EARTH_RADIUS_KM = 6371.0088

# Crime Severity Weights for calculating weighted hotspot risk
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

def train_geospatial_dbscan(
    input_path="datasets/firs.csv",
    output_hotspots_path="outputs/hotspots.csv",
    output_summary_path="outputs/hotspot_summaries.csv",
    model_output_path="models/dbscan_hotspots.joblib",
    eps_km=1.0,
    min_samples=10
):
    print("=" * 60)
    print("STARTING GEOSPATIAL DBSCAN HOTSPOT DETECTION MODULE")
    print("=" * 60)
    
    # 1. Load dataset
    print(f"[1/5] Loading dataset from {input_path}...")
    firs = pd.read_csv(input_path)
    print(f"      Loaded {len(firs)} FIR records.")

    # 2. Select and clean coordinates
    valid_coords_mask = firs['Latitude'].notnull() & firs['Longitude'].notnull()
    coords_deg = firs.loc[valid_coords_mask, ['Latitude', 'Longitude']].copy()
    
    # Convert lat/lon degrees to radians for Haversine metric
    coords_rad = np.radians(coords_deg[['Latitude', 'Longitude']])
    eps_rad = eps_km / EARTH_RADIUS_KM

    # 3. Fit DBSCAN model using Haversine metric
    print(f"[2/5] Training DBSCAN (eps={eps_km} km, min_samples={min_samples}, metric='haversine')...")
    dbscan = DBSCAN(eps=eps_rad, min_samples=min_samples, metric='haversine', algorithm='ball_tree')
    clusters = dbscan.fit_predict(coords_rad)

    # Assign cluster labels to FIR dataset
    firs['Cluster'] = -1
    firs.loc[coords_deg.index, 'Cluster'] = clusters

    n_clusters = len(set(clusters)) - (1 if -1 in clusters else 0)
    n_noise = list(clusters).count(-1)
    n_clustered = len(clusters) - n_noise

    print(f"      Extracted {n_clusters} spatial crime clusters.")
    print(f"      Clustered FIRs: {n_clustered} ({n_clustered/len(coords_deg)*100:.1f}%)")
    print(f"      Noise/Unclustered FIRs: {n_noise} ({n_noise/len(coords_deg)*100:.1f}%)")

    # 4. Calculate Cluster Summaries & Centroids
    print("[3/5] Computing cluster centroids, spatial stats, and severity scores...")
    firs['Severity_Weight'] = firs['Crime_Head'].map(lambda x: SEVERITY_WEIGHTS.get(x, 1.0))
    
    summary_list = []
    cluster_centroids = {}

    for cluster_id in range(n_clusters):
        cluster_mask = firs['Cluster'] == cluster_id
        cluster_firs = firs[cluster_mask]

        # Calculate mean lat/lon as centroid
        mean_lat = cluster_firs['Latitude'].mean()
        mean_lon = cluster_firs['Longitude'].mean()
        cluster_centroids[cluster_id] = (mean_lat, mean_lon)

        total_crimes = len(cluster_firs)
        total_severity = cluster_firs['Severity_Weight'].sum()
        top_crime = cluster_firs['Crime_Head'].mode()[0] if not cluster_firs.empty else 'N/A'
        top_district = cluster_firs['District'].mode()[0] if not cluster_firs.empty else 'N/A'

        summary_list.append({
            'Cluster_ID': cluster_id,
            'Centroid_Latitude': round(mean_lat, 6),
            'Centroid_Longitude': round(mean_lon, 6),
            'Total_Crimes': total_crimes,
            'Total_Severity_Score': round(total_severity, 2),
            'Avg_Severity_Per_Crime': round(total_severity / total_crimes, 2),
            'Primary_Crime_Head': top_crime,
            'Primary_District': top_district
        })

    summary_df = pd.DataFrame(summary_list).sort_values(by='Total_Severity_Score', ascending=False)

    # Calculate distance to centroid for each assigned crime
    def calc_distance_to_centroid(row):
        c_id = row['Cluster']
        if c_id == -1 or c_id not in cluster_centroids:
            return np.nan
        c_lat, c_lon = cluster_centroids[c_id]
        
        # Haversine formula in km
        lat1, lon1, lat2, lon2 = map(np.radians, [row['Latitude'], row['Longitude'], c_lat, c_lon])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = np.sin(dlat/2.0)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2.0)**2
        return round(2 * EARTH_RADIUS_KM * np.arcsin(np.sqrt(a)), 3)

    firs['Distance_To_Centroid_KM'] = firs.apply(calc_distance_to_centroid, axis=1)

    # 5. Save outputs and serialize model
    print(f"[4/5] Saving enriched dataset to {output_hotspots_path}...")
    os.makedirs(os.path.dirname(output_hotspots_path), exist_ok=True)
    firs.to_csv(output_hotspots_path, index=False)

    print(f"      Saving cluster summaries to {output_summary_path}...")
    summary_df.to_csv(output_summary_path, index=False)

    print(f"[5/5] Serializing model artifact to {model_output_path}...")
    os.makedirs(os.path.dirname(model_output_path), exist_ok=True)
    
    model_metadata = {
        'model': dbscan,
        'algorithm': 'DBSCAN-Haversine',
        'eps_km': eps_km,
        'min_samples': min_samples,
        'earth_radius_km': EARTH_RADIUS_KM,
        'n_clusters': n_clusters,
        'cluster_centroids': cluster_centroids,
        'severity_weights': SEVERITY_WEIGHTS
    }
    joblib.dump(model_metadata, model_output_path)
    
    print("\nSUCCESS: Geospatial DBSCAN Hotspot Module Completed.")
    print("=" * 60)
    print("TOP 5 HIGH-RISK CRIME HOTSPOTS:")
    print(summary_df.head(5).to_string(index=False))
    print("=" * 60)

if __name__ == "__main__":
    train_geospatial_dbscan()