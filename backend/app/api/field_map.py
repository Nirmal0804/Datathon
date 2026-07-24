"""Field Officer Crime Map API router.

Thin HTTP layer — parses query parameters, calls FieldMapService,
returns typed Pydantic responses.  No business logic, no CSV access.
"""

from __future__ import annotations

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.database.dependencies import RepositoryCollection, get_repositories
from app.schemas.field_map import (
    FieldMapCaseDetail,
    FieldMapCaseListResponse,
    FieldMapFiltersResponse,
)
from app.services.field_map_service import FieldMapService

router = APIRouter(prefix="/map/field", tags=["field-map"])


def _get_field_map_service(
    repos: RepositoryCollection = Depends(get_repositories),
) -> FieldMapService:
    """Build a FieldMapService from the shared repository collection."""
    return FieldMapService(
        fir_reader=repos.firs,
        fir_number_reader=repos.firs,
        station_reader=repos.stations,
        district_reader=repos.districts,
        station_list_reader=repos.stations,
    )


# ---------------------------------------------------------------------------
# GET /map/field/cases
# ---------------------------------------------------------------------------


@router.get(
    "/cases",
    response_model=FieldMapCaseListResponse,
    summary="Paginated FIR case list for field map",
    description="Returns map-ready FIR records with station name resolution. "
    "All filters are optional and combine with AND semantics. "
    "Search is case-insensitive against fir_id, fir_number, crime_head, "
    "and crime_subhead.",
)
async def list_field_cases(
    district: Optional[str] = Query(None, description="Filter by district name"),
    station_id: Optional[str] = Query(None, description="Filter by station ID"),
    crime_head: Optional[str] = Query(None, description="Filter by crime category"),
    status: Optional[str] = Query(None, description="Filter by case status"),
    start_date: Optional[date] = Query(
        None, description="Inclusive start date (YYYY-MM-DD)"
    ),
    end_date: Optional[date] = Query(
        None, description="Inclusive end date (YYYY-MM-DD)"
    ),
    search: Optional[str] = Query(
        None, description="Case-insensitive search across fir_id, fir_number, "
        "crime_head, crime_subhead"
    ),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(50, ge=1, le=200, description="Items per page (max 200)"),
    service: FieldMapService = Depends(_get_field_map_service),
) -> FieldMapCaseListResponse:
    result = service.get_cases(
        district=district,
        station_id=station_id,
        crime_head=crime_head,
        status=status,
        start_date=start_date,
        end_date=end_date,
        search=search,
        page=page,
        page_size=page_size,
    )
    return FieldMapCaseListResponse(**result)


# ---------------------------------------------------------------------------
# GET /map/field/case/{fir_identifier}
# ---------------------------------------------------------------------------


@router.get(
    "/case/{fir_identifier}",
    response_model=FieldMapCaseDetail,
    summary="Case detail by FIR ID",
    description="Returns operational FIR detail for the given FIR_ID. "
    "FIR_Number lookup is not supported via path parameter because "
    "FIR_Numbers contain slashes that conflict with URL routing. "
    "No person-level PII is exposed.",
)
async def get_field_case_detail(
    fir_identifier: str,
    service: FieldMapService = Depends(_get_field_map_service),
) -> FieldMapCaseDetail:
    result = service.get_case_detail(fir_identifier)
    return FieldMapCaseDetail(**result)


# ---------------------------------------------------------------------------
# GET /map/field/filters
# ---------------------------------------------------------------------------


@router.get(
    "/filters",
    response_model=FieldMapFiltersResponse,
    summary="Filter metadata for field map",
    description="Returns distinct district names, stations, crime categories, "
    "and statuses derived from repository data.",
)
async def get_field_filters(
    service: FieldMapService = Depends(_get_field_map_service),
) -> FieldMapFiltersResponse:
    result = service.get_filters()
    return FieldMapFiltersResponse(**result)
