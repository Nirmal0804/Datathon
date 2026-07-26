"""District Intelligence service.

Owns all district-level aggregation logic: list endpoint and per-district
intelligence profile.  Depends on repository Protocol types — not concrete
CSV implementations.

No FastAPI Request/Response objects.  No direct file access.  No
frontend-specific logic.
"""

from __future__ import annotations

from collections import Counter, defaultdict
from datetime import date
from typing import Protocol, runtime_checkable

from app.core.exceptions import InvalidFilterError, ResourceNotFoundError
from app.database.records import ArrestRecord, ChargeSheetRecord, DistrictRecord, FIRRecord
from app.services.field_map_service import compute_hotspots
from app.utils.filters import dominant_crime_head, filter_firs, validate_date_range


# ---------------------------------------------------------------------------
# Narrow reader Protocols (interface segregation)
# ---------------------------------------------------------------------------


@runtime_checkable
class DistrictListReader(Protocol):
    def list_all(self) -> list[DistrictRecord]: ...

    def get_by_id(self, district_id: int) -> DistrictRecord | None: ...


@runtime_checkable
class FIRListReader(Protocol):
    def list_all(self) -> list[FIRRecord]: ...


@runtime_checkable
class ArrestListReader(Protocol):
    def list_all_arrests(self) -> list[ArrestRecord]: ...


@runtime_checkable
class ChargeSheetListReader(Protocol):
    def list_all_chargesheets(self) -> list[ChargeSheetRecord]: ...


# ---------------------------------------------------------------------------
# Status constants
# ---------------------------------------------------------------------------

_ACTIVE_STATUSES = {"Under Investigation"}
_CLOSED_STATUSES = {"Closed"}
_CHARGESHEETED_STATUSES = {"Chargesheeted"}
_UNTRACED_STATUSES = {"Untraced"}


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------


