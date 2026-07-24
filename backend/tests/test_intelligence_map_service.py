"""Unit tests for IntelligenceMapService.

Uses lightweight fake repositories — no CSV files loaded.
Integration tests using real CSV data are in test_intelligence_map_api.py.
"""

from __future__ import annotations

from datetime import date, datetime

import pytest

from app.core.exceptions import InvalidFilterError
from app.database.records import DistrictRecord, FIRRecord, StationRecord
from app.services.intelligence_map_service import IntelligenceMapService


# ---------------------------------------------------------------------------
# Fake repositories
# ---------------------------------------------------------------------------


class _FakeFIRReader:
    def __init__(self) -> None:
        self._firs: list[FIRRecord] = []

    def add(self, fir: FIRRecord) -> None:
        self._firs.append(fir)

    def list_all(self) -> list[FIRRecord]:
        return list(self._firs)


class _FakeStationReader:
    def __init__(self, stations: list[StationRecord] | None = None) -> None:
        self._stations = {s.station_id: s for s in (stations or [])}

    def get_by_id(self, station_id: str) -> StationRecord | None:
        return self._stations.get(station_id)

    def list_all(self) -> list[StationRecord]:
        return list(self._stations.values())


class _FakeDistrictReader:
    def __init__(self, districts: list[DistrictRecord] | None = None) -> None:
        self._districts = list(districts or [])

    def list_all(self) -> list[DistrictRecord]:
        return list(self._districts)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _make_fir(
    fir_id: str = "FIR001",
    fir_number: str = "1/2025",
    district: str = "Bengaluru Urban",
    station_id: str = "PS0001",
    crime_head: str = "Theft",
    crime_subhead: str = "Petty Theft",
    bns_sections: str = "BNS 379",
    status: str = "Under Investigation",
    incident_date: datetime = datetime(2025, 6, 15, 10, 0, 0),
    lat: float = 12.97,
    lon: float = 77.59,
    io: str = "SI Ganesh Rao",
) -> FIRRecord:
    return FIRRecord(
        fir_id=fir_id,
        fir_number=fir_number,
        station_id=station_id,
        district=district,
        incident_date=incident_date,
        fir_date=incident_date,
        crime_head=crime_head,
        crime_subhead=crime_subhead,
        bns_sections=bns_sections,
        latitude=lat,
        longitude=lon,
        complainant_id="C001",
        victim_id="V001",
        accused_ids=("P001",),
        investigating_officer=io,
        status=status,
    )


def _make_station(
    station_id: str = "PS0001",
    station_name: str = "Bengaluru Central PS",
    district_name: str = "Bengaluru Urban",
) -> StationRecord:
    return StationRecord(
        station_id=station_id,
        station_name=station_name,
        district_id=5,
        district_name=district_name,
        zone="Central",
        station_type="Town Police Station",
        latitude=12.97,
        longitude=77.59,
        personnel_strength=50,
        patrol_vehicles=10,
        contact_number="08012345678",
        email="ps0001@ksp.gov.in",
    )


def _make_district(
    district_name: str = "Bengaluru Urban",
    population: int = 3467006,
    area_sq_km: int = 7092,
) -> DistrictRecord:
    return DistrictRecord(
        district_id=5,
        district_name=district_name,
        police_range="Bengaluru City",
        state="Karnataka",
        population=population,
        area_sq_km=area_sq_km,
        population_density=1629,
        literacy_rate=88.48,
        urban_population_pct=90,
        rural_population_pct=10,
        police_stations=45,
        latitude=12.97,
        longitude=77.59,
    )


def _build_service(
    firs: list[FIRRecord],
    stations: list[StationRecord] | None = None,
    districts: list[DistrictRecord] | None = None,
) -> IntelligenceMapService:
    fir_reader = _FakeFIRReader()
    for f in firs:
        fir_reader.add(f)
    return IntelligenceMapService(
        fir_reader=fir_reader,
        district_reader=_FakeDistrictReader(districts or []),
        station_reader=_FakeStationReader(stations or []),
        station_lookup=_FakeStationReader(stations or []),
    )


