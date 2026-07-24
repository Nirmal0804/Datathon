"""API endpoint tests for Intelligence Analyst Crime Map endpoints.

Uses FastAPI TestClient against the real app.  Repository loading uses
real CSV data for the integration test; unit-level API tests override
the dependency with fakes.
"""

from __future__ import annotations

from datetime import date, datetime

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database.records import DistrictRecord, FIRRecord, StationRecord
from app.database.dependencies import RepositoryCollection, get_repositories


# ---------------------------------------------------------------------------
# Fake repos for unit-level API tests (no CSV loaded)
# ---------------------------------------------------------------------------


class _FakeFIRRepo:
    def __init__(self, firs=None):
        self._firs = firs or []

    def list_all(self):
        return list(self._firs)

    def get_by_id(self, fir_id):
        for f in self._firs:
            if f.fir_id == fir_id:
                return f
        return None

    def get_by_number(self, fir_number):
        for f in self._firs:
            if f.fir_number == fir_number:
                return f
        return None


class _FakeStationRepo:
    def __init__(self, stations=None):
        self._stations = {s.station_id: s for s in (stations or [])}

    def get_by_id(self, station_id):
        return self._stations.get(station_id)

    def list_all(self):
        return list(self._stations.values())


class _FakeDistrictRepo:
    def __init__(self, districts=None):
        self._districts = list(districts or [])

    def list_all(self):
        return list(self._districts)


class _FakeArrestRepo:
    def list_all_arrests(self):
        return []


class _FakeCSRepo:
    def list_all_chargesheets(self):
        return []


def _make_fir(
    fir_id="FIR001",
    fir_number="1/2025",
    district="Bengaluru Urban",
    station_id="PS0001",
    crime_head="Theft",
    crime_subhead="Petty Theft",
    status="Under Investigation",
    incident_date=datetime(2025, 6, 15),
    lat=12.97,
    lon=77.59,
):
    return FIRRecord(
        fir_id=fir_id,
        fir_number=fir_number,
        station_id=station_id,
        district=district,
        incident_date=incident_date,
        fir_date=incident_date,
        crime_head=crime_head,
        crime_subhead=crime_subhead,
        bns_sections="BNS 379",
        latitude=lat,
        longitude=lon,
        complainant_id="C001",
        victim_id="V001",
        accused_ids=("P001",),
        investigating_officer="IO1",
        status=status,
    )


def _make_station(station_id="PS0001", name="Bengaluru Central PS"):
    return StationRecord(
        station_id=station_id,
        station_name=name,
        district_id=5,
        district_name="Bengaluru Urban",
        zone="Central",
        station_type="Town PS",
        latitude=12.97,
        longitude=77.59,
        personnel_strength=50,
        patrol_vehicles=10,
        contact_number="08012345678",
        email="ps0001@ksp.gov.in",
    )


def _make_district(name="Bengaluru Urban", population=3467006, area_sq_km=7092):
    return DistrictRecord(
        district_id=5,
        district_name=name,
        police_range="Bengaluru City",
        state="Karnataka",
        population=population,
        area_sq_km=area_sq_km,
        population_density=1629,
        literacy_rate=88.48,
        urban_population_pct=90,
        rural_population_pct=10,
        police_stations=45,
        latitude=12.97,
        longitude=77.59,
    )


def _build_fake_repos(
    firs=None, stations=None, districts=None
) -> RepositoryCollection:
    return RepositoryCollection(
        districts=_FakeDistrictRepo(districts or []),
        stations=_FakeStationRepo(stations or []),
        people=None,
        firs=_FakeFIRRepo(firs or []),
        arrests=_FakeArrestRepo(),
        chargesheets=_FakeCSRepo(),
    )


# ---------------------------------------------------------------------------
# Unit-level API tests (fake repos, no CSV)
# ---------------------------------------------------------------------------


