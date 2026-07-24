"""Centralized repository wiring for the crime analytics backend.

CSV files are loaded once at application startup and cached in ``app.state``.
Each incoming request receives repository instances from this cache — CSV
files are never re-read per request.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from fastapi import Request

from app.core.config import settings
from app.database.csv_loader import load_all
from app.database.records import (
    ArrestRecord,
    ChargeSheetRecord,
    FIRRecord,
)
from app.database.repositories.csv.arrest_repo import CSVArrestRepository
from app.database.repositories.csv.chargesheet_repo import CSVChargeSheetRepository
from app.database.repositories.csv.district_repo import CSVDistrictRepository
from app.database.repositories.csv.fir_repo import CSVFIRRepository
from app.database.repositories.csv.person_repo import CSVPersonRepository
from app.database.repositories.csv.station_repo import CSVStationRepository


class RepositoryCollection:
    """Immutable container for all six repository instances."""

    def __init__(
        self,
        districts: CSVDistrictRepository,
        stations: CSVStationRepository,
        people: CSVPersonRepository,
        firs: CSVFIRRepository,
        arrests: CSVArrestRepository,
        chargesheets: CSVChargeSheetRepository,
    ) -> None:
        self.districts = districts
        self.stations = stations
        self.people = people
        self.firs = firs
        self.arrests = arrests
        self.chargesheets = chargesheets


@lru_cache(maxsize=1)
def _load_repositories() -> RepositoryCollection:
    """Load all CSV data and build repository instances once.

    Cached via ``lru_cache`` so the CSV files are read exactly once across
    the entire application lifecycle, regardless of how many requests are
    served.
    """
    data = load_all(settings.DATA_DIR)

    firs = CSVFIRRepository(data["firs"])
    fir_station_map = {fir.fir_id: fir.station_id for fir in firs.list_all()}

    return RepositoryCollection(
        districts=CSVDistrictRepository(data["districts"]),
        stations=CSVStationRepository(data["stations"]),
        people=CSVPersonRepository(data["people"]),
        firs=firs,
        arrests=CSVArrestRepository(data["arrests"]),
        chargesheets=CSVChargeSheetRepository(
            data["chargesheets"], fir_station_map
        ),
    )


def get_repositories(request: Request) -> RepositoryCollection:
    """FastAPI dependency that returns the shared repository collection.

    Repositories are loaded once on first access and reused for all
    subsequent requests.
    """
    return _load_repositories()
