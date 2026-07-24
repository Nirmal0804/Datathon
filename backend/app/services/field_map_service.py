"""Field Officer Crime Map service.

Owns all field map business logic: filtering, search, station-name
resolution, pagination, and filter metadata.  Depends on repository
Protocol types — not concrete CSV implementations.

No FastAPI Request/Response objects.  No direct file access.  No
frontend-specific logic.
"""

from __future__ import annotations

import math
from datetime import date
from typing import List, Optional, Protocol, runtime_checkable

from app.core.exceptions import InvalidFilterError, ResourceNotFoundError
from app.database.records import FIRRecord, StationRecord


# ---------------------------------------------------------------------------
# Narrow reader Protocols (interface segregation)
# ---------------------------------------------------------------------------


@runtime_checkable
class FIRReader(Protocol):
    def list_all(self) -> list[FIRRecord]: ...

    def get_by_id(self, fir_id: str) -> FIRRecord | None: ...


@runtime_checkable
class FIRNumberReader(Protocol):
    def get_by_number(self, fir_number: str) -> FIRRecord | None: ...


@runtime_checkable
class StationNameReader(Protocol):
    def get_by_id(self, station_id: str) -> StationRecord | None: ...


@runtime_checkable
class DistrictListReader(Protocol):
    def list_all(self) -> list: ...


@runtime_checkable
class StationListReader(Protocol):
    def list_all(self) -> list: ...


# ---------------------------------------------------------------------------
# Search fields — case-insensitive non-PII operational fields
# ---------------------------------------------------------------------------

_SEARCH_FIELDS = ("fir_id", "fir_number", "crime_head", "crime_subhead")


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------


class FieldMapService:
    """Operational crime map data for Field Officers."""

    def __init__(
        self,
        fir_reader: FIRReader,
        fir_number_reader: FIRNumberReader,
        station_reader: StationNameReader,
        district_reader: DistrictListReader,
        station_list_reader: StationListReader,
    ) -> None:
        self._firs = fir_reader
        self._fir_number_reader = fir_number_reader
        self._stations = station_reader
        self._districts = district_reader
        self._station_list = station_list_reader

    # ------------------------------------------------------------------
    # Case list
    # ------------------------------------------------------------------

    def get_cases(
        self,
        district: str | None = None,
        station_id: str | None = None,
        crime_head: str | None = None,
        status: str | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
        search: str | None = None,
        page: int = 1,
        page_size: int = 50,
    ) -> dict:
        """Return paginated, filtered case list with station names resolved.

        Raises
        ------
        InvalidFilterError
            If ``start_date`` is after ``end_date``.
        """
        if start_date is not None and end_date is not None:
            if start_date > end_date:
                raise InvalidFilterError(
                    "start_date must not be after end_date"
                )

        firs = self._filter_firs(district, station_id, crime_head, status,
                                 start_date, end_date, search)

        total = len(firs)
        total_pages = max(1, math.ceil(total / page_size))
        start = (page - 1) * page_size
        end = start + page_size
        page_firs = firs[start:end]

        items = [self._fir_to_summary(fir) for fir in page_firs]

        return {
            "items": items,
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": total_pages,
        }

    # ------------------------------------------------------------------
    # Case detail
    # ------------------------------------------------------------------

    def get_case_detail(self, fir_identifier: str) -> dict:
        """Return detailed FIR record by FIR_ID or FIR_Number.

        Tries FIR_ID first, then FIR_Number.  Raises ResourceNotFoundError
        if neither matches.
        """
        fir = self._firs.get_by_id(fir_identifier)
        if fir is None:
            fir = self._fir_number_reader.get_by_number(fir_identifier)
        if fir is None:
            raise ResourceNotFoundError(
                f"FIR not found: {fir_identifier}"
            )

        return self._fir_to_detail(fir)

    # ------------------------------------------------------------------
    # Filter metadata
    # ------------------------------------------------------------------

    def get_filters(self) -> dict:
        """Return distinct filter values derived from repository data."""
        districts = sorted(
            {d.district_name for d in self._districts.list_all()}
        )
        stations = sorted(
            [
                {"station_id": s.station_id, "station_name": s.station_name}
                for s in self._station_list.list_all()
            ],
            key=lambda s: s["station_id"],
        )
        crime_heads = sorted({f.crime_head for f in self._firs.list_all()})
        statuses = sorted({f.status for f in self._firs.list_all()})

        return {
            "districts": [{"district_name": d} for d in districts],
            "stations": stations,
            "crime_heads": crime_heads,
            "statuses": statuses,
        }

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _filter_firs(
        self,
        district: str | None,
        station_id: str | None,
        crime_head: str | None,
        status: str | None,
        start_date: date | None,
        end_date: date | None,
        search: str | None,
    ) -> list[FIRRecord]:
        """Return the subset of FIRs matching all provided filters."""
        firs = self._firs.list_all()

        if district is not None:
            firs = [f for f in firs if f.district == district]

        if station_id is not None:
            firs = [f for f in firs if f.station_id == station_id]

        if crime_head is not None:
            firs = [f for f in firs if f.crime_head == crime_head]

        if status is not None:
            firs = [f for f in firs if f.status == status]

        if start_date is not None:
            firs = [f for f in firs if f.incident_date.date() >= start_date]

        if end_date is not None:
            firs = [f for f in firs if f.incident_date.date() <= end_date]

        if search is not None:
            term = search.lower().strip()
            if term:
                firs = [
                    f for f in firs
                    if any(
                        term in getattr(f, field).lower()
                        for field in _SEARCH_FIELDS
                    )
                ]

        return firs

    def _resolve_station_name(self, station_id: str) -> str:
        """Look up the station name from the station repository."""
        station = self._stations.get_by_id(station_id)
        return station.station_name if station else station_id

    def _fir_to_summary(self, fir: FIRRecord) -> dict:
        """Map a FIRRecord to a FieldMapCaseSummary dict."""
        return {
            "fir_id": fir.fir_id,
            "fir_number": fir.fir_number,
            "crime_head": fir.crime_head,
            "crime_subhead": fir.crime_subhead,
            "status": fir.status,
            "district": fir.district,
            "station_id": fir.station_id,
            "station_name": self._resolve_station_name(fir.station_id),
            "latitude": fir.latitude,
            "longitude": fir.longitude,
            "incident_date": fir.incident_date,
            "investigating_officer": fir.investigating_officer,
        }

    def _fir_to_detail(self, fir: FIRRecord) -> dict:
        """Map a FIRRecord to a FieldMapCaseDetail dict."""
        return {
            "fir_id": fir.fir_id,
            "fir_number": fir.fir_number,
            "crime_head": fir.crime_head,
            "crime_subhead": fir.crime_subhead,
            "bns_sections": fir.bns_sections,
            "status": fir.status,
            "district": fir.district,
            "station_id": fir.station_id,
            "station_name": self._resolve_station_name(fir.station_id),
            "latitude": fir.latitude,
            "longitude": fir.longitude,
            "incident_date": fir.incident_date,
            "fir_date": fir.fir_date,
            "investigating_officer": fir.investigating_officer,
        }
