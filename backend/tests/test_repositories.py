"""Tests for the CSV-backed repository implementations.

Covers all six repositories:
- Row counts match expected CSV sizes
- PK lookups (get_by_id) return correct records
- FK-based filtering (list_by_district, list_by_station, etc.) returns correct subsets
- Multi-accused FIR parsing produces list of person IDs
- Boolean normalization in arrest records
- Date/datetime parsing produces correct types
- Missing lookups return None/empty list
"""

from __future__ import annotations

import pytest

from app.core.config import settings
from app.database.csv_loader import load_all
from app.database.records import (
    ArrestRecord,
    ChargeSheetRecord,
    DistrictRecord,
    FIRRecord,
    PersonRecord,
    StationRecord,
)
from app.database.repositories.csv.arrest_repo import CSVArrestRepository
from app.database.repositories.csv.chargesheet_repo import CSVChargeSheetRepository
from app.database.repositories.csv.district_repo import CSVDistrictRepository
from app.database.repositories.csv.fir_repo import CSVFIRRepository
from app.database.repositories.csv.person_repo import CSVPersonRepository
from app.database.repositories.csv.station_repo import CSVStationRepository

# ---------------------------------------------------------------------------
# Shared fixture — load data once per module
# ---------------------------------------------------------------------------


@pytest.fixture(scope="module")
def csv_data() -> dict[str, list[dict[str, str]]]:
    return load_all(settings.DATA_DIR)


@pytest.fixture(scope="module")
def district_repo(csv_data: dict) -> CSVDistrictRepository:
    return CSVDistrictRepository(csv_data["districts"])


@pytest.fixture(scope="module")
def station_repo(csv_data: dict) -> CSVStationRepository:
    return CSVStationRepository(csv_data["stations"])


@pytest.fixture(scope="module")
def person_repo(csv_data: dict) -> CSVPersonRepository:
    return CSVPersonRepository(csv_data["people"])


@pytest.fixture(scope="module")
def fir_repo(csv_data: dict) -> CSVFIRRepository:
    return CSVFIRRepository(csv_data["firs"])


@pytest.fixture(scope="module")
def arrest_repo(csv_data: dict) -> CSVArrestRepository:
    return CSVArrestRepository(csv_data["arrests"])


@pytest.fixture(scope="module")
def chargesheet_repo(csv_data: dict, fir_repo: CSVFIRRepository) -> CSVChargeSheetRepository:
    fir_station_map = {fir.fir_id: fir.station_id for fir in fir_repo.list_all()}
    return CSVChargeSheetRepository(csv_data["chargesheets"], fir_station_map)


# ---------------------------------------------------------------------------
# District repository
# ---------------------------------------------------------------------------


class TestCSVDistrictRepository:
    def test_row_count(self, district_repo: CSVDistrictRepository) -> None:
        assert len(district_repo.list_all()) == 31

    def test_get_by_id(self, district_repo: CSVDistrictRepository) -> None:
        d = district_repo.get_by_id(1)
        assert d is not None
        assert isinstance(d, DistrictRecord)
        assert d.district_id == 1
        assert d.district_name == "Bagalkote"

    def test_get_by_id_missing(self, district_repo: CSVDistrictRepository) -> None:
        assert district_repo.get_by_id(999) is None

    def test_get_by_name(self, district_repo: CSVDistrictRepository) -> None:
        d = district_repo.get_by_name("Bengaluru Urban")
        assert d is not None
        assert d.district_id == 5

    def test_get_by_name_missing(self, district_repo: CSVDistrictRepository) -> None:
        assert district_repo.get_by_name("Nonexistent") is None

    def test_all_districts_have_coordinates(self, district_repo: CSVDistrictRepository) -> None:
        for d in district_repo.list_all():
            assert -90 <= d.latitude <= 90
            assert -180 <= d.longitude <= 180


# ---------------------------------------------------------------------------
# Station repository
# ---------------------------------------------------------------------------


class TestCSVStationRepository:
    def test_row_count(self, station_repo: CSVStationRepository) -> None:
        assert len(station_repo.list_all()) == 250

    def test_get_by_id(self, station_repo: CSVStationRepository) -> None:
        s = station_repo.get_by_id("PS0001")
        assert s is not None
        assert isinstance(s, StationRecord)
        assert s.station_id == "PS0001"

    def test_get_by_id_missing(self, station_repo: CSVStationRepository) -> None:
        assert station_repo.get_by_id("PS9999") is None

    def test_list_by_district(self, station_repo: CSVStationRepository) -> None:
        dist1_stations = station_repo.list_by_district(1)
        assert len(dist1_stations) > 0
        for s in dist1_stations:
            assert s.district_id == 1

    def test_list_by_district_empty(self, station_repo: CSVStationRepository) -> None:
        # District 99 does not exist
        assert station_repo.list_by_district(99) == []

    def test_stations_have_valid_district_references(self, station_repo: CSVStationRepository) -> None:
        district_ids = {s.district_id for s in station_repo.list_all()}
        assert all(1 <= did <= 31 for did in district_ids)


