"""Dashboard API router.

Thin HTTP layer — parses query parameters, calls DashboardService,
returns typed Pydantic response.  No business logic, no CSV access.
"""

from __future__ import annotations

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.database.dependencies import RepositoryCollection, get_repositories
from app.schemas.dashboard import DashboardSummaryResponse
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _get_dashboard_service(
    repos: RepositoryCollection = Depends(get_repositories),
) -> DashboardService:
    """Build a DashboardService from the shared repository collection."""
    return DashboardService(
        fir_reader=repos.firs,
        arrest_reader=repos.arrests,
        chargesheet_reader=repos.chargesheets,
    )


@router.get(
    "/summary",
    response_model=DashboardSummaryResponse,
    summary="Dashboard summary statistics",
    description="Returns aggregate FIR, arrest and chargesheet counts. "
    "All filters are optional and combine with AND semantics.",
)
async def dashboard_summary(
    district: Optional[str] = Query(None, description="Filter by district name"),
    station_id: Optional[str] = Query(None, description="Filter by police station ID"),
    crime_head: Optional[str] = Query(None, description="Filter by crime category"),
    start_date: Optional[date] = Query(None, description="Inclusive start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Inclusive end date (YYYY-MM-DD)"),
    service: DashboardService = Depends(_get_dashboard_service),
) -> DashboardSummaryResponse:
    result = service.get_summary(
        district=district,
        station_id=station_id,
        crime_head=crime_head,
        start_date=start_date,
        end_date=end_date,
    )
    return DashboardSummaryResponse(**result)
