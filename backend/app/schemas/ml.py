"""Pydantic API schemas for ML Engine integration endpoints.

Defines HTTP request and response contracts for ML predictions, hotspot checks,
station risk scores, and time-series daily crime forecasting.
"""

from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# 1. Hotspot Geospatial Check
# ---------------------------------------------------------------------------


class HotspotCheckRequest(BaseModel):
    """Request payload for checking coordinate hotspot proximity."""

    latitude: float = Field(
        ...,
        ge=11.0,
        le=19.0,
        description="Latitude coordinate in degrees within Karnataka (11.0 to 19.0)",
    )
    longitude: float = Field(
        ...,
        ge=74.0,
        le=79.0,
        description="Longitude coordinate in degrees within Karnataka (74.0 to 79.0)",
    )


class ClusterSummary(BaseModel):
    """Summary metrics of assigned DBSCAN cluster."""

    total_crimes: int = Field(..., description="Total FIRs in cluster")
    total_severity_score: float = Field(..., description="Combined crime severity weight")
    primary_crime_head: str = Field(..., description="Dominant crime category in cluster")
    primary_district: str = Field(..., description="Primary district jurisdiction")


class HotspotCheckResponse(BaseModel):
    """Response payload for coordinate hotspot check."""

    latitude: float = Field(..., description="Query latitude")
    longitude: float = Field(..., description="Query longitude")
    is_inside_hotspot: bool = Field(..., description="True if coordinate is within cluster radius")
    cluster_id: int = Field(..., description="Nearest cluster ID")
    distance_to_centroid_km: float = Field(..., description="Distance to nearest centroid in km")
    cluster_radius_km: float = Field(..., description="DBSCAN eps search radius in km")
    cluster_summary: Optional[ClusterSummary] = Field(
        None, description="Detailed cluster summary if inside hotspot"
    )


# ---------------------------------------------------------------------------
# 2. Police Station Risk Profile
# ---------------------------------------------------------------------------


class StationRiskMetrics(BaseModel):
    """Operational metrics for station risk calculation."""

    fir_count: int = Field(..., description="Total FIR count")
    severity_load: float = Field(..., description="Cumulative crime severity load")
    hotspot_count: int = Field(..., description="DBSCAN hotspot clusters in jurisdiction")
    personnel_strength: int = Field(..., description="Assigned police personnel")
    patrol_vehicles: int = Field(..., description="Available patrol vehicles")


class StationRiskFactorContributions(BaseModel):
    """Breakdown of AHP factor points contributing to final CCRI score."""

    severity_weight_impact: float = Field(..., description="Impact points from crime severity (30 max)")
    incident_volume_impact: float = Field(..., description="Impact points from incident volume (20 max)")
    hotspot_impact: float = Field(..., description="Impact points from spatial hotspot density (20 max)")
    personnel_shortfall_impact: float = Field(..., description="Impact points from staffing deficit (10 max)")


class StationRiskResponse(BaseModel):
    """Response payload for police station composite risk profile."""

    station_id: str = Field(..., description="Police Station Identifier (e.g. PS0069)")
    station_name: str = Field(..., description="Police Station Name")
    district: str = Field(..., description="District Name")
    zone: str = Field(..., description="Administrative Zone")
    risk_rank: int = Field(..., description="Risk rank relative to all stations (1 is highest risk)")
    total_stations: int = Field(..., description="Total stations evaluated")
    risk_score: float = Field(..., description="Composite Crime Risk Index (0-100 score)")
    risk_tier: str = Field(..., description="Operational Risk Tier (Critical, High, Medium, Low)")
    metrics: StationRiskMetrics = Field(..., description="Station operational metrics")
    factor_contributions: StationRiskFactorContributions = Field(..., description="Factor contribution breakdown")


# ---------------------------------------------------------------------------
# 3. Time-Series Daily Crime Forecast
# ---------------------------------------------------------------------------


class DailyForecast(BaseModel):
    """Single day forecasted crime volume record."""

    date: str = Field(..., description="Forecast date (YYYY-MM-DD)")
    day_of_week: str = Field(..., description="Day of week name")
    forecasted_crime_count: float = Field(..., description="Predicted daily incident count")


class ForecastEvaluationMetrics(BaseModel):
    """Model benchmarking and evaluation performance metrics."""

    mae: float = Field(..., description="Mean Absolute Error")
    rmse: float = Field(..., description="Root Mean Squared Error")
    r2_score: float = Field(..., description="R^2 Coefficient of Determination")


class ForecastResponse(BaseModel):
    """Response payload for N-day forward crime volume forecasting."""

    forecast_days: int = Field(..., description="Number of days forecasted")
    model_algorithm: str = Field(..., description="Selected ML forecasting model name")
    total_predicted_crimes: float = Field(..., description="Total forecasted crimes over period")
    average_daily_volume: float = Field(..., description="Average daily forecasted crimes")
    evaluation_metrics: Optional[ForecastEvaluationMetrics] = Field(
        None, description="Model validation performance metrics"
    )
    daily_forecasts: List[DailyForecast] = Field(..., description="Daily breakdown of predictions")


# ---------------------------------------------------------------------------
# 4. Hotspot Cluster Summaries Collection
# ---------------------------------------------------------------------------


class HotspotSummaryItem(BaseModel):
    """Summary model for a single DBSCAN hotspot cluster."""

    cluster_id: int = Field(..., description="Cluster Identifier")
    centroid_latitude: float = Field(..., description="Centroid Latitude")
    centroid_longitude: float = Field(..., description="Centroid Longitude")
    total_crimes: int = Field(..., description="Total FIRs clustered")
    total_severity_score: float = Field(..., description="Combined severity load")
    avg_severity_per_crime: float = Field(..., description="Average severity per incident")
    primary_crime_head: str = Field(..., description="Primary crime category")
    primary_district: str = Field(..., description="Primary district jurisdiction")


class HotspotSummariesResponse(BaseModel):
    """Response payload for list of all DBSCAN hotspot cluster summaries."""

    total_clusters: int = Field(..., description="Total hotspot clusters")
    clusters: List[HotspotSummaryItem] = Field(..., description="List of cluster summaries")


# ---------------------------------------------------------------------------
# 5. Station Risk Scores Collection
# ---------------------------------------------------------------------------


class StationRiskItem(BaseModel):
    """Single station risk entry for risk ranking listing."""

    risk_rank: int = Field(..., description="Rank position (1 is highest risk)")
    station_id: str = Field(..., description="Station ID")
    station_name: str = Field(..., description="Station Name")
    district: str = Field(..., description="District Name")
    zone: str = Field(..., description="Zone Name")
    station_type: str = Field(..., description="Station Category/Type")
    fir_count: int = Field(..., description="Total FIRs")
    severity_load: float = Field(..., description="Severity score load")
    hotspot_count: int = Field(..., description="Spatial hotspots count")
    personnel_strength: int = Field(..., description="Police personnel count")
    patrol_vehicles: int = Field(..., description="Patrol vehicle count")
    risk_score: float = Field(..., description="Composite risk score (0-100)")
    risk_tier: str = Field(..., description="Risk tier classification")


class StationRiskListResponse(BaseModel):
    """Response payload for full station risk rankings."""

    total_stations: int = Field(..., description="Total stations evaluated")
    critical_count: int = Field(..., description="Count of Critical risk tier stations")
    high_count: int = Field(..., description="Count of High risk tier stations")
    medium_count: int = Field(..., description="Count of Medium risk tier stations")
    low_count: int = Field(..., description="Count of Low risk tier stations")
    stations: List[StationRiskItem] = Field(..., description="List of station risk records")
