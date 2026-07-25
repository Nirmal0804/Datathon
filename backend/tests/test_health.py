import httpx
from fastapi.testclient import TestClient

from app.main import app


def test_health_returns_200():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200


def test_health_returns_expected_structure():
    client = TestClient(app)
    response = client.get("/health")
    body = response.json()
    assert "status" in body
    assert "service" in body
    # Status is "healthy" when PG connects, "degraded" when it cannot
    assert body["status"] in ("healthy", "degraded")
    assert isinstance(body["service"], str)
    assert len(body["service"]) > 0


def test_health_is_get_only():
    client = TestClient(app)
    response = client.post("/health")
    assert response.status_code == 405


# ---------------------------------------------------------------------------
# GET /health/live — Liveness probe
# ---------------------------------------------------------------------------


def test_health_live_returns_200():
    client = TestClient(app)
    response = client.get("/health/live")
    assert response.status_code == 200


def test_health_live_returns_expected_structure():
    client = TestClient(app)
    response = client.get("/health/live")
    body = response.json()
    assert body == {"status": "alive"}


def test_health_live_is_get_only():
    client = TestClient(app)
    response = client.post("/health/live")
    assert response.status_code == 405


# ---------------------------------------------------------------------------
# GET /health/ready — Readiness probe
# ---------------------------------------------------------------------------


def test_health_ready_returns_200():
    client = TestClient(app)
    response = client.get("/health/ready")
    assert response.status_code == 200


def test_health_ready_returns_expected_structure():
    client = TestClient(app)
    response = client.get("/health/ready")
    body = response.json()
    assert "status" in body
    # "ready" when PG connects; "not ready" when unreachable
    assert body["status"] in ("ready", "not ready")


def test_health_ready_is_get_only():
    client = TestClient(app)
    response = client.post("/health/ready")
    assert response.status_code == 405
