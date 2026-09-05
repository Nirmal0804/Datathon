"""District Intelligence API router.

Thin HTTP layer — parses query parameters, calls DistrictService,
returns typed Pydantic responses.  No business logic, no CSV access.
"""

from __future__ import annotations

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query, Request

from app.api.rbac_deps import require_permission
from app.core.cache import CatalystCacheService, get_cache_service
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
    request: Request,
    service: DistrictService = Depends(_get_district_service),
    cache: CatalystCacheService = Depends(get_cache_service),
    _identity: AuthenticatedIdentity = Depends(require_permission("districts.read")),
) -> DistrictListResponse:
    cache_key = "districts_list"
    cached = cache.get(cache_key, req=request)
    if cached is not None:
        return DistrictListResponse(**cached)

    result = service.list_all_districts()
    cache.put(cache_key, result, req=request)
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
    request: Request,
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
    cache: CatalystCacheService = Depends(get_cache_service),
    _identity: AuthenticatedIdentity = Depends(require_permission("districts.read")),
) -> DistrictIntelligenceProfile:
    cache_key = cache.make_cache_key(
        f"district_intelligence_{district_id}",
        start_date=start_date,
        end_date=end_date,
        crime_head=crime_head,
        status=status,
    )
    cached = cache.get(cache_key, req=request)
    if cached is not None:
        return DistrictIntelligenceProfile(**cached)

    result = service.get_district_intelligence(
        district_id=district_id,
        start_date=start_date,
        end_date=end_date,
        crime_head=crime_head,
        status=status,
    )
    cache.put(cache_key, result, req=request)
    return DistrictIntelligenceProfile(**result)