# ---------------------------------------------------------------------------
# Person repository
# ---------------------------------------------------------------------------


class TestCSVPersonRepository:
    def test_total_people(self, person_repo: CSVPersonRepository) -> None:
        assert len(person_repo._by_id) == 10000

    def test_get_by_id(self, person_repo: CSVPersonRepository) -> None:
        p = person_repo.get_by_id("P000001")
        assert p is not None
        assert isinstance(p, PersonRecord)
        assert p.person_id == "P000001"

    def test_get_by_id_missing(self, person_repo: CSVPersonRepository) -> None:
        assert person_repo.get_by_id("P999999") is None

    def test_date_of_birth_is_date(self, person_repo: CSVPersonRepository) -> None:
        p = person_repo.get_by_id("P000001")
        assert isinstance(p.dob, type(p.dob))
        from datetime import date
        assert isinstance(p.dob, date)

    def test_list_by_district(self, person_repo: CSVPersonRepository) -> None:
        people = person_repo.list_by_district("Bagalkote")
        assert len(people) > 0
        for p in people:
            assert p.district == "Bagalkote"

    def test_list_by_district_empty(self, person_repo: CSVPersonRepository) -> None:
        assert person_repo.list_by_district("Nonexistent District") == []

    def test_gender_values(self, person_repo: CSVPersonRepository) -> None:
        p = person_repo.get_by_id("P000001")
        assert p.gender in ("Male", "Female")


# ---------------------------------------------------------------------------
# FIR repository
# ---------------------------------------------------------------------------


class TestCSVFIRRepository:
    def test_row_count(self, fir_repo: CSVFIRRepository) -> None:
        assert len(fir_repo.list_all()) == 5000

    def test_get_by_id(self, fir_repo: CSVFIRRepository) -> None:
        f = fir_repo.get_by_id("FIR202500001")
        assert f is not None
        assert isinstance(f, FIRRecord)

    def test_get_by_id_missing(self, fir_repo: CSVFIRRepository) -> None:
        assert fir_repo.get_by_id("FIR999999999") is None

    def test_get_by_number(self, fir_repo: CSVFIRRepository) -> None:
        f = fir_repo.list_all()[0]
        result = fir_repo.get_by_number(f.fir_number)
        assert result is not None
        assert result.fir_number == f.fir_number

    def test_get_by_number_missing(self, fir_repo: CSVFIRRepository) -> None:
        assert fir_repo.get_by_number("NONEXISTENT/0000/0000") is None

    def test_accused_ids_are_tuples(self, fir_repo: CSVFIRRepository) -> None:
        for f in fir_repo.list_all():
            assert isinstance(f.accused_ids, tuple)
            assert len(f.accused_ids) >= 1

    def test_multi_accused_parsed(self, fir_repo: CSVFIRRepository) -> None:
        multi = [f for f in fir_repo.list_all() if len(f.accused_ids) > 1]
        assert len(multi) > 0, "Expected at least one multi-accused FIR"
        for f in multi:
            for aid in f.accused_ids:
                assert aid.startswith("P")

    def test_accused_ids_immutable(self, fir_repo: CSVFIRRepository) -> None:
        f = fir_repo.list_all()[0]
        with pytest.raises(AttributeError):
            f.accused_ids = ("P999999",)

    def test_list_by_station(self, fir_repo: CSVFIRRepository) -> None:
        # Pick a station that has FIRs
        firs = fir_repo.list_all()
        station_id = firs[0].station_id
        result = fir_repo.list_by_station(station_id)
        assert len(result) > 0
        for f in result:
            assert f.station_id == station_id

    def test_list_by_station_empty(self, fir_repo: CSVFIRRepository) -> None:
        assert fir_repo.list_by_station("PS9999") == []

    def test_list_by_district(self, fir_repo: CSVFIRRepository) -> None:
        result = fir_repo.list_by_district("Bagalkote")
        assert len(result) > 0
        for f in result:
            assert f.district == "Bagalkote"

    def test_list_by_status(self, fir_repo: CSVFIRRepository) -> None:
        result = fir_repo.list_by_status("Chargesheeted")
        assert len(result) > 0
        for f in result:
            assert f.status == "Chargesheeted"

    def test_datetime_parsing(self, fir_repo: CSVFIRRepository) -> None:
        from datetime import datetime
        f = fir_repo.list_all()[0]
        assert isinstance(f.incident_date, datetime)
        assert isinstance(f.fir_date, datetime)