# ===================================================================
# 1. Analytics
# ===================================================================


class TestIntelligenceAnalytics:
    def test_empty_data_returns_zero_totals(self):
        svc = _build_service([])
        result = svc.get_analytics()
        assert result["total_crimes"] == 0
        assert result["hotspot_count"] == 0
        assert result["density_index"] == 0.0
        assert result["dominant_crime_type"] is None

    def test_total_crimes_count(self):
        firs = [_make_fir(fir_id=f"F{i}") for i in range(10)]
        svc = _build_service(firs)
        result = svc.get_analytics()
        assert result["total_crimes"] == 10

    def test_dominant_crime_type(self):
        firs = [
            _make_fir(fir_id="F1", crime_head="Theft"),
            _make_fir(fir_id="F2", crime_head="Theft"),
            _make_fir(fir_id="F3", crime_head="Theft"),
            _make_fir(fir_id="F4", crime_head="Assault"),
        ]
        svc = _build_service(firs)
        result = svc.get_analytics()
        assert result["dominant_crime_type"] == "Theft"

    def test_dominant_crime_type_tiebreak_is_alphabetical(self):
        firs = [
            _make_fir(fir_id="F1", crime_head="Assault"),
            _make_fir(fir_id="F2", crime_head="Assault"),
            _make_fir(fir_id="F3", crime_head="Theft"),
            _make_fir(fir_id="F4", crime_head="Theft"),
        ]
        svc = _build_service(firs)
        result = svc.get_analytics()
        # Equal count → alphabetically ascending Crime_Head wins
        assert result["dominant_crime_type"] == "Assault"

    def test_hotspot_count_with_qualifying_cells(self):
        # All same grid cell — 3 FIRs qualify as a hotspot
        firs = [
            _make_fir(fir_id=f"F{i}", lat=12.97, lon=77.59)
            for i in range(5)
        ]
        svc = _build_service(firs)
        result = svc.get_analytics()
        assert result["hotspot_count"] >= 1

    def test_density_index_computed(self):
        districts = [_make_district("Bengaluru Urban", population=3467006, area_sq_km=7092)]
        firs = [_make_fir(district="Bengaluru Urban")]
        svc = _build_service(firs, districts=districts)
        result = svc.get_analytics()
        expected = 1 / 7092
        assert abs(result["density_index"] - expected) < 1e-6

    def test_density_index_zero_when_no_area(self):
        firs = [_make_fir(district="Unknown District")]
        svc = _build_service(firs, districts=[])
        result = svc.get_analytics()
        assert result["density_index"] == 0.0

    def test_analytics_with_filters(self):
        firs = [
            _make_fir(fir_id="F1", district="A", crime_head="Theft"),
            _make_fir(fir_id="F2", district="B", crime_head="Assault"),
        ]
        svc = _build_service(firs)
        result = svc.get_analytics(district="A")
        assert result["total_crimes"] == 1
        assert result["dominant_crime_type"] == "Theft"


# ===================================================================
# 2. Heatmap
# ===================================================================


