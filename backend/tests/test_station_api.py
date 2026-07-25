"""API endpoint tests for Station Reference endpoints.

Uses FastAPI TestClient against the real app.  Repository loading uses
real data for integration tests; unit-level API tests override
the dependency with fakes.
"""

from __future__ import annotations

from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database.records import StationRecord
from app.database.dependencies import RepositoryCollection, get_repositories


# ---------------------------------------------------------------------------
# Fake repos for unit-level API tests (no CSV loaded)
# ---------------------------------------------------------------------------


class _FakeStationRepo:
    def __init__(self, stations: list[StationRecord] | None = None):
        self._stations = {s.station_id: s for s in (stations or [])}
        self._by_district: dict[int, list[StationRecord]] = {}
        for s in (stations or []):
            self._by_district.setdefault(s.district_id, []).append(s)

    def list_all(self):
        return list(self._stations.values())

    def get_by_id(self, station_id: str):
        return self._stations.get(station_id)

    def list_by_district(self, district_id: int):
        return list(self._by_district.get(district_id, []))


def _make_station(
    station_id="PS0001",
    station_name="Central PS",
    district_id=1,
    district_name="Bengaluru Urban",
    zone="Central",
    station_type="City",
    latitude=12.97,
    longitude=77.59,
    personnel_strength=50,
    patrol_vehicles=10,
    contact_number="080-12345678",
    email="central@kar.gov.in",
):
    return StationRecord(
        station_id=station_id,
        station_name=station_name,
        district_id=district_id,
        district_name=district_name,
        zone=zone,
        station_type=station_type,
        latitude=latitude,
        longitude=longitude,
        personnel_strength=personnel_strength,
        patrol_vehicles=patrol_vehicles,
        contact_number=contact_number,
        email=email,
    )


def _build_fake_repos(stations=None):
    return RepositoryCollection(
        districts=None,
        stations=_FakeStationRepo(stations or []),
        people=None,
        firs=None,
        arrests=None,
        chargesheets=None,
    )


# ---------------------------------------------------------------------------
# GET /api/v1/stations — Unit tests
# ---------------------------------------------------------------------------


