"""API endpoint tests for District Intelligence endpoints.

Uses FastAPI TestClient against the real app.  Repository loading uses
real CSV data for integration tests; unit-level API tests override
the dependency with fakes.
"""

from __future__ import annotations

from datetime import datetime
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database.records import (
    ArrestRecord,
    ChargeSheetRecord,
    DistrictRecord,
    FIRRecord,
)
from app.database.dependencies import RepositoryCollection, get_repositories


# ---------------------------------------------------------------------------
# Fake repos for unit-level API tests (no CSV loaded)
# ---------------------------------------------------------------------------


class _FakeDistrictRepo:
    def __init__(self, districts: list[DistrictRecord] | None = None):
        self._districts = {d.district_id: d for d in (districts or [])}

    def list_all(self):
        return list(self._districts.values())

    def get_by_id(self, district_id: int):
        return self._districts.get(district_id)


class _FakeFIRRepo:
    def __init__(self, firs: list[FIRRecord] | None = None):
        self._firs = firs or []

    def list_all(self):
        return list(self._firs)


class _FakeArrestRepo:
    def __init__(self, arrests: list[ArrestRecord] | None = None):
        self._arrests = arrests or []

    def list_all_arrests(self):
        return list(self._arrests)


class _FakeCSRepo:
    def __init__(self, css: list[ChargeSheetRecord] | None = None):
        self._css = css or []

    def list_all_chargesheets(self):
        return list(self._css)


def _make_district(
    district_id=1,
    district_name="Bengaluru Urban",
    police_range="Bengaluru City",
    population=1_000_000,
    area_sq_km=5_000,
    population_density=200,
    literacy_rate=88.0,
    urban_population_pct=80,
    rural_population_pct=20,
    police_stations=30,
    latitude=12.97,
    longitude=77.59,
):
    return DistrictRecord(
        district_id=district_id,
        district_name=district_name,
        police_range=police_range,
        state="Karnataka",
        population=population,
        area_sq_km=area_sq_km,
        population_density=population_density,
        literacy_rate=literacy_rate,
        urban_population_pct=urban_population_pct,
        rural_population_pct=rural_population_pct,
        police_stations=police_stations,
        latitude=latitude,
        longitude=longitude,
    )


def _make_fir(
    fir_id="FIR001",
    district="Bengaluru Urban",
    station_id="PS0001",
    crime_head="Theft",
    status="Under Investigation",
    incident_date=datetime(2025, 6, 15),
    latitude=12.97,
    longitude=77.59,
):
    return FIRRecord(
        fir_id=fir_id,
        fir_number="1/2025",
        station_id=station_id,
        district=district,
        incident_date=incident_date,
        fir_date=incident_date,
        crime_head=crime_head,
        crime_subhead="",
        bns_sections="",
        latitude=latitude,
        longitude=longitude,
        complainant_id="C001",
        victim_id="V001",
        accused_ids=("P001",),
        investigating_officer="IO1",
        status=status,
    )


def _make_arrest(arrest_id="A1", fir_id="FIR001"):
    return ArrestRecord(
        arrest_id=arrest_id,
        fir_id=fir_id,
        person_id="P001",
        accused_name="Test",
        gender="Male",
        age=30,
        district="Bengaluru Urban",
        station_id="PS0001",
        arrest_date=datetime(2025, 6, 20),
        arrest_location="Loc",
        arresting_officer="Officer",
        custody_type="Police",
        bail_status="No",
        recovery_item="None",
        recovery_value=0,
    )


def _make_chargesheet(chargesheet_id="CS1", fir_id="FIR001"):
    from datetime import date
    return ChargeSheetRecord(
        chargesheet_id=chargesheet_id,
        fir_id=fir_id,
        accused_id="P001",
        crime_type="Theft",
        sections="BNS 379",
        investigating_officer="IO1",
        court="Session Court",
        witness_count=2,
        evidence_count=3,
        chargesheet_date=date(2025, 7, 15),
        status="Filed",
    )