class TestIntelligenceHeatmap:
    def test_empty_data_returns_empty_points(self):
        svc = _build_service([])
        result = svc.get_heatmap()
        assert result["points"] == []
        assert result["total_points"] == 0

    def test_same_grid_cell_aggregated(self):
        # Multiple FIRs in same 0.01° grid cell
        firs = [
            _make_fir(fir_id=f"F{i}", lat=12.97, lon=77.59)
            for i in range(4)
        ]
        svc = _build_service(firs)
        result = svc.get_heatmap()
        assert result["total_points"] == 1
        assert result["points"][0]["weight"] == 4

    def test_different_grid_cells_separate(self):
        firs = [
            _make_fir(fir_id="F1", lat=12.97, lon=77.59),
            _make_fir(fir_id="F2", lat=15.30, lon=75.70),
        ]
        svc = _build_service(firs)
        result = svc.get_heatmap()
        assert result["total_points"] == 2

    def test_points_sorted_by_weight_descending(self):
        firs = [
            _make_fir(fir_id="F1", lat=12.97, lon=77.59),
            _make_fir(fir_id="F2", lat=12.97, lon=77.59),
            _make_fir(fir_id="F3", lat=12.97, lon=77.59),
            _make_fir(fir_id="F4", lat=15.30, lon=75.70),
        ]
        svc = _build_service(firs)
        result = svc.get_heatmap()
        weights = [p["weight"] for p in result["points"]]
        assert weights == sorted(weights, reverse=True)

    def test_grid_cell_center_is_grid_origin_plus_half(self):
        firs = [_make_fir(fir_id="F1", lat=12.97, lon=77.59)]
        svc = _build_service(firs)
        result = svc.get_heatmap()
        point = result["points"][0]
        # Grid origin = (floor(12.97/0.01)*0.01, floor(77.59/0.01)*0.01) = (12.97, 77.59)
        # center = origin + 0.005
        assert abs(point["latitude"] - 12.975) < 1e-4
        assert abs(point["longitude"] - 77.595) < 1e-4

    def test_heatmap_with_district_filter(self):
        firs = [
            _make_fir(fir_id="F1", district="A", lat=12.97, lon=77.59),
            _make_fir(fir_id="F2", district="B", lat=15.30, lon=75.70),
        ]
        svc = _build_service(firs)
        result = svc.get_heatmap(district="A")
        assert result["total_points"] == 1


# ===================================================================
# 3. Clusters (station-based)
# ===================================================================


class TestIntelligenceClusters:
    def test_empty_data_returns_empty_clusters(self):
        svc = _build_service([])
        result = svc.get_clusters()
        assert result["clusters"] == []
        assert result["total_clusters"] == 0

    def test_cluster_created_per_station(self):
        stations = [
            _make_station("PS0001", "Station A"),
            _make_station("PS0002", "Station B"),
        ]
        firs = [
            _make_fir(fir_id="F1", station_id="PS0001"),
            _make_fir(fir_id="F2", station_id="PS0001"),
            _make_fir(fir_id="F3", station_id="PS0002"),
        ]
        svc = _build_service(firs, stations=stations)
        result = svc.get_clusters()
        assert result["total_clusters"] == 2

    def test_cluster_uses_authoritative_station_coords(self):
        stations = [_make_station("PS0001", "Station A")]
        firs = [_make_fir(fir_id="F1", station_id="PS0001", lat=0.0, lon=0.0)]
        svc = _build_service(firs, stations=stations)
        result = svc.get_clusters()
        cluster = result["clusters"][0]
        assert cluster["latitude"] == 12.97  # Station coords, not FIR coords
        assert cluster["longitude"] == 77.59

    def test_cluster_fir_count(self):
        stations = [_make_station("PS0001", "Station A")]
        firs = [_make_fir(fir_id=f"F{i}", station_id="PS0001") for i in range(5)]
        svc = _build_service(firs, stations=stations)
        result = svc.get_clusters()
        assert result["clusters"][0]["fir_count"] == 5

    def test_cluster_dominant_crime_type(self):
        stations = [_make_station("PS0001", "Station A")]
        firs = [
            _make_fir(fir_id="F1", station_id="PS0001", crime_head="Theft"),
            _make_fir(fir_id="F2", station_id="PS0001", crime_head="Theft"),
            _make_fir(fir_id="F3", station_id="PS0001", crime_head="Assault"),
        ]
        svc = _build_service(firs, stations=stations)
        result = svc.get_clusters()
        assert result["clusters"][0]["dominant_crime_type"] == "Theft"

    def test_cluster_status_breakdown(self):
        stations = [_make_station("PS0001", "Station A")]
        firs = [
            _make_fir(fir_id="F1", station_id="PS0001", status="Chargesheeted"),
            _make_fir(fir_id="F2", station_id="PS0001", status="Under Investigation"),
        ]
        svc = _build_service(firs, stations=stations)
        result = svc.get_clusters()
        breakdown = result["clusters"][0]["status_breakdown"]
        assert len(breakdown) == 2
        statuses = {b["status"] for b in breakdown}
        assert statuses == {"Chargesheeted", "Under Investigation"}

    def test_cluster_sorted_by_fir_count_desc(self):
        stations = [
            _make_station("PS0001", "Station A"),
            _make_station("PS0002", "Station B"),
        ]
        firs = [
            _make_fir(fir_id="F1", station_id="PS0002"),
            _make_fir(fir_id="F2", station_id="PS0001"),
            _make_fir(fir_id="F3", station_id="PS0001"),
            _make_fir(fir_id="F4", station_id="PS0001"),
        ]
        svc = _build_service(firs, stations=stations)
        result = svc.get_clusters()
        counts = [c["fir_count"] for c in result["clusters"]]
        assert counts == sorted(counts, reverse=True)

    def test_firs_for_unknown_station_skipped(self):
        # Station not in station list
        firs = [_make_fir(fir_id="F1", station_id="PS_UNKNOWN")]
        svc = _build_service(firs, stations=[])
        result = svc.get_clusters()
        assert result["total_clusters"] == 0

    def test_cluster_with_filter(self):
        stations = [_make_station("PS0001", "Station A")]
        firs = [
            _make_fir(fir_id="F1", station_id="PS0001", district="A"),
            _make_fir(fir_id="F2", station_id="PS0001", district="B"),
        ]
        svc = _build_service(firs, stations=stations)
        result = svc.get_clusters(district="A")
        assert result["clusters"][0]["fir_count"] == 1


