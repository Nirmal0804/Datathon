"""Tests for the production PostgreSQL migration checkpoint.

Covers:
- Migration SQL schema correctness and completeness
- PostgreSQL repository protocol compliance
- CSV repository protocol compliance
- Cardinality preservation for duplicate FIR associations
- Ingestion logic and idempotency
- Ingestion UPSERT key correctness
- Persistence provider selection
- Configuration validation
- Connection management module
- File structure

These tests verify behavioral correctness without requiring a live
PostgreSQL instance.  Schema SQL is parsed and validated statically.
Repository record construction is tested with synthetic data.
Protocol compliance is verified via runtime_checkable isinstance checks.
"""

from __future__ import annotations

import re
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

BACKEND_ROOT = Path(__file__).resolve().parent.parent
MIGRATION_PATH = BACKEND_ROOT / "supabase" / "migrations" / "001_initial_schema.sql"


# ---------------------------------------------------------------------------
# Migration SQL schema tests
# ---------------------------------------------------------------------------


class TestMigrationSchema:
    """Validate the production PostgreSQL migration SQL."""

    @pytest.fixture(scope="class")
    def sql(self) -> str:
        return MIGRATION_PATH.read_text(encoding="utf-8")

    def test_migration_file_exists(self) -> None:
        assert MIGRATION_PATH.exists(), f"Migration not found: {MIGRATION_PATH}"

    def test_all_required_tables_defined(self, sql: str) -> None:
        required = [
            "districts",
            "police_stations",
            "people",
            "firs",
            "fir_person_roles",
            "arrests",
            "chargesheets",
            "ingestion_batches",
        ]
        for table in required:
            assert f"CREATE TABLE {table}" in sql, (
                f"Missing table: {table}"
            )

    def test_districts_primary_key(self, sql: str) -> None:
        assert re.search(
            r"CREATE TABLE districts.*?id SERIAL PRIMARY KEY",
            sql,
            re.DOTALL,
        ), "districts.id should be SERIAL PRIMARY KEY"

    def test_districts_unique_constraints(self, sql: str) -> None:
        assert "district_id INTEGER UNIQUE" in sql
        assert "district_name TEXT UNIQUE" in sql

    def test_stations_foreign_key_to_districts(self, sql: str) -> None:
        assert "fk_stations_district" in sql
        assert "REFERENCES districts(district_id)" in sql

    def test_people_foreign_key_to_stations(self, sql: str) -> None:
        assert "fk_people_station" in sql
        assert "REFERENCES police_stations(station_id)" in sql

    def test_firs_foreign_keys(self, sql: str) -> None:
        assert "fk_firs_station" in sql
        assert "fk_firs_complainant" in sql
        assert "fk_firs_victim" in sql
        assert "REFERENCES police_stations(station_id)" in sql
        assert "REFERENCES people(person_id)" in sql

    def test_firs_no_accused_id_column(self, sql: str) -> None:
        """Accused_ID must NOT be a column on firs — it's normalized."""
        firs_start = sql.index("CREATE TABLE firs (")
        firs_end = sql.index(");", firs_start) + 2
        firs_block = sql[firs_start:firs_end]
        assert not re.search(r"\baccused_id\b", firs_block), (
            "firs table should not have accused_id column (normalized into junction table)"
        )

    def test_fir_person_roles_junction_table(self, sql: str) -> None:
        assert "CREATE TYPE person_role AS ENUM" in sql
        assert "fir_person_roles" in sql
        assert "'complainant'" in sql
        assert "'victim'" in sql
        assert "'accused'" in sql

    def test_fir_person_roles_unique_constraint(self, sql: str) -> None:
        assert "uq_fir_person_role UNIQUE (fir_id, person_id, role)" in sql

    def test_fir_person_roles_foreign_keys(self, sql: str) -> None:
        assert "fk_fpr_fir" in sql
        assert "fk_fpr_person" in sql

    def test_arrests_foreign_keys(self, sql: str) -> None:
        assert "fk_arrests_fir" in sql
        assert "fk_arrests_person" in sql
        assert "fk_arrests_station" in sql

    def test_chargesheets_foreign_keys(self, sql: str) -> None:
        assert "fk_chargesheets_fir" in sql
        assert "fk_chargesheets_accused" in sql

    def test_chargesheets_fir_not_unique(self, sql: str) -> None:
        """chargesheets.fir_id must NOT be UNIQUE.

        The current CSV snapshot may contain one chargesheet per FIR, but
        this is not a proven domain invariant.  Multiple chargesheets per
        FIR must be permitted.
        """
        cs_section = sql.split("CREATE TABLE chargesheets")[1].split("CREATE TABLE")[0]
        assert "fir_id TEXT UNIQUE" not in cs_section, (
            "chargesheets.fir_id must not be UNIQUE — "
            "multiple chargesheets per FIR should be permitted"
        )

    def test_chargesheets_fir_indexed(self, sql: str) -> None:
        """chargesheets.fir_id should have an index for lookup performance."""
        assert "idx_chargesheets_fir" in sql

    def test_ingestion_batches_table(self, sql: str) -> None:
        assert "batch_id TEXT UNIQUE" in sql
        assert "records_processed INTEGER" in sql
        assert "records_accepted INTEGER" in sql
        assert "records_rejected INTEGER" in sql
        assert "status TEXT" in sql

    def test_indexes_created(self, sql: str) -> None:
        required_indexes = [
            "idx_stations_district",
            "idx_people_district",
            "idx_people_station",
            "idx_firs_station",
            "idx_firs_district",
            "idx_firs_status",
            "idx_firs_crime_head",
            "idx_firs_incident_date",
            "idx_fpr_fir",
            "idx_fpr_person",
            "idx_fpr_role",
            "idx_arrests_fir",
            "idx_arrests_person",
            "idx_arrests_station",
            "idx_chargesheets_fir",
            "idx_chargesheets_accused",
        ]
        for idx in required_indexes:
            assert idx in sql, f"Missing index: {idx}"

    def test_timestamps_use_timestamptz(self, sql: str) -> None:
        """All timestamp columns should use TIMESTAMPTZ for timezone safety."""
        timestamptz_count = sql.count("TIMESTAMPTZ")
        assert timestamptz_count >= 6, (
            f"Expected at least 6 TIMESTAMPTZ columns, found {timestamptz_count}"
        )

    def test_created_at_defaults(self, sql: str) -> None:
        """Most tables should have created_at with NOW() default."""
        assert sql.count("created_at TIMESTAMPTZ DEFAULT NOW()") >= 5