class TestStationsListAPIUnit:
    def test_returns_200(self):
        repos = _build_fake_repos(stations=[_make_station()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/stations")
            assert resp.status_code == 200
        finally:
            app.dependency_overrides.clear()

    def test_response_has_correct_schema(self):
        repos = _build_fake_repos(stations=[_make_station()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/stations")
            data = resp.json()
            assert "stations" in data
            assert "total_stations" in data
            assert "total_pages" in data
            assert "page" in data
            assert "page_size" in data
            assert data["total_stations"] == 1
            assert data["total_pages"] == 1
            assert data["page"] == 1
            assert data["page_size"] == 50

            item = data["stations"][0]
            expected_keys = {
                "station_id", "station_name", "district_id", "district_name",
                "zone", "station_type", "latitude", "longitude",
                "personnel_strength", "patrol_vehicles", "contact_number", "email",
            }
            assert set(item.keys()) == expected_keys
        finally:
            app.dependency_overrides.clear()

    def test_empty_stations_returns_empty_list(self):
        repos = _build_fake_repos(stations=[])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/stations")
            assert resp.status_code == 200
            data = resp.json()
            assert data["stations"] == []
            assert data["total_stations"] == 0
            assert data["total_pages"] == 1
        finally:
            app.dependency_overrides.clear()

    def test_district_id_filter(self):
        stations = [
            _make_station(station_id="PS0001", district_id=1),
            _make_station(station_id="PS0002", district_id=1, station_name="North PS"),
            _make_station(station_id="PS0003", district_id=2, station_name="Other PS"),
        ]
        repos = _build_fake_repos(stations=stations)
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/stations", params={"district_id": 1})
            assert resp.status_code == 200
            data = resp.json()
            assert data["total_stations"] == 2
            assert all(s["district_id"] == 1 for s in data["stations"])
        finally:
            app.dependency_overrides.clear()

    def test_pagination(self):
        stations = [_make_station(station_id=f"PS{i:04d}") for i in range(1, 6)]
        repos = _build_fake_repos(stations=stations)
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/stations", params={"page": 1, "page_size": 2})
            assert resp.status_code == 200
            data = resp.json()
            assert len(data["stations"]) == 2
            assert data["total_stations"] == 5
            assert data["total_pages"] == 3  # ceil(5/2) = 3
            assert data["page"] == 1
            assert data["page_size"] == 2
        finally:
            app.dependency_overrides.clear()

    def test_pagination_page_2(self):
        stations = [_make_station(station_id=f"PS{i:04d}") for i in range(1, 6)]
        repos = _build_fake_repos(stations=stations)
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/stations", params={"page": 2, "page_size": 2})
            assert resp.status_code == 200
            data = resp.json()
            assert len(data["stations"]) == 2
            # Page 2 should have stations at index 2 and 3 (sorted by station_id)
            assert data["stations"][0]["station_id"] == "PS0003"
            assert data["stations"][1]["station_id"] == "PS0004"
        finally:
            app.dependency_overrides.clear()

    def test_request_id_header_present(self):
        repos = _build_fake_repos(stations=[_make_station()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/stations")
            request_id = resp.headers.get("x-request-id")
            assert request_id is not None
            assert len(request_id) > 0
        finally:
            app.dependency_overrides.clear()

    def test_stations_sorted_by_id(self):
        stations = [
            _make_station(station_id="PS0003"),
            _make_station(station_id="PS0001"),
            _make_station(station_id="PS0002"),
        ]
        repos = _build_fake_repos(stations=stations)
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/stations")
            data = resp.json()
            ids = [s["station_id"] for s in data["stations"]]
            assert ids == ["PS0001", "PS0002", "PS0003"]
        finally:
            app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# GET /api/v1/stations/{station_id} — Unit tests
# ---------------------------------------------------------------------------


class TestStationDetailAPIUnit:
    def test_returns_200_for_valid_station(self):
        repos = _build_fake_repos(stations=[_make_station(station_id="PS0001")])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/stations/PS0001")
            assert resp.status_code == 200
            data = resp.json()
            assert data["station_id"] == "PS0001"
        finally:
            app.dependency_overrides.clear()

    def test_returns_404_for_unknown_station(self):
        repos = _build_fake_repos(stations=[_make_station(station_id="PS0001")])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/stations/PS9999")
            assert resp.status_code == 404
            body = resp.json()
            assert body["error"]["code"] == "RESOURCE_NOT_FOUND"
        finally:
            app.dependency_overrides.clear()

    def test_detail_response_has_correct_schema(self):
        repos = _build_fake_repos(stations=[_make_station()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/stations/PS0001")
            data = resp.json()
            expected_keys = {
                "station_id", "station_name", "district_id", "district_name",
                "zone", "station_type", "latitude", "longitude",
                "personnel_strength", "patrol_vehicles", "contact_number", "email",
            }
            assert set(data.keys()) == expected_keys
        finally:
            app.dependency_overrides.clear()

    def test_request_id_header_present(self):
        repos = _build_fake_repos(stations=[_make_station()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/stations/PS0001")
            request_id = resp.headers.get("x-request-id")
            assert request_id is not None
            assert len(request_id) > 0
        finally:
            app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Integration tests — real data
# ---------------------------------------------------------------------------


class TestStationAPIIntegration:
    """Uses real repositories loaded from settings.DATA_DIR."""

    def test_list_returns_stations(self):
        from app.database.dependencies import _load_repositories
        repos = _load_repositories()
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/stations")
            assert resp.status_code == 200
            data = resp.json()
            assert data["total_stations"] > 0
            assert len(data["stations"]) > 0
        finally:
            app.dependency_overrides.clear()

    def test_detail_returns_station(self):
        from app.database.dependencies import _load_repositories
        repos = _load_repositories()
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            # Get first station from list
            list_resp = client.get("/api/v1/stations", params={"page_size": 1})
            first_station_id = list_resp.json()["stations"][0]["station_id"]

            resp = client.get(f"/api/v1/stations/{first_station_id}")
            assert resp.status_code == 200
            data = resp.json()
            assert data["station_id"] == first_station_id
        finally:
            app.dependency_overrides.clear()

    def test_unknown_station_returns_404(self):
        from app.database.dependencies import _load_repositories
        repos = _load_repositories()
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/stations/PS9999")
            assert resp.status_code == 404
        finally:
            app.dependency_overrides.clear()

    def test_district_filter_works(self):
        from app.database.dependencies import _load_repositories
        repos = _load_repositories()
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/stations", params={"district_id": 1})
            assert resp.status_code == 200
            data = resp.json()
            assert data["total_stations"] > 0
            assert all(s["district_id"] == 1 for s in data["stations"])
        finally:
            app.dependency_overrides.clear()

    def test_health_still_works(self):
        client = TestClient(app)
        resp = client.get("/health")
        assert resp.status_code == 200

    def test_health_live_works(self):
        client = TestClient(app)
        resp = client.get("/health/live")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "alive"

    def test_health_ready_works(self):
        client = TestClient(app)
        resp = client.get("/health/ready")
        # Returns 200 when PG connects, 503 when unreachable
        assert resp.status_code in (200, 503)
        data = resp.json()
        assert data["status"] in ("ready", "not ready")