# ===================================================================
# 4. Hotspots (shared implementation)
# ===================================================================


class TestIntelligenceHotspots:
    def test_empty_data_returns_empty(self):
        svc = _build_service([])
        result = svc.get_hotspots()
        assert result["hotspots"] == []
        assert result["total_hotspots"] == 0

    def test_below_threshold_no_hotspot(self):
        firs = [
            _make_fir(fir_id=f"F{i}", lat=12.97, lon=77.59)
            for i in range(2)  # Below threshold of 3
        ]
        svc = _build_service(firs)
        result = svc.get_hotspots()
        assert result["total_hotspots"] == 0

    def test_at_threshold_creates_hotspot(self):
        firs = [
            _make_fir(fir_id=f"F{i}", lat=12.97, lon=77.59)
            for i in range(3)
        ]
        svc = _build_service(firs)
        result = svc.get_hotspots()
        assert result["total_hotspots"] == 1
        assert result["hotspots"][0]["fir_count"] == 3

    def test_above_threshold_creates_hotspot(self):
        firs = [
            _make_fir(fir_id=f"F{i}", lat=12.97, lon=77.59)
            for i in range(10)
        ]
        svc = _build_service(firs)
        result = svc.get_hotspots()
        assert result["total_hotspots"] == 1
        assert result["hotspots"][0]["fir_count"] == 10

    def test_hotspot_dominant_crime_type(self):
        firs = [
            _make_fir(fir_id="F1", lat=12.97, lon=77.59, crime_head="Theft"),
            _make_fir(fir_id="F2", lat=12.97, lon=77.59, crime_head="Theft"),
            _make_fir(fir_id="F3", lat=12.97, lon=77.59, crime_head="Assault"),
        ]
        svc = _build_service(firs)
        result = svc.get_hotspots()
        assert result["hotspots"][0]["dominant_crime_type"] == "Theft"

    def test_hotspot_districts_sorted(self):
        firs = [
            _make_fir(fir_id="F1", lat=12.97, lon=77.59, district="Mysuru"),
            _make_fir(fir_id="F2", lat=12.97, lon=77.59, district="Bengaluru Urban"),
            _make_fir(fir_id="F3", lat=12.97, lon=77.59, district="Mysuru"),
        ]
        svc = _build_service(firs)
        result = svc.get_hotspots()
        assert result["hotspots"][0]["districts"] == ["Bengaluru Urban", "Mysuru"]

    def test_hotspots_with_filter(self):
        firs = [
            _make_fir(fir_id=f"F{i}", lat=12.97, lon=77.59, district="A")
            for i in range(5)
        ]
        firs += [
            _make_fir(fir_id=f"F{i+10}", lat=15.0, lon=75.0, district="B")
            for i in range(5)
        ]
        svc = _build_service(firs)
        result = svc.get_hotspots(district="A")
        assert result["total_hotspots"] == 1

    def test_hotspots_sorted_by_fir_count_desc(self):
        # Two different grid cells with different FIR counts
        firs = [
            _make_fir(fir_id=f"F{i}", lat=12.97, lon=77.59)
            for i in range(5)
        ]
        firs += [
            _make_fir(fir_id=f"F{i+10}", lat=15.30, lon=75.70)
            for i in range(8)
        ]
        svc = _build_service(firs)
        result = svc.get_hotspots()
        counts = [h["fir_count"] for h in result["hotspots"]]
        assert counts == sorted(counts, reverse=True)

    def test_invalid_date_raises(self):
        svc = _build_service([_make_fir()])
        with pytest.raises(InvalidFilterError, match="start_date must not be after end_date"):
            svc.get_hotspots(start_date=date(2025, 12, 31), end_date=date(2025, 1, 1))


