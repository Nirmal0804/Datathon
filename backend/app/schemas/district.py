"""Pydantic API schemas for the District Intelligence module.

These are HTTP response contracts — not internal data models.
No person-level PII is included in any response.
"""

from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Shared breakdown schemas
# ---------------------------------------------------------------------------


class CrimeHeadBreakdown(BaseModel):
    """Single crime category count."""

    crime_head: str = Field(..., description="Crime category label")
    count: int = Field(..., description="Number of FIRs in this category")


class StatusBreakdown(BaseModel):
    """Single case status count."""

    status: str = Field(..., description="Case status label")
    count: int = Field(..., description="Number of FIRs with this status")


# ---------------------------------------------------------------------------
# District list item
# ---------------------------------------------------------------------------


class DistrictListItem(BaseModel):
    """Single district with aggregate statistics for list endpoint."""

    district_id: int = Field(..., description="Stable integer district identifier")
    district_name: str = Field(..., description="District display name")
    police_range: str = Field(..., description="Administrative police range")
    population: int = Field(..., description="District population")
    area_sq_km: int = Field(..., description="District area in square kilometres")
    population_density: int = Field(
        ..., description="Persons per square kilometre"
    )
    literacy_rate: float = Field(..., description="Literacy rate percentage")
    urban_population_pct: int = Field(..., description="Urban population percentage")
    rural_population_pct: int = Field(..., description="Rural population percentage")
    police_stations: int = Field(..., description="Number of police stations")
    latitude: float = Field(..., description="District centroid latitude")
    longitude: float = Field(..., description="District centroid longitude")

    fir_count: int = Field(..., description="Total FIRs for this district")
    active_cases: int = Field(
        ..., description="FIRs with status 'Under Investigation'"
    )
    closed_cases: int = Field(..., description="FIRs with status 'Closed'")
    chargesheeted_cases: int = Field(
        ..., description="FIRs with status 'Chargesheeted'"
    )
    untraced_cases: int = Field(..., description="FIRs with status 'Untraced'")

    total_arrests: int = Field(
        ..., description="Arrest records scoped to district FIRs"
    )
    total_chargesheets: int = Field(
        ..., description="Chargesheet records scoped to district FIRs"
    )

    crime_rate_per_100k: float = Field(
        ...,
        description="FIR count / population * 100,000; 0.0 when population <= 0",
    )
    fir_density_per_sq_km: float = Field(
        ...,
        description="FIR count / area_sq_km; 0.0 when area <= 0",
    )

    dominant_crime_type: Optional[str] = Field(
        None,
        description="Crime_Head with highest FIR count; null when no FIRs",
    )
    crime_head_breakdown: List[CrimeHeadBreakdown] = Field(
        ..., description="Crime category counts (count desc, alphabetical tie-break)"
    )
    status_breakdown: List[StatusBreakdown] = Field(
        ..., description="Case status counts (alphabetical order)"
    )

    hotspot_count: int = Field(
        ..., description="Number of qualifying hotspot grid cells (FIR count >= 3)"
    )


# ---------------------------------------------------------------------------
# District list response
# ---------------------------------------------------------------------------


class DistrictListResponse(BaseModel):
    """Response for GET /api/v1/districts."""

    districts: List[DistrictListItem] = Field(
        ..., description="All districts with aggregate statistics"
    )
    total_districts: int = Field(..., description="Total number of districts")


# ---------------------------------------------------------------------------
# District intelligence profile (detail endpoint)
# ---------------------------------------------------------------------------


class DistrictIntelligenceProfile(BaseModel):
    """District intelligence profile for detail endpoint."""

    district_id: int = Field(..., description="Stable integer district identifier")
    district_name: str = Field(..., description="District display name")
    police_range: str = Field(..., description="Administrative police range")
    population: int = Field(..., description="District population")
    area_sq_km: int = Field(..., description="District area in square kilometres")
    population_density: int = Field(
        ..., description="Persons per square kilometre"
    )
    literacy_rate: float = Field(..., description="Literacy rate percentage")
    urban_population_pct: int = Field(..., description="Urban population percentage")
    rural_population_pct: int = Field(..., description="Rural population percentage")
    police_stations: int = Field(..., description="Number of police stations")
    latitude: float = Field(..., description="District centroid latitude")
    longitude: float = Field(..., description="District centroid longitude")

    fir_count: int = Field(..., description="Total FIRs matching filters")
    active_cases: int = Field(
        ..., description="FIRs with status 'Under Investigation'"
    )
    closed_cases: int = Field(..., description="FIRs with status 'Closed'")
    chargesheeted_cases: int = Field(
        ..., description="FIRs with status 'Chargesheeted'"
    )
    untraced_cases: int = Field(..., description="FIRs with status 'Untraced'")

    total_arrests: int = Field(
        ..., description="Arrest records scoped to filtered FIRs"
    )
    total_chargesheets: int = Field(
        ..., description="Chargesheet records scoped to filtered FIRs"
    )

    crime_rate_per_100k: float = Field(
        ...,
        description="FIR count / population * 100,000; 0.0 when population <= 0",
    )
    fir_density_per_sq_km: float = Field(
        ...,
        description="FIR count / area_sq_km; 0.0 when area <= 0",
    )

    dominant_crime_type: Optional[str] = Field(
        None,
        description="Crime_Head with highest FIR count; null when no FIRs",
    )
    crime_head_breakdown: List[CrimeHeadBreakdown] = Field(
        ..., description="Crime category counts (count desc, alphabetical tie-break)"
    )
    status_breakdown: List[StatusBreakdown] = Field(
        ..., description="Case status counts (alphabetical order)"
    )

    hotspot_count: int = Field(
        ..., description="Number of qualifying hotspot grid cells (FIR count >= 3)"
    )
