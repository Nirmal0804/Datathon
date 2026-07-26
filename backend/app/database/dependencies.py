"""Centralized repository wiring for the crime analytics backend.

Supports two persistence backends selected via the DATA_BACKEND setting:

- **csv** (transitional): CSV files loaded once at startup, cached in memory.
- **postgres** (production): Supabase PostgreSQL with connection pooling.

The backend choice is made once at startup. There is no runtime fallback.
Services depend on repository protocols — they are unaware of the backend.
"""

from __future__ import annotations

import logging
from functools import lru_cache

from fastapi import Request

from app.core.config import settings
from app.database.repositories.protocols import (
    ArrestRepository,
    ChargeSheetRepository,
    DistrictRepository,
    FIRRepository,
    PersonRepository,
    StationRepository,
)

logger = logging.getLogger(__name__)


class RepositoryCollection:
    """Immutable container for all six repository instances.

    Typed to protocol interfaces so services remain backend-agnostic.
    """

    def __init__(
        self,
        districts: DistrictRepository,
        stations: StationRepository,
        people: PersonRepository,
        firs: FIRRepository,
        arrests: ArrestRepository,
        chargesheets: ChargeSheetRepository,
    ) -> None:
        self.districts = districts
        self.stations = stations
        self.people = people
        self.firs = firs
        self.arrests = arrests
        self.chargesheets = chargesheets


def _build_csv_repositories() -> RepositoryCollection:
    """Build in-memory CSV repository collection."""
    from app.database.csv_loader import load_all
    from app.database.repositories.csv.arrest_repo import CSVArrestRepository
    from app.database.repositories.csv.chargesheet_repo import CSVChargeSheetRepository
    from app.database.repositories.csv.district_repo import CSVDistrictRepository
    from app.database.repositories.csv.fir_repo import CSVFIRRepository
    from app.database.repositories.csv.person_repo import CSVPersonRepository
    from app.database.repositories.csv.station_repo import CSVStationRepository

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


def _build_postgres_repositories() -> RepositoryCollection:
    """Build PostgreSQL repository collection. Initializes connection pool."""
    from app.database.postgres import init_pool
    from app.database.postgres.arrest_repo import PostgresArrestRepository
    from app.database.postgres.chargesheet_repo import PostgresChargeSheetRepository
    from app.database.postgres.district_repo import PostgresDistrictRepository
    from app.database.postgres.fir_repo import PostgresFIRRepository
    from app.database.postgres.person_repo import PostgresPersonRepository
    from app.database.postgres.station_repo import PostgresStationRepository

    if not settings.DATABASE_URL:
        raise RuntimeError(
            "DATABASE_URL must be set when DATA_BACKEND='postgres'"
        )

    init_pool(
        dsn=settings.DATABASE_URL,
        minconn=settings.DATABASE_POOL_MIN,
        maxconn=settings.DATABASE_POOL_MAX,
    )

    return RepositoryCollection(
        districts=PostgresDistrictRepository(),
        stations=PostgresStationRepository(),
        people=PostgresPersonRepository(),
        firs=PostgresFIRRepository(),
        arrests=PostgresArrestRepository(),
        chargesheets=PostgresChargeSheetRepository(),
    )


@lru_cache(maxsize=1)
def _load_repositories() -> RepositoryCollection:
    """Load repositories once per application lifecycle.

    The backend is selected at startup via DATA_BACKEND.
    No fallback exists — the configured backend must be functional.
    """
    backend = settings.DATA_BACKEND.lower()

    if backend == "postgres":
        logger.info("Initializing PostgreSQL persistence backend")
        return _build_postgres_repositories()

    if backend == "csv":
        logger.info("Initializing CSV (transitional) persistence backend")
        return _build_csv_repositories()

    raise RuntimeError(
        f"Unknown DATA_BACKEND='{backend}'. Supported: 'csv', 'postgres'."
    )


def get_repositories(request: Request) -> RepositoryCollection:
    """FastAPI dependency that returns the shared repository collection.

    Repositories are loaded once on first access and reused for all
    subsequent requests.
    """
    return _load_repositories()