# ===================================================================
# 5. District comparison
# ===================================================================


class TestIntelligenceDistrictComparison:
    def test_empty_data_returns_empty(self):
        svc = _build_service([])
        result = svc.get_district_comparison()
        assert result["districts"] == []
        assert result["total_districts"] == 0

    def test_single_district_row(self):
        districts = [_make_district("Bengaluru Urban", population=3467006, area_sq_km=7092)]
        firs = [_make_fir(fir_id="F1", district="Bengaluru Urban")]
        svc = _build_service(firs, districts=districts)
        result = svc.get_district_comparison()
        assert result["total_districts"] == 1
        row = result["districts"][0]
        assert row["district"] == "Bengaluru Urban"
        assert row["fir_count"] == 1

    def test_crime_rate_per_100k(self):
        districts = [_make_district("DistrictA", population=100_000, area_sq_km=1000)]
        firs = [_make_fir(fir_id=f"F{i}", district="DistrictA") for i in range(10)]
        svc = _build_service(firs, districts=districts)
        result = svc.get_district_comparison()
        row = result["districts"][0]
        # 10 / 100000 * 100000 = 10.0
        assert row["crime_rate_per_100k"] == 10.0

    def test_density_per_sq_km(self):
        districts = [_make_district("DistrictA", population=100_000, area_sq_km=500)]
        firs = [_make_fir(fir_id=f"F{i}", district="DistrictA") for i in range(10)]
        svc = _build_service(firs, districts=districts)
        result = svc.get_district_comparison()
        row = result["districts"][0]
        # 10 / 500 = 0.02
        assert row["density_per_sq_km"] == 0.02

    def test_multiple_districts_sorted_by_fir_count(self):
        districts = [
            _make_district("DistrictA", population=100_000, area_sq_km=1000),
            _make_district("DistrictB", population=200_000, area_sq_km=2000),
        ]
        firs = [
            _make_fir(fir_id="F1", district="DistrictB"),
            _make_fir(fir_id="F2", district="DistrictA"),
            _make_fir(fir_id="F3", district="DistrictA"),
        ]
        svc = _build_service(firs, districts=districts)
        result = svc.get_district_comparison()
        assert result["districts"][0]["district"] == "DistrictA"
        assert result["districts"][0]["fir_count"] == 2
        assert result["districts"][1]["district"] == "DistrictB"
        assert result["districts"][1]["fir_count"] == 1

    def test_dominant_crime_type_per_district(self):
        districts = [_make_district("DistrictA")]
        firs = [
            _make_fir(fir_id="F1", district="DistrictA", crime_head="Theft"),
            _make_fir(fir_id="F2", district="DistrictA", crime_head="Theft"),
            _make_fir(fir_id="F3", district="DistrictA", crime_head="Assault"),
        ]
        svc = _build_service(firs, districts=districts)
        result = svc.get_district_comparison()
        assert result["districts"][0]["dominant_crime_type"] == "Theft"

    def test_status_breakdown_per_district(self):
        districts = [_make_district("DistrictA")]
        firs = [
            _make_fir(fir_id="F1", district="DistrictA", status="Chargesheeted"),
            _make_fir(fir_id="F2", district="DistrictA", status="Untraced"),
        ]
        svc = _build_service(firs, districts=districts)
        result = svc.get_district_comparison()
        breakdown = result["districts"][0]["status_breakdown"]
        statuses = {b["status"] for b in breakdown}
        assert statuses == {"Chargesheeted", "Untraced"}

    def test_zero_population_zero_crime_rate(self):
        districts = [_make_district("DistrictA", population=0)]
        firs = [_make_fir(fir_id="F1", district="DistrictA")]
        svc = _build_service(firs, districts=districts)
        result = svc.get_district_comparison()
        assert result["districts"][0]["crime_rate_per_100k"] == 0.0

    def test_zero_area_zero_density(self):
        districts = [_make_district("DistrictA", area_sq_km=0)]
        firs = [_make_fir(fir_id="F1", district="DistrictA")]
        svc = _build_service(firs, districts=districts)
        result = svc.get_district_comparison()
        assert result["districts"][0]["density_per_sq_km"] == 0.0

    def test_district_not_in_metadata_gets_defaults(self):
        firs = [_make_fir(fir_id="F1", district="Unknown")]
        svc = _build_service(firs, districts=[])
        result = svc.get_district_comparison()
        row = result["districts"][0]
        assert row["district"] == "Unknown"
        assert row["population"] == 0
        assert row["area_sq_km"] == 0

    def test_district_comparison_with_filter(self):
        districts = [
            _make_district("DistrictA"),
            _make_district("DistrictB"),
        ]
        firs = [
            _make_fir(fir_id="F1", district="DistrictA"),
            _make_fir(fir_id="F2", district="DistrictB"),
        ]
        svc = _build_service(firs, districts=districts)
        result = svc.get_district_comparison(district="DistrictA")
        assert result["total_districts"] == 1
        assert result["districts"][0]["district"] == "DistrictA"