# ---------------------------------------------------------------------------
# PostgreSQL repository protocol compliance tests
# ---------------------------------------------------------------------------


class TestPostgresProtocolCompliance:
    """Verify PostgreSQL repositories satisfy their runtime_checkable Protocols.

    These tests use isinstance() against the Protocol classes, which
    checks for structural method presence (not exact signatures).
    No database connection is required.
    """

    def test_district_repo_satisfies_protocol(self) -> None:
        from app.database.postgres.district_repo import PostgresDistrictRepository
        from app.database.repositories.protocols import DistrictRepository

        assert isinstance(PostgresDistrictRepository(), DistrictRepository)

    def test_station_repo_satisfies_protocol(self) -> None:
        from app.database.postgres.station_repo import PostgresStationRepository
        from app.database.repositories.protocols import StationRepository

        assert isinstance(PostgresStationRepository(), StationRepository)

    def test_person_repo_satisfies_protocol(self) -> None:
        from app.database.postgres.person_repo import PostgresPersonRepository
        from app.database.repositories.protocols import PersonRepository

        assert isinstance(PostgresPersonRepository(), PersonRepository)

    def test_fir_repo_satisfies_protocol(self) -> None:
        from app.database.postgres.fir_repo import PostgresFIRRepository
        from app.database.repositories.protocols import FIRRepository

        assert isinstance(PostgresFIRRepository(), FIRRepository)

    def test_arrest_repo_satisfies_protocol(self) -> None:
        from app.database.postgres.arrest_repo import PostgresArrestRepository
        from app.database.repositories.protocols import ArrestRepository

        assert isinstance(PostgresArrestRepository(), ArrestRepository)

    def test_chargesheet_repo_satisfies_protocol(self) -> None:
        from app.database.postgres.chargesheet_repo import PostgresChargeSheetRepository
        from app.database.repositories.protocols import ChargeSheetRepository

        assert isinstance(PostgresChargeSheetRepository(), ChargeSheetRepository)


# ---------------------------------------------------------------------------
# CSV repository protocol compliance tests
# ---------------------------------------------------------------------------


class TestCSVProtocolCompliance:
    """Verify CSV repositories satisfy their runtime_checkable Protocols.

    No database connection required — tests structural method presence.
    """

    def test_district_repo_satisfies_protocol(self) -> None:
        from app.database.repositories.csv.district_repo import CSVDistrictRepository
        from app.database.repositories.protocols import DistrictRepository

        assert isinstance(CSVDistrictRepository([]), DistrictRepository)

    def test_station_repo_satisfies_protocol(self) -> None:
        from app.database.repositories.csv.station_repo import CSVStationRepository
        from app.database.repositories.protocols import StationRepository

        assert isinstance(CSVStationRepository([]), StationRepository)

    def test_person_repo_satisfies_protocol(self) -> None:
        from app.database.repositories.csv.person_repo import CSVPersonRepository
        from app.database.repositories.protocols import PersonRepository

        assert isinstance(CSVPersonRepository([]), PersonRepository)

    def test_fir_repo_satisfies_protocol(self) -> None:
        from app.database.repositories.csv.fir_repo import CSVFIRRepository
        from app.database.repositories.protocols import FIRRepository

        assert isinstance(CSVFIRRepository([]), FIRRepository)

    def test_arrest_repo_satisfies_protocol(self) -> None:
        from app.database.repositories.csv.arrest_repo import CSVArrestRepository
        from app.database.repositories.protocols import ArrestRepository

        assert isinstance(CSVArrestRepository([]), ArrestRepository)

    def test_chargesheet_repo_satisfies_protocol(self) -> None:
        from app.database.repositories.csv.chargesheet_repo import CSVChargeSheetRepository
        from app.database.repositories.protocols import ChargeSheetRepository

        assert isinstance(CSVChargeSheetRepository([]), ChargeSheetRepository)


# ---------------------------------------------------------------------------
# Cardinality tests — duplicate FIR associations
# ---------------------------------------------------------------------------


