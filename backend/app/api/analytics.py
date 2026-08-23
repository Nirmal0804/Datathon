"""Analytics & ML Engine API router.

Thin HTTP layer — exposes ML analytics endpoints.
Calls MLAnalyticsService and returns typed Pydantic responses.
No business logic, no direct file access, no ML model retraining.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.schemas.analytics import (
    DashboardMLSummaryPayload,
    ForecastPayload,
    HotspotsPayload,
    StationRiskPayload,
)
from app.services.ml_analytics_service import MLAnalyticsService

router = APIRouter(prefix="/analytics", tags=["analytics"])


def get_ml_analytics_service() -> MLAnalyticsService:
    """Dependency provider for MLAnalyticsService."""
    return MLAnalyticsService()


@router.get(
    "/hotspots",
    response_model=HotspotsPayload,
    summary="Geospatial crime hotspot detection analysis",
    description="Returns pre-computed DBSCAN spatial cluster summaries and assigned FIR hotspot records.",
)
async def get_hotspots(
    service: MLAnalyticsService = Depends(get_ml_analytics_service),
) -> HotspotsPayload:
    """Get DBSCAN geospatial hotspots analysis payload."""
    data = service.get_hotspots()
    return HotspotsPayload(**data)


@router.get(
    "/risk-scores",
    response_model=StationRiskPayload,
    summary="Station Composite Crime Risk Index (CCRI)",
    description="Returns station-level CCRI risk ranks, scores, tiers, and indicator factor breakdowns.",
)
async def get_risk_scores(
    service: MLAnalyticsService = Depends(get_ml_analytics_service),
) -> StationRiskPayload:
    """Get station risk scores payload."""
    data = service.get_station_risk_scores()
    return StationRiskPayload(**data)


@router.get(
    "/forecast",
    response_model=ForecastPayload,
    summary="Daily crime volume time-series forecast",
    description="Returns predicted daily crime incident volume for N days ahead (1 to 30 days).",
)
async def get_forecast(
    forecast_days: int = Query(
        default=30,
        ge=1,
        le=30,
        description="Number of days to forecast (1 to 30)",
    ),
    service: MLAnalyticsService = Depends(get_ml_analytics_service),
) -> ForecastPayload:
    """Get daily crime volume forecast payload."""
    data = service.get_forecast(forecast_days=forecast_days)
    return ForecastPayload(**data)


@router.get(
    "/summary",
    response_model=DashboardMLSummaryPayload,
    summary="Executive ML dashboard summary metrics",
    description="Returns aggregate spatial hotspot totals, station risk distributions, and 30-day forecast volume.",
)
async def get_summary(
    service: MLAnalyticsService = Depends(get_ml_analytics_service),
) -> DashboardMLSummaryPayload:
    """Get executive ML summary payload."""
    data = service.get_dashboard_ml_summary()
    return DashboardMLSummaryPayload(**data)
