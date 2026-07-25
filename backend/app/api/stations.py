"""Station Reference API router.

Thin HTTP layer — parses query parameters, calls StationService,
returns typed Pydantic responses.  No business logic, no data access.
"""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.database.dependencies import RepositoryCollection, get_repositories
from app.schemas.station import StationDetailResponse, StationListResponse
from app.services.station_service import StationService

router = APIRouter(prefix="/stations", tags=["stations"])


def _get_station_service(
    repos: RepositoryCollection = Depends(get_repositories),
) -> StationService:
    """Build a StationService from the shared repository collection."""
    return StationService(
        station_list_reader=repos.stations,
        station_detail_reader=repos.stations,
        station_district_reader=repos.stations,
    )


# ---------------------------------------------------------------------------
# GET /stations
# ---------------------------------------------------------------------------


@router.get(
    "",
    response_model=StationListResponse,
    summary="List police stations with optional district filter",
    description="Returns paginated station reference data. "
    "All filters are optional. Pagination defaults to 50 per page.",
)
async def list_stations(
    district_id: Optional[int] = Query(
        None, description="Filter by district ID"
    ),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(
        50, ge=1, le=200, description="Items per page (max 200)"
    ),
    service: StationService = Depends(_get_station_service),
) -> StationListResponse:
    result = service.list_stations(
        district_id=district_id,
        page=page,
        page_size=page_size,
    )
    return StationListResponse(**result)


# ---------------------------------------------------------------------------
# GET /stations/{station_id}
# ---------------------------------------------------------------------------


@router.get(
    "/{station_id}",
    response_model=StationDetailResponse,
    summary="Station detail by ID",
    description="Returns reference data for a single police station. "
    "Returns 404 if the station ID is not found.",
)
async def get_station_detail(
    station_id: str,
    service: StationService = Depends(_get_station_service),
) -> StationDetailResponse:
    result = service.get_station_detail(station_id)
    return StationDetailResponse(**result)
