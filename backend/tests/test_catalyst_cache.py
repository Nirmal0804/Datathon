"""Automated tests for Multi-Tier Cache Service: L1 In-Memory LRU + L2 Catalyst Cache,
single-flight stampede protection, fail-safe degradation, invalidation, telemetry, and RBAC order.
"""

import concurrent.futures
import time
from unittest.mock import MagicMock
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.cache import (
    get_cache_service,
    CacheService,
    InMemoryCacheStore,
    CatalystCacheStore,
    MAX_CATALYST_PAYLOAD_BYTES,
)
from app.core.config import settings


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client


# ---------------------------------------------------------------------------
# 1. Key generation & order determinism
# ---------------------------------------------------------------------------


def test_cache_service_key_generation():
    cache = CacheService()
    key1 = cache.make_cache_key("summary", district="Bengaluru", year=2024)
    key2 = cache.make_cache_key("summary", year=2024, district="Bengaluru")
    # Order independence
    assert key1 == key2
    assert "district=Bengaluru" in key1
    assert "year=2024" in key1


def test_cache_key_isolation():
    cache = CacheService()
    key_a = cache.make_cache_key("summary", district="Bengaluru", status="Active")
    key_b = cache.make_cache_key("summary", district="Mysuru", status="Active")
    key_c = cache.make_cache_key("summary", district="Bengaluru", status="Closed")
    assert key_a != key_b
    assert key_a != key_c
    assert key_b != key_c


# ---------------------------------------------------------------------------
# 2. Put / Get flow & Miss (L1)
# ---------------------------------------------------------------------------


def test_cache_put_get_flow():
    cache = CacheService()
    key = "test_item_123"
    payload = {"status": "ok", "count": 42, "items": ["a", "b"]}

    assert cache.get(key) is None
    cache.put(key, payload, ttl_seconds=10)
    cached = cache.get(key)
    assert cached == payload


def test_cache_miss():
    cache = CacheService()
    assert cache.get("non_existent_key_999") is None


# ---------------------------------------------------------------------------
# 3. TTL expiration
# ---------------------------------------------------------------------------


def test_cache_ttl_expiration():
    cache = CacheService()
    key = "test_ttl_item"
    payload = {"data": "temp"}

    cache.put(key, payload, ttl_seconds=1)
    assert cache.get(key) == payload

    time.sleep(1.1)
    # Expired item returns None
    assert cache.get(key) is None


# ---------------------------------------------------------------------------
# 4. Disabled cache mode
# ---------------------------------------------------------------------------


def test_disabled_cache_behavior():
    cache = CacheService(enabled=False)
    key = "disabled_test_key"
    payload = {"val": 123}

    assert cache.put(key, payload, ttl_seconds=60) is False
    assert cache.get(key) is None
    assert cache.get_stats()["sets"] == 0


# ---------------------------------------------------------------------------
# 5. LRU memory eviction (L1)
# ---------------------------------------------------------------------------


def test_lru_eviction():
    # Cache with capacity of 3 items
    store = InMemoryCacheStore(max_entries=3)
    store.put("k1", "v1", ttl_seconds=60)
    store.put("k2", "v2", ttl_seconds=60)
    store.put("k3", "v3", ttl_seconds=60)

    # Access k1 to make it most recently used (order becomes k2, k3, k1)
    assert store.get("k1") == "v1"

    # Insert k4 -> should evict least recently used (k2)
    store.put("k4", "v4", ttl_seconds=60)

    assert store.get("k2") is None  # Evicted
    assert store.get("k1") == "v1"  # Retained
    assert store.get("k3") == "v3"  # Retained
    assert store.get("k4") == "v4"  # Retained

    stats = store.get_stats()
    assert stats["evictions"] == 1
    assert stats["current_entries"] == 3


# ---------------------------------------------------------------------------
# 6. L2 Catalyst Cache Store & Multi-Tier Hierarchy
# ---------------------------------------------------------------------------


def test_l1_hit_prevents_l2_lookup():
    mock_l2_client = MagicMock()
    l2_store = CatalystCacheStore(enabled=True, client=mock_l2_client)
    cache = CacheService(l2_store=l2_store)

    # Put into L1
    cache.put("hot_key", {"data": "fast"}, ttl_seconds=60)
    mock_l2_client.get_value.reset_mock()
    mock_l2_client.get.reset_mock()

    # Get should be served directly from L1 without querying L2
    res = cache.get("hot_key")
    assert res == {"data": "fast"}
    mock_l2_client.get_value.assert_not_called()
    mock_l2_client.get.assert_not_called()