class TestCardinalityPreservation:
    """Verify that repositories preserve multiple records sharing the same FIR_ID.

    The CSV arrest and chargesheet repos previously had a cardinality bug
    where _by_fir was a dict[str, Record] (singular), causing later records
    to overwrite earlier ones when multiple records shared a FIR_ID.
    """

    def test_csv_arrest_repo_preserves_duplicate_fir(self) -> None:
        """CSVArrestRepository must return all arrests for a given FIR_ID."""
        from app.database.repositories.csv.arrest_repo import CSVArrestRepository

        rows = [
            {
                "Arrest_ID": "ARR001", "FIR_ID": "FIR001", "Person_ID": "P01",
                "Accused_Name": "A", "Gender": "Male", "Age": "30",
                "District": "Test", "Station_ID": "PS01",
                "Arrest_Date": "2025-01-01 10:00", "Arrest_Location": "Loc1",
                "Arresting_Officer": "Off1", "Custody_Type": "Police",
                "Bail_Status": "Denied", "Recovery_Item": "Phone",
                "Recovery_Value": "1000", "Medical_Examination": "true",
                "Fingerprint_Taken": "true", "DNA_Sample": "false",
                "Photograph_Taken": "true",
            },
            {
                "Arrest_ID": "ARR002", "FIR_ID": "FIR001", "Person_ID": "P02",
                "Accused_Name": "B", "Gender": "Female", "Age": "25",
                "District": "Test", "Station_ID": "PS01",
                "Arrest_Date": "2025-01-02 11:00", "Arrest_Location": "Loc2",
                "Arresting_Officer": "Off2", "Custody_Type": "Judicial",
                "Bail_Status": "Granted", "Recovery_Item": "Laptop",
                "Recovery_Value": "50000", "Medical_Examination": "false",
                "Fingerprint_Taken": "false", "DNA_Sample": "true",
                "Photograph_Taken": "false",
            },
        ]
        repo = CSVArrestRepository(rows)

        result = repo.get_by_fir_id("FIR001")
        assert len(result) == 2
        arrest_ids = {r.arrest_id for r in result}
        assert arrest_ids == {"ARR001", "ARR002"}

    def test_csv_arrest_repo_preserves_all_records(self) -> None:
        """list_all_arrests must return every record, not just one per FIR."""
        from app.database.repositories.csv.arrest_repo import CSVArrestRepository

        rows = [
            {
                "Arrest_ID": f"ARR{i:03d}", "FIR_ID": "FIR001",
                "Person_ID": f"P{i:02d}", "Accused_Name": f"Person {i}",
                "Gender": "Male", "Age": "30", "District": "Test",
                "Station_ID": "PS01", "Arrest_Date": "2025-01-01 10:00",
                "Arrest_Location": "Loc", "Arresting_Officer": "Off",
                "Custody_Type": "Police", "Bail_Status": "Denied",
                "Recovery_Item": "None", "Recovery_Value": "0",
                "Medical_Examination": "false", "Fingerprint_Taken": "false",
                "DNA_Sample": "false", "Photograph_Taken": "false",
            }
            for i in range(5)
        ]
        repo = CSVArrestRepository(rows)
        assert len(repo.list_all_arrests()) == 5

    def test_csv_chargesheet_repo_preserves_duplicate_fir(self) -> None:
        """CSVChargeSheetRepository must return all chargesheets for a FIR_ID."""
        from app.database.repositories.csv.chargesheet_repo import CSVChargeSheetRepository

        rows = [
            {
                "ChargeSheet_ID": "CS001", "FIR_ID": "FIR001",
                "Accused_ID": "P01", "Crime_Type": "Theft",
                "Sections": "BNS 303", "Investigating_Officer": "Off1",
                "Court": "Session", "Witness_Count": "3",
                "Evidence_Count": "2", "ChargeSheet_Date": "2025-06-01",
                "Status": "Under Trial",
            },
            {
                "ChargeSheet_ID": "CS002", "FIR_ID": "FIR001",
                "Accused_ID": "P02", "Crime_Type": "Robbery",
                "Sections": "BNS 309", "Investigating_Officer": "Off2",
                "Court": "District", "Witness_Count": "5",
                "Evidence_Count": "4", "ChargeSheet_Date": "2025-06-15",
                "Status": "Convicted",
            },
        ]
        repo = CSVChargeSheetRepository(rows)

        result = repo.get_by_fir_id("FIR001")
        assert len(result) == 2
        cs_ids = {r.chargesheet_id for r in result}
        assert cs_ids == {"CS001", "CS002"}

    def test_csv_chargesheet_repo_preserves_all_records(self) -> None:
        """list_all_chargesheets must return every record."""
        from app.database.repositories.csv.chargesheet_repo import CSVChargeSheetRepository

        rows = [
            {
                "ChargeSheet_ID": f"CS{i:03d}", "FIR_ID": f"FIR{i:03d}",
                "Accused_ID": f"P{i:02d}", "Crime_Type": "Theft",
                "Sections": "BNS 303", "Investigating_Officer": "Off",
                "Court": "Session", "Witness_Count": "1",
                "Evidence_Count": "1", "ChargeSheet_Date": "2025-01-01",
                "Status": "Under Trial",
            }
            for i in range(10)
        ]
        repo = CSVChargeSheetRepository(rows)
        assert len(repo.list_all_chargesheets()) == 10

    def test_csv_arrest_repo_empty_fir_returns_empty_list(self) -> None:
        """get_by_fir_id must return empty list (not None) for unknown FIR."""
        from app.database.repositories.csv.arrest_repo import CSVArrestRepository

        repo = CSVArrestRepository([])
        result = repo.get_by_fir_id("NONEXISTENT")
        assert result == []

    def test_csv_chargesheet_repo_empty_fir_returns_empty_list(self) -> None:
        """get_by_fir_id must return empty list (not None) for unknown FIR."""
        from app.database.repositories.csv.chargesheet_repo import CSVChargeSheetRepository

        repo = CSVChargeSheetRepository([])
        result = repo.get_by_fir_id("NONEXISTENT")
        assert result == []