def _build_fake_repos(
    districts=None,
    firs=None,
    arrests=None,
    chargesheets=None,
):
    return RepositoryCollection(
        districts=_FakeDistrictRepo(districts or []),
        stations=None,
        people=None,
        firs=_FakeFIRRepo(firs or []),
        arrests=_FakeArrestRepo(arrests or []),
        chargesheets=_FakeCSRepo(chargesheets or []),
    )


# ---------------------------------------------------------------------------
# GET /api/v1/districts — Unit tests
# ---------------------------------------------------------------------------


class TestDistrictsListAPIUnit:
    def test_returns_200(self):
        repos = _build_fake_repos(
            districts=[_make_district()],
            firs=[_make_fir()],
        )
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/districts")
            assert resp.status_code == 200
        finally:
            app.dependency_overrides.clear()

    def test_response_has_correct_schema(self):
        repos = _build_fake_repos(
            districts=[_make_district()],
            firs=[],
        )
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/districts")
            data = resp.json()
            assert "districts" in data
            assert "total_districts" in data
            assert data["total_districts"] == 1

            item = data["districts"][0]
            expected_keys = {
                "district_id", "district_name", "police_range",
                "population", "area_sq_km", "population_density",
                "literacy_rate", "urban_population_pct", "rural_population_pct",
                "police_stations", "latitude", "longitude",
                "fir_count", "active_cases", "closed_cases",
                "chargesheeted_cases", "untraced_cases",
                "total_arrests", "total_chargesheets",
                "crime_rate_per_100k", "fir_density_per_sq_km",
                "dominant_crime_type", "crime_head_breakdown", "status_breakdown",
                "hotspot_count",
            }
            assert set(item.keys()) == expected_keys
        finally:
            app.dependency_overrides.clear()

    def test_request_id_header_present(self):
        repos = _build_fake_repos(districts=[], firs=[])
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/districts")
            request_id = resp.headers.get("x-request-id")
            assert request_id is not None
            assert len(request_id) > 0
        finally:
            app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# GET /api/v1/districts/{district_id}/intelligence — Unit tests
# ---------------------------------------------------------------------------


class TestDistrictIntelligenceAPIUnit:
    def test_returns_200_for_valid_district(self):
        repos = _build_fake_repos(
            districts=[_make_district(district_id=1)],
            firs=[_make_fir()],
        )
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/districts/1/intelligence")
            assert resp.status_code == 200
        finally:
            app.dependency_overrides.clear()

    def test_returns_404_for_unknown_district(self):
        repos = _build_fake_repos(
            districts=[_make_district(district_id=1)],
            firs=[],
        )
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/districts/999/intelligence")
            assert resp.status_code == 404
            body = resp.json()
            assert body["error"]["code"] == "RESOURCE_NOT_FOUND"
        finally:
            app.dependency_overrides.clear()

    def test_zero_fir_district_returns_200(self):
        repos = _build_fake_repos(
            districts=[_make_district(district_id=99, district_name="Empty")],
            firs=[],
        )
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/districts/99/intelligence")
            assert resp.status_code == 200
            data = resp.json()
            assert data["fir_count"] == 0
        finally:
            app.dependency_overrides.clear()

    def test_filter_params_work(self):
        repos = _build_fake_repos(
            districts=[_make_district(district_id=1)],
            firs=[
                _make_fir(fir_id="F1", crime_head="Theft"),
                _make_fir(fir_id="F2", crime_head="Assault"),
            ],
        )
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get(
                "/api/v1/districts/1/intelligence",
                params={"crime_head": "Theft"},
            )
            assert resp.status_code == 200
            data = resp.json()
            assert data["fir_count"] == 1
        finally:
            app.dependency_overrides.clear()

    def test_invalid_date_range_returns_400(self):
        repos = _build_fake_repos(
            districts=[_make_district(district_id=1)],
            firs=[_make_fir()],
        )
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get(
                "/api/v1/districts/1/intelligence",
                params={"start_date": "2025-12-31", "end_date": "2025-01-01"},
            )
            assert resp.status_code == 400
            body = resp.json()
            assert body["error"]["code"] == "INVALID_FILTER"
        finally:
            app.dependency_overrides.clear()

    def test_request_id_header_present(self):
        repos = _build_fake_repos(
            districts=[_make_district(district_id=1)],
            firs=[],
        )
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/districts/1/intelligence")
            request_id = resp.headers.get("x-request-id")
            assert request_id is not None
            assert len(request_id) > 0
        finally:
            app.dependency_overrides.clear()

    def test_no_pii_in_response(self):
        repos = _build_fake_repos(
            districts=[_make_district(district_id=1)],
            firs=[_make_fir()],
        )
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/districts/1/intelligence")
            data = resp.json()
            resp_str = str(data)
            pii_fields = ["Person_ID", "person_id", "Full_Name", "DOB",
                          "Blood_Group", "Complainant_ID", "Victim_ID"]
            for field in pii_fields:
                assert field not in resp_str
        finally:
            app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Integration tests — real CSV data
