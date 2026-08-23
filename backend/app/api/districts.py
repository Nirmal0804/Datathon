"""District Intelligence API router.

Thin HTTP layer — parses query parameters, calls DistrictService,
returns typed Pydantic responses.  No business logic, no CSV access.
"""

from __future__ import annotations

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.api.rbac_deps import require_permission
from app.database.dependencies import RepositoryCollection, get_repositories
from app.schemas.district import (
    DistrictIntelligenceProfile,
    DistrictListResponse,
)
from app.schemas.auth import AuthenticatedIdentity
from app.services.district_service import DistrictService

router = APIRouter(prefix="/districts", tags=["districts"])


def _get_district_service(
    repos: RepositoryCollection = Depends(get_repositories),
) -> DistrictService:
    """Build a DistrictService from the shared repository collection."""
    return DistrictService(
        district_reader=repos.districts,
        fir_reader=repos.firs,
        arrest_reader=repos.arrests,
        chargesheet_reader=repos.chargesheets,
    )


# ---------------------------------------------------------------------------
# GET /districts
# ---------------------------------------------------------------------------


@router.get(
    "",
    response_model=DistrictListResponse,
    summary="List all districts with aggregate statistics",
    description="Returns all 31 districts with transactional metrics derived "
    "from FIR, arrest, and chargesheet data. Districts with zero "
    "transactional data are included with zero-valued statistics.",
)
async def list_districts(
    service: DistrictService = Depends(_get_district_service),
    _identity: AuthenticatedIdentity = Depends(require_permission("districts.read")),
) -> DistrictListResponse:
    result = service.list_all_districts()
    return DistrictListResponse(**result)


# ---------------------------------------------------------------------------
# GET /districts/{district_id}/intelligence
# ---------------------------------------------------------------------------


@router.get(
    "/{district_id}/intelligence",
    response_model=DistrictIntelligenceProfile,
    summary="District intelligence profile",
    description="Returns aggregate intelligence metrics for a single district. "
    "All filters are optional and combine with AND semantics.",
)
async def get_district_intelligence(
    district_id: int,
    start_date: Optional[date] = Query(
        None, description="Inclusive start date (YYYY-MM-DD)"
    ),
    end_date: Optional[date] = Query(
        None, description="Inclusive end date (YYYY-MM-DD)"
    ),
    crime_head: Optional[str] = Query(
        None, description="Filter by crime category"
    ),
    status: Optional[str] = Query(
        None, description="Filter by case status"
    ),
    service: DistrictService = Depends(_get_district_service),
    _identity: AuthenticatedIdentity = Depends(require_permission("districts.read")),
) -> DistrictIntelligenceProfile:
    result = service.get_district_intelligence(
        district_id=district_id,
        start_date=start_date,
        end_date=end_date,
        crime_head=crime_head,
        status=status,
    )
    return DistrictIntelligenceProfile(**result)
