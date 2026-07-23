import pandas as pd

def analyze_spatial_clusters(firs_df):
    """
    Computes spatial density summaries per District and Police Station.
    """
    if "Station_ID" not in firs_df.columns:
        raise ValueError("FIR DataFrame missing Station_ID column")

    station_counts = firs_df.groupby(["District", "Station_ID"]).size().reset_index(name="FIR_Count")
    station_counts = station_counts.sort_values("FIR_Count", ascending=False)
    
    top_stations = station_counts.head(5)
    print("=" * 60)
    print("TOP SPATIAL CRIME CONCENTRATIONS (STATIONS)")
    print("=" * 60)
    print(top_stations.to_string(index=False))
    return station_counts