class TestIntelligenceAPIAnalytics:
    def test_returns_200(self):
        repos = _build_fake_repos(
            firs=[_make_fir()],
            stations=[_make_station()],
            districts=[_make_district()],
        )
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/intelligence/analytics")
            assert resp.status_code == 200
        finally:
            app.dependency_overrides.clear()

    def test_response_schema(self):
        repos = _build_fake_repos(
            firs=[_make_fir()],
            stations=[_make_station()],
            districts=[_make_district()],
        )
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/intelligence/analytics")
            data = resp.json()
            assert "total_crimes" in data
            assert "hotspot_count" in data
            assert "density_index" in data
            assert "dominant_crime_type" in data
        finally:
            app.dependency_overrides.clear()

    def test_empty_data(self):
        repos = _build_fake_repos()
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/intelligence/analytics")
            data = resp.json()
            assert data["total_crimes"] == 0
            assert data["dominant_crime_type"] is None
        finally:
            app.dependency_overrides.clear()

    def test_with_filter(self):
        repos = _build_fake_repos(
            firs=[
                _make_fir(fir_id="F1", district="A"),
                _make_fir(fir_id="F2", district="B"),
            ],
        )
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get(
                "/api/v1/map/intelligence/analytics",
                params={"district": "A"},
            )
            data = resp.json()
            assert data["total_crimes"] == 1
        finally:
            app.dependency_overrides.clear()

    def test_invalid_dates_returns_400(self):
        repos = _build_fake_repos(firs=[_make_fir()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get(
                "/api/v1/map/intelligence/analytics",
                params={"start_date": "2025-12-31", "end_date": "2025-01-01"},
            )
            assert resp.status_code == 400
            assert resp.json()["error"]["code"] == "INVALID_FILTER"
        finally:
            app.dependency_overrides.clear()


class TestIntelligenceAPIHeatmap:
    def test_returns_200(self):
        repos = _build_fake_repos(firs=[_make_fir()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/intelligence/heatmap")
            assert resp.status_code == 200
        finally:
            app.dependency_overrides.clear()

    def test_response_schema(self):
        repos = _build_fake_repos(firs=[_make_fir()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/intelligence/heatmap")
            data = resp.json()
            assert "points" in data
            assert "total_points" in data
        finally:
            app.dependency_overrides.clear()

    def test_empty_data(self):
        repos = _build_fake_repos()
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/intelligence/heatmap")
            data = resp.json()
            assert data["points"] == []
            assert data["total_points"] == 0
        finally:
            app.dependency_overrides.clear()

    def test_with_filter(self):
        repos = _build_fake_repos(
            firs=[
                _make_fir(fir_id="F1", district="A"),
                _make_fir(fir_id="F2", district="B"),
            ],
        )
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get(
                "/api/v1/map/intelligence/heatmap",
                params={"district": "A"},
            )
            assert resp.status_code == 200
            assert resp.json()["total_points"] == 1
        finally:
            app.dependency_overrides.clear()

    def test_invalid_dates_returns_400(self):
        repos = _build_fake_repos(firs=[_make_fir()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get(
                "/api/v1/map/intelligence/heatmap",
                params={"start_date": "2025-12-31", "end_date": "2025-01-01"},
            )
            assert resp.status_code == 400
        finally:
            app.dependency_overrides.clear()


class TestIntelligenceAPIClusters:
    def test_returns_200(self):
        repos = _build_fake_repos(
            firs=[_make_fir()],
            stations=[_make_station()],
        )
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/intelligence/clusters")
            assert resp.status_code == 200
        finally:
            app.dependency_overrides.clear()

    def test_response_schema(self):
        repos = _build_fake_repos(
            firs=[_make_fir()],
            stations=[_make_station()],
        )
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/intelligence/clusters")
            data = resp.json()
            assert "clusters" in data
            assert "total_clusters" in data
        finally:
            app.dependency_overrides.clear()

    def test_empty_data(self):
        repos = _build_fake_repos()
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/intelligence/clusters")
            data = resp.json()
            assert data["clusters"] == []
            assert data["total_clusters"] == 0
        finally:
            app.dependency_overrides.clear()

    def test_with_filter(self):
        repos = _build_fake_repos(
            firs=[
                _make_fir(fir_id="F1", station_id="PS0001", district="A"),
                _make_fir(fir_id="F2", station_id="PS0002", district="B"),
            ],
            stations=[
                _make_station("PS0001", "Station A"),
                _make_station("PS0002", "Station B"),
            ],
        )
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get(
                "/api/v1/map/intelligence/clusters",
                params={"district": "A"},
            )
            assert resp.status_code == 200
            assert resp.json()["total_clusters"] == 1
        finally:
            app.dependency_overrides.clear()

    def test_invalid_dates_returns_400(self):
        repos = _build_fake_repos(firs=[_make_fir()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get(
                "/api/v1/map/intelligence/clusters",
                params={"start_date": "2025-12-31", "end_date": "2025-01-01"},
            )
            assert resp.status_code == 400
        finally:
            app.dependency_overrides.clear()


class TestIntelligenceAPIHotspots:
    def test_returns_200(self):
        repos = _build_fake_repos(firs=[_make_fir()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/intelligence/hotspots")
            assert resp.status_code == 200
        finally:
            app.dependency_overrides.clear()

    def test_response_schema(self):
        repos = _build_fake_repos(firs=[_make_fir()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/intelligence/hotspots")
            data = resp.json()
            assert "hotspots" in data
            assert "total_hotspots" in data
        finally:
            app.dependency_overrides.clear()

    def test_empty_data(self):
        repos = _build_fake_repos()
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/intelligence/hotspots")
            data = resp.json()
            assert data["hotspots"] == []
            assert data["total_hotspots"] == 0
        finally:
            app.dependency_overrides.clear()

    def test_with_filter(self):
        repos = _build_fake_repos(
            firs=[
                _make_fir(fir_id=f"F{i}", lat=12.97, lon=77.59, district="A")
                for i in range(5)
            ],
        )
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get(
                "/api/v1/map/intelligence/hotspots",
                params={"district": "A"},
            )
            assert resp.status_code == 200
            assert resp.json()["total_hotspots"] == 1
        finally:
            app.dependency_overrides.clear()

    def test_invalid_dates_returns_400(self):
        repos = _build_fake_repos(firs=[_make_fir()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get(
                "/api/v1/map/intelligence/hotspots",
                params={"start_date": "2025-12-31", "end_date": "2025-01-01"},
            )
            assert resp.status_code == 400
        finally:
            app.dependency_overrides.clear()


class TestIntelligenceAPIDistrictComparison:
    def test_returns_200(self):
        repos = _build_fake_repos(
            firs=[_make_fir()],
            districts=[_make_district()],
        )
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/intelligence/district-comparison")
            assert resp.status_code == 200
        finally:
            app.dependency_overrides.clear()

    def test_response_schema(self):
        repos = _build_fake_repos(
            firs=[_make_fir()],
            districts=[_make_district()],
        )
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/intelligence/district-comparison")
            data = resp.json()
            assert "districts" in data
            assert "total_districts" in data
        finally:
            app.dependency_overrides.clear()

    def test_empty_data(self):
        repos = _build_fake_repos()
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/intelligence/district-comparison")
            data = resp.json()
            assert data["districts"] == []
            assert data["total_districts"] == 0
        finally:
            app.dependency_overrides.clear()

    def test_with_filter(self):
        repos = _build_fake_repos(
            firs=[
                _make_fir(fir_id="F1", district="A"),
                _make_fir(fir_id="F2", district="B"),
            ],
            districts=[
                _make_district("A"),
                _make_district("B"),
            ],
        )
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get(
                "/api/v1/map/intelligence/district-comparison",
                params={"district": "A"},
            )
            assert resp.status_code == 200
            assert resp.json()["total_districts"] == 1
        finally:
            app.dependency_overrides.clear()

    def test_invalid_dates_returns_400(self):
        repos = _build_fake_repos(firs=[_make_fir()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get(
                "/api/v1/map/intelligence/district-comparison",
                params={"start_date": "2025-12-31", "end_date": "2025-01-01"},
            )
            assert resp.status_code == 400
        finally:
            app.dependency_overrides.clear()


class TestIntelligenceAPITimeline:
    def test_returns_200(self):
        repos = _build_fake_repos(firs=[_make_fir()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/intelligence/timeline")
            assert resp.status_code == 200
        finally:
            app.dependency_overrides.clear()

    def test_response_schema(self):
        repos = _build_fake_repos(firs=[_make_fir()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/intelligence/timeline")
            data = resp.json()
            assert "buckets" in data
            assert "total_buckets" in data
            assert "granularity" in data
        finally:
            app.dependency_overrides.clear()

    def test_empty_data(self):
        repos = _build_fake_repos()
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/intelligence/timeline")
            data = resp.json()
            assert data["buckets"] == []
            assert data["total_buckets"] == 0
            assert data["granularity"] == "monthly"
        finally:
            app.dependency_overrides.clear()

    def test_daily_granularity(self):
        repos = _build_fake_repos(firs=[_make_fir()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get(
                "/api/v1/map/intelligence/timeline",
                params={"granularity": "daily"},
            )
            assert resp.status_code == 200
            assert resp.json()["granularity"] == "daily"
        finally:
            app.dependency_overrides.clear()

    def test_invalid_granularity_returns_400(self):
        repos = _build_fake_repos(firs=[_make_fir()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get(
                "/api/v1/map/intelligence/timeline",
                params={"granularity": "weekly"},
            )
            assert resp.status_code == 400
            assert resp.json()["error"]["code"] == "INVALID_FILTER"
        finally:
            app.dependency_overrides.clear()

    def test_with_filter(self):
        repos = _build_fake_repos(
            firs=[
                _make_fir(fir_id="F1", district="A", incident_date=datetime(2025, 1, 1)),
                _make_fir(fir_id="F2", district="B", incident_date=datetime(2025, 1, 1)),
            ],
        )
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get(
                "/api/v1/map/intelligence/timeline",
                params={"district": "A"},
            )
            assert resp.status_code == 200
            assert resp.json()["buckets"][0]["fir_count"] == 1
        finally:
            app.dependency_overrides.clear()

    def test_invalid_dates_returns_400(self):
        repos = _build_fake_repos(firs=[_make_fir()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get(
                "/api/v1/map/intelligence/timeline",
                params={"start_date": "2025-12-31", "end_date": "2025-01-01"},
            )
            assert resp.status_code == 400
        finally:
            app.dependency_overrides.clear()


class TestIntelligenceAPIExport:
    def test_returns_200(self):
        repos = _build_fake_repos(firs=[_make_fir()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/intelligence/export")
            assert resp.status_code == 200
        finally:
            app.dependency_overrides.clear()

    def test_csv_content_type(self):
        repos = _build_fake_repos(firs=[_make_fir()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/intelligence/export")
            assert "text/csv" in resp.headers["content-type"]
        finally:
            app.dependency_overrides.clear()

    def test_csv_content_header(self):
        repos = _build_fake_repos(firs=[_make_fir()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/intelligence/export")
            lines = resp.text.strip().split("\n")
            assert len(lines) >= 2  # Header + at least 1 data row
            header = lines[0]
            assert "FIR_ID" in header
            assert "FIR_Number" in header
        finally:
            app.dependency_overrides.clear()

    def test_empty_data(self):
        repos = _build_fake_repos()
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/intelligence/export")
            lines = resp.text.strip().split("\n")
            assert len(lines) == 1  # Header only
        finally:
            app.dependency_overrides.clear()

    def test_with_filter(self):
        repos = _build_fake_repos(
            firs=[
                _make_fir(fir_id="F1", district="A"),
                _make_fir(fir_id="F2", district="B"),
            ],
        )
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get(
                "/api/v1/map/intelligence/export",
                params={"district": "A"},
            )
            lines = resp.text.strip().split("\n")
            assert len(lines) == 2  # Header + 1 data row
        finally:
            app.dependency_overrides.clear()

    def test_invalid_dates_returns_400(self):
        repos = _build_fake_repos(firs=[_make_fir()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get(
                "/api/v1/map/intelligence/export",
                params={"start_date": "2025-12-31", "end_date": "2025-01-01"},
            )
            assert resp.status_code == 400
        finally:
            app.dependency_overrides.clear()


class TestIntelligenceAPIRequestID:
    def test_request_id_header_present(self):
        repos = _build_fake_repos(firs=[])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/intelligence/analytics")
            request_id = resp.headers.get("x-request-id")
            assert request_id is not None
            assert len(request_id) > 0
        finally:
            app.dependency_overrides.clear()


class TestIntelligenceAPIRegression:
    def test_existing_endpoints_still_work(self):
        client = TestClient(app)
        assert client.get("/health").status_code == 200
        assert client.get("/api/v1/dashboard/summary").status_code == 200

    def test_field_map_endpoints_still_work(self):
        repos = _build_fake_repos(firs=[_make_fir()], stations=[_make_station()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            assert client.get("/api/v1/map/field/cases").status_code == 200
            assert client.get("/api/v1/map/field/filters").status_code == 200
            assert client.get("/api/v1/map/field/case/FIR001").status_code == 200
            assert client.get("/api/v1/map/field/hotspots").status_code == 200
        finally:
            app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Integration test — real CSV data
# ---------------------------------------------------------------------------


class TestIntelligenceAPIIntegration:
    """Uses real CSV-backed repositories loaded from settings.DATA_DIR."""

    def test_unfiltered_analytics_count(self):
        from app.database.dependencies import _load_repositories
        from app.services.intelligence_map_service import IntelligenceMapService

        repos = _load_repositories()
        svc = IntelligenceMapService(
            fir_reader=repos.firs,
            district_reader=repos.districts,
            station_reader=repos.stations,
            station_lookup=repos.stations,
        )
        result = svc.get_analytics()
        assert result["total_crimes"] == 5000
        assert result["dominant_crime_type"] is not None

    def test_heatmap_from_csv(self):
        from app.database.dependencies import _load_repositories
        from app.services.intelligence_map_service import IntelligenceMapService

        repos = _load_repositories()
        svc = IntelligenceMapService(
            fir_reader=repos.firs,
            district_reader=repos.districts,
            station_reader=repos.stations,
            station_lookup=repos.stations,
        )
        result = svc.get_heatmap()
        assert result["total_points"] > 0

    def test_clusters_from_csv(self):
        from app.database.dependencies import _load_repositories
        from app.services.intelligence_map_service import IntelligenceMapService

        repos = _load_repositories()
        svc = IntelligenceMapService(
            fir_reader=repos.firs,
            district_reader=repos.districts,
            station_reader=repos.stations,
            station_lookup=repos.stations,
        )
        result = svc.get_clusters()
        assert result["total_clusters"] > 0

    def test_export_from_csv(self):
        from app.database.dependencies import _load_repositories
        from app.services.intelligence_map_service import IntelligenceMapService

        repos = _load_repositories()
        svc = IntelligenceMapService(
            fir_reader=repos.firs,
            district_reader=repos.districts,
            station_reader=repos.stations,
            station_lookup=repos.stations,
        )
        result = svc.get_export()
        lines = result.strip().split("\n")
        assert len(lines) > 1  # Header + data rows

    def test_timeline_from_csv(self):
        from app.database.dependencies import _load_repositories
        from app.services.intelligence_map_service import IntelligenceMapService

        repos = _load_repositories()
        svc = IntelligenceMapService(
            fir_reader=repos.firs,
            district_reader=repos.districts,
            station_reader=repos.stations,
            station_lookup=repos.stations,
        )
        result = svc.get_timeline()
        assert result["total_buckets"] > 0

    def test_district_comparison_from_csv(self):
        from app.database.dependencies import _load_repositories
        from app.services.intelligence_map_service import IntelligenceMapService

        repos = _load_repositories()
        svc = IntelligenceMapService(
            fir_reader=repos.firs,
            district_reader=repos.districts,
            station_reader=repos.stations,
            station_lookup=repos.stations,
        )
        result = svc.get_district_comparison()
        assert result["total_districts"] > 0