# ===================================================================
# 6. Timeline
# ===================================================================


class TestIntelligenceTimeline:
    def test_empty_data_returns_empty_buckets(self):
        svc = _build_service([])
        result = svc.get_timeline()
        assert result["buckets"] == []
        assert result["total_buckets"] == 0
        assert result["granularity"] == "monthly"

    def test_monthly_granularity(self):
        firs = [
            _make_fir(fir_id="F1", incident_date=datetime(2025, 1, 15)),
            _make_fir(fir_id="F2", incident_date=datetime(2025, 1, 20)),
            _make_fir(fir_id="F3", incident_date=datetime(2025, 3, 10)),
        ]
        svc = _build_service(firs)
        result = svc.get_timeline(granularity="monthly")
        assert result["total_buckets"] == 2
        assert result["buckets"][0]["period"] == "2025-01"
        assert result["buckets"][1]["period"] == "2025-03"
        assert result["buckets"][0]["fir_count"] == 2

    def test_daily_granularity(self):
        firs = [
            _make_fir(fir_id="F1", incident_date=datetime(2025, 1, 15, 8, 0)),
            _make_fir(fir_id="F2", incident_date=datetime(2025, 1, 15, 14, 0)),
            _make_fir(fir_id="F3", incident_date=datetime(2025, 1, 16)),
        ]
        svc = _build_service(firs)
        result = svc.get_timeline(granularity="daily")
        assert result["total_buckets"] == 2
        assert result["buckets"][0]["period"] == "2025-01-15"
        assert result["buckets"][0]["fir_count"] == 2

    def test_buckets_sorted_chronologically(self):
        firs = [
            _make_fir(fir_id="F1", incident_date=datetime(2025, 3, 1)),
            _make_fir(fir_id="F2", incident_date=datetime(2025, 1, 1)),
            _make_fir(fir_id="F3", incident_date=datetime(2025, 6, 1)),
        ]
        svc = _build_service(firs)
        result = svc.get_timeline(granularity="monthly")
        periods = [b["period"] for b in result["buckets"]]
        assert periods == sorted(periods)

    def test_crime_head_breakdown_in_bucket(self):
        firs = [
            _make_fir(fir_id="F1", incident_date=datetime(2025, 1, 1), crime_head="Theft"),
            _make_fir(fir_id="F2", incident_date=datetime(2025, 1, 1), crime_head="Theft"),
            _make_fir(fir_id="F3", incident_date=datetime(2025, 1, 1), crime_head="Assault"),
        ]
        svc = _build_service(firs)
        result = svc.get_timeline(granularity="monthly")
        breakdown = result["buckets"][0]["crime_head_breakdown"]
        counts = {b["crime_head"]: b["count"] for b in breakdown}
        assert counts["Theft"] == 2
        assert counts["Assault"] == 1

    def test_invalid_granularity_raises(self):
        svc = _build_service([_make_fir()])
        with pytest.raises(InvalidFilterError, match="Invalid granularity"):
            svc.get_timeline(granularity="weekly")

    def test_default_granularity_is_monthly(self):
        firs = [_make_fir(fir_id="F1", incident_date=datetime(2025, 1, 15))]
        svc = _build_service(firs)
        result = svc.get_timeline()
        assert result["granularity"] == "monthly"

    def test_timeline_with_filter(self):
        firs = [
            _make_fir(fir_id="F1", district="A", incident_date=datetime(2025, 1, 1)),
            _make_fir(fir_id="F2", district="B", incident_date=datetime(2025, 1, 1)),
        ]
        svc = _build_service(firs)
        result = svc.get_timeline(district="A", granularity="monthly")
        assert result["buckets"][0]["fir_count"] == 1

    def test_invalid_date_range_raises(self):
        svc = _build_service([_make_fir()])
        with pytest.raises(InvalidFilterError, match="start_date must not be after end_date"):
            svc.get_timeline(
                start_date=date(2025, 12, 31), end_date=date(2025, 1, 1)
            )


