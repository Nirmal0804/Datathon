"""CSV to PostgreSQL ingestion for production database population.

Design constraints (from BACKEND_GUARDRAILS.md §15):
- Deterministic: same CSV input produces identical database state
- Repeatable: multiple runs do not create duplicate records
- Idempotent: re-running with same data produces same result
- Transaction-safe: partial failures roll back completely
- Auditable: every ingestion batch is recorded
- No PII in logs: names, IDs never appear in log output
"""

from __future__ import annotations

import csv
import hashlib
import logging
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import psycopg2

logger = logging.getLogger(__name__)

# Ingestion order respects FK dependencies:
# districts → stations → people → firs → fir_person_roles → arrests → chargesheets
TABLE_ORDER = [
    "districts",
    "police_stations",
    "people",
    "firs",
    "fir_person_roles",
    "arrests",
    "chargesheets",
]

CSV_TABLE_MAP = {
    "districts.csv": "districts",
    "stations.csv": "police_stations",
    "people.csv": "people",
    "firs.csv": "firs",
    "arrests.csv": "arrests",
    "chargesheets.csv": "chargesheets",
}


def _generate_batch_id() -> str:
    """Generate a unique batch identifier."""
    return f"batch-{uuid.uuid4().hex[:12]}"


def _compute_file_hash(file_path: Path) -> str:
    """Compute SHA-256 hash of a file for audit trail."""
    h = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()[:16]


def _read_csv(file_path: Path) -> list[dict[str, Any]]:
    """Read CSV file and return list of row dicts."""
    with open(file_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)


def _truncate_value(value: str, max_len: int) -> str:
    """Truncate string to max length for safety."""
    return value[:max_len] if value else ""


def _safe_int(value: str, default: int = 0) -> int:
    """Safely convert string to int."""
    try:
        return int(value.strip()) if value and value.strip() else default
    except (ValueError, TypeError):
        return default


def _safe_float(value: str, default: float = 0.0) -> float:
    """Safely convert string to float."""
    try:
        return float(value.strip()) if value and value.strip() else default
    except (ValueError, TypeError):
        return default


def _safe_bool(value: str) -> bool:
    """Safely convert string to boolean."""
    return str(value).strip().lower() in ("true", "1", "yes")


def ingest_districts(cur: psycopg2.extensions.cursor, rows: list[dict]) -> int:
    """Ingest districts CSV rows."""
    count = 0
    for row in rows:
        cur.execute(
            """
            INSERT INTO districts (district_id, district_name, police_range, state,
                population, area_sq_km, population_density, literacy_rate,
                urban_population_pct, rural_population_pct, police_stations,
                latitude, longitude)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (district_id) DO UPDATE SET
                district_name = EXCLUDED.district_name,
                police_range = EXCLUDED.police_range,
                population = EXCLUDED.population,
                area_sq_km = EXCLUDED.area_sq_km,
                population_density = EXCLUDED.population_density,
                literacy_rate = EXCLUDED.literacy_rate,
                urban_population_pct = EXCLUDED.urban_population_pct,
                rural_population_pct = EXCLUDED.rural_population_pct,
                police_stations = EXCLUDED.police_stations,
                latitude = EXCLUDED.latitude,
                longitude = EXCLUDED.longitude
            """,
            (
                _safe_int(row.get("District_ID", "0")),
                row.get("District_Name", "").strip(),
                row.get("Police_Range", "").strip(),
                row.get("State", "Karnataka").strip(),
                _safe_int(row.get("Population", "0")),
                _safe_int(row.get("Area_Sq_Km", "0")),
                _safe_int(row.get("Population_Density", "0")),
                _safe_float(row.get("Literacy_Rate", "0")),
                _safe_int(row.get("Urban_Population_Pct", "0")),
                _safe_int(row.get("Rural_Population_Pct", "0")),
                _safe_int(row.get("Police_Stations", "0")),
                _safe_float(row.get("Latitude", "0")),
                _safe_float(row.get("Longitude", "0")),
            ),
        )
        count += 1
    return count


