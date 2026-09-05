"""CSV to PostgreSQL ingestion for production database population.

Design constraints (from BACKEND_GUARDRAILS.md section 15):
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
import psycopg2.extras

logger = logging.getLogger(__name__)

CSV_TABLE_MAP = {
    "districts.csv": "districts",
    "stations.csv": "police_stations",
    "people.csv": "people",
    "firs.csv": "firs",
    "arrests.csv": "arrests",
    "chargesheets.csv": "chargesheets",
}


def _generate_batch_id() -> str:
    return f"batch-{uuid.uuid4().hex[:12]}"


def _read_csv(file_path: Path) -> list[dict[str, Any]]:
    with open(file_path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def _safe_int(value: str, default: int = 0) -> int:
    try:
        return int(value.strip()) if value and value.strip() else default
    except (ValueError, TypeError):
        return default


def _safe_float(value: str, default: float = 0.0) -> float:
    try:
        return float(value.strip()) if value and value.strip() else default
    except (ValueError, TypeError):
        return default


def _safe_bool(value: str) -> bool:
    return str(value).strip().lower() in ("true", "1", "yes")


BATCH_SIZE = 500


def ingest_districts(cur: psycopg2.extensions.cursor, rows: list[dict]) -> int:
    sql = """
        INSERT INTO districts (district_id, district_name, police_range, state,
            population, area_sq_km, population_density, literacy_rate,
            urban_population_pct, rural_population_pct, police_stations,
            latitude, longitude)
        VALUES %s
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
    """
    values = [
        (
            _safe_int(r.get("District_ID", "0")),
            r.get("District", "").strip(),
            r.get("Police_Range", "").strip(),
            r.get("State", "Karnataka").strip(),
            _safe_int(r.get("Population", "0")),
            _safe_int(r.get("Area_sq_km", "0")),
            _safe_int(r.get("Population_Density", "0")),
            _safe_float(r.get("Literacy_Rate", "0")),
            _safe_int(r.get("Urban_Population_%", "0")),
            _safe_int(r.get("Rural_Population_%", "0")),
            _safe_int(r.get("Police_Stations", "0")),
            _safe_float(r.get("Latitude", "0")),
            _safe_float(r.get("Longitude", "0")),
        )
        for r in rows
    ]
    for i in range(0, len(values), BATCH_SIZE):
        psycopg2.extras.execute_values(cur, sql, values[i:i + BATCH_SIZE])
    return len(values)


def ingest_stations(cur: psycopg2.extensions.cursor, rows: list[dict]) -> int:
    sql = """
        INSERT INTO police_stations (station_id, station_name, district_id,
            district_name, zone, station_type, latitude, longitude,
            personnel_strength, patrol_vehicles, contact_number, email)
        VALUES %s
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
    """
    values = [
        (
            r.get("Station_ID", "").strip(),
            r.get("Station_Name", "").strip(),
            _safe_int(r.get("District_ID", "0")),
            r.get("District", "").strip(),
            r.get("Zone", "").strip(),
            r.get("Station_Type", "").strip(),
            _safe_float(r.get("Latitude", "0")),
            _safe_float(r.get("Longitude", "0")),
            _safe_int(r.get("Personnel_Strength", "0")),
            _safe_int(r.get("Patrol_Vehicles", "0")),
            r.get("Contact_Number", "").strip(),
            r.get("Email", "").strip(),
        )
        for r in rows
    ]
    for i in range(0, len(values), BATCH_SIZE):
        psycopg2.extras.execute_values(cur, sql, values[i:i + BATCH_SIZE])
    return len(values)


def ingest_people(cur: psycopg2.extensions.cursor, rows: list[dict]) -> int:
    sql = """
        INSERT INTO people (person_id, full_name, gender, dob, age,
            occupation, education, marital_status, blood_group,
            nationality, district, station_id)
        VALUES %s
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
    """
    values = [
        (
            r.get("Person_ID", "").strip(),
            r.get("Full_Name", "").strip(),
            r.get("Gender", "").strip(),
            r.get("DOB", "").strip() or None,
            _safe_int(r.get("Age", "0")),
            r.get("Occupation", "").strip(),
            r.get("Education", "").strip(),
            r.get("Marital_Status", "").strip(),
            r.get("Blood_Group", "").strip(),
            r.get("Nationality", "Indian").strip(),
            r.get("District", "").strip(),
            r.get("Station_ID", "").strip(),
        )
        for r in rows
    ]
    for i in range(0, len(values), BATCH_SIZE):
        psycopg2.extras.execute_values(cur, sql, values[i:i + BATCH_SIZE])
    return len(values)


def ingest_firs(
    cur: psycopg2.extensions.cursor, rows: list[dict]
) -> tuple[int, int]:
    fir_sql = """
        INSERT INTO firs (fir_id, fir_number, station_id, district,
            incident_date, fir_date, crime_head, crime_subhead,
            bns_sections, latitude, longitude, complainant_id,
            victim_id, investigating_officer, status)
        VALUES %s
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
    """
    fir_values = []
    role_values = []

    for row in rows:
        fir_id = row.get("FIR_ID", "").strip()
        complainant_id = row.get("Complainant_ID", "").strip()
        victim_id = row.get("Victim_ID", "").strip()
        accused_ids_raw = row.get("Accused_ID", "").strip()

        fir_values.append((
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
        ))

        if complainant_id:
            role_values.append((fir_id, complainant_id, "complainant"))
        if victim_id:
            role_values.append((fir_id, victim_id, "victim"))
        if accused_ids_raw:
            for aid in accused_ids_raw.split(","):
                aid = aid.strip()
                if aid:
                    role_values.append((fir_id, aid, "accused"))

    for i in range(0, len(fir_values), BATCH_SIZE):
        psycopg2.extras.execute_values(cur, fir_sql, fir_values[i:i + BATCH_SIZE])

    if role_values:
        role_sql = """
            INSERT INTO fir_person_roles (fir_id, person_id, role)
            VALUES %s
            ON CONFLICT (fir_id, person_id, role) DO NOTHING
        """
        for i in range(0, len(role_values), BATCH_SIZE):
            psycopg2.extras.execute_values(cur, role_sql, role_values[i:i + BATCH_SIZE])

    return len(fir_values), len(role_values)


def ingest_arrests(cur: psycopg2.extensions.cursor, rows: list[dict]) -> int:
    sql = """
        INSERT INTO arrests (arrest_id, fir_id, person_id, accused_name,
            gender, age, district, station_id, arrest_date,
            arrest_location, arresting_officer, custody_type,
            bail_status, recovery_item, recovery_value,
            medical_examination, fingerprint_taken, dna_sample,
            photograph_taken)
        VALUES %s
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
    """
    values = [
        (
            r.get("Arrest_ID", "").strip(),
            r.get("FIR_ID", "").strip(),
            r.get("Person_ID", "").strip(),
            r.get("Accused_Name", "").strip(),
            r.get("Gender", "").strip(),
            _safe_int(r.get("Age", "0")),
            r.get("District", "").strip(),
            r.get("Station_ID", "").strip(),
            r.get("Arrest_Date", "").strip() or None,
            r.get("Arrest_Location", "").strip(),
            r.get("Arresting_Officer", "").strip(),
            r.get("Custody_Type", "").strip(),
            r.get("Bail_Status", "").strip(),
            r.get("Recovery_Item", "").strip(),
            _safe_int(r.get("Recovery_Value", "0")),
            _safe_bool(r.get("Medical_Examination", "false")),
            _safe_bool(r.get("Fingerprint_Taken", "false")),
            _safe_bool(r.get("DNA_Sample", "false")),
            _safe_bool(r.get("Photograph_Taken", "false")),
        )
        for r in rows
    ]
    for i in range(0, len(values), BATCH_SIZE):
        psycopg2.extras.execute_values(cur, sql, values[i:i + BATCH_SIZE])
    return len(values)


def ingest_chargesheets(
    cur: psycopg2.extensions.cursor, rows: list[dict]
) -> int:
    sql = """
        INSERT INTO chargesheets (chargesheet_id, fir_id, accused_id,
            crime_type, sections, investigating_officer, court,
            witness_count, evidence_count, chargesheet_date, status)
        VALUES %s
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
    """
    values = [
        (
            r.get("ChargeSheet_ID", "").strip(),
            r.get("FIR_ID", "").strip(),
            r.get("Accused_ID", "").strip(),
            r.get("Crime_Type", "").strip(),
            r.get("Sections", "").strip(),
            r.get("Investigating_Officer", "").strip(),
            r.get("Court", "").strip(),
            _safe_int(r.get("Witness_Count", "0")),
            _safe_int(r.get("Evidence_Count", "0")),
            r.get("ChargeSheet_Date", "").strip() or None,
            r.get("Status", "Under Trial").strip(),
        )
        for r in rows
    ]
    for i in range(0, len(values), BATCH_SIZE):
        psycopg2.extras.execute_values(cur, sql, values[i:i + BATCH_SIZE])
    return len(values)


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

        cur.execute(
            """
            INSERT INTO ingestion_batches (batch_id, source_type, source_file,
                records_processed, records_accepted, records_rejected, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (batch_id, "csv", str(data_dir), total, total, 0, "success"),
        )

        conn.commit()

        # Invalidate cached analytics only after confirmed successful database commit
        try:
            from app.core.cache import get_cache_service
            cache = get_cache_service()
            invalidated_count = (
                cache.invalidate_prefix("dashboard_summary")
                + cache.invalidate_prefix("districts_list")
                + cache.invalidate_prefix("district_intelligence_")
                + cache.invalidate_prefix("map_intelligence_")
                + cache.invalidate_prefix("stations_list")
                + cache.invalidate_prefix("station_detail_")
                + cache.invalidate_prefix("analytics_")
            )
            logger.info("Cache invalidated after batch %s (%d entries purged)", batch_id, invalidated_count)
        except Exception as cache_exc:
            logger.warning("Cache invalidation notice after ingestion: %s", cache_exc)

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

        try:
            cur = conn.cursor()
            cur.execute(
                """
                INSERT INTO ingestion_batches (batch_id, source_type, source_file,
                    records_processed, records_accepted, records_rejected,
                    status, failure_reason)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (batch_id, "csv", str(data_dir), 0, 0, 0, "failed", str(e)[:500]),
            )
            conn.commit()
        except Exception:
            logger.error("Failed to record ingestion batch failure")
            conn.rollback()

        raise

    finally:
        cur.close()

    return summary