# ---------------------------------------------------------------------------
# PostgreSQL repository record construction tests
# ---------------------------------------------------------------------------


class TestPostgresRepositoryRecords:
    """Test that PostgreSQL repositories construct record objects correctly."""

    def test_fir_repo_parse_accused_ids_empty(self) -> None:
        from app.database.postgres.fir_repo import PostgresFIRRepository

        assert PostgresFIRRepository._parse_accused_ids("") == ()
        assert PostgresFIRRepository._parse_accused_ids(None) == ()

    def test_fir_repo_parse_accused_ids_single(self) -> None:
        from app.database.postgres.fir_repo import PostgresFIRRepository

        result = PostgresFIRRepository._parse_accused_ids("P000001")
        assert result == ("P000001",)

    def test_fir_repo_parse_accused_ids_multiple(self) -> None:
        from app.database.postgres.fir_repo import PostgresFIRRepository

        result = PostgresFIRRepository._parse_accused_ids("P000001,P000002,P000003")
        assert result == ("P000001", "P000002", "P000003")

    def test_fir_repo_parse_accused_ids_with_spaces(self) -> None:
        from app.database.postgres.fir_repo import PostgresFIRRepository

        result = PostgresFIRRepository._parse_accused_ids("P000001, P000002")
        assert result == ("P000001", "P000002")

    def test_fir_repo_to_record(self) -> None:
        from app.database.postgres.fir_repo import PostgresFIRRepository

        row = {
            "fir_id": "FIR20250001",
            "fir_number": "25/001/2025",
            "station_id": "PS0001",
            "district": "Bengaluru Urban",
            "incident_date": "2025-01-15 10:30:00+05:30",
            "fir_date": "2025-01-15 11:00:00+05:30",
            "crime_head": "Theft",
            "crime_subhead": "Snatching",
            "bns_sections": "BNS 303",
            "latitude": 12.97,
            "longitude": 77.59,
            "complainant_id": "P000001",
            "victim_id": "P000002",
            "accused_ids_raw": "P000003,P000004",
            "investigating_officer": "SI Kumar",
            "status": "Under Investigation",
        }
        record = PostgresFIRRepository._to_record(row)
        assert record.fir_id == "FIR20250001"
        assert record.accused_ids == ("P000003", "P000004")
        assert record.complainant_id == "P000001"
        assert record.victim_id == "P000002"

    def test_district_repo_to_record(self) -> None:
        from app.database.postgres.district_repo import PostgresDistrictRepository

        row = {
            "district_id": 1,
            "district_name": "Bengaluru Urban",
            "police_range": "Bengaluru City",
            "state": "Karnataka",
            "population": 13191000,
            "area_sq_km": 741,
            "population_density": 17810,
            "literacy_rate": 88.48,
            "urban_population_pct": 92,
            "rural_population_pct": 8,
            "police_stations": 45,
            "latitude": 12.97,
            "longitude": 77.59,
        }
        record = PostgresDistrictRepository._to_record(row)
        assert record.district_id == 1
        assert record.district_name == "Bengaluru Urban"
        assert record.population == 13191000
        assert record.latitude == 12.97

    def test_arrest_repo_to_record(self) -> None:
        from app.database.postgres.arrest_repo import PostgresArrestRepository

        row = {
            "arrest_id": "ARR001",
            "fir_id": "FIR20250001",
            "person_id": "P000003",
            "accused_name": "Test Person",
            "gender": "Male",
            "age": 30,
            "district": "Bengaluru Urban",
            "station_id": "PS0001",
            "arrest_date": "2025-02-01 08:00:00+05:30",
            "arrest_location": "Main Road",
            "arresting_officer": "Insp Singh",
            "custody_type": "Police Custody",
            "bail_status": "Denied",
            "recovery_item": "Mobile Phone",
            "recovery_value": 15000,
            "medical_examination": True,
            "fingerprint_taken": True,
            "dna_sample": False,
            "photograph_taken": True,
        }
        record = PostgresArrestRepository._to_record(row)
        assert record.arrest_id == "ARR001"
        assert record.medical_examination is True
        assert record.dna_sample is False
        assert record.recovery_value == 15000

    def test_chargesheet_repo_to_record(self) -> None:
        from app.database.postgres.chargesheet_repo import PostgresChargeSheetRepository

        row = {
            "chargesheet_id": "CS20250001",
            "fir_id": "FIR20250001",
            "accused_id": "P000003",
            "crime_type": "Theft",
            "sections": "BNS 303",
            "investigating_officer": "Insp Singh",
            "court": "Session Court",
            "witness_count": 5,
            "evidence_count": 3,
            "chargesheet_date": "2025-06-15",
            "status": "Under Trial",
        }
        record = PostgresChargeSheetRepository._to_record(row)
        assert record.chargesheet_id == "CS20250001"
        assert record.witness_count == 5
        assert record.chargesheet_date == "2025-06-15"


