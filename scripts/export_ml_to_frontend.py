"""
Export ML Output CSVs to JSON for Frontend Consumption
======================================================
Reads generated CSVs from outputs/ and exports structured JSON datasets into:
frontend/Datathon/CrimeAnalyticsPlatform/frontend/public/data/
"""

import os
import json
import pandas as pd

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUTPUTS_DIR = os.path.join(BASE_DIR, "outputs")
TARGET_DATA_DIR = os.path.join(
    BASE_DIR,
    "frontend",
    "public",
    "data"
)

os.makedirs(TARGET_DATA_DIR, exist_ok=True)

def export_hotspot_summaries():
    summaries_csv = os.path.join(OUTPUTS_DIR, "hotspot_summaries.csv")
    if os.path.exists(summaries_csv):
        df = pd.read_csv(summaries_csv)
        data = df.to_dict(orient="records")
        out_path = os.path.join(TARGET_DATA_DIR, "hotspot_summaries.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print(f"[SUCCESS] Exported {len(data)} hotspot clusters to {out_path}")

def export_hotspots_firs():
    hotspots_csv = os.path.join(OUTPUTS_DIR, "hotspots.csv")
    if os.path.exists(hotspots_csv):
        df = pd.read_csv(hotspots_csv)
        # Take the top 100 FIRs (or all if small, but top 100/200 keeps frontend fast)
        sample_df = df.head(200)
        data = sample_df.to_dict(orient="records")
        out_path = os.path.join(TARGET_DATA_DIR, "hotspots.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print(f"[SUCCESS] Exported {len(data)} FIR hotspot records to {out_path}")

def export_station_risks():
    risk_csv = os.path.join(OUTPUTS_DIR, "station_risk_scores.csv")
    if os.path.exists(risk_csv):
        df = pd.read_csv(risk_csv)
        data = df.to_dict(orient="records")
        out_path = os.path.join(TARGET_DATA_DIR, "station_risk_scores.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print(f"[SUCCESS] Exported {len(data)} police station risk scores to {out_path}")

def export_forecasts():
    forecast_csv = os.path.join(OUTPUTS_DIR, "crime_forecasts.csv")
    if os.path.exists(forecast_csv):
        df = pd.read_csv(forecast_csv)
        data = df.to_dict(orient="records")
        out_path = os.path.join(TARGET_DATA_DIR, "crime_forecasts.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print(f"[SUCCESS] Exported {len(data)} daily forecasts to {out_path}")

def export_kpi_summary():
    risk_csv = os.path.join(OUTPUTS_DIR, "station_risk_scores.csv")
    summaries_csv = os.path.join(OUTPUTS_DIR, "hotspot_summaries.csv")
    forecast_csv = os.path.join(OUTPUTS_DIR, "crime_forecasts.csv")

    tot_firs = 0
    tot_hotspots = 0
    tot_stations = 0
    tot_30day_forecast = 0.0

    if os.path.exists(risk_csv):
        risk_df = pd.read_csv(risk_csv)
        tot_stations = len(risk_df)
        tot_firs = int(risk_df["FIR_Count"].sum())

    if os.path.exists(summaries_csv):
        sum_df = pd.read_csv(summaries_csv)
        tot_hotspots = len(sum_df)

    if os.path.exists(forecast_csv):
        fc_df = pd.read_csv(forecast_csv)
        tot_30day_forecast = float(fc_df["Forecasted_Crime_Count"].sum())

    kpi_data = {
        "total_active_incidents": tot_firs,
        "high_risk_hotspots": tot_hotspots,
        "stations_monitored": tot_stations,
        "forecast_30day_total": round(tot_30day_forecast, 1)
    }

    out_path = os.path.join(TARGET_DATA_DIR, "dashboard_kpis.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(kpi_data, f, indent=2)
    print(f"[SUCCESS] Exported KPI dashboard metrics to {out_path}")

def main():
    export_hotspot_summaries()
    export_hotspots_firs()
    export_station_risks()
    export_forecasts()
    export_kpi_summary()
    print("[COMPLETED] All ML datasets exported to public/data successfully.")

if __name__ == "__main__":
    main()
