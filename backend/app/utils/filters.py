"""Shared filter logic for Module 2 map services.

Provides a single ``filter_firs`` function used by both FieldMapService and
IntelligenceMapService so filter semantics never drift.
"""

from __future__ import annotations

from collections import Counter
from datetime import date
from typing import Optional

from app.core.exceptions import InvalidFilterError
from app.database.records import FIRRecord


def validate_date_range(
    start_date: Optional[date], end_date: Optional[date]
) -> None:
    """Raise ``InvalidFilterError`` if start_date > end_date."""
    if start_date is not None and end_date is not None:
        if start_date > end_date:
            raise InvalidFilterError(
                "start_date must not be after end_date"
            )


def filter_firs(
    firs: list[FIRRecord],
    district: Optional[str] = None,
    station_id: Optional[str] = None,
    crime_head: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> list[FIRRecord]:
    """Return the subset of FIRs matching all provided filters (AND semantics).

    Date filtering uses ``FIRRecord.incident_date`` and is inclusive on both
    boundaries.  Call ``validate_date_range`` before this function to reject
    ``start_date > end_date``.
    """
    result = firs

    if district is not None:
        result = [f for f in result if f.district == district]

    if station_id is not None:
        result = [f for f in result if f.station_id == station_id]

    if crime_head is not None:
        result = [f for f in result if f.crime_head == crime_head]

    if status is not None:
        result = [f for f in result if f.status == status]

    if start_date is not None:
        result = [f for f in result if f.incident_date.date() >= start_date]

    if end_date is not None:
        result = [f for f in result if f.incident_date.date() <= end_date]

    return result


def dominant_crime_head(crime_counter: Counter) -> Optional[str]:
    """Return the dominant crime head from a Counter.

    Contract:
    1. Highest count wins.
    2. On equal counts, alphabetically ascending crime head wins.

    Returns ``None`` when the counter is empty.
    """
    if not crime_counter:
        return None
    return sorted(crime_counter.items(), key=lambda kv: (-kv[1], kv[0]))[0][0]
