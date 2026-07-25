"""Station Reference service.

Owns station list/detail retrieval with pagination and filtering.
Depends on repository Protocol types — not concrete implementations.

No FastAPI Request/Response objects.  No direct file access.  No
frontend-specific logic.
"""

from __future__ import annotations

from typing import Protocol, runtime_checkable

from app.core.exceptions import ResourceNotFoundError
from app.database.records import StationRecord


# ---------------------------------------------------------------------------
# Narrow reader Protocols (interface segregation)
# ---------------------------------------------------------------------------


@runtime_checkable
class StationListReader(Protocol):
    def list_all(self) -> list[StationRecord]: ...


@runtime_checkable
class StationDetailReader(Protocol):
    def get_by_id(self, station_id: str) -> StationRecord | None: ...


@runtime_checkable
class StationDistrictFilterReader(Protocol):
    def list_by_district(self, district_id: int) -> list[StationRecord]: ...


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------


class StationService:
    """Station reference data retrieval and filtering."""

    def __init__(
        self,
        station_list_reader: StationListReader,
        station_detail_reader: StationDetailReader,
        station_district_reader: StationDistrictFilterReader,
    ) -> None:
        self._list_reader = station_list_reader
        self._detail_reader = station_detail_reader
        self._district_reader = station_district_reader

    def list_stations(
        self,
        district_id: int | None = None,
        page: int = 1,
        page_size: int = 50,
    ) -> dict:
        """Return paginated station records with optional district filter.

        Parameters
        ----------
        district_id:
            If provided, restrict to stations in this district.
        page:
            1-indexed page number.
        page_size:
            Items per page (1..200).

        Returns
        -------
        dict
            ``{"stations": [...], "total_stations": N, "page": P, "page_size": S}``
        """
        if district_id is not None:
            all_stations = self._district_reader.list_by_district(district_id)
        else:
            all_stations = self._list_reader.list_all()

        total = len(all_stations)

        # Sort deterministically by station_id
        all_stations.sort(key=lambda s: s.station_id)

        start = (page - 1) * page_size
        end = start + page_size
        page_stations = all_stations[start:end]

        return {
            "stations": [self._to_dict(s) for s in page_stations],
            "total_stations": total,
            "total_pages": max(1, -(-total // page_size)),  # ceil division
            "page": page,
            "page_size": page_size,
        }

    def get_station_detail(self, station_id: str) -> dict:
        """Return detail for a single station.

        Raises
        ------
        ResourceNotFoundError
            If ``station_id`` does not match any known station.
        """
        station = self._detail_reader.get_by_id(station_id)
        if station is None:
            raise ResourceNotFoundError(
                f"Station not found: {station_id}"
            )
        return self._to_dict(station)

    @staticmethod
    def _to_dict(station: StationRecord) -> dict:
        """Convert a StationRecord to an API-ready dict."""
        return {
            "station_id": station.station_id,
            "station_name": station.station_name,
            "district_id": station.district_id,
            "district_name": station.district_name,
            "zone": station.zone,
            "station_type": station.station_type,
            "latitude": station.latitude,
            "longitude": station.longitude,
            "personnel_strength": station.personnel_strength,
            "patrol_vehicles": station.patrol_vehicles,
            "contact_number": station.contact_number,
            "email": station.email,
        }
