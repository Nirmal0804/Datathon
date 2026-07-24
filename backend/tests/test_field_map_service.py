"""Unit tests for FieldMapService.

Uses lightweight fake repositories — no CSV files loaded.
Integration tests that use real CSV data are in test_field_map_api.py.
"""

from __future__ import annotations

from datetime import date, datetime

import pytest

from app.core.exceptions import InvalidFilterError, ResourceNotFoundError
from app.database.records import DistrictRecord, FIRRecord, StationRecord
from app.services.field_map_service import FieldMapService


# ---------------------------------------------------------------------------
# Fake repositories (minimal implementations for service tests)
# ---------------------------------------------------------------------------


class FakeFIRReader:
    def __init__(self) -> None:
        self._firs: list[FIRRecord] = []

    def add(self, fir: FIRRecord) -> None:
        self._firs.append(fir)

    def list_all(self) -> list[FIRRecord]:
        return list(self._firs)

    def get_by_id(self, fir_id: str) -> FIRRecord | None:
        for f in self._firs:
            if f.fir_id == fir_id:
                return f
        return None

    def get_by_number(self, fir_number: str) -> FIRRecord | None:
        for f in self._firs:
            if f.fir_number == fir_number:
                return f
        return None


class FakeStationReader:
    def __init__(self, stations: list[StationRecord] | None = None) -> None:
        self._stations = {s.station_id: s for s in (stations or [])}

    def get_by_id(self, station_id: str) -> StationRecord | None:
        return self._stations.get(station_id)

    def list_all(self) -> list[StationRecord]:
        return list(self._stations.values())


class FakeDistrictReader:
    def __init__(self, districts: list[DistrictRecord] | None = None) -> None:
        self._districts = list(districts or [])

    def list_all(self) -> list[DistrictRecord]:
        return list(self._districts)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _make_fir(
    fir_id: str = "FIR001",
    fir_number: str = "1/2025",
    district: str = "Bengaluru Urban",
    station_id: str = "PS0001",
    crime_head: str = "Theft",
    crime_subhead: str = "Petty Theft",
    bns_sections: str = "BNS 379",
    status: str = "Under Investigation",
    incident_date: datetime = datetime(2025, 6, 15, 10, 0, 0),
    lat: float = 12.97,
    lon: float = 77.59,
    io: str = "SI Ganesh Rao",
) -> FIRRecord:
    return FIRRecord(
        fir_id=fir_id,
        fir_number=fir_number,
        station_id=station_id,
        district=district,
        incident_date=incident_date,
        fir_date=incident_date,
        crime_head=crime_head,
        crime_subhead=crime_subhead,
        bns_sections=bns_sections,
        latitude=lat,
        longitude=lon,
        complainant_id="C001",
        victim_id="V001",
        accused_ids=("P001",),
        investigating_officer=io,
        status=status,
    )


def _make_station(
    station_id: str = "PS0001",
    station_name: str = "Bengaluru Central PS",
) -> StationRecord:
    return StationRecord(
        station_id=station_id,
        station_name=station_name,
        district_id=5,
        district_name="Bengaluru Urban",
        zone="Central",
        station_type="Town Police Station",
        latitude=12.97,
        longitude=77.59,
        personnel_strength=50,
        patrol_vehicles=10,
        contact_number="08012345678",
        email="ps0001@ksp.gov.in",
    )