def ingest_stations(cur: psycopg2.extensions.cursor, rows: list[dict]) -> int:
    """Ingest police stations CSV rows."""
    count = 0
    for row in rows:
        cur.execute(
            """
            INSERT INTO police_stations (station_id, station_name, district_id,
                district_name, zone, station_type, latitude, longitude,
                personnel_strength, patrol_vehicles, contact_number, email)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (station_id) DO UPDATE SET
                station_name = EXCLUDED.station_name,
                district_id = EXCLUDED.district_id,
                district_name = EXCLUDED.district_name,
                zone = EXCLUDED.zone,
                station_type = EXCLUDED.station_type,
                latitude = EXCLUDED.latitude,
                longitude = EXCLUDED.longitude,
                personnel_strength = EXCLUDED.personnel_strength,
                patrol_vehicles = EXCLUDED.patrol_vehicles,
                contact_number = EXCLUDED.contact_number,
                email = EXCLUDED.email
            """,
            (
                row.get("Station_ID", "").strip(),
                row.get("Station_Name", "").strip(),
                _safe_int(row.get("District_ID", "0")),
                row.get("District_Name", "").strip(),
                row.get("Zone", "").strip(),
                row.get("Station_Type", "").strip(),
                _safe_float(row.get("Latitude", "0")),
                _safe_float(row.get("Longitude", "0")),
                _safe_int(row.get("Personnel_Strength", "0")),
                _safe_int(row.get("Patrol_Vehicles", "0")),
                row.get("Contact_Number", "").strip(),
                row.get("Email", "").strip(),
            ),
        )
        count += 1
    return count


def ingest_people(cur: psycopg2.extensions.cursor, rows: list[dict]) -> int:
    """Ingest people CSV rows."""
    count = 0
    for row in rows:
        cur.execute(
            """
            INSERT INTO people (person_id, full_name, gender, dob, age,
                occupation, education, marital_status, blood_group,
                nationality, district, station_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (person_id) DO UPDATE SET
                full_name = EXCLUDED.full_name,
                gender = EXCLUDED.gender,
                dob = EXCLUDED.dob,
                age = EXCLUDED.age,
                occupation = EXCLUDED.occupation,
                education = EXCLUDED.education,
                marital_status = EXCLUDED.marital_status,
                blood_group = EXCLUDED.blood_group,
                nationality = EXCLUDED.nationality,
                district = EXCLUDED.district,
                station_id = EXCLUDED.station_id
            """,
            (
                row.get("Person_ID", "").strip(),
                row.get("Full_Name", "").strip(),
                row.get("Gender", "").strip(),
                row.get("DOB", "").strip() or None,
                _safe_int(row.get("Age", "0")),
                row.get("Occupation", "").strip(),
                row.get("Education", "").strip(),
                row.get("Marital_Status", "").strip(),
                row.get("Blood_Group", "").strip(),
                row.get("Nationality", "Indian").strip(),
                row.get("District", "").strip(),
                row.get("Station_ID", "").strip(),
            ),
        )
        count += 1
    return count


def ingest_firs(
    cur: psycopg2.extensions.cursor, rows: list[dict]
) -> tuple[int, int]:
    """Ingest FIR CSV rows and populate fir_person_roles junction table.

    Returns (fir_count, role_count).
    """
    fir_count = 0
    role_count = 0

    for row in rows:
        fir_id = row.get("FIR_ID", "").strip()
        complainant_id = row.get("Complainant_ID", "").strip()
        victim_id = row.get("Victim_ID", "").strip()
        accused_ids_raw = row.get("Accused_ID", "").strip()

        cur.execute(
            """
            INSERT INTO firs (fir_id, fir_number, station_id, district,
                incident_date, fir_date, crime_head, crime_subhead,
                bns_sections, latitude, longitude, complainant_id,
                victim_id, investigating_officer, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (fir_id) DO UPDATE SET
                fir_number = EXCLUDED.fir_number,
                station_id = EXCLUDED.station_id,
                district = EXCLUDED.district,
                incident_date = EXCLUDED.incident_date,
                fir_date = EXCLUDED.fir_date,
                crime_head = EXCLUDED.crime_head,
                crime_subhead = EXCLUDED.crime_subhead,
                bns_sections = EXCLUDED.bns_sections,
                latitude = EXCLUDED.latitude,
                longitude = EXCLUDED.longitude,
                complainant_id = EXCLUDED.complainant_id,
                victim_id = EXCLUDED.victim_id,
                investigating_officer = EXCLUDED.investigating_officer,
                status = EXCLUDED.status
            """,
            (
                fir_id,
                row.get("FIR_Number", "").strip(),
                row.get("Station_ID", "").strip(),
                row.get("District", "").strip(),
                row.get("Incident_Date", "").strip() or None,
                row.get("FIR_Date", "").strip() or None,
                row.get("Crime_Head", "").strip(),
                row.get("Crime_Subhead", "").strip(),
                row.get("BNS_Sections", "").strip(),
                _safe_float(row.get("Latitude", "0")),
                _safe_float(row.get("Longitude", "0")),
                complainant_id,
                victim_id,
                row.get("Investigating_Officer", "").strip(),
                row.get("Status", "Under Investigation").strip(),
            ),
        )
        fir_count += 1

        # Populate fir_person_roles for complainant
        if complainant_id:
            cur.execute(
                """
                INSERT INTO fir_person_roles (fir_id, person_id, role)
                VALUES (%s, %s, 'complainant')
                ON CONFLICT (fir_id, person_id, role) DO NOTHING
                """,
                (fir_id, complainant_id),
            )
            role_count += 1

        # Populate fir_person_roles for victim
        if victim_id:
            cur.execute(
                """
                INSERT INTO fir_person_roles (fir_id, person_id, role)
                VALUES (%s, %s, 'victim')
                ON CONFLICT (fir_id, person_id, role) DO NOTHING
                """,
                (fir_id, victim_id),
            )
            role_count += 1

        # Populate fir_person_roles for accused (comma-separated)
        if accused_ids_raw:
            for accused_id in accused_ids_raw.split(","):
                accused_id = accused_id.strip()
                if accused_id:
                    cur.execute(
                        """
                        INSERT INTO fir_person_roles (fir_id, person_id, role)
                        VALUES (%s, %s, 'accused')
                        ON CONFLICT (fir_id, person_id, role) DO NOTHING
                        """,
                        (fir_id, accused_id),
                    )
                    role_count += 1

    return fir_count, role_count


