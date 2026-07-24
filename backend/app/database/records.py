"""Internal typed records for the crime analytics data layer.

Each record maps 1:1 to a row in the corresponding CSV file.  These are
**internal** representations used by repositories and services — they are
**not** API response schemas.  API schemas live in ``app/schemas/`` and
will be defined when the API layer is implemented (Phase 3+).

All fields match the CSV columns after type conversion.  Boolean fields
that appear as ``'Yes'``/``'No'`` in the CSV are stored as ``bool``.
The ``Accused_IDs`` field on :class:`FIRRecord` is a parsed list of
individual person IDs extracted from the comma-separated CSV column.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime


@dataclass(frozen=True, slots=True)
class DistrictRecord:
    district_id: int
    district_name: str
    police_range: str
    state: str
    population: int
    area_sq_km: int
    population_density: int
    literacy_rate: float
    urban_population_pct: int
    rural_population_pct: int
    police_stations: int
    latitude: float
    longitude: float


@dataclass(frozen=True, slots=True)
class StationRecord:
    station_id: str
    station_name: str
    district_id: int
    district_name: str
    zone: str
    station_type: str
    latitude: float
    longitude: float
    personnel_strength: int
    patrol_vehicles: int
    contact_number: str
    email: str


@dataclass(frozen=True, slots=True)
class PersonRecord:
    person_id: str
    full_name: str
    gender: str
    dob: date
    age: int
    occupation: str
    education: str
    marital_status: str
    blood_group: str
    nationality: str
    district: str
    station_id: str


@dataclass(frozen=True, slots=True)
class FIRRecord:
    fir_id: str
    fir_number: str
    station_id: str
    district: str
    incident_date: datetime
    fir_date: datetime
    crime_head: str
    crime_subhead: str
    bns_sections: str
    latitude: float
    longitude: float
    complainant_id: str
    victim_id: str
    accused_ids: tuple[str, ...] = ()
    investigating_officer: str = ""
    status: str = ""


@dataclass(frozen=True, slots=True)
class ArrestRecord:
    arrest_id: str
    fir_id: str
    person_id: str
    accused_name: str
    gender: str
    age: int
    district: str
    station_id: str
    arrest_date: datetime
    arrest_location: str
    arresting_officer: str
    custody_type: str
    bail_status: str
    recovery_item: str
    recovery_value: int
    medical_examination: bool = False
    fingerprint_taken: bool = False
    dna_sample: bool = False
    photograph_taken: bool = False


@dataclass(frozen=True, slots=True)
class ChargeSheetRecord:
    chargesheet_id: str
    fir_id: str
    accused_id: str
    crime_type: str
    sections: str
    investigating_officer: str
    court: str
    witness_count: int
    evidence_count: int
    chargesheet_date: date
    status: str
