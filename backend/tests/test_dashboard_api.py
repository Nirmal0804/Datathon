"""API endpoint tests for GET /api/v1/dashboard/summary.

Uses FastAPI TestClient against the real app.  Repository loading uses
real CSV data for the integration test; unit-level API tests override
the dependency with fakes.
"""

from __future__ import annotations

from datetime import datetime
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database.records import FIRRecord, ArrestRecord, ChargeSheetRecord
from app.services.dashboard_service import DashboardService
from app.database.dependencies import RepositoryCollection, get_repositories


# ---------------------------------------------------------------------------
# Fake repos for unit-level API tests (no CSV loaded)
# ---------------------------------------------------------------------------


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


def _make_fir(
    fir_id="FIR001",
    district="Bengaluru Urban",
    station_id="PS0001",
    crime_head="Theft",
    status="Under Investigation",
    incident_date=datetime(2025, 6, 15),
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
        latitude=0.0,
        longitude=0.0,
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


def _build_fake_repos(firs, arrests=None, chargesheets=None):
    return RepositoryCollection(
        districts=None,
        stations=None,
        people=None,
        firs=_FakeFIRRepo(firs),
        arrests=_FakeArrestRepo(arrests or []),
        chargesheets=_FakeCSRepo(chargesheets or []),
    )


# ---------------------------------------------------------------------------
# Unit-level API tests (fake repos, no CSV)
# ---------------------------------------------------------------------------


class TestDashboardAPIUnit:
    def test_health_still_works(self):
        client = TestClient(app)
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"

    def test_summary_returns_200(self):
        repos = _build_fake_repos(
            firs=[_make_fir()],
            arrests=[_make_arrest()],
            chargesheets=[_make_chargesheet()],
        )
        app.dependency_overrides[get_repositories] = lambda: repos

        try:
            client = TestClient(app)
            resp = client.get("/api/v1/dashboard/summary")
            assert resp.status_code == 200
        finally:
            app.dependency_overrides.clear()

    def test_summary_schema_has_all_seven_fields(self):
        repos = _build_fake_repos(
            firs=[_make_fir()],
            arrests=[],
            chargesheets=[],
        )
        app.dependency_overrides[get_repositories] = lambda: repos

        try:
            client = TestClient(app)
            resp = client.get("/api/v1/dashboard/summary")
            data = resp.json()
            expected_keys = {
                "total_firs",
                "active_cases",
                "closed_cases",
                "chargesheeted_cases",
                "untraced_cases",
                "total_arrests",
                "total_chargesheets",
            }
            assert set(data.keys()) == expected_keys
        finally:
            app.dependency_overrides.clear()

    def test_summary_with_query_params(self):
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
                "/api/v1/dashboard/summary",
                params={"district": "A", "crime_head": "Theft"},
            )
            assert resp.status_code == 200
            data = resp.json()
            assert data["total_firs"] == 1
        finally:
            app.dependency_overrides.clear()

    def test_summary_zero_valued_for_no_match(self):
        repos = _build_fake_repos(firs=[])
        app.dependency_overrides[get_repositories] = lambda: repos

        try:
            client = TestClient(app)
            resp = client.get(
                "/api/v1/dashboard/summary",
                params={"district": "Nonexistent"},
            )
            assert resp.status_code == 200
            data = resp.json()
            assert data["total_firs"] == 0
            assert data["active_cases"] == 0
            assert data["total_arrests"] == 0
        finally:
            app.dependency_overrides.clear()

    def test_invalid_date_returns_400(self):
        """start_date > end_date returns structured INVALID_FILTER error."""
        client = TestClient(app)
        resp = client.get(
            "/api/v1/dashboard/summary",
            params={"start_date": "2025-12-31", "end_date": "2025-01-01"},
        )
        assert resp.status_code == 400
        body = resp.json()
        assert "error" in body
        error = body["error"]
        assert error["code"] == "INVALID_FILTER"
        assert "start_date" in error["message"] or "end_date" in error["message"]
        assert error["request_id"] is not None
        assert len(error["request_id"]) > 0

    def test_request_id_header_present(self):
        """GET /api/v1/dashboard/summary returns a non-empty X-Request-ID."""
        repos = _build_fake_repos(firs=[])
        app.dependency_overrides[get_repositories] = lambda: repos

        try:
            client = TestClient(app)
            resp = client.get("/api/v1/dashboard/summary")
            request_id = resp.headers.get("x-request-id")
            assert request_id is not None
            assert len(request_id) > 0
        finally:
            app.dependency_overrides.clear()

    def test_equal_start_end_date_succeeds(self):
        """start_date == end_date is valid and inclusive."""
        repos = _build_fake_repos(
            firs=[
                _make_fir(fir_id="F1", incident_date=datetime(2025, 6, 15)),
                _make_fir(fir_id="F2", incident_date=datetime(2025, 6, 16)),
            ],
        )
        app.dependency_overrides[get_repositories] = lambda: repos

        try:
            client = TestClient(app)
            resp = client.get(
                "/api/v1/dashboard/summary",
                params={"start_date": "2025-06-15", "end_date": "2025-06-15"},
            )
            assert resp.status_code == 200
            data = resp.json()
            assert data["total_firs"] == 1
        finally:
            app.dependency_overrides.clear()

    def test_response_is_json_with_correct_content_type(self):
        repos = _build_fake_repos(firs=[])
        app.dependency_overrides[get_repositories] = lambda: repos

        try:
            client = TestClient(app)
            resp = client.get("/api/v1/dashboard/summary")
            assert resp.headers["content-type"] == "application/json"
        finally:
            app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Integration test — real CSV data
# ---------------------------------------------------------------------------


class TestDashboardAPIIntegration:
    """Uses real CSV-backed repositories loaded from settings.DATA_DIR."""

    def test_unfiltered_summary_counts(self):
        """Unfiltered summary returns expected baselines from real data."""
        from app.database.dependencies import _load_repositories
        repos = _load_repositories()

        svc = DashboardService(
            fir_reader=repos.firs,
            arrest_reader=repos.arrests,
            chargesheet_reader=repos.chargesheets,
        )
        result = svc.get_summary()

        assert result["total_firs"] == 5000
        assert result["total_arrests"] == 2540
        assert result["total_chargesheets"] == 2469

    def test_unfiltered_status_breakdown(self):
        """Status counts sum to total_firs."""
        from app.database.dependencies import _load_repositories
        repos = _load_repositories()

        svc = DashboardService(
            fir_reader=repos.firs,
            arrest_reader=repos.arrests,
            chargesheet_reader=repos.chargesheets,
        )
        result = svc.get_summary()

        status_sum = (
            result["active_cases"]
            + result["closed_cases"]
            + result["chargesheeted_cases"]
            + result["untraced_cases"]
        )
        assert status_sum == result["total_firs"]

    def test_status_values_match_expected(self):
        """Status breakdown matches known baselines from real data."""
        from app.database.dependencies import _load_repositories
        repos = _load_repositories()

        svc = DashboardService(
            fir_reader=repos.firs,
            arrest_reader=repos.arrests,
            chargesheet_reader=repos.chargesheets,
        )
        result = svc.get_summary()

        assert result["active_cases"] == 1765
        assert result["closed_cases"] == 284
        assert result["chargesheeted_cases"] == 2469
        assert result["untraced_cases"] == 482
