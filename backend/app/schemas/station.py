"""Pydantic API schemas for the Station Reference module.

These are HTTP response contracts — not internal data models.
No person-level PII is included in any response.
"""

from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class StationListItem(BaseModel):
    """Single station reference record for list endpoint."""

    station_id: str = Field(..., description="Station identifier (e.g. PS0001)")
    station_name: str = Field(..., description="Station display name")
    district_id: int = Field(..., description="District foreign key")
    district_name: str = Field(..., description="District display name")
    zone: str = Field(..., description="Administrative zone")
    station_type: str = Field(..., description="Station classification")
    latitude: float = Field(..., description="Station latitude")
    longitude: float = Field(..., description="Station longitude")
    personnel_strength: int = Field(..., description="Number of assigned personnel")
    patrol_vehicles: int = Field(..., description="Number of patrol vehicles")
    contact_number: str = Field(..., description="Station contact number")
    email: str = Field(..., description="Station email address")


class StationListResponse(BaseModel):
    """Response for GET /api/v1/stations."""

    stations: List[StationListItem] = Field(
        ..., description="Station reference records (paginated)"
    )
    total_stations: int = Field(
        ..., description="Total stations matching filters (before pagination)"
    )
    total_pages: int = Field(
        ..., description="Total number of pages given the current page_size"
    )
    page: int = Field(..., description="Current page number (1-indexed)")
    page_size: int = Field(..., description="Items per page")


class StationDetailResponse(BaseModel):
    """Response for GET /api/v1/stations/{station_id}."""

    station_id: str = Field(..., description="Station identifier")
    station_name: str = Field(..., description="Station display name")
    district_id: int = Field(..., description="District foreign key")
    district_name: str = Field(..., description="District display name")
    zone: str = Field(..., description="Administrative zone")
    station_type: str = Field(..., description="Station classification")
    latitude: float = Field(..., description="Station latitude")
    longitude: float = Field(..., description="Station longitude")
    personnel_strength: int = Field(..., description="Number of assigned personnel")
    patrol_vehicles: int = Field(..., description="Number of patrol vehicles")
    contact_number: str = Field(..., description="Station contact number")
    email: str = Field(..., description="Station email address")
