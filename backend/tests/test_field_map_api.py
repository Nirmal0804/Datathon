"""API endpoint tests for Field Officer Crime Map endpoints.

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
    def __init__(self, firs: list[FIRRecord] | None = None):
        self._firs = firs or []

    def list_all(self):
        return list(self._firs)

    def get_by_id(self, fir_id: str):
        for f in self._firs:
            if f.fir_id == fir_id:
                return f
        return None

    def get_by_number(self, fir_number: str):
        for f in self._firs:
            if f.fir_number == fir_number:
                return f
        return None


class _FakeStationRepo:
    def __init__(self, stations: list[StationRecord] | None = None):
        self._stations = {s.station_id: s for s in (stations or [])}

    def get_by_id(self, station_id: str):
        return self._stations.get(station_id)

    def list_all(self):
        return list(self._stations.values())


class _FakeDistrictRepo:
    def __init__(self, districts: list[DistrictRecord] | None = None):
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


def _make_district(name="Bengaluru Urban"):
    return DistrictRecord(
        district_id=5,
        district_name=name,
        police_range="Bengaluru City",
        state="Karnataka",
        population=3467006,
        area_sq_km=7092,
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


class TestFieldMapAPIUnit:
    def test_cases_returns_200(self):
        repos = _build_fake_repos(firs=[_make_fir()], stations=[_make_station()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/field/cases")
            assert resp.status_code == 200
        finally:
            app.dependency_overrides.clear()

    def test_cases_response_schema(self):
        repos = _build_fake_repos(firs=[_make_fir()], stations=[_make_station()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/field/cases")
            data = resp.json()
            assert "items" in data
            assert "page" in data
            assert "page_size" in data
            assert "total" in data
            assert "total_pages" in data
            assert data["page"] == 1
            assert data["page_size"] == 50
            assert data["total"] == 1
        finally:
            app.dependency_overrides.clear()

    def test_cases_item_schema(self):
        repos = _build_fake_repos(firs=[_make_fir()], stations=[_make_station()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/field/cases")
            item = resp.json()["items"][0]
            expected_keys = {
                "fir_id", "fir_number", "crime_head", "crime_subhead",
                "status", "district", "station_id", "station_name",
                "latitude", "longitude", "incident_date", "investigating_officer",
            }
            assert set(item.keys()) == expected_keys
        finally:
            app.dependency_overrides.clear()

    def test_page_validation_rejects_zero(self):
        repos = _build_fake_repos(firs=[_make_fir()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/field/cases", params={"page": 0})
            assert resp.status_code == 422
        finally:
            app.dependency_overrides.clear()

    def test_page_size_rejects_over_200(self):
        repos = _build_fake_repos(firs=[_make_fir()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/field/cases", params={"page_size": 201})
            assert resp.status_code == 422
        finally:
            app.dependency_overrides.clear()

    def test_page_size_rejects_zero(self):
        repos = _build_fake_repos(firs=[_make_fir()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/field/cases", params={"page_size": 0})
            assert resp.status_code == 422
        finally:
            app.dependency_overrides.clear()

    def test_filter_query_params_work(self):
        repos = _build_fake_repos(
            firs=[
                _make_fir(fir_id="F1", district="A", crime_head="Theft"),
                _make_fir(fir_id="F2", district="B", crime_head="Assault"),
            ],
        )
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get(
                "/api/v1/map/field/cases",
                params={"district": "A"},
            )
            assert resp.status_code == 200
            assert resp.json()["total"] == 1
        finally:
            app.dependency_overrides.clear()

    def test_invalid_date_returns_400(self):
        """start_date > end_date returns structured INVALID_FILTER error."""
        repos = _build_fake_repos(firs=[_make_fir()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get(
                "/api/v1/map/field/cases",
                params={"start_date": "2025-12-31", "end_date": "2025-01-01"},
            )
            assert resp.status_code == 400
            body = resp.json()
            assert body["error"]["code"] == "INVALID_FILTER"
        finally:
            app.dependency_overrides.clear()

    def test_request_id_header_present(self):
        repos = _build_fake_repos(firs=[])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/field/cases")
            request_id = resp.headers.get("x-request-id")
            assert request_id is not None
            assert len(request_id) > 0
        finally:
            app.dependency_overrides.clear()

    # --- Case detail ---

    def test_case_detail_returns_200(self):
        repos = _build_fake_repos(firs=[_make_fir()], stations=[_make_station()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/field/case/FIR001")
            assert resp.status_code == 200
            data = resp.json()
            assert data["fir_id"] == "FIR001"
            assert data["station_name"] == "Bengaluru Central PS"
        finally:
            app.dependency_overrides.clear()

    def test_case_detail_by_fir_number_via_path_not_supported(self):
        """FIR numbers contain '/' which conflicts with URL path routing.

        The service-level get_case_detail() does resolve FIR numbers, but the
        path parameter /case/{fir_identifier} cannot carry slashes.  This test
        documents that limitation — the 404 is expected.
        """
        repos = _build_fake_repos(firs=[_make_fir(fir_number="42/2025")])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/field/case/42%2F2025")
            assert resp.status_code == 404
        finally:
            app.dependency_overrides.clear()

    def test_case_detail_missing_returns_404(self):
        repos = _build_fake_repos(firs=[])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/field/case/NONEXISTENT")
            assert resp.status_code == 404
            body = resp.json()
            assert body["error"]["code"] == "RESOURCE_NOT_FOUND"
        finally:
            app.dependency_overrides.clear()

    def test_case_detail_no_pii(self):
        repos = _build_fake_repos(firs=[_make_fir()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/field/case/FIR001")
            data = resp.json()
            for field in ("complainant_id", "victim_id", "accused_ids",
                          "person_id", "full_name", "dob"):
                assert field not in data
        finally:
            app.dependency_overrides.clear()

    # --- Filters ---

    def test_filters_returns_200(self):
        repos = _build_fake_repos(
            firs=[_make_fir()],
            stations=[_make_station()],
            districts=[_make_district()],
        )
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/field/filters")
            assert resp.status_code == 200
        finally:
            app.dependency_overrides.clear()

    def test_filters_response_structure(self):
        repos = _build_fake_repos(
            firs=[_make_fir()],
            stations=[_make_station()],
            districts=[_make_district()],
        )
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/field/filters")
            data = resp.json()
            assert "districts" in data
            assert "stations" in data
            assert "crime_heads" in data
            assert "statuses" in data
            assert len(data["districts"]) == 1
            assert len(data["stations"]) == 1
            assert len(data["crime_heads"]) == 1
            assert len(data["statuses"]) == 1
        finally:
            app.dependency_overrides.clear()

    # --- Hotspots ---

    def test_hotspots_returns_200(self):
        repos = _build_fake_repos(
            firs=[_make_fir()],
        )
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/field/hotspots")
            assert resp.status_code == 200
        finally:
            app.dependency_overrides.clear()

    def test_hotspots_response_schema(self):
        repos = _build_fake_repos(
            firs=[_make_fir()],
        )
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/field/hotspots")
            data = resp.json()
            assert "hotspots" in data
            assert "total_hotspots" in data
            assert isinstance(data["hotspots"], list)
            assert isinstance(data["total_hotspots"], int)
        finally:
            app.dependency_overrides.clear()

    def test_hotspots_empty_data(self):
        repos = _build_fake_repos(firs=[])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/field/hotspots")
            data = resp.json()
            assert data["hotspots"] == []
            assert data["total_hotspots"] == 0
        finally:
            app.dependency_overrides.clear()

    def test_hotspots_with_qualifying_data(self):
        repos = _build_fake_repos(
            firs=[
                _make_fir(fir_id=f"F{i}", lat=12.97, lon=77.59)
                for i in range(5)
            ],
        )
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/field/hotspots")
            data = resp.json()
            assert data["total_hotspots"] >= 1
            assert data["hotspots"][0]["fir_count"] >= 3
        finally:
            app.dependency_overrides.clear()

    def test_hotspots_with_district_filter(self):
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
                "/api/v1/map/field/hotspots",
                params={"district": "A"},
            )
            assert resp.status_code == 200
            assert resp.json()["total_hotspots"] == 1
        finally:
            app.dependency_overrides.clear()

    def test_hotspots_invalid_dates_returns_400(self):
        repos = _build_fake_repos(firs=[_make_fir()])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get(
                "/api/v1/map/field/hotspots",
                params={"start_date": "2025-12-31", "end_date": "2025-01-01"},
            )
            assert resp.status_code == 400
            assert resp.json()["error"]["code"] == "INVALID_FILTER"
        finally:
            app.dependency_overrides.clear()

    # --- Existing endpoints still work ---

    def test_health_still_works(self):
        client = TestClient(app)
        resp = client.get("/health")
        assert resp.status_code == 200

    def test_dashboard_still_works(self):
        repos = _build_fake_repos(firs=[])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/dashboard/summary")
            assert resp.status_code == 200
        finally:
            app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Integration test — real CSV data
# ---------------------------------------------------------------------------


class TestFieldMapAPIIntegration:
    """Uses real CSV-backed repositories loaded from settings.DATA_DIR."""

    def _get_repos(self):
        from tests.conftest import get_csv_repositories
        return get_csv_repositories()

    def test_unfiltered_case_count(self):
        from app.services.field_map_service import FieldMapService

        repos = self._get_repos()
        svc = FieldMapService(
            fir_reader=repos.firs,
            fir_number_reader=repos.firs,
            station_reader=repos.stations,
            district_reader=repos.districts,
            station_list_reader=repos.stations,
        )
        result = svc.get_cases(page_size=200)
        assert result["total"] == 5000

    def test_station_names_resolved_from_csv(self):
        from app.services.field_map_service import FieldMapService

        repos = self._get_repos()
        svc = FieldMapService(
            fir_reader=repos.firs,
            fir_number_reader=repos.firs,
            station_reader=repos.stations,
            district_reader=repos.districts,
            station_list_reader=repos.stations,
        )
        result = svc.get_cases(page_size=1)
        assert len(result["items"]) == 1
        item = result["items"][0]
        assert item["station_name"] != item["station_id"]

    def test_filter_metadata_from_csv(self):
        from app.services.field_map_service import FieldMapService

        repos = self._get_repos()
        svc = FieldMapService(
            fir_reader=repos.firs,
            fir_number_reader=repos.firs,
            station_reader=repos.stations,
            district_reader=repos.districts,
            station_list_reader=repos.stations,
        )
        filters = svc.get_filters()
        assert len(filters["districts"]) > 0
        assert len(filters["stations"]) > 0
        assert len(filters["crime_heads"]) > 0
        assert len(filters["statuses"]) > 0

    def test_case_detail_from_csv(self):
        from app.services.field_map_service import FieldMapService

        repos = self._get_repos()
        svc = FieldMapService(
            fir_reader=repos.firs,
            fir_number_reader=repos.firs,
            station_reader=repos.stations,
            district_reader=repos.districts,
            station_list_reader=repos.stations,
        )
        first_fir = repos.firs.list_all()[0]
        result = svc.get_case_detail(first_fir.fir_id)
        assert result["fir_id"] == first_fir.fir_id
        assert "station_name" in result