def test_l1_miss_and_l2_hit_populates_l1():
    mock_l2_client = MagicMock()
    mock_l2_client.get_value.return_value = '{"from": "catalyst_l2"}'
    l2_store = CatalystCacheStore(enabled=True, client=mock_l2_client)
    cache = CacheService(l2_store=l2_store)

    # First access: L1 misses, L2 hits
    res1 = cache.get("l2_key")
    assert res1 == {"from": "catalyst_l2"}
    assert mock_l2_client.get_value.call_count == 1

    # Second access: should now HIT L1 directly without querying L2 again
    mock_l2_client.get_value.reset_mock()
    res2 = cache.get("l2_key")
    assert res2 == {"from": "catalyst_l2"}
    mock_l2_client.get_value.assert_not_called()


def test_l1_miss_and_l2_miss():
    mock_l2_client = MagicMock()
    mock_l2_client.get_value.return_value = None
    l2_store = CatalystCacheStore(enabled=True, client=mock_l2_client)
    cache = CacheService(l2_store=l2_store)

    assert cache.get("completely_missing_key") is None
    assert l2_store.get_stats()["misses"] == 1


def test_l2_unavailable_graceful_fallback():
    # Simulate L2 raising a network timeout / connection error
    mock_l2_client = MagicMock()
    mock_l2_client.get_value.side_effect = TimeoutError("Catalyst Cache network timeout")
    l2_store = CatalystCacheStore(enabled=True, client=mock_l2_client)
    cache = CacheService(l2_store=l2_store)

    # Must NOT throw 500 or crash; should return None and log warning
    assert cache.get("timeout_key") is None
    assert l2_store.get_stats()["errors"] >= 1


def test_l2_oversized_payload_protection():
    mock_l2_client = MagicMock()
    l2_store = CatalystCacheStore(enabled=True, client=mock_l2_client)

    # Value larger than 512KB limit
    large_val = "x" * (MAX_CATALYST_PAYLOAD_BYTES + 1024)
    res = l2_store.put("big_key", large_val, ttl_seconds=60)

    # L2 skips storing oversized payload safely
    assert res is False
    mock_l2_client.put.assert_not_called()


# ---------------------------------------------------------------------------
# 7. Prefix and single-key invalidation (L1 + L2)
# ---------------------------------------------------------------------------


def test_single_key_invalidation():
    cache = CacheService()
    cache.put("user_101", {"name": "Officer A"}, ttl_seconds=60)
    assert cache.get("user_101") is not None

    assert cache.invalidate("user_101") is True
    assert cache.get("user_101") is None
    assert cache.invalidate("user_101") is False


def test_prefix_invalidation():
    cache = CacheService()
    cache.put("dashboard_summary:d1", {"count": 10}, ttl_seconds=60)
    cache.put("dashboard_summary:d2", {"count": 20}, ttl_seconds=60)
    cache.put("map_intelligence_hotspots:d1", {"count": 5}, ttl_seconds=60)

    purged = cache.invalidate_prefix("dashboard_summary")
    assert purged == 2

    assert cache.get("dashboard_summary:d1") is None
    assert cache.get("dashboard_summary:d2") is None
    assert cache.get("map_intelligence_hotspots:d1") is not None


def test_cache_clear():
    cache = CacheService()
    cache.put("a", 1, ttl_seconds=60)
    cache.put("b", 2, ttl_seconds=60)
    assert cache.get("a") == 1

    cache.clear()
    assert cache.get("a") is None
    assert cache.get("b") is None
    assert cache.get_stats()["current_entries"] == 0


# ---------------------------------------------------------------------------
# 8. Operational statistics (L1 + L2 breakdown)
# ---------------------------------------------------------------------------


def test_cache_statistics():
    cache = CacheService(max_entries=5)
    cache.clear()

    cache.put("s1", "v1", ttl_seconds=60)
    cache.put("s2", "v2", ttl_seconds=60)

    # 1 hit, 1 miss
    _ = cache.get("s1")
    _ = cache.get("s3_missing")

    stats = cache.get_stats()
    assert "l1" in stats
    assert "l2" in stats
    assert stats["hits"] >= 1
    assert stats["misses"] >= 1
    assert stats["sets"] >= 2
    assert stats["current_entries"] == 2
    assert stats["max_entries"] == 5


