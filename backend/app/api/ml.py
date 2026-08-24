"""ML Engine API Router for Karnataka Police Crime Analytics Platform.

Provides REST API endpoints for:
1. Geospatial DBSCAN Hotspot coordinate checks
2. Police Station Composite Crime Risk Index (CCRI) lookup
3. Time-Series Daily Crime Forecasting
4. Hotspot Cluster Summaries list
5. Station Risk Rankings list
"""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.api.rbac_deps import require_permission
from app.schemas.auth import AuthenticatedIdentity
from app.schemas.ml import (
    ForecastResponse,
    HotspotCheckRequest,
    HotspotCheckResponse,
    HotspotSummariesResponse,
    StationRiskListResponse,
    StationRiskResponse,
)
from app.services.ml_service import MLService, get_ml_service

router = APIRouter(prefix="/ml", tags=["ml"])


# ---------------------------------------------------------------------------
# POST /ml/hotspot/check
# ---------------------------------------------------------------------------


@router.post(
    "/hotspot/check",
    response_model=HotspotCheckResponse,
    summary="Check coordinate hotspot status",
    description="Analyzes given latitude and longitude coordinates against DBSCAN hotspot clusters. "
    "Returns cluster status, distance to nearest centroid, and cluster summary if inside.",
)
async def check_hotspot(
    payload: HotspotCheckRequest,
    service: MLService = Depends(get_ml_service),
    _identity: AuthenticatedIdentity = Depends(require_permission("map.intelligence.read")),
) -> HotspotCheckResponse:
    result = service.check_location_hotspot(payload.latitude, payload.longitude)
    return HotspotCheckResponse(**result)


# ---------------------------------------------------------------------------
# GET /ml/station/{station_id}/risk
# ---------------------------------------------------------------------------


@router.get(
    "/station/{station_id}/risk",
    response_model=StationRiskResponse,
    summary="Police Station Composite Risk profile",
    description="Queries Composite Crime Risk Index (CCRI) score, risk rank, tier, "
    "and AHP factor breakdown for a specific Police Station ID.",
)
async def get_station_risk_profile(
    station_id: str,
    service: MLService = Depends(get_ml_service),
    _identity: AuthenticatedIdentity = Depends(require_permission("map.intelligence.read")),
) -> StationRiskResponse:
    result = service.get_station_risk(station_id)
    return StationRiskResponse(**result)


# ---------------------------------------------------------------------------
# GET /ml/forecast
# ---------------------------------------------------------------------------


@router.get(
    "/forecast",
    response_model=ForecastResponse,
    summary="Time-series daily crime volume forecast",
    description="Returns N-day out-of-sample forward daily crime predictions "
    "and model benchmarking evaluation metrics.",
)
async def get_crime_forecast(
    days: int = Query(30, ge=1, le=30, description="Number of days to forecast (1 to 30)"),
    service: MLService = Depends(get_ml_service),
    _identity: AuthenticatedIdentity = Depends(require_permission("analytics.read")),
) -> ForecastResponse:
    result = service.get_forecast(days=days)
    return ForecastResponse(**result)


# ---------------------------------------------------------------------------
# GET /ml/hotspots/summary
# ---------------------------------------------------------------------------


@router.get(
    "/hotspots/summary",
    response_model=HotspotSummariesResponse,
    summary="DBSCAN hotspot cluster summaries",
    description="Returns list of all DBSCAN geospatial crime hotspot cluster summaries across Karnataka.",
)
async def get_hotspot_summaries_list(
    district: Optional[str] = Query(None, description="Filter by primary district name"),
    min_crimes: Optional[int] = Query(None, ge=1, description="Minimum incident count filter"),
    service: MLService = Depends(get_ml_service),
    _identity: AuthenticatedIdentity = Depends(require_permission("map.intelligence.read")),
) -> HotspotSummariesResponse:
    result = service.get_hotspot_summaries(district=district, min_crimes=min_crimes)
    return HotspotSummariesResponse(**result)


# ---------------------------------------------------------------------------
# GET /ml/stations/risk
# ---------------------------------------------------------------------------


@router.get(
    "/stations/risk",
    response_model=StationRiskListResponse,
    summary="Station risk rankings and metrics",
    description="Returns CCRI station risk scores and rankings for all evaluated police stations.",
)
async def get_station_risk_rankings(
    district: Optional[str] = Query(None, description="Filter by district name"),
    risk_tier: Optional[str] = Query(None, description="Filter by risk tier (Critical, High, Medium, Low)"),
    service: MLService = Depends(get_ml_service),
    _identity: AuthenticatedIdentity = Depends(require_permission("map.intelligence.read")),
) -> StationRiskListResponse:
    result = service.get_station_risk_list(district=district, risk_tier=risk_tier)
    return StationRiskListResponse(**result)