# ===================================================================
# 7. Export (CSV)
# ===================================================================


class TestIntelligenceExport:
    def test_empty_data_returns_header_only(self):
        svc = _build_service([])
        result = svc.get_export()
        lines = result.strip().split("\n")
        assert len(lines) == 1  # Header only

    def test_csv_has_correct_header(self):
        svc = _build_service([])
        result = svc.get_export()
        header = result.strip().split("\n")[0]
        expected = "FIR_ID,FIR_Number,Crime_Head,Crime_Subhead,Status,District,Station_ID,Latitude,Longitude,Incident_Date,Investigating_Officer"
        assert header == expected

    def test_single_fir_exported(self):
        stations = [_make_station("PS0001", "Central PS")]
        firs = [_make_fir(fir_id="FIR001", station_id="PS0001")]
        svc = _build_service(firs, stations=stations)
        result = svc.get_export()
        lines = result.strip().split("\n")
        assert len(lines) == 2  # Header + 1 data row

    def test_export_no_pii_columns(self):
        firs = [_make_fir()]
        svc = _build_service(firs)
        result = svc.get_export()
        header = result.strip().split("\n")[0]
        for col in ("Complainant_ID", "Victim_ID", "Accused_IDs", "Person_ID"):
            assert col not in header

    def test_export_formula_injection_protection(self):
        firs = [
            _make_fir(fir_id="=CMD('calc')", fir_number="1/2025"),
            _make_fir(fir_id="F2", fir_number="+CMD('calc')"),
            _make_fir(fir_id="F3", fir_number="-CMD('calc')"),
            _make_fir(fir_id="F4", fir_number="@SUM(A1:A10)"),
            _make_fir(fir_id="F5", fir_number=" =CMD('space')"),
            _make_fir(fir_id="F6", fir_number="\t=CMD('tab')"),
        ]
        svc = _build_service(firs)
        result = svc.get_export()
        lines = result.strip().split("\n")[1:]  # Skip header
        for line in lines:
            # Sanitizer prepends ' to the original value, so leading-space
            # values become ' =CMD (quote + space + formula prefix)
            assert (
                "'=CMD" in line
                or "'+CMD" in line
                or "'-CMD" in line
                or "'@SUM" in line
                or "' =CMD" in line
                or "'\t=CMD" in line
            )

    def test_export_formula_injection_normal_strings_unchanged(self):
        firs = [
            _make_fir(fir_id="FIR001", fir_number="123/2025"),
            _make_fir(fir_id="FIR002", fir_number="Normal text"),
        ]
        svc = _build_service(firs)
        result = svc.get_export()
        lines = result.strip().split("\n")[1:]  # Skip header
        for line in lines:
            assert "'" not in line.split(",")[0]  # fir_id not prefixed

    def test_export_with_filter(self):
        firs = [
            _make_fir(fir_id="F1", district="A"),
            _make_fir(fir_id="F2", district="B"),
        ]
        svc = _build_service(firs)
        result = svc.get_export(district="A")
        lines = result.strip().split("\n")
        assert len(lines) == 2  # Header + 1 data row

    def test_export_date_format(self):
        firs = [_make_fir(fir_id="F1", incident_date=datetime(2025, 6, 15, 14, 30))]
        svc = _build_service(firs)
        result = svc.get_export()
        lines = result.strip().split("\n")
        data_row = lines[1]
        assert "2025-06-15 14:30" in data_row

    def test_export_invalid_date_range_raises(self):
        svc = _build_service([_make_fir()])
        with pytest.raises(InvalidFilterError, match="start_date must not be after end_date"):
            svc.get_export(
                start_date=date(2025, 12, 31), end_date=date(2025, 1, 1)
            )


