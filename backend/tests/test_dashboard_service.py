"""Unit tests for DashboardService aggregation logic.

Uses lightweight fake repositories — no CSV files loaded.
Integration tests that use real CSV data are in test_dashboard_api.py.
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Optional

import pytest

from app.core.exceptions import InvalidFilterError
from app.database.records import ArrestRecord, ChargeSheetRecord, FIRRecord
from app.services.dashboard_service import DashboardService


# ---------------------------------------------------------------------------
# Fake repositories (minimal implementations for service tests)
# ---------------------------------------------------------------------------


class FakeFIRRepository:
    """In-memory fake for FIRReader protocol."""

    def __init__(self) -> None:
        self._firs: list[FIRRecord] = []

    def add(self, fir: FIRRecord) -> None:
        self._firs.append(fir)

    def list_all(self) -> list[FIRRecord]:
        return list(self._firs)


class FakeArrestRepository:
    """In-memory fake for ArrestReader protocol."""

    def __init__(self) -> None:
        self._arrests: list[ArrestRecord] = []

    def add(self, arrest: ArrestRecord) -> None:
        self._arrests.append(arrest)

    def list_all_arrests(self) -> list[ArrestRecord]:
        return list(self._arrests)


class FakeChargeSheetRepository:
    """In-memory fake for ChargeSheetReader protocol."""

    def __init__(self) -> None:
        self._chargesheets: list[ChargeSheetRecord] = []

    def add(self, cs: ChargeSheetRecord) -> None:
        self._chargesheets.append(cs)

    def list_all_chargesheets(self) -> list[ChargeSheetRecord]:
        return list(self._chargesheets)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _make_fir(
    fir_id: str = "FIR001",
    district: str = "Bengaluru Urban",
    station_id: str = "PS0001",
    crime_head: str = "Theft",
    status: str = "Under Investigation",
    incident_date: datetime = datetime(2025, 6, 15, 10, 0, 0),
) -> FIRRecord:
    return FIRRecord(
        fir_id=fir_id,
        fir_number=f"1/2025",
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


def _make_arrest(
    arrest_id: str = "ARR001",
    fir_id: str = "FIR001",
    person_id: str = "P001",
) -> ArrestRecord:
    return ArrestRecord(
        arrest_id=arrest_id,
        fir_id=fir_id,
        person_id=person_id,
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


def _make_chargesheet(
    chargesheet_id: str = "CS001",
    fir_id: str = "FIR001",
    accused_id: str = "P001",
) -> ChargeSheetRecord:
    return ChargeSheetRecord(
        chargesheet_id=chargesheet_id,
        fir_id=fir_id,
        accused_id=accused_id,
        crime_type="Theft",
        sections="BNS 379",
        investigating_officer="IO1",
        court="Session Court",
        witness_count=2,
        evidence_count=3,
        chargesheet_date=date(2025, 7, 15),
        status="Filed",
    )


def _build_service(
    firs: list[FIRRecord],
    arrests: list[ArrestRecord] | None = None,
    chargesheets: list[ChargeSheetRecord] | None = None,
) -> DashboardService:
    fir_repo = FakeFIRRepository()
    for f in firs:
        fir_repo.add(f)

    arrest_repo = FakeArrestRepository()
    for a in (arrests or []):
        arrest_repo.add(a)

    cs_repo = FakeChargeSheetRepository()
    for cs in (chargesheets or []):
        cs_repo.add(cs)

    return DashboardService(fir_repo, arrest_repo, cs_repo)


# ---------------------------------------------------------------------------
# Unfiltered summary
# ---------------------------------------------------------------------------


class TestDashboardServiceUnfiltered:
    def test_empty_dataset_returns_zeros(self):
        svc = _build_service([])
        result = svc.get_summary()
        assert result == {
            "total_firs": 0,
            "active_cases": 0,
            "closed_cases": 0,
            "chargesheeted_cases": 0,
            "untraced_cases": 0,
            "total_arrests": 0,
            "total_chargesheets": 0,
        }

    def test_single_fir_all_statuses(self):
        firs = [
            _make_fir(fir_id="F1", status="Under Investigation"),
            _make_fir(fir_id="F2", status="Closed"),
            _make_fir(fir_id="F3", status="Chargesheeted"),
            _make_fir(fir_id="F4", status="Untraced"),
        ]
        arrests = [_make_arrest(arrest_id="A1", fir_id="F1")]
        chargesheets = [_make_chargesheet(chargesheet_id="CS1", fir_id="F3")]
        svc = _build_service(firs, arrests, chargesheets)

        result = svc.get_summary()
        assert result["total_firs"] == 4
        assert result["active_cases"] == 1
        assert result["closed_cases"] == 1
        assert result["chargesheeted_cases"] == 1
        assert result["untraced_cases"] == 1
        assert result["total_arrests"] == 1
        assert result["total_chargesheets"] == 1

    def test_multiple_arrests_per_fir(self):
        firs = [_make_fir(fir_id="F1", status="Under Investigation")]
        arrests = [
            _make_arrest(arrest_id="A1", fir_id="F1"),
            _make_arrest(arrest_id="A2", fir_id="F1"),
        ]
        svc = _build_service(firs, arrests)
        result = svc.get_summary()
        assert result["total_arrests"] == 2

    def test_arrests_for_unfiltered_firs_counted(self):
        """Arrests linked to any FIR are counted when no filters applied."""
        firs = [
            _make_fir(fir_id="F1", district="A", status="Under Investigation"),
            _make_fir(fir_id="F2", district="B", status="Closed"),
        ]
        arrests = [
            _make_arrest(arrest_id="A1", fir_id="F1"),
            _make_arrest(arrest_id="A2", fir_id="F2"),
        ]
        svc = _build_service(firs, arrests)
        result = svc.get_summary()
        assert result["total_arrests"] == 2

    def test_arrests_for_nonexistent_fir_not_counted(self):
        """Arrests referencing FIR IDs not in the FIR list are excluded."""
        firs = [_make_fir(fir_id="F1", status="Under Investigation")]
        arrests = [
            _make_arrest(arrest_id="A1", fir_id="F1"),
            _make_arrest(arrest_id="A2", fir_id="F999"),
        ]
        svc = _build_service(firs, arrests)
        result = svc.get_summary()
        assert result["total_arrests"] == 1


# ---------------------------------------------------------------------------
# District filter
# ---------------------------------------------------------------------------


class TestDashboardServiceDistrictFilter:
    def test_filter_by_district(self):
        firs = [
            _make_fir(fir_id="F1", district="Bengaluru Urban"),
            _make_fir(fir_id="F2", district="Mysuru"),
            _make_fir(fir_id="F3", district="Bengaluru Urban"),
        ]
        arrests = [
            _make_arrest(arrest_id="A1", fir_id="F1"),
            _make_arrest(arrest_id="A2", fir_id="F2"),
            _make_arrest(arrest_id="A3", fir_id="F3"),
        ]
        svc = _build_service(firs, arrests)
        result = svc.get_summary(district="Bengaluru Urban")
        assert result["total_firs"] == 2
        assert result["total_arrests"] == 2

    def test_filter_by_nonexistent_district_returns_zeros(self):
        firs = [_make_fir(fir_id="F1", district="Bengaluru Urban")]
        svc = _build_service(firs)
        result = svc.get_summary(district="Nonexistent District")
        assert result["total_firs"] == 0
        assert result["total_arrests"] == 0


# ---------------------------------------------------------------------------
# Station filter
# ---------------------------------------------------------------------------


class TestDashboardServiceStationFilter:
    def test_filter_by_station(self):
        firs = [
            _make_fir(fir_id="F1", station_id="PS0001"),
            _make_fir(fir_id="F2", station_id="PS0002"),
            _make_fir(fir_id="F3", station_id="PS0001"),
        ]
        svc = _build_service(firs)
        result = svc.get_summary(station_id="PS0001")
        assert result["total_firs"] == 2

    def test_filter_by_nonexistent_station_returns_zeros(self):
        firs = [_make_fir(fir_id="F1", station_id="PS0001")]
        svc = _build_service(firs)
        result = svc.get_summary(station_id="PS9999")
        assert result["total_firs"] == 0


# ---------------------------------------------------------------------------
# Crime head filter
# ---------------------------------------------------------------------------


class TestDashboardServiceCrimeHeadFilter:
    def test_filter_by_crime_head(self):
        firs = [
            _make_fir(fir_id="F1", crime_head="Theft"),
            _make_fir(fir_id="F2", crime_head="Assault"),
            _make_fir(fir_id="F3", crime_head="Theft"),
        ]
        svc = _build_service(firs)
        result = svc.get_summary(crime_head="Theft")
        assert result["total_firs"] == 2


# ---------------------------------------------------------------------------
# Date filters
# ---------------------------------------------------------------------------


class TestDashboardServiceDateFilter:
    def test_filter_by_start_date(self):
        firs = [
            _make_fir(fir_id="F1", incident_date=datetime(2025, 1, 1)),
            _make_fir(fir_id="F2", incident_date=datetime(2025, 6, 15)),
            _make_fir(fir_id="F3", incident_date=datetime(2025, 12, 31)),
        ]
        svc = _build_service(firs)
        result = svc.get_summary(start_date=date(2025, 6, 1))
        assert result["total_firs"] == 2

    def test_filter_by_end_date(self):
        firs = [
            _make_fir(fir_id="F1", incident_date=datetime(2025, 1, 1)),
            _make_fir(fir_id="F2", incident_date=datetime(2025, 6, 15)),
            _make_fir(fir_id="F3", incident_date=datetime(2025, 12, 31)),
        ]
        svc = _build_service(firs)
        result = svc.get_summary(end_date=date(2025, 6, 30))
        assert result["total_firs"] == 2

    def test_filter_by_date_range_inclusive(self):
        firs = [
            _make_fir(fir_id="F1", incident_date=datetime(2025, 1, 1)),
            _make_fir(fir_id="F2", incident_date=datetime(2025, 6, 15)),
            _make_fir(fir_id="F3", incident_date=datetime(2025, 12, 31)),
        ]
        svc = _build_service(firs)
        result = svc.get_summary(
            start_date=date(2025, 1, 1), end_date=date(2025, 12, 31)
        )
        assert result["total_firs"] == 3

    def test_start_date_after_end_date_raises(self):
        svc = _build_service([_make_fir()])
        with pytest.raises(InvalidFilterError, match="start_date must not be after end_date"):
            svc.get_summary(start_date=date(2025, 12, 31), end_date=date(2025, 1, 1))

    def test_date_filter_on_boundary(self):
        """FIRs on exact start/end dates are included (inclusive range)."""
        firs = [
            _make_fir(fir_id="F1", incident_date=datetime(2025, 3, 10, 8, 30)),
            _make_fir(fir_id="F2", incident_date=datetime(2025, 3, 10, 17, 45)),
            _make_fir(fir_id="F3", incident_date=datetime(2025, 3, 11, 0, 0)),
        ]
        svc = _build_service(firs)
        result = svc.get_summary(
            start_date=date(2025, 3, 10), end_date=date(2025, 3, 10)
        )
        assert result["total_firs"] == 2


# ---------------------------------------------------------------------------
# Combined filters
# ---------------------------------------------------------------------------


class TestDashboardServiceCombinedFilters:
    def test_multiple_filters_narrow_results(self):
        firs = [
            _make_fir(
                fir_id="F1",
                district="Bengaluru Urban",
                station_id="PS0001",
                crime_head="Theft",
            ),
            _make_fir(
                fir_id="F2",
                district="Bengaluru Urban",
                station_id="PS0002",
                crime_head="Assault",
            ),
            _make_fir(
                fir_id="F3",
                district="Mysuru",
                station_id="PS0001",
                crime_head="Theft",
            ),
        ]
        svc = _build_service(firs)
        result = svc.get_summary(
            district="Bengaluru Urban", crime_head="Theft"
        )
        assert result["total_firs"] == 1

    def test_all_filters_combined(self):
        firs = [
            _make_fir(
                fir_id="F1",
                district="Bengaluru Urban",
                station_id="PS0001",
                crime_head="Theft",
                incident_date=datetime(2025, 6, 15),
            ),
            _make_fir(
                fir_id="F2",
                district="Bengaluru Urban",
                station_id="PS0001",
                crime_head="Theft",
                incident_date=datetime(2025, 8, 20),
            ),
        ]
        arrests = [_make_arrest(arrest_id="A1", fir_id="F1")]
        chargesheets = [_make_chargesheet(chargesheet_id="CS1", fir_id="F1")]
        svc = _build_service(firs, arrests, chargesheets)
        result = svc.get_summary(
            district="Bengaluru Urban",
            station_id="PS0001",
            crime_head="Theft",
            start_date=date(2025, 6, 1),
            end_date=date(2025, 7, 31),
        )
        assert result["total_firs"] == 1
        assert result["total_arrests"] == 1
        assert result["total_chargesheets"] == 1
