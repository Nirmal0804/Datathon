"""Automated tests for In-Memory Response Cache Service and cached API endpoints."""

import time
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.cache import get_cache_service, CacheService


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_cache_service_key_generation():
    cache = CacheService()
    key1 = cache.make_cache_key("summary", district="Bengaluru", year=2024)
    key2 = cache.make_cache_key("summary", year=2024, district="Bengaluru")
    # Order independence
    assert key1 == key2
    assert "district=Bengaluru" in key1
    assert "year=2024" in key1


def test_cache_put_get_flow():
    cache = CacheService()
    key = "test_item_123"
    payload = {"status": "ok", "count": 42, "items": ["a", "b"]}

    assert cache.get(key) is None
    cache.put(key, payload, ttl_seconds=10)
    cached = cache.get(key)
    assert cached == payload


def test_cache_ttl_expiration():
    cache = CacheService()
    key = "test_ttl_item"
    payload = {"data": "temp"}

    cache.put(key, payload, ttl_seconds=1)
    assert cache.get(key) == payload

    time.sleep(1.1)
    # Expired item returns None
    assert cache.get(key) is None


def test_dashboard_summary_caching(client):
    # First request -> Cache MISS & store
    res1 = client.get("/api/v1/dashboard/summary")
    assert res1.status_code == 200
    data1 = res1.json()

    # Second request -> Cache HIT
    res2 = client.get("/api/v1/dashboard/summary")
    assert res2.status_code == 200
    data2 = res2.json()

    assert data1 == data2


def test_districts_caching(client):
    res1 = client.get("/api/v1/districts")
    assert res1.status_code == 200
    res2 = client.get("/api/v1/districts")
    assert res2.status_code == 200
    assert res1.json() == res2.json()


def test_analytics_caching(client):
    res1 = client.get("/api/v1/analytics/summary")
    assert res1.status_code == 200
    res2 = client.get("/api/v1/analytics/summary")
    assert res2.status_code == 200
    assert res1.json() == res2.json()


def test_map_intelligence_caching(client):
    res1 = client.get("/api/v1/map/intelligence/analytics")
    assert res1.status_code == 200
    res2 = client.get("/api/v1/map/intelligence/analytics")
    assert res2.status_code == 200
    assert res1.json() == res2.json()


def test_health_endpoints(client):
    res = client.get("/health")
    assert res.status_code == 200
    res_live = client.get("/health/live")
    assert res_live.status_code == 200
    res_ready = client.get("/health/ready")
    assert res_ready.status_code == 200
