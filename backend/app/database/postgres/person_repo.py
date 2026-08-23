from __future__ import annotations

import logging
from typing import Optional

from app.database.postgres import execute_one, execute_query
from app.database.records import PersonRecord

logger = logging.getLogger(__name__)


class PostgresPersonRepository:
    """PostgreSQL implementation of person data access."""

    def get_by_id(self, person_id: str) -> Optional[PersonRecord]:
        row = execute_one(
            "SELECT person_id, full_name, gender, dob, age, "
            "occupation, education, marital_status, blood_group, "
            "nationality, district, station_id "
            "FROM people WHERE person_id = %s",
            (person_id,),
        )
        return self._to_record(row) if row else None

    def list_by_station(self, station_id: str) -> list[PersonRecord]:
        rows = execute_query(
            "SELECT person_id, full_name, gender, dob, age, "
            "occupation, education, marital_status, blood_group, "
            "nationality, district, station_id "
            "FROM people WHERE station_id = %s ORDER BY person_id",
            (station_id,),
        )
        return [self._to_record(r) for r in rows]

    def list_by_district(self, district: str) -> list[PersonRecord]:
        rows = execute_query(
            "SELECT person_id, full_name, gender, dob, age, "
            "occupation, education, marital_status, blood_group, "
            "nationality, district, station_id "
            "FROM people WHERE district = %s ORDER BY person_id",
            (district,),
        )
        return [self._to_record(r) for r in rows]

    @staticmethod
    def _to_record(row: dict) -> PersonRecord:
        return PersonRecord(
            person_id=row["person_id"],
            full_name=row["full_name"],
            gender=row["gender"],
            dob=row["dob"],
            age=row["age"],
            occupation=row["occupation"],
            education=row["education"],
            marital_status=row["marital_status"],
            blood_group=row["blood_group"],
            nationality=row["nationality"],
            district=row["district"],
            station_id=row["station_id"],
        )
