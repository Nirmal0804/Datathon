"""Pydantic API schemas for the Field Officer Crime Map module.

These are HTTP response contracts — not internal data models.

Field Officer map endpoints expose operational FIR data with geospatial
coordinates for map marker rendering.  No person-level PII is included.
"""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Case summary (list items)
# ---------------------------------------------------------------------------


class FieldMapCaseSummary(BaseModel):
    """Single FIR record formatted for map marker rendering."""

    fir_id: str = Field(..., description="Stable FIR identifier")
    fir_number: str = Field(..., description="Human-readable FIR number")
    crime_head: str = Field(..., description="Top-level crime category")
    crime_subhead: str = Field(..., description="Detailed crime sub-category")
    status: str = Field(..., description="Case status")
    district: str = Field(..., description="District name")
    station_id: str = Field(..., description="Reporting station ID")
    station_name: str = Field(..., description="Reporting station name (resolved)")
    latitude: float = Field(..., description="Incident latitude")
    longitude: float = Field(..., description="Incident longitude")
    incident_date: datetime = Field(..., description="When the incident occurred")
    investigating_officer: str = Field(..., description="Assigned investigating officer")


# ---------------------------------------------------------------------------
# Paginated case list response
# ---------------------------------------------------------------------------


class FieldMapCaseListResponse(BaseModel):
    """Paginated response for GET /api/v1/map/field/cases."""

    items: List[FieldMapCaseSummary] = Field(
        ..., description="Page of FIR case records"
    )
    page: int = Field(..., description="Current page number (1-indexed)")
    page_size: int = Field(..., description="Number of items per page")
    total: int = Field(..., description="Total matching records")
    total_pages: int = Field(..., description="Total number of pages")


# ---------------------------------------------------------------------------
# Case detail (single FIR)
# ---------------------------------------------------------------------------


class FieldMapCaseDetail(BaseModel):
    """Detailed FIR record for case detail panel."""

    fir_id: str = Field(..., description="Stable FIR identifier")
    fir_number: str = Field(..., description="Human-readable FIR number")
    crime_head: str = Field(..., description="Top-level crime category")
    crime_subhead: str = Field(..., description="Detailed crime sub-category")
    bns_sections: str = Field(..., description="Applicable BNS/NDPS/IT Act sections")
    status: str = Field(..., description="Case status")
    district: str = Field(..., description="District name")
    station_id: str = Field(..., description="Reporting station ID")
    station_name: str = Field(..., description="Reporting station name (resolved)")
    latitude: float = Field(..., description="Incident latitude")
    longitude: float = Field(..., description="Incident longitude")
    incident_date: datetime = Field(..., description="When the incident occurred")
    fir_date: datetime = Field(..., description="When the FIR was registered")
    investigating_officer: str = Field(..., description="Assigned investigating officer")


# ---------------------------------------------------------------------------
# Filter metadata
# ---------------------------------------------------------------------------


class FieldMapDistrictFilter(BaseModel):
    """District entry for filter dropdown."""

    district_name: str = Field(..., description="District display name")


class FieldMapStationFilter(BaseModel):
    """Station entry for filter dropdown."""

    station_id: str = Field(..., description="Stable station identifier")
    station_name: str = Field(..., description="Station display name")


class FieldMapFiltersResponse(BaseModel):
    """Response for GET /api/v1/map/field/filters.

    Provides distinct filter values derived from repository data so the
    frontend can populate filter controls dynamically.
    """

    districts: List[FieldMapDistrictFilter] = Field(
        ..., description="Distinct district names (deterministic order)"
    )
    stations: List[FieldMapStationFilter] = Field(
        ..., description="All stations (sorted by station_id)"
    )
    crime_heads: List[str] = Field(
        ..., description="Distinct crime categories (sorted)"
    )
    statuses: List[str] = Field(
        ..., description="Distinct FIR statuses (sorted)"
    )


# ---------------------------------------------------------------------------
# Hotspots (shared between field and intelligence endpoints)
# ---------------------------------------------------------------------------


class FieldMapHotspotCell(BaseModel):
    """Single qualifying grid-cell hotspot for field officer view."""

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


class FieldMapHotspotResponse(BaseModel):
    """Response for GET /api/v1/map/field/hotspots."""

    hotspots: List[FieldMapHotspotCell] = Field(
        ..., description="Qualifying hotspot grid cells"
    )
    total_hotspots: int = Field(
        ..., description="Number of qualifying hotspot cells"
    )
