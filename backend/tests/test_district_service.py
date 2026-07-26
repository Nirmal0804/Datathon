"""Unit tests for DistrictService aggregation logic.

Uses lightweight fake repositories — no CSV files loaded.
Integration tests that use real CSV data are in test_district_api.py.
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Optional

import pytest

from app.core.exceptions import InvalidFilterError, ResourceNotFoundError
from app.database.records import (
    ArrestRecord,
    ChargeSheetRecord,
    DistrictRecord,
    FIRRecord,
)
from app.services.district_service import DistrictService


# ---------------------------------------------------------------------------
# Fake repositories (minimal implementations for service tests)
# ---------------------------------------------------------------------------


class FakeDistrictRepository:
    """In-memory fake for DistrictListReader protocol."""

    def __init__(self) -> None:
        self._districts: dict[int, DistrictRecord] = {}

    def add(self, district: DistrictRecord) -> None:
        self._districts[district.district_id] = district

    def list_all(self) -> list[DistrictRecord]:
        return list(self._districts.values())

    def get_by_id(self, district_id: int) -> DistrictRecord | None:
        return self._districts.get(district_id)


class FakeFIRRepository:
    """In-memory fake for FIRListReader protocol."""

    def __init__(self) -> None:
        self._firs: list[FIRRecord] = []

    def add(self, fir: FIRRecord) -> None:
        self._firs.append(fir)

    def list_all(self) -> list[FIRRecord]:
        return list(self._firs)


class FakeArrestRepository:
    """In-memory fake for ArrestListReader protocol."""

    def __init__(self) -> None:
        self._arrests: list[ArrestRecord] = []

    def add(self, arrest: ArrestRecord) -> None:
        self._arrests.append(arrest)

    def list_all_arrests(self) -> list[ArrestRecord]:
        return list(self._arrests)


class FakeChargeSheetRepository:
    """In-memory fake for ChargeSheetListReader protocol."""

    def __init__(self) -> None:
        self._chargesheets: list[ChargeSheetRecord] = []

    def add(self, cs: ChargeSheetRecord) -> None:
        self._chargesheets.append(cs)

    def list_all_chargesheets(self) -> list[ChargeSheetRecord]:
        return list(self._chargesheets)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _make_district(
    district_id: int = 1,
    district_name: str = "Test District",
    police_range: str = "Test Range",
    population: int = 1_000_000,
    area_sq_km: int = 5_000,
    population_density: int = 200,
    literacy_rate: float = 75.0,
    urban_population_pct: int = 40,
    rural_population_pct: int = 60,
    police_stations: int = 20,
    latitude: float = 15.0,
    longitude: float = 76.0,
) -> DistrictRecord:
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
    fir_id: str = "FIR001",
    district: str = "Test District",
    station_id: str = "PS0001",
    crime_head: str = "Theft",
    status: str = "Under Investigation",
    incident_date: datetime = datetime(2025, 6, 15, 10, 0, 0),
    latitude: float = 15.0,
    longitude: float = 76.0,
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
        latitude=latitude,
        longitude=longitude,
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
        district="Test District",
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
    districts: list[DistrictRecord],
    firs: list[FIRRecord] | None = None,
    arrests: list[ArrestRecord] | None = None,
    chargesheets: list[ChargeSheetRecord] | None = None,
) -> DistrictService:
    district_repo = FakeDistrictRepository()
    for d in districts:
        district_repo.add(d)

    fir_repo = FakeFIRRepository()
    for f in (firs or []):
        fir_repo.add(f)

    arrest_repo = FakeArrestRepository()
    for a in (arrests or []):
        arrest_repo.add(a)

    cs_repo = FakeChargeSheetRepository()
    for cs in (chargesheets or []):
        cs_repo.add(cs)

    return DistrictService(district_repo, fir_repo, arrest_repo, cs_repo)


# ---------------------------------------------------------------------------
# LIST ALL DISTRICTS
# ---------------------------------------------------------------------------


class TestDistrictServiceListAll:
    def test_returns_every_district(self):
        districts = [
            _make_district(district_id=1, district_name="A"),
            _make_district(district_id=2, district_name="B"),
            _make_district(district_id=3, district_name="C"),
        ]
        svc = _build_service(districts)
        result = svc.list_all_districts()
        assert result["total_districts"] == 3
        assert len(result["districts"]) == 3

    def test_district_ids_are_integers(self):
        districts = [_make_district(district_id=1)]
        svc = _build_service(districts)
        result = svc.list_all_districts()
        item = result["districts"][0]
        assert isinstance(item["district_id"], int)

    def test_sorted_by_district_id(self):
        districts = [
            _make_district(district_id=3, district_name="C"),
            _make_district(district_id=1, district_name="A"),
            _make_district(district_id=2, district_name="B"),
        ]
        svc = _build_service(districts)
        result = svc.list_all_districts()
        ids = [d["district_id"] for d in result["districts"]]
        assert ids == [1, 2, 3]

    def test_transactional_district_has_correct_metrics(self):
        districts = [_make_district(district_id=1, district_name="BD", population=100_000, area_sq_km=500)]
        firs = [
            _make_fir(fir_id="F1", district="BD", crime_head="Theft", status="Under Investigation"),
            _make_fir(fir_id="F2", district="BD", crime_head="Theft", status="Closed"),
            _make_fir(fir_id="F3", district="BD", crime_head="Assault", status="Chargesheeted"),
        ]
        arrests = [_make_arrest(arrest_id="A1", fir_id="F1")]
        chargesheets = [_make_chargesheet(chargesheet_id="CS1", fir_id="F3")]
        svc = _build_service(districts, firs, arrests, chargesheets)
        result = svc.list_all_districts()
        item = result["districts"][0]

        assert item["fir_count"] == 3
        assert item["active_cases"] == 1
        assert item["closed_cases"] == 1
        assert item["chargesheeted_cases"] == 1
        assert item["untraced_cases"] == 0
        assert item["total_arrests"] == 1
        assert item["total_chargesheets"] == 1

    def test_zero_fir_district_has_zero_transactional_metrics(self):
        districts = [_make_district(district_id=99, district_name="Empty")]
        svc = _build_service(districts)
        result = svc.list_all_districts()
        item = result["districts"][0]

        assert item["fir_count"] == 0
        assert item["active_cases"] == 0
        assert item["closed_cases"] == 0
        assert item["chargesheeted_cases"] == 0
        assert item["untraced_cases"] == 0
        assert item["total_arrests"] == 0
        assert item["total_chargesheets"] == 0
        assert item["dominant_crime_type"] is None
        assert item["crime_head_breakdown"] == []
        assert item["status_breakdown"] == []
        assert item["hotspot_count"] == 0

    def test_zero_fir_district_preserves_reference_data(self):
        districts = [_make_district(
            district_id=99,
            district_name="Empty",
            population=500_000,
            area_sq_km=3_000,
            literacy_rate=82.5,
            latitude=14.5,
            longitude=75.9,
        )]
        svc = _build_service(districts)
        result = svc.list_all_districts()
        item = result["districts"][0]

        assert item["population"] == 500_000
        assert item["area_sq_km"] == 3_000
        assert item["literacy_rate"] == 82.5
        assert item["latitude"] == 14.5
        assert item["longitude"] == 75.9

    def test_other_district_firs_not_counted(self):
        districts = [
            _make_district(district_id=1, district_name="A"),
            _make_district(district_id=2, district_name="B"),
        ]
        firs = [
            _make_fir(fir_id="F1", district="A"),
            _make_fir(fir_id="F2", district="A"),
            _make_fir(fir_id="F3", district="B"),
        ]
        svc = _build_service(districts, firs)
        result = svc.list_all_districts()
        items = {d["district_name"]: d for d in result["districts"]}

        assert items["A"]["fir_count"] == 2
        assert items["B"]["fir_count"] == 1


# ---------------------------------------------------------------------------
# CRIME RATE / DENSITY FORMULAS
# ---------------------------------------------------------------------------


class TestDistrictServiceDerivedMetrics:
    def test_crime_rate_per_100k(self):
        districts = [_make_district(district_id=1, district_name="X", population=200_000, area_sq_km=1_000)]
        firs = [_make_fir(fir_id="F1", district="X"), _make_fir(fir_id="F2", district="X")]
        svc = _build_service(districts, firs)
        result = svc.list_all_districts()
        item = result["districts"][0]

        # 2 / 200,000 * 100,000 = 1.0
        assert item["crime_rate_per_100k"] == 1.0

    def test_fir_density_per_sq_km(self):
        districts = [_make_district(district_id=1, district_name="X", population=200_000, area_sq_km=400)]
        firs = [_make_fir(fir_id="F1", district="X"), _make_fir(fir_id="F2", district="X")]
        svc = _build_service(districts, firs)
        result = svc.list_all_districts()
        item = result["districts"][0]

        # 2 / 400 = 0.005
        assert item["fir_density_per_sq_km"] == 0.005

    def test_population_zero_returns_zero_rate(self):
        districts = [_make_district(district_id=1, district_name="X", population=0, area_sq_km=1_000)]
        firs = [_make_fir(fir_id="F1", district="X")]
        svc = _build_service(districts, firs)
        result = svc.list_all_districts()
        item = result["districts"][0]

        assert item["crime_rate_per_100k"] == 0.0

    def test_area_zero_returns_zero_density(self):
        districts = [_make_district(district_id=1, district_name="X", population=100_000, area_sq_km=0)]
        firs = [_make_fir(fir_id="F1", district="X")]
        svc = _build_service(districts, firs)
        result = svc.list_all_districts()
        item = result["districts"][0]

        assert item["fir_density_per_sq_km"] == 0.0


# ---------------------------------------------------------------------------
# DOMINANT CRIME
# ---------------------------------------------------------------------------


class TestDistrictServiceDominantCrime:
    def test_dominant_crime_highest_count(self):
        districts = [_make_district(district_id=1, district_name="X")]
        firs = [
            _make_fir(fir_id="F1", district="X", crime_head="Theft"),
            _make_fir(fir_id="F2", district="X", crime_head="Theft"),
            _make_fir(fir_id="F3", district="X", crime_head="Assault"),
        ]
        svc = _build_service(districts, firs)
        result = svc.list_all_districts()
        item = result["districts"][0]
        assert item["dominant_crime_type"] == "Theft"

    def test_dominant_crime_alphabetical_tie_break(self):
        districts = [_make_district(district_id=1, district_name="X")]
        firs = [
            _make_fir(fir_id="F1", district="X", crime_head="Assault"),
            _make_fir(fir_id="F2", district="X", crime_head="Theft"),
        ]
        svc = _build_service(districts, firs)
        result = svc.list_all_districts()
        item = result["districts"][0]
        assert item["dominant_crime_type"] == "Assault"


# ---------------------------------------------------------------------------
# BREAKDOWN ORDERING
# ---------------------------------------------------------------------------


class TestDistrictServiceBreakdownOrdering:
    def test_crime_head_breakdown_count_desc_alphabetical(self):
        districts = [_make_district(district_id=1, district_name="X")]
        firs = [
            _make_fir(fir_id="F1", district="X", crime_head="Assault"),
            _make_fir(fir_id="F2", district="X", crime_head="Theft"),
            _make_fir(fir_id="F3", district="X", crime_head="Theft"),
            _make_fir(fir_id="F4", district="X", crime_head="Burglary"),
        ]
        svc = _build_service(districts, firs)
        result = svc.list_all_districts()
        item = result["districts"][0]

        breakdown = item["crime_head_breakdown"]
        assert breakdown[0]["crime_head"] == "Theft"
        assert breakdown[0]["count"] == 2
        # Assault and Burglary both have count=1, alphabetical: Assault < Burglary
        assert breakdown[1]["crime_head"] == "Assault"
        assert breakdown[2]["crime_head"] == "Burglary"

    def test_status_breakdown_alphabetical(self):
        districts = [_make_district(district_id=1, district_name="X")]
        firs = [
            _make_fir(fir_id="F1", district="X", status="Closed"),
            _make_fir(fir_id="F2", district="X", status="Under Investigation"),
            _make_fir(fir_id="F3", district="X", status="Closed"),
        ]
        svc = _build_service(districts, firs)
        result = svc.list_all_districts()
        item = result["districts"][0]

        breakdown = item["status_breakdown"]
        statuses = [s["status"] for s in breakdown]
        assert statuses == ["Closed", "Under Investigation"]


# ---------------------------------------------------------------------------
# HOTSPOT COUNT
# ---------------------------------------------------------------------------


class TestDistrictServiceHotspotCount:
    def test_hotspot_count_zero_firs(self):
        districts = [_make_district(district_id=1, district_name="X")]
        svc = _build_service(districts)
        result = svc.list_all_districts()
        item = result["districts"][0]
        assert item["hotspot_count"] == 0


# ---------------------------------------------------------------------------
# DETAIL ENDPOINT
# ---------------------------------------------------------------------------


class TestDistrictServiceDetail:
    def test_valid_district_id(self):
        districts = [_make_district(district_id=1, district_name="X", population=100_000, area_sq_km=500)]
        firs = [_make_fir(fir_id="F1", district="X")]
        arrests = [_make_arrest(arrest_id="A1", fir_id="F1")]
        svc = _build_service(districts, firs, arrests)
        result = svc.get_district_intelligence(1)
        assert result["district_id"] == 1
        assert result["fir_count"] == 1
        assert result["total_arrests"] == 1

    def test_unknown_district_id_raises(self):
        districts = [_make_district(district_id=1, district_name="X")]
        svc = _build_service(districts)
        with pytest.raises(ResourceNotFoundError, match="District not found"):
            svc.get_district_intelligence(999)

    def test_zero_fir_district_detail_succeeds(self):
        districts = [_make_district(district_id=99, district_name="Empty", population=500_000)]
        svc = _build_service(districts)
        result = svc.get_district_intelligence(99)
        assert result["district_id"] == 99
        assert result["fir_count"] == 0
        assert result["total_arrests"] == 0

    def test_start_date_filter(self):
        districts = [_make_district(district_id=1, district_name="X")]
        firs = [
            _make_fir(fir_id="F1", district="X", incident_date=datetime(2025, 1, 1)),
            _make_fir(fir_id="F2", district="X", incident_date=datetime(2025, 6, 15)),
            _make_fir(fir_id="F3", district="X", incident_date=datetime(2025, 12, 31)),
        ]
        svc = _build_service(districts, firs)
        result = svc.get_district_intelligence(1, start_date=date(2025, 6, 1))
        assert result["fir_count"] == 2

    def test_end_date_filter(self):
        districts = [_make_district(district_id=1, district_name="X")]
        firs = [
            _make_fir(fir_id="F1", district="X", incident_date=datetime(2025, 1, 1)),
            _make_fir(fir_id="F2", district="X", incident_date=datetime(2025, 6, 15)),
            _make_fir(fir_id="F3", district="X", incident_date=datetime(2025, 12, 31)),
        ]
        svc = _build_service(districts, firs)
        result = svc.get_district_intelligence(1, end_date=date(2025, 6, 30))
        assert result["fir_count"] == 2

    def test_inclusive_equal_date_range(self):
        districts = [_make_district(district_id=1, district_name="X")]
        firs = [
            _make_fir(fir_id="F1", district="X", incident_date=datetime(2025, 6, 15, 8, 30)),
            _make_fir(fir_id="F2", district="X", incident_date=datetime(2025, 6, 15, 17, 45)),
            _make_fir(fir_id="F3", district="X", incident_date=datetime(2025, 6, 16)),
        ]
        svc = _build_service(districts, firs)
        result = svc.get_district_intelligence(
            1, start_date=date(2025, 6, 15), end_date=date(2025, 6, 15)
        )
        assert result["fir_count"] == 2

    def test_crime_head_filter(self):
        districts = [_make_district(district_id=1, district_name="X")]
        firs = [
            _make_fir(fir_id="F1", district="X", crime_head="Theft"),
            _make_fir(fir_id="F2", district="X", crime_head="Assault"),
            _make_fir(fir_id="F3", district="X", crime_head="Theft"),
        ]
        svc = _build_service(districts, firs)
        result = svc.get_district_intelligence(1, crime_head="Theft")
        assert result["fir_count"] == 2

    def test_status_filter(self):
        districts = [_make_district(district_id=1, district_name="X")]
        firs = [
            _make_fir(fir_id="F1", district="X", status="Under Investigation"),
            _make_fir(fir_id="F2", district="X", status="Closed"),
            _make_fir(fir_id="F3", district="X", status="Closed"),
        ]
        svc = _build_service(districts, firs)
        result = svc.get_district_intelligence(1, status="Closed")
        assert result["fir_count"] == 2

    def test_combined_filters(self):
        districts = [_make_district(district_id=1, district_name="X")]
        firs = [
            _make_fir(fir_id="F1", district="X", crime_head="Theft", status="Closed",
                       incident_date=datetime(2025, 6, 15)),
            _make_fir(fir_id="F2", district="X", crime_head="Theft", status="Closed",
                       incident_date=datetime(2025, 8, 20)),
            _make_fir(fir_id="F3", district="X", crime_head="Theft", status="Under Investigation",
                       incident_date=datetime(2025, 6, 20)),
            _make_fir(fir_id="F4", district="X", crime_head="Assault", status="Closed",
                       incident_date=datetime(2025, 7, 1)),
        ]
        arrests = [_make_arrest(arrest_id="A1", fir_id="F1")]
        chargesheets = [_make_chargesheet(chargesheet_id="CS1", fir_id="F1")]
        svc = _build_service(districts, firs, arrests, chargesheets)
        result = svc.get_district_intelligence(
            1,
            start_date=date(2025, 6, 1),
            end_date=date(2025, 7, 31),
            crime_head="Theft",
            status="Closed",
        )
        assert result["fir_count"] == 1
        assert result["total_arrests"] == 1
        assert result["total_chargesheets"] == 1

    def test_invalid_date_range_raises(self):
        districts = [_make_district(district_id=1, district_name="X")]
        firs = [_make_fir(fir_id="F1", district="X")]
        svc = _build_service(districts, firs)
        with pytest.raises(InvalidFilterError, match="start_date must not be after end_date"):
            svc.get_district_intelligence(
                1, start_date=date(2025, 12, 31), end_date=date(2025, 1, 1)
            )

    def test_filtered_arrests_scoped_through_fir_id(self):
        districts = [_make_district(district_id=1, district_name="X")]
        firs = [
            _make_fir(fir_id="F1", district="X", crime_head="Theft"),
            _make_fir(fir_id="F2", district="X", crime_head="Assault"),
        ]
        arrests = [
            _make_arrest(arrest_id="A1", fir_id="F1"),
            _make_arrest(arrest_id="A2", fir_id="F2"),
        ]
        svc = _build_service(districts, firs, arrests)
        result = svc.get_district_intelligence(1, crime_head="Theft")
        assert result["total_arrests"] == 1

    def test_filtered_chargesheets_scoped_through_fir_id(self):
        districts = [_make_district(district_id=1, district_name="X")]
        firs = [
            _make_fir(fir_id="F1", district="X", crime_head="Theft"),
            _make_fir(fir_id="F2", district="X", crime_head="Assault"),
        ]
        chargesheets = [
            _make_chargesheet(chargesheet_id="CS1", fir_id="F1"),
            _make_chargesheet(chargesheet_id="CS2", fir_id="F2"),
        ]
        svc = _build_service(districts, firs, chargesheets=chargesheets)
        result = svc.get_district_intelligence(1, crime_head="Theft")
        assert result["total_chargesheets"] == 1

    def test_no_pii_exposed(self):
        districts = [_make_district(district_id=1, district_name="X")]
        firs = [_make_fir(fir_id="F1", district="X")]
        svc = _build_service(districts, firs)
        result = svc.get_district_intelligence(1)

        result_str = str(result)
        pii_fields = ["Person_ID", "person_id", "Full_Name", "DOB", "Blood_Group",
                       "Complainant_ID", "Victim_ID", "Accused_ID"]
        for field in pii_fields:
            assert field not in result_str
