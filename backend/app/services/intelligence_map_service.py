"""Intelligence Analyst Crime Map service.

Owns all intelligence analytics: hotspot detection, heatmap aggregation,
station clustering, district comparison, timeline, and CSV export.
Depends on repository Protocol types — not concrete CSV implementations.

No FastAPI Request/Response objects.  No direct file access.  No
frontend-specific logic.
"""

from __future__ import annotations

import csv
import io
import math
from collections import Counter, defaultdict
from datetime import date
from typing import List, Optional, Protocol, runtime_checkable

from app.core.exceptions import ExportLimitExceededError, InvalidFilterError
from app.database.records import (
    DistrictRecord,
    FIRRecord,
    StationRecord,
)
from app.services.field_map_service import compute_hotspots
from app.utils.filters import dominant_crime_head, filter_firs, validate_date_range


# ---------------------------------------------------------------------------
# Narrow reader Protocols (interface segregation)
# ---------------------------------------------------------------------------


@runtime_checkable
class FIRListReader(Protocol):
    def list_all(self) -> list[FIRRecord]: ...


@runtime_checkable
class DistrictListReader(Protocol):
    def list_all(self) -> list[DistrictRecord]: ...


@runtime_checkable
class StationListReader(Protocol):
    def list_all(self) -> list[StationRecord]: ...


@runtime_checkable
class StationLookupReader(Protocol):
    def get_by_id(self, station_id: str) -> StationRecord | None: ...


# ---------------------------------------------------------------------------
# Export CSV columns (non-person operational fields only)
# ---------------------------------------------------------------------------

_EXPORT_FIELD_NAMES = [
    "FIR_ID",
    "FIR_Number",
    "Crime_Head",
    "Crime_Subhead",
    "Status",
    "District",
    "Station_ID",
    "Latitude",
    "Longitude",
    "Incident_Date",
    "Investigating_Officer",
]

# Formula-injection characters
_CSV_INJECTION_PREFIXES = ("=", "+", "-", "@")

_GRID_SIZE = 0.01


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------