# ---------------------------------------------------------------------------
# Ingestion logic tests
# ---------------------------------------------------------------------------


class TestIngestionLogic:
    """Test CSV ingestion functions with mock database cursors."""

    def test_safe_int_valid(self) -> None:
        from app.database.ingest import _safe_int

        assert _safe_int("42") == 42
        assert _safe_int(" 42 ") == 42

    def test_safe_int_invalid(self) -> None:
        from app.database.ingest import _safe_int

        assert _safe_int("abc") == 0
        assert _safe_int("") == 0
        assert _safe_int(None) == 0
        assert _safe_int("abc", default=-1) == -1

    def test_safe_float_valid(self) -> None:
        from app.database.ingest import _safe_float

        assert _safe_float("3.14") == 3.14
        assert _safe_float(" 2.5 ") == 2.5

    def test_safe_float_invalid(self) -> None:
        from app.database.ingest import _safe_float

        assert _safe_float("abc") == 0.0
        assert _safe_float("") == 0.0

    def test_safe_bool_true_values(self) -> None:
        from app.database.ingest import _safe_bool

        assert _safe_bool("true") is True
        assert _safe_bool("1") is True
        assert _safe_bool("yes") is True
        assert _safe_bool("True") is True

    def test_safe_bool_false_values(self) -> None:
        from app.database.ingest import _safe_bool

        assert _safe_bool("false") is False
        assert _safe_bool("0") is False
        assert _safe_bool("no") is False
        assert _safe_bool("") is False

    def test_generate_batch_id_format(self) -> None:
        from app.database.ingest import _generate_batch_id

        batch_id = _generate_batch_id()
        assert batch_id.startswith("batch-")
        assert len(batch_id) == 18  # "batch-" + 12 hex chars

    def test_ingest_districts_calls_execute(self) -> None:
        from unittest.mock import patch
        from app.database.ingest import ingest_districts

        mock_cur = MagicMock()
        rows = [
            {
                "District_ID": "1",
                "District_Name": "Test District",
                "Police_Range": "Test Range",
                "State": "Karnataka",
                "Population": "1000000",
                "Area_Sq_Km": "500",
                "Population_Density": "2000",
                "Literacy_Rate": "85.5",
                "Urban_Population_Pct": "60",
                "Rural_Population_Pct": "40",
                "Police_Stations": "10",
                "Latitude": "12.5",
                "Longitude": "77.5",
            }
        ]
        with patch("app.database.ingest.psycopg2.extras.execute_values") as mock_ev:
            count = ingest_districts(mock_cur, rows)
            assert count == 1
            mock_ev.assert_called_once()
            sql = mock_ev.call_args[0][1]
            assert "ON CONFLICT (district_id)" in sql

    def test_ingest_firs_populates_junction_table(self) -> None:
        from unittest.mock import patch
        from app.database.ingest import ingest_firs

        mock_cur = MagicMock()
        rows = [
            {
                "FIR_ID": "FIR20250001",
                "FIR_Number": "25/001/2025",
                "Station_ID": "PS0001",
                "District": "Test",
                "Incident_Date": "2025-01-15",
                "FIR_Date": "2025-01-15",
                "Crime_Head": "Theft",
                "Crime_Subhead": "Snatching",
                "BNS_Sections": "BNS 303",
                "Latitude": "12.97",
                "Longitude": "77.59",
                "Complainant_ID": "P000001",
                "Victim_ID": "P000002",
                "Accused_ID": "P000003,P000004",
                "Investigating_Officer": "SI Kumar",
                "Status": "Under Investigation",
            }
        ]
        with patch("app.database.ingest.psycopg2.extras.execute_values") as mock_ev:
            fir_count, role_count = ingest_firs(mock_cur, rows)
            assert fir_count == 1
            # complainant + victim + 2 accused = 4 roles
            assert role_count == 4
            # execute_values called twice: once for FIR insert, once for roles
            assert mock_ev.call_count == 2
            # Second call is the roles insert
            roles_values = mock_ev.call_args_list[1][0][2]
            assert len(roles_values) == 4

    def test_ingest_dispatch_completeness(self) -> None:
        from app.database.ingest import INGEST_DISPATCH

        required = [
            "districts",
            "police_stations",
            "people",
            "firs",
            "arrests",
            "chargesheets",
        ]
        for table in required:
            assert table in INGEST_DISPATCH, f"Missing ingest function for: {table}"


# ---------------------------------------------------------------------------
# Ingestion UPSERT key tests
# ---------------------------------------------------------------------------


