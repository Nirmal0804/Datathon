from __future__ import annotations

import logging
from typing import Optional

from app.database.postgres import execute_one, execute_query
from app.database.records import ArrestRecord

logger = logging.getLogger(__name__)


class PostgresArrestRepository:
    """PostgreSQL implementation of arrest data access."""

    _BASE_SELECT = (
        "SELECT a.arrest_id, a.fir_id, a.person_id, a.accused_name, "
        "a.gender, a.age, a.district, a.station_id, a.arrest_date, "
        "a.arrest_location, a.arresting_officer, a.custody_type, "
        "a.bail_status, a.recovery_item, a.recovery_value, "
        "a.medical_examination, a.fingerprint_taken, a.dna_sample, "
        "a.photograph_taken "
        "FROM arrests a"
    )

    def list_all_arrests(self) -> list[ArrestRecord]:
        rows = execute_query(f"{self._BASE_SELECT} ORDER BY a.arrest_id")
        return [self._to_record(r) for r in rows]

    def get_by_id(self, arrest_id: str) -> Optional[ArrestRecord]:
        row = execute_one(
            f"{self._BASE_SELECT} WHERE a.arrest_id = %s", (arrest_id,)
        )
        return self._to_record(row) if row else None

    def get_by_fir_id(self, fir_id: str) -> list[ArrestRecord]:
        rows = execute_query(
            f"{self._BASE_SELECT} WHERE a.fir_id = %s ORDER BY a.arrest_id",
            (fir_id,),
        )
        return [self._to_record(r) for r in rows]

    def list_by_station(self, station_id: str) -> list[ArrestRecord]:
        rows = execute_query(
            f"{self._BASE_SELECT} WHERE a.station_id = %s ORDER BY a.arrest_id",
            (station_id,),
        )
        return [self._to_record(r) for r in rows]

    def list_by_person(self, person_id: str) -> list[ArrestRecord]:
        rows = execute_query(
            f"{self._BASE_SELECT} WHERE a.person_id = %s ORDER BY a.arrest_id",
            (person_id,),
        )
        return [self._to_record(r) for r in rows]

    @staticmethod
    def _to_record(row: dict) -> ArrestRecord:
        return ArrestRecord(
            arrest_id=row["arrest_id"],
            fir_id=row["fir_id"],
            person_id=row["person_id"],
            accused_name=row["accused_name"],
            gender=row["gender"],
            age=row["age"],
            district=row["district"],
            station_id=row["station_id"],
            arrest_date=row["arrest_date"],
            arrest_location=row["arrest_location"],
            arresting_officer=row["arresting_officer"],
            custody_type=row["custody_type"],
            bail_status=row["bail_status"],
            recovery_item=row["recovery_item"],
            recovery_value=row["recovery_value"],
            medical_examination=row["medical_examination"],
            fingerprint_taken=row["fingerprint_taken"],
            dna_sample=row["dna_sample"],
            photograph_taken=row["photograph_taken"],
        )
