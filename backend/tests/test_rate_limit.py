"""Rate limiting tests.

Covers the fixed-window limiter unit behaviour and end-to-end 429
responses through the middleware. These tests enable RATE_LIMIT_ENABLED
and use tight limits for determinism.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app
from app.core.rate_limit import FixedWindowRateLimiter, _default_limiter
from tests.conftest import (
    TEST_AUDIENCE,
    TEST_ISSUER,
    TEST_JWT_SECRET,
    create_test_jwt,
)


class TestFixedWindowLimiter:
    def test_allows_within_limit(self):
        clock = iter([100.0, 100.5, 101.0, 101.5])
        limiter = FixedWindowRateLimiter(now=lambda: next(clock))
        assert limiter.allow("k", limit=3, window_seconds=60) is True
        assert limiter.allow("k", limit=3, window_seconds=60) is True
        assert limiter.allow("k", limit=3, window_seconds=60) is True
        assert limiter.allow("k", limit=3, window_seconds=60) is False

    def test_window_rotation_resets_counter(self):
        clock = iter([100.0, 191.0])  # 91s later → new window
        limiter = FixedWindowRateLimiter(now=lambda: next(clock))
        assert limiter.allow("k", limit=1, window_seconds=60) is True
        assert limiter.allow("k", limit=1, window_seconds=60) is True

    def test_per_key_isolation(self):
        limiter = FixedWindowRateLimiter(now=lambda: 100.0)
        assert limiter.allow("a", limit=1, window_seconds=60) is True
        assert limiter.allow("a", limit=1, window_seconds=60) is False
        assert limiter.allow("b", limit=1, window_seconds=60) is True

    def test_reset_clears_counters(self):
        limiter = FixedWindowRateLimiter(now=lambda: 100.0)
        assert limiter.allow("k", limit=1, window_seconds=60) is True
        limiter.reset()
        assert limiter.allow("k", limit=1, window_seconds=60) is True


def _setup_auth(require_auth: bool = True) -> None:
    settings.REQUIRE_AUTH = require_auth
    settings.SUPABASE_JWT_SECRET = TEST_JWT_SECRET
    settings.SUPABASE_JWKS_URL = ""
    settings.SUPABASE_JWT_ISSUER = TEST_ISSUER
    settings.SUPABASE_JWT_AUDIENCE = TEST_AUDIENCE

    from app.core.jwt_auth import init_verifier

    init_verifier(
        jwt_secret=TEST_JWT_SECRET,
        jwks_url="",
        issuer=TEST_ISSUER,
        audience=TEST_AUDIENCE,
    )


@pytest.fixture
def rate_limit_client():
    """Client with rate limiting + auth enabled, reset counters."""
    _default_limiter.reset()
    orig_require_auth = settings.REQUIRE_AUTH
    orig_secret = settings.SUPABASE_JWT_SECRET
    orig_jwks = settings.SUPABASE_JWKS_URL
    orig_issuer = settings.SUPABASE_JWT_ISSUER
    orig_audience = settings.SUPABASE_JWT_AUDIENCE
    orig_rl = settings.RATE_LIMIT_ENABLED
    orig_def_limit = settings.RATE_LIMIT_DEFAULT_LIMIT
    orig_export_limit = settings.RATE_LIMIT_EXPORT_LIMIT
    orig_search_limit = settings.RATE_LIMIT_SEARCH_LIMIT

    settings.RATE_LIMIT_ENABLED = True
    settings.RATE_LIMIT_DEFAULT_LIMIT = 5
    settings.RATE_LIMIT_EXPORT_LIMIT = 2
    settings.RATE_LIMIT_SEARCH_LIMIT = 2
    _setup_auth(require_auth=True)
    yield TestClient(app)

    _default_limiter.reset()
    settings.REQUIRE_AUTH = orig_require_auth
    settings.SUPABASE_JWT_SECRET = orig_secret
    settings.SUPABASE_JWKS_URL = orig_jwks
    settings.SUPABASE_JWT_ISSUER = orig_issuer
    settings.SUPABASE_JWT_AUDIENCE = orig_audience
    settings.RATE_LIMIT_ENABLED = orig_rl
    settings.RATE_LIMIT_DEFAULT_LIMIT = orig_def_limit
    settings.RATE_LIMIT_EXPORT_LIMIT = orig_export_limit
    settings.RATE_LIMIT_SEARCH_LIMIT = orig_search_limit
    from app.core.jwt_auth import init_verifier

    init_verifier(
        jwt_secret=orig_secret,
        jwks_url=orig_jwks,
        issuer=orig_issuer,
        audience=orig_audience,
    )


def _auth_header() -> dict:
    return {"Authorization": "Bearer " + create_test_jwt()}


class TestRateLimitMiddleware:
    def test_health_never_limited(self, rate_limit_client):
        client = rate_limit_client
        for _ in range(10):
            assert client.get("/health").status_code == 200

    def test_default_route_limit(self, rate_limit_client):
        client = rate_limit_client
        headers = _auth_header()
        for i in range(5):
            resp = client.get("/api/v1/dashboard/summary", headers=headers)
            assert resp.status_code == 200, i
        resp = client.get("/api/v1/dashboard/summary", headers=headers)
        assert resp.status_code == 429
        assert resp.json()["error"]["code"] == "RATE_LIMITED"
        assert "retry-after" in resp.headers

    def test_export_route_stricter_limit(self, rate_limit_client):
        client = rate_limit_client
        headers = _auth_header()
        assert client.get("/api/v1/map/intelligence/export", headers=headers).status_code == 200
        assert client.get("/api/v1/map/intelligence/export", headers=headers).status_code == 200
        resp = client.get("/api/v1/map/intelligence/export", headers=headers)
        assert resp.status_code == 429

    def test_limits_are_per_client(self, rate_limit_client):
        client = rate_limit_client
        headers_a = _auth_header()
        headers_a["X-Forwarded-For"] = "203.0.113.1"
        # Client A exhausts its budget (default limit 5)
        for i in range(5):
            resp = client.get("/api/v1/dashboard/summary", headers=headers_a)
            assert resp.status_code == 200, i
        assert client.get("/api/v1/dashboard/summary", headers=headers_a).status_code == 429
        # Client B has its own budget
        headers_b = _auth_header()
        headers_b["X-Forwarded-For"] = "203.0.113.2"
        resp = client.get("/api/v1/dashboard/summary", headers=headers_b)
        assert resp.status_code == 200

    def test_disabled_when_turned_off(self, rate_limit_client):
        settings.RATE_LIMIT_ENABLED = False
        client = rate_limit_client
        for i in range(20):
            resp = client.get("/api/v1/dashboard/summary", headers=_auth_header())
            assert resp.status_code == 200, i