# ===================================================================
# 8. Shared filter semantics
# ===================================================================


class TestIntelligenceFilters:
    def test_analytics_respects_district_filter(self):
        firs = [
            _make_fir(fir_id="F1", district="A"),
            _make_fir(fir_id="F2", district="B"),
        ]
        svc = _build_service(firs)
        result = svc.get_analytics(district="A")
        assert result["total_crimes"] == 1

    def test_heatmap_respects_status_filter(self):
        firs = [
            _make_fir(fir_id="F1", status="Chargesheeted"),
            _make_fir(fir_id="F2", status="Under Investigation"),
        ]
        svc = _build_service(firs)
        result = svc.get_heatmap(status="Chargesheeted")
        assert result["total_points"] == 1

    def test_clusters_respects_crime_head_filter(self):
        stations = [_make_station("PS0001")]
        firs = [
            _make_fir(fir_id="F1", station_id="PS0001", crime_head="Theft"),
            _make_fir(fir_id="F2", station_id="PS0001", crime_head="Assault"),
        ]
        svc = _build_service(firs, stations=stations)
        result = svc.get_clusters(crime_head="Theft")
        assert result["clusters"][0]["fir_count"] == 1

    def test_all_filters_combined(self):
        districts = [_make_district("DistrictA")]
        stations = [_make_station("PS0001")]
        firs = [
            _make_fir(
                fir_id="F1",
                district="DistrictA",
                station_id="PS0001",
                crime_head="Theft",
                status="Chargesheeted",
                incident_date=datetime(2025, 6, 15),
            ),
            _make_fir(
                fir_id="F2",
                district="DistrictA",
                station_id="PS0001",
                crime_head="Theft",
                status="Chargesheeted",
                incident_date=datetime(2025, 8, 20),
            ),
        ]
        svc = _build_service(firs, stations=stations, districts=districts)
        result = svc.get_analytics(
            district="DistrictA",
            station_id="PS0001",
            crime_head="Theft",
            status="Chargesheeted",
            start_date=date(2025, 6, 1),
            end_date=date(2025, 7, 31),
        )
        assert result["total_crimes"] == 1

    def test_start_date_after_end_date_raises(self):
        svc = _build_service([_make_fir()])
        with pytest.raises(InvalidFilterError, match="start_date must not be after end_date"):
            svc.get_analytics(
                start_date=date(2025, 12, 31), end_date=date(2025, 1, 1)
            )
