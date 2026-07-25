"""CSV-backed station repository."""

from __future__ import annotations

from typing import List, Optional

from app.database.csv_loader import parse_float, parse_int
from app.database.records import StationRecord


class CSVStationRepository:
    """Station repository backed by ``stations.csv``."""

    def __init__(self, rows: list[dict[str, str]]) -> None:
        self._rows = rows
        self._by_id: dict[str, StationRecord] = {}
        self._by_district: dict[int, list[StationRecord]] = {}
        self._build_indices()

    def _build_indices(self) -> None:
        for row in self._rows:
            record = self._row_to_record(row)
            self._by_id[record.station_id] = record
            self._by_district.setdefault(record.district_id, []).append(record)

    @staticmethod
    def _row_to_record(row: dict[str, str]) -> StationRecord:
        return StationRecord(
            station_id=row["Station_ID"],
            station_name=row["Station_Name"],
            district_id=parse_int(row["District_ID"]),
            district_name=row["District"],
            zone=row["Zone"],
            station_type=row["Station_Type"],
            latitude=parse_float(row["Latitude"]),
            longitude=parse_float(row["Longitude"]),
            personnel_strength=parse_int(row["Personnel_Strength"]),
            patrol_vehicles=parse_int(row["Patrol_Vehicles"]),
            contact_number=row["Contact_Number"],
            email=row["Email"],
        )

    def list_all(self) -> List[StationRecord]:
        return list(self._by_id.values())

    def get_by_id(self, station_id: str) -> Optional[StationRecord]:
        return self._by_id.get(station_id)

    def list_by_district(self, district_id: int) -> List[StationRecord]:
        return list(self._by_district.get(district_id, []))

    def get_by_name(self, station_name: str) -> Optional[StationRecord]:
        for record in self._by_id.values():
            if record.station_name == station_name:
                return record
        return None