def _make_district(district_name: str = "Bengaluru Urban") -> DistrictRecord:
    return DistrictRecord(
        district_id=5,
        district_name=district_name,
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


def _build_service(
    firs: list[FIRRecord],
    stations: list[StationRecord] | None = None,
    districts: list[DistrictRecord] | None = None,
) -> FieldMapService:
    fir_reader = FakeFIRReader()
    for f in firs:
        fir_reader.add(f)

    station_reader = FakeStationReader(stations or [])
    district_reader = FakeDistrictReader(districts or [])

    return FieldMapService(
        fir_reader=fir_reader,
        fir_number_reader=fir_reader,
        station_reader=station_reader,
        district_reader=district_reader,
        station_list_reader=station_reader,
    )


# ---------------------------------------------------------------------------
# 1. Unfiltered case listing
# ---------------------------------------------------------------------------


class TestFieldMapServiceUnfiltered:
    def test_empty_dataset_returns_empty_items(self):
        svc = _build_service([])
        result = svc.get_cases()
        assert result["items"] == []
        assert result["total"] == 0
        assert result["total_pages"] == 1

    def test_single_fir_returned(self):
        svc = _build_service([_make_fir()], stations=[_make_station()])
        result = svc.get_cases()
        assert result["total"] == 1
        assert len(result["items"]) == 1
        item = result["items"][0]
        assert item["fir_id"] == "FIR001"
        assert item["station_name"] == "Bengaluru Central PS"

    def test_station_name_resolved(self):
        stations = [_make_station(station_id="PS0001", station_name="Test Station")]
        svc = _build_service([_make_fir()], stations=stations)
        result = svc.get_cases()
        assert result["items"][0]["station_name"] == "Test Station"

    def test_station_name_falls_back_to_id(self):
        """If station is not found, station_id is used as fallback."""
        svc = _build_service([_make_fir(station_id="PS9999")], stations=[])
        result = svc.get_cases()
        assert result["items"][0]["station_name"] == "PS9999"

    def test_no_pii_exposed_in_summary(self):
        svc = _build_service([_make_fir()])
        result = svc.get_cases()
        item = result["items"][0]
        for field in ("complainant_id", "victim_id", "accused_ids",
                       "person_id", "full_name", "dob", "blood_group"):
            assert field not in item


# ---------------------------------------------------------------------------
# 2. Pagination
# ---------------------------------------------------------------------------


class TestFieldMapServicePagination:
    def test_default_page_size(self):
        firs = [_make_fir(fir_id=f"F{i}") for i in range(60)]
        svc = _build_service(firs)
        result = svc.get_cases()
        assert result["page"] == 1
        assert result["page_size"] == 50
        assert result["total"] == 60
        assert len(result["items"]) == 50
        assert result["total_pages"] == 2

    def test_page_2(self):
        firs = [_make_fir(fir_id=f"F{i}") for i in range(60)]
        svc = _build_service(firs)
        result = svc.get_cases(page=2, page_size=50)
        assert len(result["items"]) == 10

    def test_custom_page_size(self):
        firs = [_make_fir(fir_id=f"F{i}") for i in range(25)]
        svc = _build_service(firs)
        result = svc.get_cases(page=1, page_size=10)
        assert len(result["items"]) == 10
        assert result["total_pages"] == 3

    def test_empty_page_beyond_total(self):
        firs = [_make_fir(fir_id="F1")]
        svc = _build_service(firs)
        result = svc.get_cases(page=100, page_size=50)
        assert result["items"] == []
        assert result["total"] == 1
        assert result["total_pages"] == 1


# ---------------------------------------------------------------------------
# 3. District filter
# ---------------------------------------------------------------------------


class TestFieldMapServiceDistrictFilter:
    def test_filter_by_district(self):
        firs = [
            _make_fir(fir_id="F1", district="Bengaluru Urban"),
            _make_fir(fir_id="F2", district="Mysuru"),
            _make_fir(fir_id="F3", district="Bengaluru Urban"),
        ]
        svc = _build_service(firs)
        result = svc.get_cases(district="Bengaluru Urban")
        assert result["total"] == 2

    def test_filter_by_nonexistent_district(self):
        firs = [_make_fir(fir_id="F1")]
        svc = _build_service(firs)
        result = svc.get_cases(district="Nonexistent")
        assert result["total"] == 0
        assert result["items"] == []


# ---------------------------------------------------------------------------
# 4. Station filter
# ---------------------------------------------------------------------------


class TestFieldMapServiceStationFilter:
    def test_filter_by_station(self):
        firs = [
            _make_fir(fir_id="F1", station_id="PS0001"),
            _make_fir(fir_id="F2", station_id="PS0002"),
            _make_fir(fir_id="F3", station_id="PS0001"),
        ]
        svc = _build_service(firs)
        result = svc.get_cases(station_id="PS0001")
        assert result["total"] == 2


# ---------------------------------------------------------------------------
# 5. Crime head filter
# ---------------------------------------------------------------------------


class TestFieldMapServiceCrimeHeadFilter:
    def test_filter_by_crime_head(self):
        firs = [
            _make_fir(fir_id="F1", crime_head="Theft"),
            _make_fir(fir_id="F2", crime_head="Assault"),
            _make_fir(fir_id="F3", crime_head="Theft"),
        ]
        svc = _build_service(firs)
        result = svc.get_cases(crime_head="Theft")
        assert result["total"] == 2


# ---------------------------------------------------------------------------
# 6. Status filter
# ---------------------------------------------------------------------------


class TestFieldMapServiceStatusFilter:
    def test_filter_by_status(self):
        firs = [
            _make_fir(fir_id="F1", status="Chargesheeted"),
            _make_fir(fir_id="F2", status="Under Investigation"),
            _make_fir(fir_id="F3", status="Chargesheeted"),
        ]
        svc = _build_service(firs)
        result = svc.get_cases(status="Chargesheeted")
        assert result["total"] == 2


# ---------------------------------------------------------------------------
# 7. Inclusive date range
# ---------------------------------------------------------------------------


class TestFieldMapServiceDateFilter:
    def test_filter_by_start_date(self):
        firs = [
            _make_fir(fir_id="F1", incident_date=datetime(2025, 1, 1)),
            _make_fir(fir_id="F2", incident_date=datetime(2025, 6, 15)),
            _make_fir(fir_id="F3", incident_date=datetime(2025, 12, 31)),
        ]
        svc = _build_service(firs)
        result = svc.get_cases(start_date=date(2025, 6, 1))
        assert result["total"] == 2

    def test_filter_by_end_date(self):
        firs = [
            _make_fir(fir_id="F1", incident_date=datetime(2025, 1, 1)),
            _make_fir(fir_id="F2", incident_date=datetime(2025, 6, 15)),
            _make_fir(fir_id="F3", incident_date=datetime(2025, 12, 31)),
        ]
        svc = _build_service(firs)
        result = svc.get_cases(end_date=date(2025, 6, 30))
        assert result["total"] == 2

    def test_date_range_inclusive(self):
        firs = [
            _make_fir(fir_id="F1", incident_date=datetime(2025, 6, 15, 8, 0)),
            _make_fir(fir_id="F2", incident_date=datetime(2025, 6, 15, 17, 0)),
            _make_fir(fir_id="F3", incident_date=datetime(2025, 6, 16)),
        ]
        svc = _build_service(firs)
        result = svc.get_cases(
            start_date=date(2025, 6, 15), end_date=date(2025, 6, 15)
        )
        assert result["total"] == 2

    def test_equal_start_end_date(self):
        firs = [
            _make_fir(fir_id="F1", incident_date=datetime(2025, 6, 15)),
            _make_fir(fir_id="F2", incident_date=datetime(2025, 6, 16)),
        ]
        svc = _build_service(firs)
        result = svc.get_cases(
            start_date=date(2025, 6, 15), end_date=date(2025, 6, 15)
        )
        assert result["total"] == 1


# ---------------------------------------------------------------------------
# 8. Combined filters
# ---------------------------------------------------------------------------


class TestFieldMapServiceCombinedFilters:
    def test_multiple_filters_narrow(self):
        firs = [
            _make_fir(fir_id="F1", district="A", station_id="PS0001", crime_head="Theft"),
            _make_fir(fir_id="F2", district="A", station_id="PS0002", crime_head="Assault"),
            _make_fir(fir_id="F3", district="B", station_id="PS0001", crime_head="Theft"),
        ]
        svc = _build_service(firs)
        result = svc.get_cases(district="A", crime_head="Theft")
        assert result["total"] == 1
        assert result["items"][0]["fir_id"] == "F1"

    def test_all_filters_combined(self):
        firs = [
            _make_fir(
                fir_id="F1",
                district="A",
                station_id="PS0001",
                crime_head="Theft",
                status="Chargesheeted",
                incident_date=datetime(2025, 6, 15),
            ),
            _make_fir(
                fir_id="F2",
                district="A",
                station_id="PS0001",
                crime_head="Theft",
                status="Chargesheeted",
                incident_date=datetime(2025, 8, 20),
            ),
        ]
        svc = _build_service(firs)
        result = svc.get_cases(
            district="A",
            station_id="PS0001",
            crime_head="Theft",
            status="Chargesheeted",
            start_date=date(2025, 6, 1),
            end_date=date(2025, 7, 31),
        )
        assert result["total"] == 1


# ---------------------------------------------------------------------------
# 9. Invalid date range
# ---------------------------------------------------------------------------


class TestFieldMapServiceInvalidDate:
    def test_start_after_end_raises(self):
        svc = _build_service([_make_fir()])
        with pytest.raises(InvalidFilterError, match="start_date must not be after end_date"):
            svc.get_cases(
                start_date=date(2025, 12, 31), end_date=date(2025, 1, 1)
            )


# ---------------------------------------------------------------------------
# 10. Search — case-insensitive
# ---------------------------------------------------------------------------


class TestFieldMapServiceSearch:
    def test_search_by_fir_id(self):
        firs = [
            _make_fir(fir_id="FIR202500001"),
            _make_fir(fir_id="FIR202500002"),
        ]
        svc = _build_service(firs)
        result = svc.get_cases(search="FIR202500001")
        assert result["total"] == 1
        assert result["items"][0]["fir_id"] == "FIR202500001"

    def test_search_by_fir_number(self):
        firs = [
            _make_fir(fir_id="F1", fir_number="42/2025"),
            _make_fir(fir_id="F2", fir_number="99/2025"),
        ]
        svc = _build_service(firs)
        result = svc.get_cases(search="42/2025")
        assert result["total"] == 1
        assert result["items"][0]["fir_number"] == "42/2025"

    def test_search_by_crime_head(self):
        firs = [
            _make_fir(fir_id="F1", crime_head="Cyber Crime"),
            _make_fir(fir_id="F2", crime_head="Theft"),
        ]
        svc = _build_service(firs)
        result = svc.get_cases(search="cyber")
        assert result["total"] == 1
        assert result["items"][0]["crime_head"] == "Cyber Crime"

    def test_search_by_crime_subhead(self):
        firs = [
            _make_fir(fir_id="F1", crime_subhead="Online Banking Fraud"),
            _make_fir(fir_id="F2", crime_subhead="Pickpocketing"),
        ]
        svc = _build_service(firs)
        result = svc.get_cases(search="banking")
        assert result["total"] == 1

    def test_search_case_insensitive(self):
        firs = [_make_fir(fir_id="F1", crime_head="Cyber Crime")]
        svc = _build_service(firs)
        result = svc.get_cases(search="CYBER")
        assert result["total"] == 1

    def test_search_empty_string_no_effect(self):
        firs = [_make_fir(fir_id="F1")]
        svc = _build_service(firs)
        result = svc.get_cases(search="")
        assert result["total"] == 1

    def test_search_no_match(self):
        firs = [_make_fir(fir_id="F1", crime_head="Theft")]
        svc = _build_service(firs)
        result = svc.get_cases(search="NONEXISTENT")
        assert result["total"] == 0

    def test_search_does_not_match_pii(self):
        """Search must NOT match against complainant_id, victim_id, etc."""
        firs = [_make_fir(fir_id="F1")]
        svc = _build_service(firs)
        result = svc.get_cases(search="C001")
        assert result["total"] == 0

    def test_search_combined_with_filter(self):
        firs = [
            _make_fir(fir_id="F1", district="A", crime_head="Cyber Crime"),
            _make_fir(fir_id="F2", district="B", crime_head="Cyber Crime"),
        ]
        svc = _build_service(firs)
        result = svc.get_cases(district="A", search="cyber")
        assert result["total"] == 1
        assert result["items"][0]["fir_id"] == "F1"


# ---------------------------------------------------------------------------
# 11. Filtering occurs before pagination
# ---------------------------------------------------------------------------


class TestFieldMapServiceFilterBeforePaginate:
    def test_filter_then_paginate(self):
        """100 FIRs matching filter, page_size=10 → page 1 has 10 items."""
        firs = [_make_fir(fir_id=f"F{i}", district="Match") for i in range(100)]
        firs.append(_make_fir(fir_id="Nomatch", district="Other"))
        svc = _build_service(firs)
        result = svc.get_cases(district="Match", page=1, page_size=10)
        assert result["total"] == 100
        assert len(result["items"]) == 10
        assert result["total_pages"] == 10


# ---------------------------------------------------------------------------
# 12. Case detail
# ---------------------------------------------------------------------------


class TestFieldMapServiceCaseDetail:
    def test_lookup_by_fir_id(self):
        svc = _build_service([_make_fir()], stations=[_make_station()])
        result = svc.get_case_detail("FIR001")
        assert result["fir_id"] == "FIR001"
        assert result["station_name"] == "Bengaluru Central PS"

    def test_lookup_by_fir_number(self):
        svc = _build_service([_make_fir(fir_number="42/2025")])
        result = svc.get_case_detail("42/2025")
        assert result["fir_number"] == "42/2025"

    def test_fir_id_checked_before_number(self):
        """If identifier matches both FIR_ID and FIR_Number, FIR_ID wins."""
        svc = _build_service([_make_fir(fir_id="UNIQUE", fir_number="42/2025")])
        result = svc.get_case_detail("UNIQUE")
        assert result["fir_id"] == "UNIQUE"

    def test_missing_case_raises_not_found(self):
        svc = _build_service([])
        with pytest.raises(ResourceNotFoundError, match="FIR not found"):
            svc.get_case_detail("NONEXISTENT")

    def test_no_pii_exposed_in_detail(self):
        svc = _build_service([_make_fir()])
        result = svc.get_case_detail("FIR001")
        for field in ("complainant_id", "victim_id", "accused_ids",
                       "person_id", "full_name", "dob", "blood_group"):
            assert field not in result

    def test_detail_has_bns_sections(self):
        svc = _build_service([_make_fir(bns_sections="BNS 379, BNS 380")])
        result = svc.get_case_detail("FIR001")
        assert result["bns_sections"] == "BNS 379, BNS 380"


# ---------------------------------------------------------------------------
# 13. Filter metadata
# ---------------------------------------------------------------------------


class TestFieldMapServiceFilters:
    def test_returns_all_keys(self):
        svc = _build_service(
            [_make_fir()],
            stations=[_make_station()],
            districts=[_make_district()],
        )
        result = svc.get_filters()
        assert "districts" in result
        assert "stations" in result
        assert "crime_heads" in result
        assert "statuses" in result

    def test_districts_sorted(self):
        districts = [
            _make_district("Mysuru"),
            _make_district("Bengaluru Urban"),
            _make_district("Bidar"),
        ]
        svc = _build_service([], districts=districts)
        result = svc.get_filters()
        names = [d["district_name"] for d in result["districts"]]
        assert names == sorted(names)

    def test_stations_sorted_by_id(self):
        stations = [
            _make_station("PS0002", "Station B"),
            _make_station("PS0001", "Station A"),
        ]
        svc = _build_service([], stations=stations)
        result = svc.get_filters()
        ids = [s["station_id"] for s in result["stations"]]
        assert ids == ["PS0001", "PS0002"]

    def test_stations_have_id_and_name(self):
        stations = [_make_station("PS0001", "My Station")]
        svc = _build_service([], stations=stations)
        result = svc.get_filters()
        s = result["stations"][0]
        assert s["station_id"] == "PS0001"
        assert s["station_name"] == "My Station"

    def test_crime_heads_sorted(self):
        firs = [
            _make_fir(fir_id="F1", crime_head="Theft"),
            _make_fir(fir_id="F2", crime_head="Assault"),
            _make_fir(fir_id="F3", crime_head="Cyber Crime"),
        ]
        svc = _build_service(firs)
        result = svc.get_filters()
        assert result["crime_heads"] == ["Assault", "Cyber Crime", "Theft"]

    def test_statuses_sorted(self):
        firs = [
            _make_fir(fir_id="F1", status="Untraced"),
            _make_fir(fir_id="F2", status="Chargesheeted"),
            _make_fir(fir_id="F3", status="Under Investigation"),
        ]
        svc = _build_service(firs)
        result = svc.get_filters()
        assert result["statuses"] == [
            "Chargesheeted",
            "Under Investigation",
            "Untraced",
        ]

    def test_empty_data_returns_empty_lists(self):
        svc = _build_service([])
        result = svc.get_filters()
        assert result["districts"] == []
        assert result["stations"] == []
        assert result["crime_heads"] == []
        assert result["statuses"] == []