# ---------------------------------------------------------------------------
# Arrest repository
# ---------------------------------------------------------------------------


class TestCSVArrestRepository:
    def test_row_count(self, arrest_repo: CSVArrestRepository) -> None:
        assert len(arrest_repo._by_fir) == 2540

    def test_get_by_fir_id(self, arrest_repo: CSVArrestRepository) -> None:
        firs_with_arrests = list(arrest_repo._by_fir.keys())
        first_fir = firs_with_arrests[0]
        result = arrest_repo.get_by_fir_id(first_fir)
        assert len(result) > 0
        assert isinstance(result[0], ArrestRecord)
        assert result[0].fir_id == first_fir

    def test_get_by_fir_id_missing(self, arrest_repo: CSVArrestRepository) -> None:
        assert arrest_repo.get_by_fir_id("FIR999999999") == []

    def test_boolean_normalization(self, arrest_repo: CSVArrestRepository) -> None:
        for arrests in arrest_repo._by_fir.values():
            for a in arrests:
                assert isinstance(a.medical_examination, bool)
                assert isinstance(a.fingerprint_taken, bool)
                assert isinstance(a.dna_sample, bool)
                assert isinstance(a.photograph_taken, bool)

    def test_list_by_station(self, arrest_repo: CSVArrestRepository) -> None:
        first = arrest_repo.list_all_arrests()[0]
        result = arrest_repo.list_by_station(first.station_id)
        assert len(result) > 0

    def test_list_by_person(self, arrest_repo: CSVArrestRepository) -> None:
        first = arrest_repo.list_all_arrests()[0]
        result = arrest_repo.list_by_person(first.person_id)
        assert len(result) > 0

    def test_arrest_date_is_datetime(self, arrest_repo: CSVArrestRepository) -> None:
        from datetime import datetime
        a = arrest_repo.list_all_arrests()[0]
        assert isinstance(a.arrest_date, datetime)

    def test_one_arrest_per_fir(self, arrest_repo: CSVArrestRepository) -> None:
        # Current dataset has one arrest per FIR; verify unique FIR key count
        assert len(arrest_repo._by_fir) == 2540
        # Each FIR key maps to a list (not a single record)
        for v in arrest_repo._by_fir.values():
            assert isinstance(v, list)

    def test_list_all_arrests_returns_all_records(self, arrest_repo: CSVArrestRepository) -> None:
        all_arrests = arrest_repo.list_all_arrests()
        assert len(all_arrests) == 2540

    def test_list_all_arrests_survives_duplicate_fir_id(self) -> None:
        """Regression: two arrests with same FIR_ID must both be returned."""
        rows = [
            {
                "Arrest_ID": "ARR001",
                "FIR_ID": "FIR001",
                "Person_ID": "P001",
                "Accused_Name": "Person A",
                "Gender": "Male",
                "Age": "30",
                "District": "Bengaluru Urban",
                "Station_ID": "PS0001",
                "Arrest_Date": "2025-06-20 10:00",
                "Arrest_Location": "Residence",
                "Arresting_Officer": "IO1",
                "Custody_Type": "Police Custody",
                "Bail_Status": "Pending",
                "Recovery_Item": "None",
                "Recovery_Value": "0",
                "Medical_Examination": "No",
                "Fingerprint_Taken": "No",
                "DNA_Sample": "No",
                "Photograph_Taken": "No",
            },
            {
                "Arrest_ID": "ARR002",
                "FIR_ID": "FIR001",
                "Person_ID": "P002",
                "Accused_Name": "Person B",
                "Gender": "Female",
                "Age": "25",
                "District": "Bengaluru Urban",
                "Station_ID": "PS0001",
                "Arrest_Date": "2025-06-21 11:00",
                "Arrest_Location": "Lodge",
                "Arresting_Officer": "IO2",
                "Custody_Type": "Police Custody",
                "Bail_Status": "Granted",
                "Recovery_Item": "None",
                "Recovery_Value": "0",
                "Medical_Examination": "No",
                "Fingerprint_Taken": "No",
                "DNA_Sample": "No",
                "Photograph_Taken": "No",
            },
        ]
        repo = CSVArrestRepository(rows)
        all_arrests = repo.list_all_arrests()
        assert len(all_arrests) == 2
        arrest_ids = {a.arrest_id for a in all_arrests}
        assert arrest_ids == {"ARR001", "ARR002"}


# ---------------------------------------------------------------------------
# ChargeSheet repository
# ---------------------------------------------------------------------------


