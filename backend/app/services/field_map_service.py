"""Field Officer Crime Map service.

Owns all field map business logic: filtering, search, station-name
resolution, pagination, filter metadata, and hotspots.  Depends on
repository Protocol types — not concrete CSV implementations.

No FastAPI Request/Response objects.  No direct file access.  No
frontend-specific logic.
"""

from __future__ import annotations

import math
from collections import Counter
from datetime import date
from typing import List, Optional, Protocol, runtime_checkable

from app.core.exceptions import InvalidFilterError, ResourceNotFoundError
from app.database.records import FIRRecord, StationRecord
from app.utils.filters import dominant_crime_head, filter_firs, validate_date_range


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
# Hotspot grid constants
# ---------------------------------------------------------------------------

_GRID_SIZE = 0.01
_HOTSPOT_THRESHOLD = 3


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
        validate_date_range(start_date, end_date)

        firs = filter_firs(
            self._firs.list_all(),
            district=district,
            station_id=station_id,
            crime_head=crime_head,
            status=status,
            start_date=start_date,
            end_date=end_date,
        )

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
    # Hotspots
    # ------------------------------------------------------------------

    def get_hotspots(
        self,
        district: str | None = None,
        station_id: str | None = None,
        crime_head: str | None = None,
        status: str | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> dict:
        """Return grid-based hotspots for the filtered FIR scope.

        Uses the same shared hotspot definition as IntelligenceMapService.
        """
        validate_date_range(start_date, end_date)

        firs = filter_firs(
            self._firs.list_all(),
            district=district,
            station_id=station_id,
            crime_head=crime_head,
            status=status,
            start_date=start_date,
            end_date=end_date,
        )

        return compute_hotspots(firs)

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


# ---------------------------------------------------------------------------
# Shared hotspot computation (used by both Field and Intelligence services)
# ---------------------------------------------------------------------------


def _grid_key(lat: float, lon: float) -> tuple[float, float]:
    """Return deterministic grid-cell origin for the given coordinates."""
    return (
        math.floor(lat / _GRID_SIZE) * _GRID_SIZE,
        math.floor(lon / _GRID_SIZE) * _GRID_SIZE,
    )


def _hotspot_id(grid_lat: float, grid_lon: float) -> str:
    """Deterministic hotspot ID for a grid cell."""
    return f"HS-{grid_lat:.2f}-{grid_lon:.2f}"


def compute_hotspots(firs: list[FIRRecord]) -> dict:
    """Compute grid-based hotspots from a list of FIRs.

    Shared implementation used by both FieldMapService.get_hotspots and
    IntelligenceMapService.get_hotspots to ensure consistency.
    """
    if not firs:
        return {"hotspots": [], "total_hotspots": 0}

    cells: dict[tuple[float, float], list[FIRRecord]] = {}
    for fir in firs:
        key = _grid_key(fir.latitude, fir.longitude)
        cells.setdefault(key, []).append(fir)

    hotspots = []
    for (glat, glon), cell_firs in cells.items():
        if len(cell_firs) < _HOTSPOT_THRESHOLD:
            continue

        crime_counter = Counter(f.crime_head for f in cell_firs)
        dominant = dominant_crime_head(crime_counter)
        districts = sorted({f.district for f in cell_firs})
        center_lat = glat + _GRID_SIZE / 2
        center_lon = glon + _GRID_SIZE / 2

        hotspots.append({
            "hotspot_id": _hotspot_id(glat, glon),
            "center_latitude": round(center_lat, 6),
            "center_longitude": round(center_lon, 6),
            "fir_count": len(cell_firs),
            "dominant_crime_type": dominant,
            "districts": districts,
        })

    hotspots.sort(
        key=lambda h: (-h["fir_count"], h["center_latitude"],
                       h["center_longitude"])
    )

    return {"hotspots": hotspots, "total_hotspots": len(hotspots)}
