"""CSV-backed FIR repository."""

from __future__ import annotations

from typing import List, Optional

from app.database.csv_loader import parse_datetime, parse_float
from app.database.records import FIRRecord


class CSVFIRRepository:
    """FIR repository backed by ``firs.csv``."""

    def __init__(self, rows: list[dict[str, str]]) -> None:
        self._rows = rows
        self._by_id: dict[str, FIRRecord] = {}
        self._by_station: dict[str, list[FIRRecord]] = {}
        self._by_district: dict[str, list[FIRRecord]] = {}
        self._by_status: dict[str, list[FIRRecord]] = {}
        self._build_indices()

    def _build_indices(self) -> None:
        for row in self._rows:
            record = self._row_to_record(row)
            self._by_id[record.fir_id] = record
            self._by_station.setdefault(record.station_id, []).append(record)
            self._by_district.setdefault(record.district, []).append(record)
            self._by_status.setdefault(record.status, []).append(record)

    @staticmethod
    def _row_to_record(row: dict[str, str]) -> FIRRecord:
        accused_raw = row.get("Accused_ID", "")
        accused_ids = tuple(a.strip() for a in accused_raw.split(",") if a.strip())
        return FIRRecord(
            fir_id=row["FIR_ID"],
            fir_number=row["FIR_Number"],
            station_id=row["Station_ID"],
            district=row["District"],
            incident_date=parse_datetime(row["Incident_Date"]),
            fir_date=parse_datetime(row["FIR_Date"]),
            crime_head=row["Crime_Head"],
            crime_subhead=row["Crime_Subhead"],
            bns_sections=row["BNS_Sections"],
            latitude=parse_float(row["Latitude"]),
            longitude=parse_float(row["Longitude"]),
            complainant_id=row["Complainant_ID"],
            victim_id=row["Victim_ID"],
            accused_ids=accused_ids,
            investigating_officer=row["Investigating_Officer"],
            status=row["Status"],
        )

    def list_all(self) -> List[FIRRecord]:
        return list(self._by_id.values())

    def get_by_id(self, fir_id: str) -> Optional[FIRRecord]:
        return self._by_id.get(fir_id)

    def list_by_station(self, station_id: str) -> List[FIRRecord]:
        return list(self._by_station.get(station_id, []))

    def list_by_district(self, district: str) -> List[FIRRecord]:
        return list(self._by_district.get(district, []))

    def list_by_status(self, status: str) -> List[FIRRecord]:
        return list(self._by_status.get(status, []))
