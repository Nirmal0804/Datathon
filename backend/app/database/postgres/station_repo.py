from __future__ import annotations

import logging
from typing import Optional

from app.database.postgres import execute_one, execute_query
from app.database.records import StationRecord

logger = logging.getLogger(__name__)


class PostgresStationRepository:
    """PostgreSQL implementation of police station data access."""

    def list_all(self) -> list[StationRecord]:
        rows = execute_query(
            "SELECT station_id, station_name, district_id, district_name, "
            "zone, station_type, latitude, longitude, "
            "personnel_strength, patrol_vehicles, contact_number, email "
            "FROM police_stations ORDER BY station_id"
        )
        return [self._to_record(r) for r in rows]

    def get_by_id(self, station_id: str) -> Optional[StationRecord]:
        row = execute_one(
            "SELECT station_id, station_name, district_id, district_name, "
            "zone, station_type, latitude, longitude, "
            "personnel_strength, patrol_vehicles, contact_number, email "
            "FROM police_stations WHERE station_id = %s",
            (station_id,),
        )
        return self._to_record(row) if row else None

    def list_by_district(self, district_id: int) -> list[StationRecord]:
        rows = execute_query(
            "SELECT station_id, station_name, district_id, district_name, "
            "zone, station_type, latitude, longitude, "
            "personnel_strength, patrol_vehicles, contact_number, email "
            "FROM police_stations WHERE district_id = %s ORDER BY station_id",
            (district_id,),
        )
        return [self._to_record(r) for r in rows]

    def get_by_name(self, station_name: str) -> Optional[StationRecord]:
        row = execute_one(
            "SELECT station_id, station_name, district_id, district_name, "
            "zone, station_type, latitude, longitude, "
            "personnel_strength, patrol_vehicles, contact_number, email "
            "FROM police_stations WHERE station_name = %s LIMIT 1",
            (station_name,),
        )
        return self._to_record(row) if row else None

    def list_by_district_and_type(
        self, district_id: int, station_type: str
    ) -> list[StationRecord]:
        rows = execute_query(
            "SELECT station_id, station_name, district_id, district_name, "
            "zone, station_type, latitude, longitude, "
            "personnel_strength, patrol_vehicles, contact_number, email "
            "FROM police_stations WHERE district_id = %s AND station_type = %s "
            "ORDER BY station_id",
            (district_id, station_type),
        )
        return [self._to_record(r) for r in rows]

    @staticmethod
    def _to_record(row: dict) -> StationRecord:
        return StationRecord(
            station_id=row["station_id"],
            station_name=row["station_name"],
            district_id=row["district_id"],
            district_name=row["district_name"],
            zone=row["zone"],
            station_type=row["station_type"],
            latitude=row["latitude"],
            longitude=row["longitude"],
            personnel_strength=row["personnel_strength"],
            patrol_vehicles=row["patrol_vehicles"],
            contact_number=row["contact_number"],
            email=row["email"],
        )
