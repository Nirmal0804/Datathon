"""Unit and API integration tests for ML Engine endpoints."""

from __future__ import annotations

from fastapi.testclient import TestClient
import pytest

from app.main import app
from app.services.ml_service import MLService, get_ml_service


@pytest.fixture
def client():
    return TestClient(app)


def test_ml_service_location_hotspot_check():
    service = get_ml_service()
    # Test valid coordinates inside Karnataka
    result = service.check_location_hotspot(12.9716, 77.5946)
    assert "is_inside_hotspot" in result
    assert "distance_to_centroid_km" in result
    assert result["cluster_radius_km"] == 1.0


def test_ml_service_station_risk_lookup():
    service = get_ml_service()
    result = service.get_station_risk("PS0001")
    assert result["station_id"] == "PS0001"
    assert "risk_score" in result
    assert "risk_tier" in result
    assert "factor_contributions" in result


def test_ml_service_forecast():
    service = get_ml_service()
    result = service.get_forecast(days=7)
    assert result["forecast_days"] == 7
    assert len(result["daily_forecasts"]) == 7
    assert result["total_predicted_crimes"] > 0


def test_api_hotspot_check(client):
    response = client.post(
        "/api/v1/ml/hotspot/check",
        json={"latitude": 12.9716, "longitude": 77.5946},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["latitude"] == 12.9716
    assert data["longitude"] == 77.5946
    assert "is_inside_hotspot" in data


def test_api_station_risk(client):
    response = client.get("/api/v1/ml/station/PS0001/risk")
    assert response.status_code == 200
    data = response.json()
    assert data["station_id"] == "PS0001"
    assert "risk_score" in data
    assert "risk_tier" in data


def test_api_station_risk_not_found(client):
    response = client.get("/api/v1/ml/station/INVALID_STATION_9999/risk")
    assert response.status_code == 404
    data = response.json()
    assert "error" in data


def test_api_forecast(client):
    response = client.get("/api/v1/ml/forecast?days=14")
    assert response.status_code == 200
    data = response.json()
    assert data["forecast_days"] == 14
    assert len(data["daily_forecasts"]) == 14


def test_api_hotspots_summary(client):
    response = client.get("/api/v1/ml/hotspots/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_clusters" in data
    assert isinstance(data["clusters"], list)


def test_api_stations_risk_list(client):
    response = client.get("/api/v1/ml/stations/risk")
    assert response.status_code == 200
    data = response.json()
    assert "total_stations" in data
    assert isinstance(data["stations"], list)
