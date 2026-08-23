"""Network Analysis API router.

Thin HTTP layer — parses query parameters, calls NetworkService,
returns typed Pydantic response.  No business logic, no CSV access.

All endpoints require authentication.
"""

from __future__ import annotations

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Path, Query

from app.api.rbac_deps import require_any_permission, require_permission
from app.database.dependencies import RepositoryCollection, get_repositories
from app.schemas.network import (
    NetworkEntityDetail,
    NetworkGraphResponse,
    NetworkSearchResponse,
)
from app.schemas.auth import AuthenticatedIdentity
from app.services.network_service import NetworkService

router = APIRouter(prefix="/network", tags=["network"])


def _get_network_service(
    repos: RepositoryCollection = Depends(get_repositories),
) -> NetworkService:
    """Build a NetworkService from the shared repository collection."""
    return NetworkService(
        fir_reader=repos.firs,
        station_reader=repos.stations,
        district_reader=repos.districts,
    )


@router.get(
    "/graph",
    response_model=NetworkGraphResponse,
    summary="Network graph visualization data",
    description="Returns a bounded graph of FIR, person, station, and district "
    "nodes with evidence-backed relationship edges. All results are "
    "privacy-safe. Requires authentication.",
)
async def get_network_graph(
    district: Optional[str] = Query(None, description="Filter by district name"),
    station_id: Optional[str] = Query(None, description="Filter by police station ID"),
    fir_id: Optional[str] = Query(None, description="Filter by specific FIR ID"),
    crime_head: Optional[str] = Query(None, description="Filter by crime category"),
    start_date: Optional[date] = Query(None, description="Inclusive start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Inclusive end date (YYYY-MM-DD)"),
    service: NetworkService = Depends(_get_network_service),
    _identity: AuthenticatedIdentity = Depends(require_permission("network.read")),
) -> NetworkGraphResponse:
    result = service.get_graph(
        district=district,
        station_id=station_id,
        fir_id=fir_id,
        crime_head=crime_head,
        start_date=start_date,
        end_date=end_date,
    )
    return NetworkGraphResponse(**result)


@router.get(
    "/entities/{entity_type}/{entity_id}",
    response_model=NetworkEntityDetail,
    summary="Network entity detail",
    description="Returns privacy-safe detail for a specific network entity "
    "(person, fir, station, or district). Person entities expose only "
    "operational metadata — no PII. Requires authentication.",
)
async def get_entity_detail(
    entity_type: str = Path(
        ...,
        description="Entity type: 'person', 'fir', 'station', or 'district'",
        pattern="^(person|fir|station|district)$",
    ),
    entity_id: str = Path(..., description="Entity identifier"),
    service: NetworkService = Depends(_get_network_service),
    _identity: AuthenticatedIdentity = Depends(require_any_permission(["network.read", "network.person.read"])),
) -> NetworkEntityDetail:
    from app.core.exceptions import ResourceNotFoundError

    result = service.get_entity_detail(entity_type, entity_id)
    if result is None:
        raise ResourceNotFoundError(
            f"Entity not found: {entity_type}/{entity_id}"
        )
    return NetworkEntityDetail(**result)


@router.get(
    "/search",
    response_model=NetworkSearchResponse,
    summary="Search network entities",
    description="Search FIR IDs, FIR numbers, station names, district names, "
    "and crime heads. Does NOT search person names or PII. "
    "Requires authentication.",
)
async def search_network(
    q: str = Query(
        ...,
        description="Search query (minimum 2 characters)",
        min_length=2,
    ),
    limit: int = Query(
        50,
        description="Maximum number of results",
        ge=1,
        le=100,
    ),
    service: NetworkService = Depends(_get_network_service),
    _identity: AuthenticatedIdentity = Depends(require_permission("network.read")),
) -> NetworkSearchResponse:
    result = service.search(q, limit=limit)
    return NetworkSearchResponse(**result)
