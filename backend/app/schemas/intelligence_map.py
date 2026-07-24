"""Pydantic API schemas for the Intelligence Analyst Crime Map module.

These are HTTP response contracts — not internal data models.
No person-level PII is included in any response.
"""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Analytics KPIs
# ---------------------------------------------------------------------------


class IntelligenceAnalyticsResponse(BaseModel):
    """Response for GET /api/v1/map/intelligence/analytics."""

    total_crimes: int = Field(..., description="Count of FIRs in filtered scope")
    hotspot_count: int = Field(
        ..., description="Number of qualifying hotspot grid cells"
    )
    density_index: float = Field(
        ...,
        description="Filtered FIR count / total geographic area (sq km) "
        "of represented districts",
    )
    dominant_crime_type: Optional[str] = Field(
        None,
        description="Crime_Head with largest FIR count; "
        "alphabetical tie-break; null if no FIRs",
    )


# ---------------------------------------------------------------------------
# Heatmap
# ---------------------------------------------------------------------------


class HeatmapPoint(BaseModel):
    """Single grid-aggregated heatmap point."""

    latitude: float = Field(..., description="Grid cell center latitude")
    longitude: float = Field(..., description="Grid cell center longitude")
    weight: int = Field(..., description="FIR count in this grid cell")


class HeatmapResponse(BaseModel):
    """Response for GET /api/v1/map/intelligence/heatmap."""

    points: List[HeatmapPoint] = Field(
        ..., description="Grid-aggregated heatmap points"
    )
    total_points: int = Field(..., description="Number of heatmap points")


# ---------------------------------------------------------------------------
# Clusters (station-based)
# ---------------------------------------------------------------------------


class StatusBreakdown(BaseModel):
    """Case status counts for a cluster or district."""

    status: str = Field(..., description="Case status label")
    count: int = Field(..., description="Number of FIRs with this status")


class ClusterPoint(BaseModel):
    """Single station-based cluster."""

    station_id: str = Field(..., description="Station identifier")
    station_name: str = Field(..., description="Station display name")
    latitude: float = Field(..., description="Authoritative station latitude")
    longitude: float = Field(..., description="Authoritative station longitude")
    fir_count: int = Field(..., description="Number of FIRs at this station")
    dominant_crime_type: Optional[str] = Field(
        None, description="Most common Crime_Head; null if no FIRs"
    )
    status_breakdown: List[StatusBreakdown] = Field(
        ..., description="Case status distribution"
    )


class ClusterResponse(BaseModel):
    """Response for GET /api/v1/map/intelligence/clusters."""

    clusters: List[ClusterPoint] = Field(
        ..., description="Station-based cluster points"
    )
    total_clusters: int = Field(..., description="Number of station clusters")


# ---------------------------------------------------------------------------
# Hotspots (grid-based)
# ---------------------------------------------------------------------------


class HotspotCell(BaseModel):
    """Single qualifying grid-cell hotspot."""

    hotspot_id: str = Field(
        ..., description="Deterministic identifier for the grid cell"
    )
    center_latitude: float = Field(..., description="Grid cell center latitude")
    center_longitude: float = Field(
        ..., description="Grid cell center longitude"
    )
    fir_count: int = Field(..., description="Number of FIRs in this cell")
    dominant_crime_type: Optional[str] = Field(
        None, description="Most common Crime_Head in this cell"
    )
    districts: List[str] = Field(
        ..., description="Distinct districts represented in this cell"
    )


class HotspotResponse(BaseModel):
    """Response for hotspots endpoints."""

    hotspots: List[HotspotCell] = Field(
        ..., description="Qualifying hotspot grid cells"
    )
    total_hotspots: int = Field(
        ..., description="Number of qualifying hotspot cells"
    )


# ---------------------------------------------------------------------------
# District comparison
# ---------------------------------------------------------------------------


class DistrictComparisonRow(BaseModel):
    """Per-district comparison row."""

    district: str = Field(..., description="District name")
    fir_count: int = Field(..., description="Number of FIRs in this district")
    population: int = Field(..., description="District population")
    area_sq_km: int = Field(..., description="District area in sq km")
    crime_rate_per_100k: float = Field(
        ..., description="FIR count / population * 100,000"
    )
    density_per_sq_km: float = Field(
        ..., description="FIR count / area in sq km"
    )
    dominant_crime_type: Optional[str] = Field(
        None, description="Most common Crime_Head; null if no FIRs"
    )
    status_breakdown: List[StatusBreakdown] = Field(
        ..., description="Case status distribution"
    )


class DistrictComparisonResponse(BaseModel):
    """Response for GET /api/v1/map/intelligence/district-comparison."""

    districts: List[DistrictComparisonRow] = Field(
        ..., description="Per-district comparison rows"
    )
    total_districts: int = Field(
        ..., description="Number of districts in response"
    )


# ---------------------------------------------------------------------------
# Timeline
# ---------------------------------------------------------------------------


class TimelineBucket(BaseModel):
    """Single time bucket with FIR count and crime breakdown."""

    period: str = Field(..., description="Time period key (YYYY-MM or YYYY-MM-DD)")
    fir_count: int = Field(..., description="Number of FIRs in this period")
    crime_head_breakdown: List[dict] = Field(
        ..., description="Crime_Head counts for this period"
    )


class TimelineResponse(BaseModel):
    """Response for GET /api/v1/map/intelligence/timeline."""

    buckets: List[TimelineBucket] = Field(
        ..., description="Chronological time buckets"
    )
    total_buckets: int = Field(..., description="Number of time buckets")
    granularity: str = Field(
        ..., description="Granularity used: 'daily' or 'monthly'"
    )