# ---------------------------------------------------------------------------


class TestDistrictAPIIntegration:
    """Uses real CSV-backed repositories loaded from settings.DATA_DIR."""

    def test_list_returns_31_districts(self):
        from tests.conftest import get_csv_repositories
        repos = get_csv_repositories()
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/districts")
            assert resp.status_code == 200
            data = resp.json()
            assert data["total_districts"] == 31
            assert len(data["districts"]) == 31
        finally:
            app.dependency_overrides.clear()

    def test_transactional_district_has_data(self):
        from tests.conftest import get_csv_repositories
        repos = get_csv_repositories()
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/districts/1/intelligence")
            assert resp.status_code == 200
            data = resp.json()
            assert data["district_id"] == 1
            assert data["fir_count"] > 0
        finally:
            app.dependency_overrides.clear()

    def test_zero_data_district_preserves_reference(self):
        from tests.conftest import get_csv_repositories
        repos = get_csv_repositories()
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            # District 31 should have no transactional data
            resp = client.get("/api/v1/districts/31/intelligence")
            assert resp.status_code == 200
            data = resp.json()
            assert data["fir_count"] == 0
            assert data["population"] > 0
        finally:
            app.dependency_overrides.clear()

    def test_unknown_district_returns_404(self):
        from tests.conftest import get_csv_repositories
        repos = get_csv_repositories()
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/districts/999/intelligence")
            assert resp.status_code == 404
        finally:
            app.dependency_overrides.clear()

    def test_crime_head_filter_works(self):
        from tests.conftest import get_csv_repositories
        repos = get_csv_repositories()
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get(
                "/api/v1/districts/1/intelligence",
                params={"crime_head": "Cyber Crime"},
            )
            assert resp.status_code == 200
            data = resp.json()
            # All FIRs should be Cyber Crime
            assert all(
                item["crime_head"] == "Cyber Crime"
                for item in data["crime_head_breakdown"]
            )
        finally:
            app.dependency_overrides.clear()

    def test_invalid_date_range_returns_400(self):
        from tests.conftest import get_csv_repositories
        repos = get_csv_repositories()
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get(
                "/api/v1/districts/1/intelligence",
                params={"start_date": "2025-12-31", "end_date": "2025-01-01"},
            )
            assert resp.status_code == 400
            body = resp.json()
            assert body["error"]["code"] == "INVALID_FILTER"
        finally:
            app.dependency_overrides.clear()

    def test_health_still_works(self):
        client = TestClient(app)
        resp = client.get("/health")
        assert resp.status_code == 200

    def test_dashboard_still_works(self):
        from tests.conftest import get_csv_repositories
        repos = get_csv_repositories()
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/dashboard/summary")
            assert resp.status_code == 200
        finally:
            app.dependency_overrides.clear()

    def test_intelligence_map_still_works(self):
        from tests.conftest import get_csv_repositories
        repos = get_csv_repositories()
        app.dependency_overrides[get_repositories] = lambda: repos
        try:
            client = TestClient(app)
            resp = client.get("/api/v1/map/intelligence/analytics")
            assert resp.status_code == 200
        finally:
            app.dependency_overrides.clear()
