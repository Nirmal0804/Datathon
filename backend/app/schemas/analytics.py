"""Pydantic response models for ML Analytics services.

Based directly on the actual ML output structures in ml-engine/outputs/:
- hotspots.csv
- hotspot_summaries.csv
- station_risk_scores.csv
- crime_forecasts.csv
"""

from __future__ import annotations

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class HotspotSummaryRecord(BaseModel):
    """Cluster summary record produced by DBSCAN geospatial model."""

    Cluster_ID: int = Field(..., description="Unique spatial cluster identifier")
    Centroid_Latitude: float = Field(..., description="Cluster centroid latitude")
    Centroid_Longitude: float = Field(..., description="Cluster centroid longitude")
    Total_Crimes: int = Field(..., description="Total FIR incidents in cluster")
    Total_Severity_Score: float = Field(..., description="Weighted severity load sum")
    Avg_Severity_Per_Crime: float = Field(..., description="Average crime severity ratio")
    Primary_Crime_Head: str = Field(..., description="Dominant crime type in cluster")
    Primary_District: str = Field(..., description="Primary administrative district")


class HotspotFIRRecord(BaseModel):
    """FIR incident assigned to a DBSCAN cluster or noise (-1)."""

    FIR_ID: str = Field(..., description="FIR unique identifier")
    FIR_Number: str = Field(..., description="Official FIR registration number")
    Station_ID: str = Field(..., description="Police Station ID")
    District: str = Field(..., description="District jurisdiction")
    Incident_Date: str = Field(..., description="Date and time of incident")
    FIR_Date: str = Field(..., description="Date and time of FIR filing")
    Crime_Head: str = Field(..., description="Primary crime category")
    Crime_Subhead: str = Field(..., description="Specific crime subcategory")
    BNS_Sections: Optional[str] = Field(None, description="Bhartiya Nyaya Sanhita sections")
    Latitude: float = Field(..., description="Latitude coordinate")
    Longitude: float = Field(..., description="Longitude coordinate")
    Complainant_ID: Optional[str] = Field(None, description="Complainant person ID")
    Victim_ID: Optional[str] = Field(None, description="Victim person ID")
    Accused_ID: Optional[str] = Field(None, description="Accused person ID")
    Investigating_Officer: Optional[str] = Field(None, description="Assigned investigating officer")
    Status: str = Field(..., description="Legal/investigation status")
    Cluster: int = Field(..., description="DBSCAN cluster ID (-1 for noise)")
    Severity_Weight: float = Field(..., description="Crime severity weight")
    Distance_To_Centroid_KM: Optional[float] = Field(None, description="Distance to cluster centroid in km")


class HotspotsPayload(BaseModel):
    """Complete payload for geospatial hotspot detection analysis."""

    summaries: List[HotspotSummaryRecord]
    hotspot_records: List[HotspotFIRRecord]
    total_clusters: int
    total_clustered_incidents: int


class FactorBreakdown(BaseModel):
    """Normalized indicator z-scores contributing to Composite Crime Risk Index."""

    z_Severity: float = Field(..., description="Severity load impact (30% weight)")
    z_FIR: float = Field(..., description="Log incident volume impact (20% weight)")
    z_Hotspot: float = Field(..., description="Hotspot density impact (20% weight)")
    z_Personnel_Deficit: float = Field(..., description="Personnel deficit impact (10% weight)")


class StationRiskRecord(BaseModel):
    """Police station composite crime risk index score and tier."""

    Risk_Rank: int = Field(..., description="Rank among all stations (1 = Highest Risk)")
    Station_ID: str = Field(..., description="Police Station ID")
    Station_Name: str = Field(..., description="Full station name")
    District: str = Field(..., description="District jurisdiction")
    Zone: str = Field(..., description="Zone jurisdiction")
    Station_Type: str = Field(..., description="Type of station")
    FIR_Count: int = Field(..., description="Total FIR count")
    Severity_Load: float = Field(..., description="Total crime severity load")
    Hotspot_Count: int = Field(..., description="Active DBSCAN hotspots count")
    Personnel_Strength: int = Field(..., description="Assigned personnel strength")
    Patrol_Vehicles: int = Field(..., description="Available patrol vehicles count")
    Risk_Score: float = Field(..., description="Composite Risk Score (0-100)")
    Risk_Tier: str = Field(..., description="Risk Tier (Critical, High, Medium, Low)")
    factor_breakdown: FactorBreakdown = Field(..., description="Detailed factor z-scores")


class StationRiskPayload(BaseModel):
    """Complete payload for station risk assessment."""

    total_stations: int
    risk_tier_counts: Dict[str, int]
    stations: List[StationRiskRecord]


class ForecastRecord(BaseModel):
    """Single day forecasted crime record."""

    Date: str = Field(..., description="Forecast date (YYYY-MM-DD)")
    Forecasted_Crime_Count: float = Field(..., description="Predicted daily incident volume")
    Forecast_Day: int = Field(..., description="Sequence day (1 to 30)")
    Day_of_Week: str = Field(..., description="Day of the week name")


class ForecastPayload(BaseModel):
    """Payload for time-series crime volume forecast."""

    forecast_days: int
    total_forecasted_crimes: float
    average_daily_crimes: float
    records: List[ForecastRecord]


class DashboardMLSummaryPayload(BaseModel):
    """Executive dashboard ML summary payload."""

    total_hotspots: int
    station_risk_distribution: Dict[str, int]
    total_stations_monitored: int
    forecast_days: int
    forecast_total_crimes: float
    forecast_daily_average: float