def ingest_arrests(cur: psycopg2.extensions.cursor, rows: list[dict]) -> int:
    """Ingest arrests CSV rows."""
    count = 0
    for row in rows:
        cur.execute(
            """
            INSERT INTO arrests (arrest_id, fir_id, person_id, accused_name,
                gender, age, district, station_id, arrest_date,
                arrest_location, arresting_officer, custody_type,
                bail_status, recovery_item, recovery_value,
                medical_examination, fingerprint_taken, dna_sample,
                photograph_taken)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s)
            ON CONFLICT (arrest_id) DO UPDATE SET
                fir_id = EXCLUDED.fir_id,
                person_id = EXCLUDED.person_id,
                accused_name = EXCLUDED.accused_name,
                gender = EXCLUDED.gender,
                age = EXCLUDED.age,
                district = EXCLUDED.district,
                station_id = EXCLUDED.station_id,
                arrest_date = EXCLUDED.arrest_date,
                arrest_location = EXCLUDED.arrest_location,
                arresting_officer = EXCLUDED.arresting_officer,
                custody_type = EXCLUDED.custody_type,
                bail_status = EXCLUDED.bail_status,
                recovery_item = EXCLUDED.recovery_item,
                recovery_value = EXCLUDED.recovery_value,
                medical_examination = EXCLUDED.medical_examination,
                fingerprint_taken = EXCLUDED.fingerprint_taken,
                dna_sample = EXCLUDED.dna_sample,
                photograph_taken = EXCLUDED.photograph_taken
            """,
            (
                row.get("Arrest_ID", "").strip(),
                row.get("FIR_ID", "").strip(),
                row.get("Person_ID", "").strip(),
                row.get("Accused_Name", "").strip(),
                row.get("Gender", "").strip(),
                _safe_int(row.get("Age", "0")),
                row.get("District", "").strip(),
                row.get("Station_ID", "").strip(),
                row.get("Arrest_Date", "").strip() or None,
                row.get("Arrest_Location", "").strip(),
                row.get("Arresting_Officer", "").strip(),
                row.get("Custody_Type", "").strip(),
                row.get("Bail_Status", "").strip(),
                row.get("Recovery_Item", "").strip(),
                _safe_int(row.get("Recovery_Value", "0")),
                _safe_bool(row.get("Medical_Examination", "false")),
                _safe_bool(row.get("Fingerprint_Taken", "false")),
                _safe_bool(row.get("DNA_Sample", "false")),
                _safe_bool(row.get("Photograph_Taken", "false")),
            ),
        )
        count += 1
    return count


