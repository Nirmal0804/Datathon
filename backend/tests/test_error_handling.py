"""Tests for request/correlation-ID middleware, structured logging, and
centralized exception handling.

Test-only routes are added at module level and removed in a fixture so
no fake production endpoints leak into the app.
"""

from __future__ import annotations

import uuid

import pytest
from fastapi import APIRouter
from fastapi.testclient import TestClient

from app.core.exceptions import (
    DependencyUnavailableError,
    InvalidFilterError,
    ModelUnavailableError,
    ResourceNotFoundError,
)
from app.main import app

# ---------------------------------------------------------------------------
# Test-only routes (added to app, cleaned up after each test)
# ---------------------------------------------------------------------------

_test_router = APIRouter()


@_test_router.get("/test/resource-not-found")
async def _raise_not_found():
    raise ResourceNotFoundError("FIR-1234 not found")


@_test_router.get("/test/invalid-filter")
async def _raise_invalid_filter():
    raise InvalidFilterError("start_date must be before end_date")


@_test_router.get("/test/dependency-unavailable")
async def _raise_dep_unavailable():
    raise DependencyUnavailableError("PostgreSQL connection refused")


@_test_router.get("/test/model-unavailable")
async def _raise_model_unavailable():
    raise ModelUnavailableError("Risk model artifact not loaded")


@_test_router.get("/test/uncaught")
async def _raise_uncaught():
    raise RuntimeError("something broke internally")


@pytest.fixture(autouse=True)
def _add_test_routes():
    app.include_router(_test_router)
    yield
    app.router.routes = [r for r in app.router.routes if r not in _test_router.routes]


# ---------------------------------------------------------------------------
# Request-ID middleware
# ---------------------------------------------------------------------------

class TestRequestID:
    def test_response_contains_request_id_header(self):
        client = TestClient(app)
        resp = client.get("/health")
        assert "X-Request-ID" in resp.headers

    def test_generated_request_id_is_non_empty_uuid(self):
        client = TestClient(app)
        resp = client.get("/health")
        rid = resp.headers["X-Request-ID"]
        assert len(rid) > 0
        parsed = uuid.UUID(rid)
        assert parsed.version == 4

    def test_supplied_request_id_is_preserved(self):
        client = TestClient(app)
        supplied = str(uuid.uuid4())
        resp = client.get("/health", headers={"X-Request-ID": supplied})
        assert resp.headers["X-Request-ID"] == supplied


# ---------------------------------------------------------------------------
# Domain exception handlers
# ---------------------------------------------------------------------------

class TestDomainExceptions:
    def test_resource_not_found_returns_404(self):
        resp = TestClient(app).get("/test/resource-not-found")
        assert resp.status_code == 404

    def test_resource_not_found_body(self):
        body = TestClient(app).get("/test/resource-not-found").json()
        err = body["error"]
        assert err["code"] == "RESOURCE_NOT_FOUND"
        assert err["message"] == "FIR-1234 not found"
        assert isinstance(err["request_id"], str) and len(err["request_id"]) > 0

    def test_invalid_filter_returns_400(self):
        resp = TestClient(app).get("/test/invalid-filter")
        assert resp.status_code == 400

    def test_invalid_filter_body(self):
        body = TestClient(app).get("/test/invalid-filter").json()
        err = body["error"]
        assert err["code"] == "INVALID_FILTER"
        assert err["message"] == "start_date must be before end_date"

    def test_dependency_unavailable_returns_503(self):
        resp = TestClient(app).get("/test/dependency-unavailable")
        assert resp.status_code == 503

    def test_dependency_unavailable_body(self):
        body = TestClient(app).get("/test/dependency-unavailable").json()
        err = body["error"]
        assert err["code"] == "DEPENDENCY_UNAVAILABLE"

    def test_model_unavailable_returns_503(self):
        resp = TestClient(app).get("/test/model-unavailable")
        assert resp.status_code == 503

    def test_model_unavailable_body(self):
        body = TestClient(app).get("/test/model-unavailable").json()
        err = body["error"]
        assert err["code"] == "MODEL_UNAVAILABLE"
        assert err["message"] == "Risk model artifact not loaded"

    def test_domain_error_response_contains_request_id(self):
        resp = TestClient(app).get("/test/resource-not-found")
        body = resp.json()
        rid = body["error"]["request_id"]
        assert isinstance(rid, str) and len(rid) > 0
        # Same ID appears in header
        assert resp.headers["X-Request-ID"] == rid


# ---------------------------------------------------------------------------
# Uncaught exception handler
# ---------------------------------------------------------------------------

class TestUncaughtException:
    def test_returns_500(self):
        resp = TestClient(app, raise_server_exceptions=False).get("/test/uncaught")
        assert resp.status_code == 500

    def test_body_hides_internal_detail(self):
        body = TestClient(app, raise_server_exceptions=False).get("/test/uncaught").json()
        err = body["error"]
        assert err["code"] == "INTERNAL_ERROR"
        assert "something broke internally" not in err["message"]


# ---------------------------------------------------------------------------
# Framework validation error (built-in)
# ---------------------------------------------------------------------------

class TestValidationError:
    def test_405_method_not_allowed(self):
        resp = TestClient(app).post("/health")
        assert resp.status_code == 405

    def test_404_for_unknown_path(self):
        resp = TestClient(app).get("/nonexistent")
        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Health endpoint still works
# ---------------------------------------------------------------------------

class TestHealthStillWorks:
    def test_health_200(self):
        resp = TestClient(app).get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "healthy"
