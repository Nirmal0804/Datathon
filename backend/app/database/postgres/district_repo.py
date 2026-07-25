from __future__ import annotations

import logging
from typing import Optional

from app.database.postgres import execute_one, execute_query
from app.database.records import DistrictRecord

logger = logging.getLogger(__name__)


class PostgresDistrictRepository:
    """PostgreSQL implementation of district data access."""

    def list_all(self) -> list[DistrictRecord]:
        rows = execute_query(
            "SELECT district_id, district_name, police_range, state, "
            "population, area_sq_km, population_density, literacy_rate, "
            "urban_population_pct, rural_population_pct, police_stations, "
            "latitude, longitude "
            "FROM districts ORDER BY district_id"
        )
        return [self._to_record(r) for r in rows]

    def get_by_id(self, district_id: int) -> Optional[DistrictRecord]:
        row = execute_one(
            "SELECT district_id, district_name, police_range, state, "
            "population, area_sq_km, population_density, literacy_rate, "
            "urban_population_pct, rural_population_pct, police_stations, "
            "latitude, longitude "
            "FROM districts WHERE district_id = %s",
            (district_id,),
        )
        return self._to_record(row) if row else None

    def get_by_name(self, district_name: str) -> Optional[DistrictRecord]:
        row = execute_one(
            "SELECT district_id, district_name, police_range, state, "
            "population, area_sq_km, population_density, literacy_rate, "
            "urban_population_pct, rural_population_pct, police_stations, "
            "latitude, longitude "
            "FROM districts WHERE district_name = %s",
            (district_name,),
        )
        return self._to_record(row) if row else None

    @staticmethod
    def _to_record(row: dict) -> DistrictRecord:
        return DistrictRecord(
            district_id=row["district_id"],
            district_name=row["district_name"],
            police_range=row["police_range"],
            state=row["state"],
            population=row["population"],
            area_sq_km=row["area_sq_km"],
            population_density=row["population_density"],
            literacy_rate=row["literacy_rate"],
            urban_population_pct=row["urban_population_pct"],
            rural_population_pct=row["rural_population_pct"],
            police_stations=row["police_stations"],
            latitude=row["latitude"],
            longitude=row["longitude"],
        )
