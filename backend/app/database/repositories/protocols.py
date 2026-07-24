"""Repository protocol interfaces for the crime analytics data layer.

Each protocol defines the query contract for one entity.  Implementations
may back these with CSV files (hackathon), SQLite/DuckDB (prototype), or
a production database — the service and API layers depend only on these
interfaces.

Protocols use :class:`typing.runtime_checkable` so that tests can verify
that a concrete class satisfies the interface with ``isinstance()``.
"""

from __future__ import annotations

from typing import List, Optional, Protocol, runtime_checkable

from app.database.records import (
    ArrestRecord,
    ChargeSheetRecord,
    DistrictRecord,
    FIRRecord,
    PersonRecord,
    StationRecord,
)


@runtime_checkable
class DistrictRepository(Protocol):
    def list_all(self) -> List[DistrictRecord]: ...

    def get_by_id(self, district_id: int) -> Optional[DistrictRecord]: ...

    def get_by_name(self, district_name: str) -> Optional[DistrictRecord]: ...


@runtime_checkable
class StationRepository(Protocol):
    def list_all(self) -> List[StationRecord]: ...

    def get_by_id(self, station_id: str) -> Optional[StationRecord]: ...

    def list_by_district(self, district_id: int) -> List[StationRecord]: ...


@runtime_checkable
class PersonRepository(Protocol):
    def get_by_id(self, person_id: str) -> Optional[PersonRecord]: ...

    def list_by_district(self, district: str) -> List[PersonRecord]: ...


@runtime_checkable
class FIRRepository(Protocol):
    def list_all(self) -> List[FIRRecord]: ...

    def get_by_id(self, fir_id: str) -> Optional[FIRRecord]: ...

    def get_by_number(self, fir_number: str) -> Optional[FIRRecord]: ...

    def list_by_station(self, station_id: str) -> List[FIRRecord]: ...

    def list_by_district(self, district: str) -> List[FIRRecord]: ...

    def list_by_status(self, status: str) -> List[FIRRecord]: ...


@runtime_checkable
class ArrestRepository(Protocol):
    def list_all_arrests(self) -> List[ArrestRecord]: ...

    def get_by_fir_id(self, fir_id: str) -> Optional[ArrestRecord]: ...

    def list_by_station(self, station_id: str) -> List[ArrestRecord]: ...

    def list_by_person(self, person_id: str) -> List[ArrestRecord]: ...


@runtime_checkable
class ChargeSheetRepository(Protocol):
    def list_all_chargesheets(self) -> List[ChargeSheetRecord]: ...

    def get_by_fir_id(self, fir_id: str) -> Optional[ChargeSheetRecord]: ...

    def list_by_station(self, station_id: str) -> List[ChargeSheetRecord]: ...