class TestIngestionReconciliation:
    """Verify ingestion uses source identifiers for UPSERT, not fir_id.

    Multiple chargesheets or arrests may reference the same FIR.  The
    ON CONFLICT clause must target the source identifier to avoid
    overwriting legitimate records.

    Tests now use ``patch("app.database.ingest.psycopg2.extras.execute_values")``
    because the ingestion module uses ``execute_values`` for batch inserts.
    """

    def test_arrest_upsert_uses_arrest_id(self) -> None:
        """Arrest ingestion must ON CONFLICT on arrest_id, not fir_id."""
        from unittest.mock import patch
        from app.database.ingest import ingest_arrests

        mock_cur = MagicMock()
        rows = [
            {
                "Arrest_ID": "ARR001", "FIR_ID": "FIR001", "Person_ID": "P01",
                "Accused_Name": "A", "Gender": "Male", "Age": "30",
                "District": "Test", "Station_ID": "PS01",
                "Arrest_Date": "2025-01-01", "Arrest_Location": "Loc",
                "Arresting_Officer": "Off", "Custody_Type": "Police",
                "Bail_Status": "Denied", "Recovery_Item": "None",
                "Recovery_Value": "0", "Medical_Examination": "false",
                "Fingerprint_Taken": "false", "DNA_Sample": "false",
                "Photograph_Taken": "false",
            },
        ]
        with patch("app.database.ingest.psycopg2.extras.execute_values") as mock_ev:
            count = ingest_arrests(mock_cur, rows)
            assert count == 1

            sql = mock_ev.call_args[0][1]
            assert "ON CONFLICT (arrest_id)" in sql
            assert "ON CONFLICT (fir_id)" not in sql

    def test_chargesheet_upsert_uses_chargesheet_id(self) -> None:
        """Chargesheet ingestion must ON CONFLICT on chargesheet_id, not fir_id."""
        from unittest.mock import patch
        from app.database.ingest import ingest_chargesheets

        mock_cur = MagicMock()
        rows = [
            {
                "ChargeSheet_ID": "CS001", "FIR_ID": "FIR001",
                "Accused_ID": "P01", "Crime_Type": "Theft",
                "Sections": "BNS 303", "Investigating_Officer": "Off",
                "Court": "Session", "Witness_Count": "1",
                "Evidence_Count": "1", "ChargeSheet_Date": "2025-06-01",
                "Status": "Under Trial",
            },
        ]
        with patch("app.database.ingest.psycopg2.extras.execute_values") as mock_ev:
            count = ingest_chargesheets(mock_cur, rows)
            assert count == 1

            sql = mock_ev.call_args[0][1]
            assert "ON CONFLICT (chargesheet_id)" in sql
            assert "ON CONFLICT (fir_id)" not in sql

    def test_ingest_arrests_two_records_same_fir(self) -> None:
        """Two arrests for the same FIR must both be ingested."""
        from unittest.mock import patch
        from app.database.ingest import ingest_arrests

        mock_cur = MagicMock()
        rows = [
            {
                "Arrest_ID": "ARR001", "FIR_ID": "FIR001", "Person_ID": "P01",
                "Accused_Name": "A", "Gender": "Male", "Age": "30",
                "District": "Test", "Station_ID": "PS01",
                "Arrest_Date": "2025-01-01", "Arrest_Location": "Loc",
                "Arresting_Officer": "Off", "Custody_Type": "Police",
                "Bail_Status": "Denied", "Recovery_Item": "None",
                "Recovery_Value": "0", "Medical_Examination": "false",
                "Fingerprint_Taken": "false", "DNA_Sample": "false",
                "Photograph_Taken": "false",
            },
            {
                "Arrest_ID": "ARR002", "FIR_ID": "FIR001", "Person_ID": "P02",
                "Accused_Name": "B", "Gender": "Female", "Age": "25",
                "District": "Test", "Station_ID": "PS01",
                "Arrest_Date": "2025-01-02", "Arrest_Location": "Loc2",
                "Arresting_Officer": "Off2", "Custody_Type": "Judicial",
                "Bail_Status": "Granted", "Recovery_Item": "Laptop",
                "Recovery_Value": "50000", "Medical_Examination": "false",
                "Fingerprint_Taken": "false", "DNA_Sample": "false",
                "Photograph_Taken": "false",
            },
        ]
        with patch("app.database.ingest.psycopg2.extras.execute_values") as mock_ev:
            count = ingest_arrests(mock_cur, rows)
            assert count == 2
            # Both records included in one batch call
            values = mock_ev.call_args[0][2]
            assert len(values) == 2

    def test_ingest_chargesheets_two_records_same_fir(self) -> None:
        """Two chargesheets for the same FIR must both be ingested."""
        from unittest.mock import patch
        from app.database.ingest import ingest_chargesheets

        mock_cur = MagicMock()
        rows = [
            {
                "ChargeSheet_ID": "CS001", "FIR_ID": "FIR001",
                "Accused_ID": "P01", "Crime_Type": "Theft",
                "Sections": "BNS 303", "Investigating_Officer": "Off",
                "Court": "Session", "Witness_Count": "1",
                "Evidence_Count": "1", "ChargeSheet_Date": "2025-06-01",
                "Status": "Under Trial",
            },
            {
                "ChargeSheet_ID": "CS002", "FIR_ID": "FIR001",
                "Accused_ID": "P02", "Crime_Type": "Robbery",
                "Sections": "BNS 309", "Investigating_Officer": "Off2",
                "Court": "District", "Witness_Count": "5",
                "Evidence_Count": "4", "ChargeSheet_Date": "2025-06-15",
                "Status": "Convicted",
            },
        ]
        with patch("app.database.ingest.psycopg2.extras.execute_values") as mock_ev:
            count = ingest_chargesheets(mock_cur, rows)
            assert count == 2
            values = mock_ev.call_args[0][2]
            assert len(values) == 2

    def test_ingest_fir_upsert_uses_fir_id(self) -> None:
        """FIR ingestion must ON CONFLICT on fir_id."""
        from unittest.mock import patch
        from app.database.ingest import ingest_firs

        mock_cur = MagicMock()
        rows = [
            {
                "FIR_ID": "FIR20250001", "FIR_Number": "25/001/2025",
                "Station_ID": "PS0001", "District": "Test",
                "Incident_Date": "2025-01-15", "FIR_Date": "2025-01-15",
                "Crime_Head": "Theft", "Crime_Subhead": "Snatching",
                "BNS_Sections": "BNS 303", "Latitude": "12.97",
                "Longitude": "77.59", "Complainant_ID": "P000001",
                "Victim_ID": "P000002", "Accused_ID": "P000003",
                "Investigating_Officer": "SI Kumar",
                "Status": "Under Investigation",
            }
        ]
        with patch("app.database.ingest.psycopg2.extras.execute_values") as mock_ev:
            fir_count, _ = ingest_firs(mock_cur, rows)
            assert fir_count == 1
            # First call is the FIR INSERT
            fir_sql = mock_ev.call_args_list[0][0][1]
            assert "ON CONFLICT (fir_id)" in fir_sql

    def test_ingest_district_upsert_uses_district_id(self) -> None:
        from unittest.mock import patch
        from app.database.ingest import ingest_districts

        mock_cur = MagicMock()
        rows = [{"District_ID": "1", "District_Name": "T", "Police_Range": "R",
                 "State": "K", "Population": "100", "Area_Sq_Km": "10",
                 "Population_Density": "10", "Literacy_Rate": "80",
                 "Urban_Population_Pct": "50", "Rural_Population_Pct": "50",
                 "Police_Stations": "2", "Latitude": "12", "Longitude": "77"}]
        with patch("app.database.ingest.psycopg2.extras.execute_values") as mock_ev:
            ingest_districts(mock_cur, rows)
            sql = mock_ev.call_args[0][1]
            assert "ON CONFLICT (district_id)" in sql

    def test_ingest_station_upsert_uses_station_id(self) -> None:
        from unittest.mock import patch
        from app.database.ingest import ingest_stations

        mock_cur = MagicMock()
        rows = [{"Station_ID": "PS001", "Station_Name": "T",
                 "District_ID": "1", "District_Name": "D",
                 "Zone": "Z", "Station_Type": "Urban",
                 "Latitude": "12", "Longitude": "77",
                 "Personnel_Strength": "50", "Patrol_Vehicles": "5",
                 "Contact_Number": "123", "Email": "t@t.com"}]
        with patch("app.database.ingest.psycopg2.extras.execute_values") as mock_ev:
            ingest_stations(mock_cur, rows)
            sql = mock_ev.call_args[0][1]
            assert "ON CONFLICT (station_id)" in sql

    def test_ingest_person_upsert_uses_person_id(self) -> None:
        from unittest.mock import patch
        from app.database.ingest import ingest_people

        mock_cur = MagicMock()
        rows = [{"Person_ID": "P001", "Full_Name": "A", "Gender": "M",
                 "DOB": "2000-01-01", "Age": "25", "Occupation": "Driver",
                 "Education": "Graduate", "Marital_Status": "Single",
                 "Blood_Group": "O+", "Nationality": "Indian",
                 "District": "Test", "Station_ID": "PS001"}]
        with patch("app.database.ingest.psycopg2.extras.execute_values") as mock_ev:
            ingest_people(mock_cur, rows)
            sql = mock_ev.call_args[0][1]
            assert "ON CONFLICT (person_id)" in sql


