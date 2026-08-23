"""Dashboard aggregation service.

Owns all dashboard business logic.  Depends on repository Protocol types,
not concrete CSV implementations.

No FastAPI Request/Response objects.  No direct file access.  No
frontend-specific logic.
"""

from __future__ import annotations

from datetime import date
from typing import Protocol, runtime_checkable

from app.core.exceptions import InvalidFilterError
from app.database.records import ArrestRecord, ChargeSheetRecord, FIRRecord


@runtime_checkable
class FIRReader(Protocol):
    def list_all(self) -> list[FIRRecord]: ...


@runtime_checkable
class ArrestReader(Protocol):
    def list_all_arrests(self) -> list[ArrestRecord]: ...


@runtime_checkable
class ChargeSheetReader(Protocol):
    def list_all_chargesheets(self) -> list[ChargeSheetRecord]: ...


_ACTIVE_STATUSES = {"Under Investigation"}
_CLOSED_STATUSES = {"Closed"}
_CHARGESHEETED_STATUSES = {"Chargesheeted"}
_UNTRACED_STATUSES = {"Untraced"}


class DashboardService:
    """Computes aggregate dashboard metrics from repository data."""

    def __init__(
        self,
        fir_reader: FIRReader,
        arrest_reader: ArrestReader,
        chargesheet_reader: ChargeSheetReader,
    ) -> None:
        self._firs = fir_reader
        self._arrests = arrest_reader
        self._chargesheets = chargesheet_reader

    def get_summary(
        self,
        district: str | None = None,
        station_id: str | None = None,
        crime_head: str | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> dict[str, int]:
        """Return dashboard summary counts, optionally filtered.

        All filter parameters are optional.  When multiple filters are
        provided they are combined with AND semantics.

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

        firs = self._filter_firs(district, station_id, crime_head, start_date, end_date)
        fir_ids = {fir.fir_id for fir in firs}

        all_arrests = self._arrests.list_all_arrests()
        scoped_arrests = [a for a in all_arrests if a.fir_id in fir_ids]

        all_chargesheets = self._chargesheets.list_all_chargesheets()
        scoped_chargesheets = [cs for cs in all_chargesheets if cs.fir_id in fir_ids]

        active = sum(1 for f in firs if f.status in _ACTIVE_STATUSES)
        closed = sum(1 for f in firs if f.status in _CLOSED_STATUSES)
        chargesheeted = sum(1 for f in firs if f.status in _CHARGESHEETED_STATUSES)
        untraced = sum(1 for f in firs if f.status in _UNTRACED_STATUSES)

        return {
            "total_firs": len(firs),
            "active_cases": active,
            "closed_cases": closed,
            "chargesheeted_cases": chargesheeted,
            "untraced_cases": untraced,
            "total_arrests": len(scoped_arrests),
            "total_chargesheets": len(scoped_chargesheets),
        }

    # ------------------------------------------------------------------
    # Internal filtering
    # ------------------------------------------------------------------

    def _filter_firs(
        self,
        district: str | None,
        station_id: str | None,
        crime_head: str | None,
        start_date: date | None,
        end_date: date | None,
    ) -> list[FIRRecord]:
        """Return the subset of FIRs matching all provided filters."""
        firs = self._firs.list_all()

        if district is not None:
            firs = [f for f in firs if f.district == district]

        if station_id is not None:
            firs = [f for f in firs if f.station_id == station_id]

        if crime_head is not None:
            firs = [f for f in firs if f.crime_head == crime_head]

        if start_date is not None:
            firs = [f for f in firs if f.incident_date.date() >= start_date]

        if end_date is not None:
            firs = [f for f in firs if f.incident_date.date() <= end_date]

        return firs