class DistrictService:
    """District-level aggregation and intelligence profile."""

    def __init__(
        self,
        district_reader: DistrictListReader,
        fir_reader: FIRListReader,
        arrest_reader: ArrestListReader,
        chargesheet_reader: ChargeSheetListReader,
    ) -> None:
        self._districts = district_reader
        self._firs = fir_reader
        self._arrests = arrest_reader
        self._chargesheets = chargesheet_reader

    # ------------------------------------------------------------------
    # List all districts
    # ------------------------------------------------------------------

    def list_all_districts(self) -> dict:
        """Return every district with aggregate transactional statistics."""
        all_districts = self._districts.list_all()
        all_firs = self._firs.list_all()
        all_arrests = self._arrests.list_all_arrests()
        all_chargesheets = self._chargesheets.list_all_chargesheets()

        # Pre-group FIRs by district name for efficient lookup
        firs_by_district: dict[str, list[FIRRecord]] = defaultdict(list)
        for fir in all_firs:
            firs_by_district[fir.district].append(fir)

        # Pre-group arrests by FIR_ID for scoping
        arrests_by_fir: dict[str, list[ArrestRecord]] = defaultdict(list)
        for arrest in all_arrests:
            arrests_by_fir[arrest.fir_id].append(arrest)

        # Pre-group chargesheets by FIR_ID for scoping
        chargesheets_by_fir: dict[str, list[ChargeSheetRecord]] = defaultdict(list)
        for cs in all_chargesheets:
            chargesheets_by_fir[cs.fir_id].append(cs)

        items = []
        for district in all_districts:
            district_firs = firs_by_district.get(district.district_name, [])
            fir_ids = {f.fir_id for f in district_firs}
            scoped_arrests = [
                a for a_list in (arrests_by_fir[fid] for fid in fir_ids if fid in arrests_by_fir)
                for a in a_list
            ]
            scoped_chargesheets = [
                cs for cs_list in (chargesheets_by_fir[fid] for fid in fir_ids if fid in chargesheets_by_fir)
                for cs in cs_list
            ]
            items.append(self._build_district_stats(district, district_firs, scoped_arrests, scoped_chargesheets))

        # Sort by district_id for deterministic ordering
        items.sort(key=lambda d: d["district_id"])

        return {"districts": items, "total_districts": len(items)}

    # ------------------------------------------------------------------
    # District intelligence profile
    # ------------------------------------------------------------------

    def get_district_intelligence(
        self,
        district_id: int,
        start_date: date | None = None,
        end_date: date | None = None,
        crime_head: str | None = None,
        status: str | None = None,
    ) -> dict:
        """Return intelligence profile for a single district.

        Raises
        ------
        ResourceNotFoundError
            If ``district_id`` does not match any known district.
        InvalidFilterError
            If ``start_date`` is after ``end_date``.
        """
        validate_date_range(start_date, end_date)

        district = self._districts.get_by_id(district_id)
        if district is None:
            raise ResourceNotFoundError(
                f"District not found: {district_id}"
            )

        # Filter FIRs belonging to this district with active filters
        all_firs = self._firs.list_all()
        district_firs = [
            f for f in all_firs if f.district == district.district_name
        ]
        filtered_firs = filter_firs(
            district_firs,
            start_date=start_date,
            end_date=end_date,
            crime_head=crime_head,
            status=status,
        )

        # Build FIR_ID set for arrest/chargesheet scoping
        fir_ids = {fir.fir_id for fir in filtered_firs}

        all_arrests = self._arrests.list_all_arrests()
        scoped_arrests = [a for a in all_arrests if a.fir_id in fir_ids]

        all_chargesheets = self._chargesheets.list_all_chargesheets()
        scoped_chargesheets = [cs for cs in all_chargesheets if cs.fir_id in fir_ids]

        return self._build_district_stats(
            district, filtered_firs, scoped_arrests, scoped_chargesheets
        )

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _build_district_stats(
        self,
        district: DistrictRecord,
        firs: list[FIRRecord],
        scoped_arrests: list[ArrestRecord] | None = None,
        scoped_chargesheets: list[ChargeSheetRecord] | None = None,
    ) -> dict:
        """Build a district stats dict from reference data + filtered FIRs."""
        fir_count = len(firs)

        # Status counts
        active = sum(1 for f in firs if f.status in _ACTIVE_STATUSES)
        closed = sum(1 for f in firs if f.status in _CLOSED_STATUSES)
        chargesheeted = sum(1 for f in firs if f.status in _CHARGESHEETED_STATUSES)
        untraced = sum(1 for f in firs if f.status in _UNTRACED_STATUSES)

        # Arrest/chargesheet counts — use pre-scoped lists if provided,
        # otherwise count from FIR IDs
        if scoped_arrests is not None:
            arrest_count = len(scoped_arrests)
        else:
            arrest_count = 0
        if scoped_chargesheets is not None:
            chargesheet_count = len(scoped_chargesheets)
        else:
            chargesheet_count = 0

        # Derived crime metrics
        population = district.population
        area = district.area_sq_km
        crime_rate = (
            round(fir_count / population * 100_000, 2) if population > 0 else 0.0
        )
        fir_density = (
            round(fir_count / area, 4) if area > 0 else 0.0
        )

        # Dominant crime type
        crime_counter = Counter(f.crime_head for f in firs)
        dominant = dominant_crime_head(crime_counter)

        # Crime head breakdown (count desc, alphabetical tie-break)
        crime_head_breakdown = [
            {"crime_head": ch, "count": c}
            for ch, c in sorted(crime_counter.items(), key=lambda kv: (-kv[1], kv[0]))
        ]

        # Status breakdown (alphabetical order)
        status_counter = Counter(f.status for f in firs)
        status_breakdown = [
            {"status": s, "count": c}
            for s, c in sorted(status_counter.items())
        ]

        # Hotspot count from this district's FIRs
        hotspot_result = compute_hotspots(firs)
        hotspot_count = hotspot_result["total_hotspots"]

        return {
            "district_id": district.district_id,
            "district_name": district.district_name,
            "police_range": district.police_range,
            "population": district.population,
            "area_sq_km": district.area_sq_km,
            "population_density": district.population_density,
            "literacy_rate": district.literacy_rate,
            "urban_population_pct": district.urban_population_pct,
            "rural_population_pct": district.rural_population_pct,
            "police_stations": district.police_stations,
            "latitude": district.latitude,
            "longitude": district.longitude,
            "fir_count": fir_count,
            "active_cases": active,
            "closed_cases": closed,
            "chargesheeted_cases": chargesheeted,
            "untraced_cases": untraced,
            "total_arrests": arrest_count,
            "total_chargesheets": chargesheet_count,
            "crime_rate_per_100k": crime_rate,
            "fir_density_per_sq_km": fir_density,
            "dominant_crime_type": dominant,
            "crime_head_breakdown": crime_head_breakdown,
            "status_breakdown": status_breakdown,
            "hotspot_count": hotspot_count,
        }
