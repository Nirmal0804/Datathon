"""CSV-backed district repository."""

from __future__ import annotations

from typing import List, Optional

from app.database.csv_loader import parse_float, parse_int
from app.database.records import DistrictRecord


class CSVDistrictRepository:
    """District repository backed by ``districts.csv``."""

    def __init__(self, rows: list[dict[str, str]]) -> None:
        self._rows = rows
        self._by_id: dict[int, DistrictRecord] = {}
        self._by_name: dict[str, DistrictRecord] = {}
        self._build_indices()

    def _build_indices(self) -> None:
        for row in self._rows:
            record = self._row_to_record(row)
            self._by_id[record.district_id] = record
            self._by_name[record.district_name] = record

    @staticmethod
    def _row_to_record(row: dict[str, str]) -> DistrictRecord:
        return DistrictRecord(
            district_id=parse_int(row["District_ID"]),
            district_name=row["District"],
            police_range=row["Police_Range"],
            state=row["State"],
            population=parse_int(row["Population"]),
            area_sq_km=parse_int(row["Area_sq_km"]),
            population_density=parse_int(row["Population_Density"]),
            literacy_rate=parse_float(row["Literacy_Rate"]),
            urban_population_pct=parse_int(row["Urban_Population_%"]),
            rural_population_pct=parse_int(row["Rural_Population_%"]),
            police_stations=parse_int(row["Police_Stations"]),
            latitude=parse_float(row["Latitude"]),
            longitude=parse_float(row["Longitude"]),
        )

    def list_all(self) -> List[DistrictRecord]:
        return list(self._by_id.values())

    def get_by_id(self, district_id: int) -> Optional[DistrictRecord]:
        return self._by_id.get(district_id)

    def get_by_name(self, district_name: str) -> Optional[DistrictRecord]:
        return self._by_name.get(district_name)
