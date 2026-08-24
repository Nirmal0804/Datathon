"""ML Service Layer for Karnataka Police Crime Analytics Platform.

Interfaces between FastAPI routes and trained ML model artifacts (.joblib)
and pre-computed analytics datasets (.csv) under ml-engine/.
"""

from __future__ import annotations

import logging
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import joblib
import numpy as np
import pandas as pd

from app.core.config import settings
from app.core.exceptions import (
    InvalidFilterError,
    ModelUnavailableError,
    ResourceNotFoundError,
)

logger = logging.getLogger(__name__)

EARTH_RADIUS_KM = 6371.0088


class MLService:
    """Service managing ML inference and model artifact access."""

    def __init__(self, model_dir: str | Path, output_dir: str | Path) -> None:
        self.model_dir = Path(model_dir)
        self.output_dir = Path(output_dir)

        self.dbscan_model_path = self.model_dir / "dbscan_hotspots.joblib"
        self.risk_model_path = self.model_dir / "crime_risk_model.joblib"
        self.forecast_model_path = self.model_dir / "crime_forecasting_model.joblib"

        self.hotspots_csv_path = self.output_dir / "hotspots.csv"
        self.hotspot_summaries_csv_path = self.output_dir / "hotspot_summaries.csv"
        self.station_risk_csv_path = self.output_dir / "station_risk_scores.csv"
        self.forecast_csv_path = self.output_dir / "crime_forecasts.csv"

        self.dbscan_meta: Optional[Dict[str, Any]] = None
        self.risk_meta: Optional[Dict[str, Any]] = None
        self.forecast_meta: Optional[Dict[str, Any]] = None

        self._load_artifacts()

    def _load_artifacts(self) -> None:
        """Load trained ML joblib model artifacts from disk."""
        missing = []
        for path, name in [
            (self.dbscan_model_path, "DBSCAN Hotspot Model"),
            (self.risk_model_path, "Crime Risk Model"),
            (self.forecast_model_path, "Crime Forecasting Model"),
        ]:
            if not path.exists():
                missing.append(f"{name} ({path})")

        if missing:
            logger.warning(
                "Missing required ML model files: %s. ML service degraded.",
                ", ".join(missing),
            )

        try:
            if self.dbscan_model_path.exists():
                self.dbscan_meta = joblib.load(self.dbscan_model_path)
            if self.risk_model_path.exists():
                self.risk_meta = joblib.load(self.risk_model_path)
            if self.forecast_model_path.exists():
                self.forecast_meta = joblib.load(self.forecast_model_path)
        except Exception as exc:
            logger.error("Failed to deserialize ML joblib artifacts: %s", exc)
            raise ModelUnavailableError(
                f"Failed to load ML model artifacts: {exc}"
            ) from exc

    def check_location_hotspot(self, lat: float, lon: float) -> Dict[str, Any]:
        """Query if a geographic coordinate falls inside a DBSCAN hotspot cluster."""
        if not (11.0 <= lat <= 19.0 and 74.0 <= lon <= 79.0):
            raise InvalidFilterError(
                f"Coordinates ({lat}, {lon}) fall outside Karnataka region (lat 11-19, lon 74-79)."
            )

        if not self.dbscan_meta or "cluster_centroids" not in self.dbscan_meta:
            raise ModelUnavailableError("Geospatial DBSCAN model artifact is unavailable.")

        centroids: Dict[int, Tuple[float, float]] = self.dbscan_meta["cluster_centroids"]
        eps_km: float = float(self.dbscan_meta.get("eps_km", 1.0))

        min_dist = float("inf")
        nearest_cluster = -1

        lat1, lon1 = np.radians(lat), np.radians(lon)

        for c_id, (c_lat, c_lon) in centroids.items():
            lat2, lon2 = np.radians(c_lat), np.radians(c_lon)
            dlat = lat2 - lat1
            dlon = lon2 - lon1
            a = (
                np.sin(dlat / 2.0) ** 2
                + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2.0) ** 2
            )
            dist_km = float(2 * EARTH_RADIUS_KM * np.arcsin(np.sqrt(a)))

            if dist_km < min_dist:
                min_dist = dist_km
                nearest_cluster = c_id

        is_inside = min_dist <= eps_km
        summary_info: Optional[Dict[str, Any]] = None

        if is_inside and self.hotspot_summaries_csv_path.exists():
            try:
                summary_df = pd.read_csv(self.hotspot_summaries_csv_path)
                c_row = summary_df[summary_df["Cluster_ID"] == nearest_cluster]
                if not c_row.empty:
                    cr = c_row.iloc[0]
                    summary_info = {
                        "total_crimes": int(cr["Total_Crimes"]),
                        "total_severity_score": float(cr["Total_Severity_Score"]),
                        "primary_crime_head": str(cr["Primary_Crime_Head"]),
                        "primary_district": str(cr["Primary_District"]),
                    }
            except Exception as e:
                logger.warning("Could not read hotspot summaries CSV: %s", e)

        return {
            "latitude": round(lat, 6),
            "longitude": round(lon, 6),
            "is_inside_hotspot": is_inside,
            "cluster_id": nearest_cluster,
            "distance_to_centroid_km": round(min_dist, 3),
            "cluster_radius_km": eps_km,
            "cluster_summary": summary_info,
        }

    def get_station_risk(self, station_id: str) -> Dict[str, Any]:
        """Query Composite Crime Risk Index (CCRI) for a specific Police Station ID."""
        station_clean = station_id.strip().upper()

        if not self.station_risk_csv_path.exists():
            raise ModelUnavailableError("Station risk scores dataset is unavailable.")

        df = pd.read_csv(self.station_risk_csv_path)
        station_row = df[df["Station_ID"].str.upper() == station_clean]

        if station_row.empty:
            raise ResourceNotFoundError(
                f"Police Station ID '{station_id}' was not found in risk assessment database."
            )

        row = station_row.iloc[0]
        tot_stations = len(df)

        return {
            "station_id": str(row["Station_ID"]),
            "station_name": str(row["Station_Name"]),
            "district": str(row["District"]),
            "zone": str(row.get("Zone", "General")),
            "risk_rank": int(row["Risk_Rank"]),
            "total_stations": tot_stations,
            "risk_score": float(row["Risk_Score"]),
            "risk_tier": str(row["Risk_Tier"]),
            "metrics": {
                "fir_count": int(row["FIR_Count"]),
                "severity_load": float(row["Severity_Load"]),
                "hotspot_count": int(row["Hotspot_Count"]),
                "personnel_strength": int(row.get("Personnel_Strength", 0)),
                "patrol_vehicles": int(row.get("Patrol_Vehicles", 0)),
            },
            "factor_contributions": {
                "severity_weight_impact": round(float(row.get("z_Severity", 0)) * 30.0, 1),
                "incident_volume_impact": round(float(row.get("z_FIR", 0)) * 20.0, 1),
                "hotspot_impact": round(float(row.get("z_Hotspot", 0)) * 20.0, 1),
                "personnel_shortfall_impact": round(float(row.get("z_Personnel_Deficit", 0)) * 10.0, 1),
            },
        }

    def get_forecast(self, days: int = 30) -> Dict[str, Any]:
        """Query N-day daily crime volume forecast."""
        if not (1 <= days <= 30):
            raise InvalidFilterError("Forecast days parameter must be between 1 and 30.")

        if not self.forecast_csv_path.exists():
            raise ModelUnavailableError("Crime forecast dataset is unavailable.")

        df = pd.read_csv(self.forecast_csv_path).head(days)
        tot_pred = float(df["Forecasted_Crime_Count"].sum())
        avg_pred = float(df["Forecasted_Crime_Count"].mean())

        algo_name = "Random Forest / Linear Regression"
        metrics: Optional[Dict[str, float]] = None

        if self.forecast_meta:
            algo_name = str(self.forecast_meta.get("model_name", algo_name))
            raw_metrics = self.forecast_meta.get("evaluation_metrics", {})
            if raw_metrics:
                metrics = {
                    "mae": float(raw_metrics.get("MAE", 0.0)),
                    "rmse": float(raw_metrics.get("RMSE", 0.0)),
                    "r2_score": float(raw_metrics.get("R2_Score", 0.0)),
                }

        daily_records = []
        for _, r in df.iterrows():
            daily_records.append({
                "date": str(r["Date"]),
                "day_of_week": str(r.get("Day_of_Week", "")),
                "forecasted_crime_count": round(float(r["Forecasted_Crime_Count"]), 2),
            })

        return {
            "forecast_days": days,
            "model_algorithm": algo_name,
            "total_predicted_crimes": round(tot_pred, 1),
            "average_daily_volume": round(avg_pred, 1),
            "evaluation_metrics": metrics,
            "daily_forecasts": daily_records,
        }

    def get_hotspot_summaries(
        self, district: Optional[str] = None, min_crimes: Optional[int] = None
    ) -> Dict[str, Any]:
        """Fetch summary metrics for all DBSCAN crime hotspots."""
        if not self.hotspot_summaries_csv_path.exists():
            raise ModelUnavailableError("Hotspot summaries dataset is unavailable.")

        df = pd.read_csv(self.hotspot_summaries_csv_path)

        if district:
            df = df[df["Primary_District"].str.upper() == district.strip().upper()]

        if min_crimes is not None:
            df = df[df["Total_Crimes"] >= min_crimes]

        clusters = []
        for _, r in df.iterrows():
            clusters.append({
                "cluster_id": int(r["Cluster_ID"]),
                "centroid_latitude": float(r["Centroid_Latitude"]),
                "centroid_longitude": float(r["Centroid_Longitude"]),
                "total_crimes": int(r["Total_Crimes"]),
                "total_severity_score": float(r["Total_Severity_Score"]),
                "avg_severity_per_crime": float(r["Avg_Severity_Per_Crime"]),
                "primary_crime_head": str(r["Primary_Crime_Head"]),
                "primary_district": str(r["Primary_District"]),
            })

        return {
            "total_clusters": len(clusters),
            "clusters": clusters,
        }

    def get_station_risk_list(
        self, district: Optional[str] = None, risk_tier: Optional[str] = None
    ) -> Dict[str, Any]:
        """Fetch CCRI station risk score rankings."""
        if not self.station_risk_csv_path.exists():
            raise ModelUnavailableError("Station risk scores dataset is unavailable.")

        df = pd.read_csv(self.station_risk_csv_path)

        if district:
            df = df[df["District"].str.upper() == district.strip().upper()]

        if risk_tier:
            df = df[df["Risk_Tier"].str.upper() == risk_tier.strip().upper()]

        stations = []
        for _, r in df.iterrows():
            stations.append({
                "risk_rank": int(r["Risk_Rank"]),
                "station_id": str(r["Station_ID"]),
                "station_name": str(r["Station_Name"]),
                "district": str(r["District"]),
                "zone": str(r.get("Zone", "General")),
                "station_type": str(r.get("Station_Type", "Police Station")),
                "fir_count": int(r["FIR_Count"]),
                "severity_load": float(r["Severity_Load"]),
                "hotspot_count": int(r["Hotspot_Count"]),
                "personnel_strength": int(r.get("Personnel_Strength", 0)),
                "patrol_vehicles": int(r.get("Patrol_Vehicles", 0)),
                "risk_score": float(r["Risk_Score"]),
                "risk_tier": str(r["Risk_Tier"]),
            })

        critical_c = len([s for s in stations if s["risk_tier"].lower() == "critical"])
        high_c = len([s for s in stations if s["risk_tier"].lower() == "high"])
        med_c = len([s for s in stations if s["risk_tier"].lower() == "medium"])
        low_c = len([s for s in stations if s["risk_tier"].lower() == "low"])

        return {
            "total_stations": len(stations),
            "critical_count": critical_c,
            "high_count": high_c,
            "medium_count": med_c,
            "low_count": low_c,
            "stations": stations,
        }


@lru_cache(maxsize=1)
def get_ml_service() -> MLService:
    """Singleton provider for MLService instance."""
    return MLService(
        model_dir=settings.ML_MODEL_DIR,
        output_dir=settings.ML_OUTPUT_DIR,
    )