class TestCSVChargeSheetRepository:
    def test_row_count(self, chargesheet_repo: CSVChargeSheetRepository) -> None:
        assert len(chargesheet_repo._by_fir) == 2469

    def test_get_by_fir_id(self, chargesheet_repo: CSVChargeSheetRepository) -> None:
        first_fir = list(chargesheet_repo._by_fir.keys())[0]
        result = chargesheet_repo.get_by_fir_id(first_fir)
        assert len(result) > 0
        assert isinstance(result[0], ChargeSheetRecord)
        assert result[0].fir_id == first_fir

    def test_get_by_fir_id_missing(self, chargesheet_repo: CSVChargeSheetRepository) -> None:
        assert chargesheet_repo.get_by_fir_id("FIR999999999") == []

    def test_chargesheet_date_is_date(self, chargesheet_repo: CSVChargeSheetRepository) -> None:
        from datetime import date
        all_cs = chargesheet_repo.list_all_chargesheets()
        cs = all_cs[0]
        assert isinstance(cs.chargesheet_date, date)

    def test_one_chargesheet_per_fir(self, chargesheet_repo: CSVChargeSheetRepository) -> None:
        assert len(chargesheet_repo._by_fir) == 2469
        for v in chargesheet_repo._by_fir.values():
            assert isinstance(v, list)

    def test_list_all_chargesheets_returns_all_records(self, chargesheet_repo: CSVChargeSheetRepository) -> None:
        all_cs = chargesheet_repo.list_all_chargesheets()
        assert len(all_cs) == 2469

    def test_list_all_chargesheets_survives_duplicate_fir_id(self) -> None:
        """Regression: two chargesheets with same FIR_ID must both be returned."""
        rows = [
            {
                "ChargeSheet_ID": "CS001",
                "FIR_ID": "FIR001",
                "Accused_ID": "P001",
                "Crime_Type": "Theft",
                "Sections": "BNS 379",
                "Investigating_Officer": "IO1",
                "Court": "Session Court",
                "Witness_Count": "3",
                "Evidence_Count": "5",
                "ChargeSheet_Date": "2025-07-15",
                "Status": "Filed",
            },
            {
                "ChargeSheet_ID": "CS002",
                "FIR_ID": "FIR001",
                "Accused_ID": "P002",
                "Crime_Type": "Theft",
                "Sections": "BNS 379",
                "Investigating_Officer": "IO1",
                "Court": "Session Court",
                "Witness_Count": "2",
                "Evidence_Count": "3",
                "ChargeSheet_Date": "2025-07-20",
                "Status": "Accepted",
            },
        ]
        repo = CSVChargeSheetRepository(rows)
        all_cs = repo.list_all_chargesheets()
        assert len(all_cs) == 2
        cs_ids = {cs.chargesheet_id for cs in all_cs}
        assert cs_ids == {"CS001", "CS002"}

    def test_list_by_station_returns_results(
        self, chargesheet_repo: CSVChargeSheetRepository
    ) -> None:
        first_cs = chargesheet_repo.list_all_chargesheets()[0]
        first_fir_id = first_cs.fir_id
        from app.core.config import settings
        from app.database.csv_loader import load_all
        from app.database.repositories.csv.fir_repo import CSVFIRRepository
        data = load_all(settings.DATA_DIR)
        fir_repo_local = CSVFIRRepository(data["firs"])
        expected_station = fir_repo_local.get_by_id(first_fir_id).station_id
        result = chargesheet_repo.list_by_station(expected_station)
        assert len(result) > 0
        result_cs_ids = {cs.chargesheet_id for cs in result}
        assert first_cs.chargesheet_id in result_cs_ids

    def test_list_by_station_empty(self, chargesheet_repo: CSVChargeSheetRepository) -> None:
        assert chargesheet_repo.list_by_station("PS9999") == []

    def test_station_index_populated(self, chargesheet_repo: CSVChargeSheetRepository) -> None:
        # At least some chargesheets should map to stations
        assert len(chargesheet_repo._by_station) > 0


# ---------------------------------------------------------------------------
# Config DATA_DIR resolution
# ---------------------------------------------------------------------------


class TestConfigDataDir:
    def test_data_dir_is_valid_path(self) -> None:
        from pathlib import Path
        p = Path(settings.DATA_DIR)
        assert p.exists(), f"DATA_DIR does not exist: {p}"
        assert p.is_dir()

    def test_data_dir_contains_expected_files(self) -> None:
        from pathlib import Path
        p = Path(settings.DATA_DIR)
        expected = {"districts.csv", "stations.csv", "people.csv", "firs.csv", "arrests.csv", "chargesheets.csv"}
        actual = {f.name for f in p.glob("*.csv")}
        assert expected == actual