def ingest_chargesheets(
    cur: psycopg2.extensions.cursor, rows: list[dict]
) -> int:
    """Ingest chargesheets CSV rows."""
    count = 0
    for row in rows:
        cur.execute(
            """
            INSERT INTO chargesheets (chargesheet_id, fir_id, accused_id,
                crime_type, sections, investigating_officer, court,
                witness_count, evidence_count, chargesheet_date, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (chargesheet_id) DO UPDATE SET
                fir_id = EXCLUDED.fir_id,
                accused_id = EXCLUDED.accused_id,
                crime_type = EXCLUDED.crime_type,
                sections = EXCLUDED.sections,
                investigating_officer = EXCLUDED.investigating_officer,
                court = EXCLUDED.court,
                witness_count = EXCLUDED.witness_count,
                evidence_count = EXCLUDED.evidence_count,
                chargesheet_date = EXCLUDED.chargesheet_date,
                status = EXCLUDED.status
            """,
            (
                row.get("ChargeSheet_ID", "").strip(),
                row.get("FIR_ID", "").strip(),
                row.get("Accused_ID", "").strip(),
                row.get("Crime_Type", "").strip(),
                row.get("Sections", "").strip(),
                row.get("Investigating_Officer", "").strip(),
                row.get("Court", "").strip(),
                _safe_int(row.get("Witness_Count", "0")),
                _safe_int(row.get("Evidence_Count", "0")),
                row.get("ChargeSheet_Date", "").strip() or None,
                row.get("Status", "Under Trial").strip(),
            ),
        )
        count += 1
    return count


# Table-to-ingestion-function mapping
INGEST_DISPATCH = {
    "districts": ingest_districts,
    "police_stations": ingest_stations,
    "people": ingest_people,
    "firs": ingest_firs,
    "arrests": ingest_arrests,
    "chargesheets": ingest_chargesheets,
}


def ingest_all(
    conn: psycopg2.extensions.connection,
    data_dir: Path,
) -> dict[str, Any]:
    """Ingest all CSV files into PostgreSQL in a single transaction.

    This function:
    1. Reads CSVs in dependency order
    2. Ingests each table within a transaction
    3. Records an audit batch on success
    4. Rolls back completely on any failure

    Returns a summary dict with counts per table and batch_id.
    """
    batch_id = _generate_batch_id()
    started_at = datetime.now(timezone.utc)
    summary: dict[str, Any] = {
        "batch_id": batch_id,
        "started_at": started_at.isoformat(),
        "tables": {},
        "total_records": 0,
        "status": "pending",
    }

    try:
        cur = conn.cursor()

        # Process CSV files in order
        csv_files_in_order = [
            "districts.csv",
            "stations.csv",
            "people.csv",
            "firs.csv",
            "arrests.csv",
            "chargesheets.csv",
        ]

        total = 0
        for csv_filename in csv_files_in_order:
            csv_path = data_dir / csv_filename
            if not csv_path.exists():
                logger.warning("CSV file not found: %s", csv_filename)
                summary["tables"][csv_filename] = {
                    "status": "skipped",
                    "reason": "file not found",
                }
                continue

            rows = _read_csv(csv_path)
            table_name = CSV_TABLE_MAP[csv_filename]

            ingest_fn = INGEST_DISPATCH[table_name]
            result = ingest_fn(cur, rows)

            if isinstance(result, tuple):
                count = sum(result)
                detail = {"rows_processed": len(rows), "counts": result}
            else:
                count = result
                detail = {"rows_processed": len(rows), "count": count}

            summary["tables"][csv_filename] = {
                "status": "success",
                **detail,
            }
            total += count

            logger.info(
                "Ingested %s: %d rows", csv_filename, count
            )

        # Record audit batch
        cur.execute(
            """
            INSERT INTO ingestion_batches (batch_id, source_type, source_file,
                records_processed, records_accepted, records_rejected, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                batch_id,
                "csv",
                str(data_dir),
                total,
                total,
                0,
                "success",
            ),
        )

        conn.commit()

        summary["total_records"] = total
        summary["status"] = "success"
        summary["completed_at"] = datetime.now(timezone.utc).isoformat()

        logger.info(
            "Ingestion batch %s completed: %d total records",
            batch_id,
            total,
        )

    except Exception as e:
        conn.rollback()
        summary["status"] = "failed"
        summary["error"] = str(e)
        summary["completed_at"] = datetime.now(timezone.utc).isoformat()

        # Record failed batch
        try:
            cur = conn.cursor()
            cur.execute(
                """
                INSERT INTO ingestion_batches (batch_id, source_type, source_file,
                    records_processed, records_accepted, records_rejected,
                    status, failure_reason)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    batch_id,
                    "csv",
                    str(data_dir),
                    0,
                    0,
                    0,
                    "failed",
                    str(e)[:500],
                ),
            )
            conn.commit()
        except Exception:
            logger.error("Failed to record ingestion batch failure")
            conn.rollback()

        raise

    finally:
        cur.close()

    return summary