# ---------------------------------------------------------------------------
# Configuration validation tests
# ---------------------------------------------------------------------------


class TestConfigurationValidation:
    """Verify Settings rejects invalid configurations at import time.

    The module-level ``settings = Settings()`` in config.py runs validators.
    These tests verify that invalid configs raise ValueError, and that
    DATABASE_URL is never exposed in error messages.
    """

    def test_invalid_backend_rejects(self) -> None:
        """Unsupported DATA_BACKEND must raise ValueError."""
        from pydantic import ValidationError

        with pytest.raises(ValidationError, match="DATA_BACKEND"):
            from app.core.config import Settings
            Settings(DATA_BACKEND="sqlite")

    def test_missing_database_url_rejects(self) -> None:
        """DATA_BACKEND=postgres with empty DATABASE_URL must raise."""
        from pydantic import ValidationError

        with pytest.raises(ValidationError, match="DATABASE_URL"):
            from app.core.config import Settings
            Settings(DATA_BACKEND="postgres", DATABASE_URL="")

    def test_pool_min_too_low_rejects(self) -> None:
        from pydantic import ValidationError

        with pytest.raises(ValidationError, match="DATABASE_POOL_MIN"):
            from app.core.config import Settings
            Settings(DATABASE_POOL_MIN=0)

    def test_pool_max_too_low_rejects(self) -> None:
        from pydantic import ValidationError

        with pytest.raises(ValidationError, match="DATABASE_POOL_MAX"):
            from app.core.config import Settings
            Settings(DATABASE_POOL_MAX=0)

    def test_pool_min_exceeds_max_rejects(self) -> None:
        from pydantic import ValidationError

        with pytest.raises(ValidationError, match="DATABASE_POOL_MIN"):
            from app.core.config import Settings
            Settings(DATABASE_POOL_MIN=10, DATABASE_POOL_MAX=5)

    def test_valid_csv_backend_accepted(self) -> None:
        from app.core.config import Settings

        s = Settings(DATA_BACKEND="csv")
        assert s.DATA_BACKEND == "csv"

    def test_valid_postgres_backend_accepted(self) -> None:
        from app.core.config import Settings

        s = Settings(
            DATA_BACKEND="postgres",
            DATABASE_URL="postgresql://user:pass@localhost:5432/db",
        )
        assert s.DATA_BACKEND == "postgres"

    def test_backend_normalised_to_lowercase(self) -> None:
        from app.core.config import Settings

        s = Settings(DATA_BACKEND="CSV")
        assert s.DATA_BACKEND == "csv"

    def test_validation_error_hides_database_url(self) -> None:
        """DATABASE_URL must not appear in validation error messages."""
        from pydantic import ValidationError

        try:
            from app.core.config import Settings
            Settings(DATA_BACKEND="postgres", DATABASE_URL="")
        except ValidationError as exc:
            error_str = str(exc)
            assert "postgresql://" not in error_str
            assert "password" not in error_str.lower()

    def test_settings_defaults_csv(self) -> None:
        from app.core.config import Settings

        s = Settings(DATA_BACKEND="csv", DATABASE_URL="")
        assert s.DATA_BACKEND == "csv"

    def test_settings_pool_bounds_valid(self) -> None:
        from app.core.config import settings

        assert settings.DATABASE_POOL_MIN >= 1
        assert settings.DATABASE_POOL_MAX >= settings.DATABASE_POOL_MIN