class IntelligenceMapService:
    """Intelligence Analyst Crime Map analytics and data endpoints."""

    def __init__(
        self,
        fir_reader: FIRListReader,
        district_reader: DistrictListReader,
        station_reader: StationListReader,
        station_lookup: StationLookupReader,
    ) -> None:
        self._firs = fir_reader
        self._districts = district_reader
        self._stations = station_reader
        self._station_lookup = station_lookup

    def _get_filtered_firs(
        self,
        district: str | None = None,
        station_id: str | None = None,
        crime_head: str | None = None,
        status: str | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> list[FIRRecord]:
        """Apply shared filters and date validation."""
        validate_date_range(start_date, end_date)
        return filter_firs(
            self._firs.list_all(),
            district=district,
            station_id=station_id,
            crime_head=crime_head,
            status=status,
            start_date=start_date,
            end_date=end_date,
        )

    # ------------------------------------------------------------------
    # Analytics KPIs
    # ------------------------------------------------------------------

    def get_analytics(
        self,
        district: str | None = None,
        station_id: str | None = None,
        crime_head: str | None = None,
        status: str | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> dict:
        """Return typed KPIs derived from filtered data."""
        firs = self._get_filtered_firs(
            district, station_id, crime_head, status, start_date, end_date
        )

        total_crimes = len(firs)

        # Dominant crime type
        dominant_crime_type = None
        if firs:
            crime_counter = Counter(f.crime_head for f in firs)
            dominant_crime_type = dominant_crime_head(crime_counter)

        # Hotspot count (reuse shared implementation)
        hotspot_result = compute_hotspots(firs)
        hotspot_count = hotspot_result["total_hotspots"]

        # Density index: total FIRs / sum of area_sq_km for represented districts
        density_index = self._compute_density_index(firs)

        return {
            "total_crimes": total_crimes,
            "hotspot_count": hotspot_count,
            "density_index": density_index,
            "dominant_crime_type": dominant_crime_type,
        }

    def _compute_density_index(self, firs: list[FIRRecord]) -> float:
        """FIR count / total area (sq km) of districts represented by FIRs."""
        if not firs:
            return 0.0

        district_names = {f.district for f in firs}
        total_area = 0
        for d in self._districts.list_all():
            if d.district_name in district_names:
                total_area += d.area_sq_km

        if total_area == 0:
            return 0.0

        return len(firs) / total_area

    # ------------------------------------------------------------------
    # Heatmap
    # ------------------------------------------------------------------

    def get_heatmap(
        self,
        district: str | None = None,
        station_id: str | None = None,
        crime_head: str | None = None,
        status: str | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> dict:
        """Return grid-aggregated heatmap data."""
        firs = self._get_filtered_firs(
            district, station_id, crime_head, status, start_date, end_date
        )

        cells: dict[tuple[float, float], int] = Counter()
        for fir in firs:
            key = (
                math.floor(fir.latitude / _GRID_SIZE) * _GRID_SIZE,
                math.floor(fir.longitude / _GRID_SIZE) * _GRID_SIZE,
            )
            cells[key] += 1

        points = []
        for (glat, glon), weight in cells.items():
            points.append({
                "latitude": round(glat + _GRID_SIZE / 2, 6),
                "longitude": round(glon + _GRID_SIZE / 2, 6),
                "weight": weight,
            })

        points.sort(key=lambda p: (-p["weight"], p["latitude"], p["longitude"]))

        return {"points": points, "total_points": len(points)}

    # ------------------------------------------------------------------
    # Clusters (station-based)
    # ------------------------------------------------------------------

    def get_clusters(
        self,
        district: str | None = None,
        station_id: str | None = None,
        crime_head: str | None = None,
        status: str | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> dict:
        """Return station-based deterministic clusters."""
        firs = self._get_filtered_firs(
            district, station_id, crime_head, status, start_date, end_date
        )

        station_firs: dict[str, list[FIRRecord]] = defaultdict(list)
        for fir in firs:
            station_firs[fir.station_id].append(fir)

        # Build station lookup for coordinates and names
        station_map: dict[str, StationRecord] = {}
        for s in self._stations.list_all():
            station_map[s.station_id] = s

        clusters = []
        for sid, sfirs in station_firs.items():
            station = station_map.get(sid)
            if station is None:
                continue

            crime_counter = Counter(f.crime_head for f in sfirs)
            dominant = dominant_crime_head(crime_counter) if sfirs else None

            status_counter = Counter(f.status for f in sfirs)
            status_breakdown = [
                {"status": s, "count": c}
                for s, c in sorted(status_counter.items())
            ]

            clusters.append({
                "station_id": sid,
                "station_name": station.station_name,
                "latitude": station.latitude,
                "longitude": station.longitude,
                "fir_count": len(sfirs),
                "dominant_crime_type": dominant,
                "status_breakdown": status_breakdown,
            })

        clusters.sort(key=lambda c: (-c["fir_count"], c["station_id"]))

        return {"clusters": clusters, "total_clusters": len(clusters)}

    # ------------------------------------------------------------------
    # Hotspots (reuses shared implementation)
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
        """Return grid-based hotspots (shared with FieldMapService)."""
        firs = self._get_filtered_firs(
            district, station_id, crime_head, status, start_date, end_date
        )
        return compute_hotspots(firs)

    # ------------------------------------------------------------------
    # District comparison
    # ------------------------------------------------------------------

    def get_district_comparison(
        self,
        district: str | None = None,
        station_id: str | None = None,
        crime_head: str | None = None,
        status: str | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> dict:
        """Return per-district comparison metrics."""
        firs = self._get_filtered_firs(
            district, station_id, crime_head, status, start_date, end_date
        )

        if not firs:
            return {"districts": [], "total_districts": 0}

        # Group FIRs by district
        district_firs: dict[str, list[FIRRecord]] = defaultdict(list)
        for fir in firs:
            district_firs[fir.district].append(fir)

        # Build district metadata lookup
        district_meta: dict[str, DistrictRecord] = {}
        for d in self._districts.list_all():
            district_meta[d.district_name] = d

        rows = []
        for dname, dfirs in district_firs.items():
            meta = district_meta.get(dname)
            population = meta.population if meta else 0
            area = meta.area_sq_km if meta else 0
            fir_count = len(dfirs)

            crime_rate = (fir_count / population * 100_000) if population else 0.0
            density = (fir_count / area) if area else 0.0

            crime_counter = Counter(f.crime_head for f in dfirs)
            dominant = dominant_crime_head(crime_counter)

            status_counter = Counter(f.status for f in dfirs)
            status_breakdown = [
                {"status": s, "count": c}
                for s, c in sorted(status_counter.items())
            ]

            rows.append({
                "district": dname,
                "fir_count": fir_count,
                "population": population,
                "area_sq_km": area,
                "crime_rate_per_100k": round(crime_rate, 2),
                "density_per_sq_km": round(density, 4),
                "dominant_crime_type": dominant,
                "status_breakdown": status_breakdown,
            })

        rows.sort(key=lambda r: (-r["fir_count"], r["district"]))

        return {"districts": rows, "total_districts": len(rows)}

    # ------------------------------------------------------------------
    # Timeline
    # ------------------------------------------------------------------

    def get_timeline(
        self,
        district: str | None = None,
        station_id: str | None = None,
        crime_head: str | None = None,
        status: str | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
        granularity: str = "monthly",
    ) -> dict:
        """Return chronological FIR timeline buckets."""
        if granularity not in ("daily", "monthly"):
            raise InvalidFilterError(
                f"Invalid granularity: {granularity}. "
                "Must be 'daily' or 'monthly'."
            )

        firs = self._get_filtered_firs(
            district, station_id, crime_head, status, start_date, end_date
        )

        # Group by period
        period_firs: dict[str, list[FIRRecord]] = defaultdict(list)
        for fir in firs:
            if granularity == "daily":
                key = fir.incident_date.strftime("%Y-%m-%d")
            else:
                key = fir.incident_date.strftime("%Y-%m")
            period_firs[key].append(fir)

        buckets = []
        for period in sorted(period_firs.keys()):
            pfirs = period_firs[period]
            crime_counter = Counter(f.crime_head for f in pfirs)
            breakdown = [
                {"crime_head": ch, "count": c}
                for ch, c in sorted(crime_counter.items(), key=lambda kv: (-kv[1], kv[0]))
            ]
            buckets.append({
                "period": period,
                "fir_count": len(pfirs),
                "crime_head_breakdown": breakdown,
            })

        return {
            "buckets": buckets,
            "total_buckets": len(buckets),
            "granularity": granularity,
        }

    # ------------------------------------------------------------------
    # Export (CSV)
    # ------------------------------------------------------------------

    def get_export(
        self,
        district: str | None = None,
        station_id: str | None = None,
        crime_head: str | None = None,
        status: str | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
        max_rows: int | None = None,
    ) -> str:
        """Return filtered FIR scope as CSV string (in-memory).

        Raises
        ------
        ExportLimitExceededError
            If the number of matching records exceeds ``max_rows``.
            No partial CSV is generated.
        """
        firs = self._get_filtered_firs(
            district, station_id, crime_head, status, start_date, end_date
        )

        if max_rows is not None and len(firs) > max_rows:
            raise ExportLimitExceededError(
                f"Export contains {len(firs):,} records, exceeding the "
                f"synchronous limit of {max_rows:,}. "
                "Please refine your filters to reduce the result set."
            )

        output = io.StringIO()
        writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)

        # Header
        writer.writerow(_EXPORT_FIELD_NAMES)

        # Data rows
        for fir in firs:
            row = [
                fir.fir_id,
                fir.fir_number,
                fir.crime_head,
                fir.crime_subhead,
                fir.status,
                fir.district,
                fir.station_id,
                fir.latitude,
                fir.longitude,
                fir.incident_date.strftime("%Y-%m-%d %H:%M"),
                fir.investigating_officer,
            ]

            # Sanitize string fields against CSV formula injection
            row = [_sanitize_csv_cell(v) for v in row]
            writer.writerow(row)

        return output.getvalue()


def _sanitize_csv_cell(value: object) -> object:
    """Prevent spreadsheet formula injection by prefixing dangerous cells.

    If a string value begins with (or has leading whitespace before)
    =, +, -, or @, prepend a single quote to neutralize formula
    interpretation in spreadsheet applications.
    """
    if isinstance(value, str) and value:
        stripped = value.lstrip()
        if stripped and stripped[0] in _CSV_INJECTION_PREFIXES:
            return "'" + value
    return value