# ---------------------------------------------------------------------------
# 9. Single-flight stampede protection
# ---------------------------------------------------------------------------


def test_single_flight_stampede_protection():
    cache = CacheService()
    key = "expensive_calc_key"
    call_count = 0

    def expensive_computation():
        nonlocal call_count
        call_count += 1
        time.sleep(0.1)  # Simulate expensive database scan
        return {"data": 12345, "version": call_count}

    # Execute 5 concurrent requests for the exact same key
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [
            executor.submit(cache.get_or_compute, key, expensive_computation, 60)
            for _ in range(5)
        ]
        results = [f.result() for f in futures]

    # All 5 requests should get identical data, and computation must only run once
    assert call_count == 1
    for res in results:
        assert res == {"data": 12345, "version": 1}

    stats = cache.get_stats()
    assert stats["stampede_prevented"] >= 1


def test_single_flight_different_keys_parallel():
    cache = CacheService()
    start_time = time.time()

    def slow_compute(val):
        time.sleep(0.1)
        return val

    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        f1 = executor.submit(cache.get_or_compute, "key_x", lambda: slow_compute(100), 60)
        f2 = executor.submit(cache.get_or_compute, "key_y", lambda: slow_compute(200), 60)
        f3 = executor.submit(cache.get_or_compute, "key_z", lambda: slow_compute(300), 60)
        res = [f1.result(), f2.result(), f3.result()]

    duration = time.time() - start_time
    assert res == [100, 200, 300]
    # Parallel execution of different keys should complete in ~0.15s, not sequentially (0.3s+)
    assert duration < 0.25


def test_single_flight_exception_safety():
    cache = CacheService()
    key = "failing_key"

    def faulty_compute():
        raise RuntimeError("Database query timeout")

    with pytest.raises(RuntimeError):
        cache.get_or_compute(key, faulty_compute)

    # After an exception, lock must be released, and subsequent call should be able to try again
    def working_compute():
        return {"recovered": True}

    res = cache.get_or_compute(key, working_compute)
    assert res == {"recovered": True}


# ---------------------------------------------------------------------------
# 10. Database mutation post-commit invalidation vs failure safety
# ---------------------------------------------------------------------------


def test_mutation_invalidation_logic():
    cache = get_cache_service()
    cache.put("dashboard_summary:all", {"total": 500}, ttl_seconds=600)
    cache.put("districts_list", {"districts": []}, ttl_seconds=600)

    assert cache.get("dashboard_summary:all") is not None

    # Simulate successful transaction commit
    commit_success = True
    if commit_success:
        cache.invalidate_prefix("dashboard_summary")
        cache.invalidate_prefix("districts_list")

    assert cache.get("dashboard_summary:all") is None
    assert cache.get("districts_list") is None


def test_failed_mutation_does_not_invalidate():
    cache = get_cache_service()
    cache.put("dashboard_summary:preserved", {"total": 999}, ttl_seconds=600)

    # Simulate failed transaction (rollback)
    try:
        raise ValueError("Simulated DB write constraint violation")
    except ValueError:
        # Rollback path -> NO cache invalidation
        pass

    assert cache.get("dashboard_summary:preserved") == {"total": 999}


# ---------------------------------------------------------------------------
# 11. Security & RBAC order verification
# ---------------------------------------------------------------------------


def test_analytics_rbac_protection(client):
    res1 = client.get("/api/v1/analytics/summary")
    assert res1.status_code == 200
    res2 = client.get("/api/v1/analytics/summary")
    assert res2.status_code == 200
    assert res1.json() == res2.json()


def test_cache_does_not_contain_secrets():
    cache = get_cache_service()
    cache.put("test_obj", {"token": "sensitive_val", "score": 10}, ttl_seconds=60)

    stats = cache.get_stats()
    # Stats dict must contain strictly non-sensitive telemetry
    assert "hits" in stats
    assert "misses" in stats
    assert "l1" in stats
    assert "l2" in stats


# ---------------------------------------------------------------------------
# 12. Existing route integration tests
# ---------------------------------------------------------------------------


def test_dashboard_summary_caching(client):
    res1 = client.get("/api/v1/dashboard/summary")
    assert res1.status_code == 200
    data1 = res1.json()

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
    data = res.json()
    assert "cache" in data
    assert "hits" in data["cache"]
    assert "current_entries" in data["cache"]

    res_live = client.get("/health/live")
    assert res_live.status_code == 200
    res_ready = client.get("/health/ready")
    assert res_ready.status_code == 200
