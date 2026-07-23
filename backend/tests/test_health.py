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
    assert body["status"] == "healthy"
    assert isinstance(body["service"], str)
    assert len(body["service"]) > 0


def test_health_is_get_only():
    client = TestClient(app)
    response = client.post("/health")
    assert response.status_code == 405