# ---------------------------------------------------------------------------
# Persistence provider selection tests
# ---------------------------------------------------------------------------


class TestPersistenceProvider:
    """Test that persistence provider correctly selects backend."""

    def test_repository_collection_has_protocol_types(self) -> None:
        from app.database.dependencies import RepositoryCollection

        repo = RepositoryCollection(
            districts=object(),
            stations=object(),
            people=object(),
            firs=object(),
            arrests=object(),
            chargesheets=object(),
        )
        assert repo.districts is not None
        assert repo.stations is not None

    def test_build_csv_repositories_function_exists(self) -> None:
        from app.database.dependencies import _build_csv_repositories

        assert callable(_build_csv_repositories)

    def test_build_postgres_repositories_function_exists(self) -> None:
        from app.database.dependencies import _build_postgres_repositories

        assert callable(_build_postgres_repositories)


# ---------------------------------------------------------------------------
# Connection management tests
# ---------------------------------------------------------------------------


class TestConnectionManagement:
    """Test PostgreSQL connection management module."""

    def test_module_has_required_functions(self) -> None:
        import app.database.postgres as pg

        assert hasattr(pg, "init_pool")
        assert hasattr(pg, "close_pool")
        assert hasattr(pg, "get_connection")
        assert hasattr(pg, "get_cursor")
        assert hasattr(pg, "execute_query")
        assert hasattr(pg, "execute_one")
        assert hasattr(pg, "execute_write")
        assert hasattr(pg, "execute_many")

    def test_pool_not_initialized_raises(self) -> None:
        import app.database.postgres as pg

        original_pool = pg._pool
        pg._pool = None
        try:
            with pytest.raises(RuntimeError, match="not initialized"):
                with pg.get_connection():
                    pass
        finally:
            pg._pool = original_pool

    def test_close_pool_when_not_initialized(self) -> None:
        import app.database.postgres as pg

        original_pool = pg._pool
        pg._pool = None
        try:
            pg.close_pool()
        finally:
            pg._pool = original_pool


# ---------------------------------------------------------------------------
# Main.py integration tests
# ---------------------------------------------------------------------------


class TestMainAppIntegration:
    """Test that main.py correctly integrates PostgreSQL lifecycle."""

    def test_main_imports_successfully(self) -> None:
        from app.main import app

        assert app is not None

    def test_health_endpoint_exists(self) -> None:
        from app.main import app

        routes = [r.path for r in app.routes]
        assert "/health" in routes


# ---------------------------------------------------------------------------
# File structure tests
# ---------------------------------------------------------------------------


class TestFileStructure:
    """Verify required files exist for this checkpoint."""

    def test_migration_file(self) -> None:
        assert MIGRATION_PATH.exists()

    def test_postgres_package(self) -> None:
        assert (BACKEND_ROOT / "app" / "database" / "postgres" / "__init__.py").exists()

    def test_all_repository_files(self) -> None:
        postgres_dir = BACKEND_ROOT / "app" / "database" / "postgres"
        required = [
            "__init__.py",
            "district_repo.py",
            "station_repo.py",
            "person_repo.py",
            "fir_repo.py",
            "arrest_repo.py",
            "chargesheet_repo.py",
        ]
        for filename in required:
            assert (postgres_dir / filename).exists(), f"Missing: {filename}"

    def test_ingest_package(self) -> None:
        ingest_dir = BACKEND_ROOT / "app" / "database" / "ingest"
        assert (ingest_dir / "__init__.py").exists()
        assert (ingest_dir / "run.py").exists()

    def test_env_example_updated(self) -> None:
        env_example = BACKEND_ROOT / ".env.example"
        content = env_example.read_text()
        assert "DATA_BACKEND" in content
        assert "DATABASE_URL" in content

    def test_requirements_updated(self) -> None:
        req = BACKEND_ROOT / "requirements.txt"
        content = req.read_text()
        assert "psycopg2-binary" in content

    def test_run_py_no_pool_import(self) -> None:
        """run.py should not import init_pool or close_pool."""
        run_py = BACKEND_ROOT / "app" / "database" / "ingest" / "run.py"
        content = run_py.read_text()
        assert "init_pool" not in content
        assert "close_pool" not in content
