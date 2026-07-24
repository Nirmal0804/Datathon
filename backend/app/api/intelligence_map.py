"""Intelligence Analyst Crime Map API router.

Thin HTTP layer — parses query parameters, calls IntelligenceMapService,
returns typed Pydantic responses.  No business logic, no CSV access.
"""

from __future__ import annotations

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import PlainTextResponse

from app.database.dependencies import RepositoryCollection, get_repositories
from app.schemas.intelligence_map import (
    ClusterResponse,
    DistrictComparisonResponse,
    HeatmapResponse,
    HotspotResponse,
    IntelligenceAnalyticsResponse,
    TimelineResponse,
)
from app.services.intelligence_map_service import IntelligenceMapService

router = APIRouter(prefix="/map/intelligence", tags=["intelligence-map"])


def _get_intelligence_service(
    repos: RepositoryCollection = Depends(get_repositories),
) -> IntelligenceMapService:
    """Build an IntelligenceMapService from the shared repository collection."""
    return IntelligenceMapService(
        fir_reader=repos.firs,
        district_reader=repos.districts,
        station_reader=repos.stations,
        station_lookup=repos.stations,
    )


# ---------------------------------------------------------------------------
# GET /map/intelligence/analytics
# ---------------------------------------------------------------------------


@router.get(
    "/analytics",
    response_model=IntelligenceAnalyticsResponse,
    summary="Intelligence analytics KPIs",
    description="Returns typed KPIs derived from filtered FIR data. "
    "All filters are optional and combine with AND semantics.",
)
async def get_intelligence_analytics(
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
    service: IntelligenceMapService = Depends(_get_intelligence_service),
) -> IntelligenceAnalyticsResponse:
    result = service.get_analytics(
        district=district,
        station_id=station_id,
        crime_head=crime_head,
        status=status,
        start_date=start_date,
        end_date=end_date,
    )
    return IntelligenceAnalyticsResponse(**result)


# ---------------------------------------------------------------------------
# GET /map/intelligence/heatmap
# ---------------------------------------------------------------------------


@router.get(
    "/heatmap",
    response_model=HeatmapResponse,
    summary="Grid-aggregated heatmap data",
    description="Returns grid-aggregated FIR coordinates for heatmap rendering. "
    "All filters are optional and combine with AND semantics.",
)
async def get_intelligence_heatmap(
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
    service: IntelligenceMapService = Depends(_get_intelligence_service),
) -> HeatmapResponse:
    result = service.get_heatmap(
        district=district,
        station_id=station_id,
        crime_head=crime_head,
        status=status,
        start_date=start_date,
        end_date=end_date,
    )
    return HeatmapResponse(**result)


# ---------------------------------------------------------------------------
# GET /map/intelligence/clusters
# ---------------------------------------------------------------------------


@router.get(
    "/clusters",
    response_model=ClusterResponse,
    summary="Station-based crime clusters",
    description="Returns deterministic station-based aggregation for "
    "visualization. Uses authoritative station coordinates. "
    "Not ML clustering.",
)
async def get_intelligence_clusters(
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
    service: IntelligenceMapService = Depends(_get_intelligence_service),
) -> ClusterResponse:
    result = service.get_clusters(
        district=district,
        station_id=station_id,
        crime_head=crime_head,
        status=status,
        start_date=start_date,
        end_date=end_date,
    )
    return ClusterResponse(**result)


# ---------------------------------------------------------------------------
# GET /map/intelligence/hotspots
# ---------------------------------------------------------------------------


@router.get(
    "/hotspots",
    response_model=HotspotResponse,
    summary="Grid-based crime hotspots",
    description="Returns deterministic grid-cell hotspots (FIR count >= 3). "
    "Shared implementation with field officer hotspots.",
)
async def get_intelligence_hotspots(
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
    service: IntelligenceMapService = Depends(_get_intelligence_service),
) -> HotspotResponse:
    result = service.get_hotspots(
        district=district,
        station_id=station_id,
        crime_head=crime_head,
        status=status,
        start_date=start_date,
        end_date=end_date,
    )
    return HotspotResponse(**result)


# ---------------------------------------------------------------------------
# GET /map/intelligence/district-comparison
# ---------------------------------------------------------------------------


@router.get(
    "/district-comparison",
    response_model=DistrictComparisonResponse,
    summary="Per-district crime comparison",
    description="Returns per-district metrics including FIR count, population, "
    "area, crime rate per 100k, density, dominant crime type, and "
    "status breakdown.",
)
async def get_intelligence_district_comparison(
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
    service: IntelligenceMapService = Depends(_get_intelligence_service),
) -> DistrictComparisonResponse:
    result = service.get_district_comparison(
        district=district,
        station_id=station_id,
        crime_head=crime_head,
        status=status,
        start_date=start_date,
        end_date=end_date,
    )
    return DistrictComparisonResponse(**result)


# ---------------------------------------------------------------------------
# GET /map/intelligence/timeline
# ---------------------------------------------------------------------------


@router.get(
    "/timeline",
    response_model=TimelineResponse,
    summary="Crime timeline with daily/monthly granularity",
    description="Returns chronological FIR timeline buckets using Incident_Date. "
    "Supports 'daily' and 'monthly' granularity (default: monthly).",
)
async def get_intelligence_timeline(
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
    granularity: str = Query(
        "monthly",
        description="Time granularity: 'daily' or 'monthly' (default: monthly)",
    ),
    service: IntelligenceMapService = Depends(_get_intelligence_service),
) -> TimelineResponse:
    result = service.get_timeline(
        district=district,
        station_id=station_id,
        crime_head=crime_head,
        status=status,
        start_date=start_date,
        end_date=end_date,
        granularity=granularity,
    )
    return TimelineResponse(**result)


# ---------------------------------------------------------------------------
# GET /map/intelligence/export
# ---------------------------------------------------------------------------


@router.get(
    "/export",
    summary="Export filtered FIR scope as CSV",
    description="Returns a CSV download of filtered FIR data with only "
    "operational non-person fields. All standard filters apply.",
)
async def get_intelligence_export(
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
    service: IntelligenceMapService = Depends(_get_intelligence_service),
) -> PlainTextResponse:
    csv_content = service.get_export(
        district=district,
        station_id=station_id,
        crime_head=crime_head,
        status=status,
        start_date=start_date,
        end_date=end_date,
    )
    return PlainTextResponse(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": 'attachment; filename="crime_intelligence_export.csv"',
        },
    )
