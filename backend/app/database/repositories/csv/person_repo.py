"""CSV-backed person repository."""

from __future__ import annotations

from typing import List, Optional

from app.database.csv_loader import parse_date, parse_int
from app.database.records import PersonRecord


class CSVPersonRepository:
    """Person repository backed by ``people.csv``."""

    def __init__(self, rows: list[dict[str, str]]) -> None:
        self._rows = rows
        self._by_id: dict[str, PersonRecord] = {}
        self._by_district: dict[str, list[PersonRecord]] = {}
        self._build_indices()

    def _build_indices(self) -> None:
        for row in self._rows:
            record = self._row_to_record(row)
            self._by_id[record.person_id] = record
            self._by_district.setdefault(record.district, []).append(record)

    @staticmethod
    def _row_to_record(row: dict[str, str]) -> PersonRecord:
        return PersonRecord(
            person_id=row["Person_ID"],
            full_name=row["Full_Name"],
            gender=row["Gender"],
            dob=parse_date(row["DOB"]),
            age=parse_int(row["Age"]),
            occupation=row["Occupation"],
            education=row["Education"],
            marital_status=row["Marital_Status"],
            blood_group=row["Blood_Group"],
            nationality=row["Nationality"],
            district=row["District"],
            station_id=row["Station_ID"],
        )

    def get_by_id(self, person_id: str) -> Optional[PersonRecord]:
        return self._by_id.get(person_id)

    def list_by_district(self, district: str) -> List[PersonRecord]:
        return list(self._by_district.get(district, []))
