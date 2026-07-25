"""CSV-backed arrest repository."""

from __future__ import annotations

from typing import List

from app.database.csv_loader import parse_bool, parse_datetime, parse_int
from app.database.records import ArrestRecord


class CSVArrestRepository:
    """Arrest repository backed by ``arrests.csv``."""

    def __init__(self, rows: list[dict[str, str]]) -> None:
        self._rows = rows
        self._all: list[ArrestRecord] = []
        self._by_fir: dict[str, list[ArrestRecord]] = {}
        self._by_station: dict[str, list[ArrestRecord]] = {}
        self._by_person: dict[str, list[ArrestRecord]] = {}
        self._build_indices()

    def _build_indices(self) -> None:
        for row in self._rows:
            record = self._row_to_record(row)
            self._all.append(record)
            self._by_fir.setdefault(record.fir_id, []).append(record)
            self._by_station.setdefault(record.station_id, []).append(record)
            self._by_person.setdefault(record.person_id, []).append(record)

    @staticmethod
    def _row_to_record(row: dict[str, str]) -> ArrestRecord:
        return ArrestRecord(
            arrest_id=row["Arrest_ID"],
            fir_id=row["FIR_ID"],
            person_id=row["Person_ID"],
            accused_name=row["Accused_Name"],
            gender=row["Gender"],
            age=parse_int(row["Age"]),
            district=row["District"],
            station_id=row["Station_ID"],
            arrest_date=parse_datetime(row["Arrest_Date"]),
            arrest_location=row["Arrest_Location"],
            arresting_officer=row["Arresting_Officer"],
            custody_type=row["Custody_Type"],
            bail_status=row["Bail_Status"],
            recovery_item=row["Recovery_Item"],
            recovery_value=parse_int(row["Recovery_Value"]),
            medical_examination=parse_bool(row["Medical_Examination"]),
            fingerprint_taken=parse_bool(row["Fingerprint_Taken"]),
            dna_sample=parse_bool(row["DNA_Sample"]),
            photograph_taken=parse_bool(row["Photograph_Taken"]),
        )

    def get_by_fir_id(self, fir_id: str) -> List[ArrestRecord]:
        return list(self._by_fir.get(fir_id, []))

    def list_by_station(self, station_id: str) -> List[ArrestRecord]:
        return list(self._by_station.get(station_id, []))

    def list_by_person(self, person_id: str) -> List[ArrestRecord]:
        return list(self._by_person.get(person_id, []))

    def list_all_arrests(self) -> List[ArrestRecord]:
        return list(self._all)
