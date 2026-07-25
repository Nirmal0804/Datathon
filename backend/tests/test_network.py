"""Comprehensive tests for Network Analysis service and API."""

from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime
from typing import Any, Optional

import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.database.dependencies import RepositoryCollection, get_repositories
from app.database.records import DistrictRecord, FIRRecord, StationRecord
from app.main import app
from app.services.network_service import (
    MAX_GRAPH_EDGES,
    MAX_GRAPH_NODES,
    MAX_SEARCH_RESULTS,
    MIN_SEARCH_LENGTH,
    NetworkService,
)


# ---------------------------------------------------------------------------
# Fake repositories for service tests
# ---------------------------------------------------------------------------


class FakeFIRRepository:
    def __init__(self, firs: list[FIRRecord]) -> None:
        self._firs = {fir.fir_id: fir for fir in firs}

    def list_all(self) -> list[FIRRecord]:
        return list(self._firs.values())

    def get_by_id(self, fir_id: str) -> FIRRecord | None:
        return self._firs.get(fir_id)

    def get_by_number(self, fir_number: str) -> FIRRecord | None:
        for fir in self._firs.values():
            if fir.fir_number == fir_number:
                return fir
        return None

    def list_by_station(self, station_id: str) -> list[FIRRecord]:
        return [f for f in self._firs.values() if f.station_id == station_id]

    def list_by_district(self, district: str) -> list[FIRRecord]:
        return [f for f in self._firs.values() if f.district == district]

    def list_by_status(self, status: str) -> list[FIRRecord]:
        return [f for f in self._firs.values() if f.status == status]

    def list_filtered(
        self,
        district: str | None = None,
        station_id: str | None = None,
        crime_head: str | None = None,
        status: str | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> list[FIRRecord]:
        result = list(self._firs.values())
        if district is not None:
            result = [f for f in result if f.district == district]
        if station_id is not None:
            result = [f for f in result if f.station_id == station_id]
        if crime_head is not None:
            result = [f for f in result if f.crime_head == crime_head]
        if status is not None:
            result = [f for f in result if f.status == status]
        if start_date is not None:
            result = [
                f for f in result
                if f.incident_date is not None and f.incident_date.date() >= start_date
            ]
        if end_date is not None:
            result = [
                f for f in result
                if f.incident_date is not None and f.incident_date.date() <= end_date
            ]
        return result


class FakeStationRepository:
    def __init__(self, stations: list[StationRecord]) -> None:
        self._by_id = {s.station_id: s for s in stations}
        self._by_name = {s.station_name: s for s in stations}

    def get_by_id(self, station_id: str) -> StationRecord | None:
        return self._by_id.get(station_id)

    def get_by_name(self, station_name: str) -> StationRecord | None:
        return self._by_name.get(station_name)

    def list_all(self) -> list[StationRecord]:
        return list(self._by_id.values())


class FakeDistrictRepository:
    def __init__(self, districts: list[DistrictRecord]) -> None:
        self._by_id = {d.district_id: d for d in districts}
        self._by_name = {d.district_name: d for d in districts}

    def get_by_id(self, district_id: int) -> DistrictRecord | None:
        return self._by_id.get(district_id)

    def get_by_name(self, district_name: str) -> DistrictRecord | None:
        return self._by_name.get(district_name)

    def list_all(self) -> list[DistrictRecord]:
        return list(self._by_id.values())


# ---------------------------------------------------------------------------
# Test fixtures
# ---------------------------------------------------------------------------


def _make_station(
    station_id: str, name: str, district_id: int = 1,
    district_name: str = "TestDistrict",
) -> StationRecord:
    return StationRecord(
        station_id=station_id, station_name=name, district_id=district_id,
        district_name=district_name, zone="Central",
        station_type="Town Police Station", latitude=12.97, longitude=77.59,
        personnel_strength=50, patrol_vehicles=5,
        contact_number="0123456789", email="ps@test.gov.in",
    )


def _make_district(district_id: int = 1, name: str = "TestDistrict") -> DistrictRecord:
    return DistrictRecord(
        district_id=district_id, district_name=name, police_range="TestRange",
        state="Karnataka", population=1000000, area_sq_km=5000,
        population_density=200, literacy_rate=75.0, urban_population_pct=40,
        rural_population_pct=60, police_stations=20, latitude=12.97,
        longitude=77.59,
    )


def _make_fir(
    fir_id: str, fir_number: str, station_id: str = "PS0001",
    district: str = "TestDistrict", crime_head: str = "Theft",
    status: str = "Under Investigation", complainant_id: str = "P000001",
    victim_id: str = "P000002", accused_ids: tuple[str, ...] = ("P000003",),
    incident_date: datetime | None = datetime(2025, 6, 15, 10, 0),
) -> FIRRecord:
    return FIRRecord(
        fir_id=fir_id, fir_number=fir_number, station_id=station_id,
        district=district, incident_date=incident_date, fir_date=incident_date,
        crime_head=crime_head, crime_subhead=f"{crime_head} - General",
        bns_sections="BNS 379", latitude=12.97, longitude=77.59,
        complainant_id=complainant_id, victim_id=victim_id,
        accused_ids=accused_ids, investigating_officer="SI Test Officer",
        status=status,
    )


@pytest.fixture
def service() -> NetworkService:
    stations = [_make_station("PS0001", "Central Station", 1, "Bengaluru Urban")]
    districts = [_make_district(1, "Bengaluru Urban")]
    firs = [
        _make_fir("FIR001", "FIR/001/2025", accused_ids=("P000003", "P000004")),
        _make_fir("FIR002", "FIR/002/2025", accused_ids=("P000003", "P000005"),
                  crime_head="Assault"),
    ]
    return NetworkService(
        fir_reader=FakeFIRRepository(firs),
        station_reader=FakeStationRepository(stations),
        district_reader=FakeDistrictRepository(districts),
    )


@pytest.fixture
def empty_service() -> NetworkService:
    return NetworkService(
        fir_reader=FakeFIRRepository([]),
        station_reader=FakeStationRepository([]),
        district_reader=FakeDistrictRepository([]),
    )


# ===================================================================
# Service-layer tests — NetworkService.get_graph
# ===================================================================


class TestNetworkServiceGetGraph:
    def test_empty_graph(self, empty_service: NetworkService) -> None:
        result = empty_service.get_graph()
        assert result["nodes"] == []
        assert result["edges"] == []
        assert result["metadata"]["node_count"] == 0
        assert result["metadata"]["edge_count"] == 0
        assert result["metadata"]["truncated"] is False

    def test_single_fir_node_types(self, service: NetworkService) -> None:
        result = service.get_graph()
        node_types = {n["node_type"] for n in result["nodes"]}
        assert "fir" in node_types
        assert "person" in node_types
        assert "station" in node_types
        assert "district" in node_types

    def test_single_fir_edge_types(self, service: NetworkService) -> None:
        result = service.get_graph()
        edge_types = {e["edge_type"] for e in result["edges"]}
        assert "station_fir" in edge_types
        assert "district_station" in edge_types
        assert "accused_in" in edge_types
        assert "complainant_in" in edge_types
        assert "victim_of" in edge_types

    def test_fir_node_properties(self, service: NetworkService) -> None:
        result = service.get_graph()
        fir_nodes = [n for n in result["nodes"] if n["node_type"] == "fir"]
        assert len(fir_nodes) >= 1
        props = fir_nodes[0]["properties"]
        assert "fir_id" in props
        assert "fir_number" in props
        assert "crime_head" in props
        assert "status" in props
        assert "incident_date" in props
        assert "station_id" in props
        assert "district" in props

    def test_person_node_privacy_safe(self, service: NetworkService) -> None:
        result = service.get_graph()
        person_nodes = [n for n in result["nodes"] if n["node_type"] == "person"]
        assert len(person_nodes) >= 1
        for node in person_nodes:
            props = node["properties"]
            assert "entity_id" in props
            for pii_field in (
                "full_name", "dob", "age", "gender", "address",
                "phone", "email", "blood_group", "biometrics",
            ):
                assert pii_field not in props

    def test_station_node_properties(self, service: NetworkService) -> None:
        result = service.get_graph()
        station_nodes = [n for n in result["nodes"] if n["node_type"] == "station"]
        assert len(station_nodes) >= 1
        props = station_nodes[0]["properties"]
        assert "station_id" in props
        assert "station_name" in props
        assert "district_id" in props
        assert "district_name" in props

    def test_district_node_properties(self, service: NetworkService) -> None:
        result = service.get_graph()
        district_nodes = [n for n in result["nodes"] if n["node_type"] == "district"]
        assert len(district_nodes) >= 1
        props = district_nodes[0]["properties"]
        assert "district_id" in props
        assert "district_name" in props

    def test_metadata_structure(self, service: NetworkService) -> None:
        result = service.get_graph()
        meta = result["metadata"]
        assert "node_count" in meta
        assert "edge_count" in meta
        assert "truncated" in meta
        assert "filters_applied" in meta
        assert meta["node_count"] == len(result["nodes"])
        assert meta["edge_count"] == len(result["edges"])

    def test_co_accused_shared_fir_count(self) -> None:
        stations = [_make_station("PS001", "Station A")]
        districts = [_make_district(1, "District A")]
        firs = [
            _make_fir("F1", "FIR/1/2025", accused_ids=("A1", "A2", "A3")),
            _make_fir("F2", "FIR/2/2025", accused_ids=("A1", "A2")),
        ]
        svc = NetworkService(
            fir_reader=FakeFIRRepository(firs),
            station_reader=FakeStationRepository(stations),
            district_reader=FakeDistrictRepository(districts),
        )
        result = svc.get_graph()
        co_edges = [e for e in result["edges"] if e["edge_type"] == "co_accused"]
        a1_a2 = [
            e for e in co_edges
            if {e["source"], e["target"]} == {"person:A1", "person:A2"}
        ]
        assert len(a1_a2) == 1
        assert a1_a2[0]["properties"]["shared_fir_count"] == 2
        assert sorted(a1_a2[0]["properties"]["fir_ids"]) == ["F1", "F2"]

    def test_co_accused_no_self_edges(self) -> None:
        stations = [_make_station("PS001", "St")]
        districts = [_make_district(1, "Dist")]
        firs = [_make_fir("F1", "FIR/1/2025", accused_ids=("A1",))]
        svc = NetworkService(
            fir_reader=FakeFIRRepository(firs),
            station_reader=FakeStationRepository(stations),
            district_reader=FakeDistrictRepository(districts),
        )
        result = svc.get_graph()
        co_edges = [e for e in result["edges"] if e["edge_type"] == "co_accused"]
        for edge in co_edges:
            assert edge["source"] != edge["target"]

    def test_co_accused_deduplication(self) -> None:
        stations = [_make_station("PS001", "St")]
        districts = [_make_district(1, "Dist")]
        firs = [
            _make_fir("F1", "FIR/1/2025", accused_ids=("A1", "A2")),
            _make_fir("F2", "FIR/2/2025", accused_ids=("A2", "A1")),
        ]
        svc = NetworkService(
            fir_reader=FakeFIRRepository(firs),
            station_reader=FakeStationRepository(stations),
            district_reader=FakeDistrictRepository(districts),
        )
        result = svc.get_graph()
        co_edges = [e for e in result["edges"] if e["edge_type"] == "co_accused"]
        a1_a2 = [
            e for e in co_edges
            if {e["source"], e["target"]} == {"person:A1", "person:A2"}
        ]
        assert len(a1_a2) == 1
        assert a1_a2[0]["properties"]["shared_fir_count"] == 2

    def test_deterministic_ordering(self) -> None:
        stations = [_make_station("PS001", "St")]
        districts = [_make_district(1, "Dist")]
        firs = [
            _make_fir("F3", "FIR/3/2025", accused_ids=("Z1", "A1")),
            _make_fir("F1", "FIR/1/2025", accused_ids=("M1", "A1")),
        ]
        svc = NetworkService(
            fir_reader=FakeFIRRepository(firs),
            station_reader=FakeStationRepository(stations),
            district_reader=FakeDistrictRepository(districts),
        )
        r1 = svc.get_graph()
        r2 = svc.get_graph()
        assert r1["nodes"] == r2["nodes"]
        assert r1["edges"] == r2["edges"]

    def test_filter_by_crime_head(self, service: NetworkService) -> None:
        result = service.get_graph(crime_head="Theft")
        fir_nodes = [n for n in result["nodes"] if n["node_type"] == "fir"]
        for node in fir_nodes:
            assert node["properties"]["crime_head"] == "Theft"

    def test_filter_by_district(self, service: NetworkService) -> None:
        result = service.get_graph(district="Nonexistent")
        assert result["nodes"] == []
        assert result["edges"] == []

    def test_filter_empty_result(self, service: NetworkService) -> None:
        result = service.get_graph(crime_head="Murder")
        assert result["nodes"] == []
        assert result["metadata"]["node_count"] == 0

    def test_fir_id_filter(self, service: NetworkService) -> None:
        result = service.get_graph(fir_id="FIR001")
        fir_nodes = [n for n in result["nodes"] if n["node_type"] == "fir"]
        assert any(n["properties"]["fir_id"] == "FIR001" for n in fir_nodes)

    def test_fir_id_not_found(self, service: NetworkService) -> None:
        result = service.get_graph(fir_id="NONEXISTENT")
        assert result["nodes"] == []
        assert result["edges"] == []

    def test_edges_reference_valid_nodes(self, service: NetworkService) -> None:
        result = service.get_graph()
        node_ids = {n["id"] for n in result["nodes"]}
        for edge in result["edges"]:
            assert edge["source"] in node_ids
            assert edge["target"] in node_ids


# ===================================================================
# Service-layer tests — NetworkService.get_entity_detail
# ===================================================================


class TestNetworkServiceEntityDetail:
    def test_fir_detail(self, service: NetworkService) -> None:
        result = service.get_entity_detail("fir", "FIR001")
        assert result is not None
        assert result["entity_type"] == "fir"
        assert result["entity_id"] == "FIR001"
        props = result["properties"]
        assert "fir_number" in props
        assert "crime_head" in props
        assert "status" in props
        assert "incident_date" in props
        assert "accused_count" in props
        assert "has_complainant" in props
        assert "has_victim" in props

    def test_fir_detail_not_found(self, service: NetworkService) -> None:
        result = service.get_entity_detail("fir", "NONEXISTENT")
        assert result is None

    def test_station_detail(self, service: NetworkService) -> None:
        result = service.get_entity_detail("station", "PS0001")
        assert result is not None
        assert result["entity_type"] == "station"
        props = result["properties"]
        assert props["station_id"] == "PS0001"
        assert "station_name" in props
        assert "district_name" in props

    def test_station_detail_not_found(self, service: NetworkService) -> None:
        result = service.get_entity_detail("station", "NOPE")
        assert result is None

    def test_district_detail(self, service: NetworkService) -> None:
        result = service.get_entity_detail("district", "1")
        assert result is not None
        assert result["entity_type"] == "district"
        props = result["properties"]
        assert props["district_id"] == 1
        assert "district_name" in props
        assert "police_range" in props

    def test_district_detail_invalid_id(self, service: NetworkService) -> None:
        result = service.get_entity_detail("district", "abc")
        assert result is None

    def test_district_detail_not_found(self, service: NetworkService) -> None:
        result = service.get_entity_detail("district", "999")
        assert result is None

    def test_person_detail_privacy_safe(self, service: NetworkService) -> None:
        result = service.get_entity_detail("person", "P000003")
        assert result is not None
        assert result["entity_type"] == "person"
        props = result["properties"]
        assert "entity_id" in props
        assert "linked_fir_count" in props
        assert "co_accused_count" in props
        for pii_field in (
            "full_name", "dob", "age", "gender", "address",
            "phone", "email", "blood_group", "biometrics",
        ):
            assert pii_field not in props

    def test_person_detail_not_found(self, service: NetworkService) -> None:
        result = service.get_entity_detail("person", "P_NOCASE")
        assert result is None

    def test_unknown_entity_type(self, service: NetworkService) -> None:
        result = service.get_entity_detail("vehicle", "V001")
        assert result is None


# ===================================================================
# Service-layer tests — NetworkService.search
# ===================================================================


class TestNetworkServiceSearch:
    def test_empty_query(self, service: NetworkService) -> None:
        result = service.search("")
        assert result["results"] == []
        assert result["total"] == 0

    def test_single_char_query(self, service: NetworkService) -> None:
        result = service.search("F")
        assert result["results"] == []
        assert result["total"] == 0

    def test_search_by_fir_number(self, service: NetworkService) -> None:
        result = service.search("FIR/001")
        assert result["total"] >= 1
        types = {r["entity_type"] for r in result["results"]}
        assert "fir" in types

    def test_search_by_fir_id(self, service: NetworkService) -> None:
        result = service.search("FIR001")
        assert result["total"] >= 1
        assert any(r["entity_id"] == "FIR001" for r in result["results"])

    def test_search_by_station_name(self, service: NetworkService) -> None:
        result = service.search("Central")
        assert result["total"] >= 1
        types = {r["entity_type"] for r in result["results"]}
        assert "station" in types

    def test_search_by_district_name(self, service: NetworkService) -> None:
        result = service.search("Bengaluru")
        assert result["total"] >= 1
        types = {r["entity_type"] for r in result["results"]}
        assert "district" in types

    def test_search_no_pii(self, service: NetworkService) -> None:
        result = service.search("P000")
        for r in result["results"]:
            for field in ("full_name", "dob", "phone", "email", "address"):
                assert field not in r.get("description", "")

    def test_search_deterministic_order(self, service: NetworkService) -> None:
        r1 = service.search("FIR")
        r2 = service.search("FIR")
        assert r1["results"] == r2["results"]

    def test_search_limit(self, service: NetworkService) -> None:
        result = service.search("FIR", limit=1)
        assert len(result["results"]) <= 1

    def test_search_case_insensitive(self, service: NetworkService) -> None:
        r_lower = service.search("central")
        r_upper = service.search("CENTRAL")
        assert r_lower["total"] == r_upper["total"]


# ===================================================================
# Service-layer tests — Co-accused edge derivation (static method)
# ===================================================================


class TestCoAccusedDerivation:
    def test_empty_map(self) -> None:
        edges = NetworkService._derive_co_accused_edges({})
        assert edges == []

    def test_single_accused_no_edges(self) -> None:
        edges = NetworkService._derive_co_accused_edges({"F1": ["A1"]})
        assert edges == []

    def test_two_accused_one_edge(self) -> None:
        edges = NetworkService._derive_co_accused_edges({"F1": ["A1", "A2"]})
        assert len(edges) == 1
        e = edges[0]
        assert e["edge_type"] == "co_accused"
        assert sorted({e["source"], e["target"]}) == ["person:A1", "person:A2"]
        assert e["properties"]["shared_fir_count"] == 1

    def test_three_accused_three_pairs(self) -> None:
        edges = NetworkService._derive_co_accused_edges(
            {"F1": ["A1", "A2", "A3"]}
        )
        pairs = {
            frozenset({e["source"], e["target"]}) for e in edges
        }
        assert pairs == {
            frozenset({"person:A1", "person:A2"}),
            frozenset({"person:A1", "person:A3"}),
            frozenset({"person:A2", "person:A3"}),
        }

    def test_shared_firs_aggregation(self) -> None:
        edges = NetworkService._derive_co_accused_edges({
            "F1": ["A1", "A2"],
            "F2": ["A1", "A2"],
            "F3": ["A1", "A2"],
        })
        assert len(edges) == 1
        assert edges[0]["properties"]["shared_fir_count"] == 3
        assert sorted(edges[0]["properties"]["fir_ids"]) == ["F1", "F2", "F3"]

    def test_no_self_edges(self) -> None:
        edges = NetworkService._derive_co_accused_edges(
            {"F1": ["A1", "A1", "A2"]}
        )
        for e in edges:
            assert e["source"] != e["target"]

    def test_deterministic_source_target(self) -> None:
        edges = NetworkService._derive_co_accused_edges({"F1": ["B2", "A1"]})
        e = edges[0]
        assert e["source"] == "person:A1"
        assert e["target"] == "person:B2"


# ===================================================================
# API tests — use dependency overrides to inject fake repos
# ===================================================================


def _build_fake_repos() -> RepositoryCollection:
    """Build a RepositoryCollection backed by the same fake repos used
    in service tests."""
    firs = [
        _make_fir("FIR001", "FIR/001/2025", accused_ids=("P000003", "P000004")),
        _make_fir("FIR002", "FIR/002/2025", accused_ids=("P000003", "P000005"),
                  crime_head="Assault"),
    ]
    stations = [_make_station("PS0001", "Central Station", 1, "Bengaluru Urban")]
    districts = [_make_district(1, "Bengaluru Urban")]
    return RepositoryCollection(
        districts=FakeDistrictRepository(districts),
        stations=FakeStationRepository(stations),
        people=None,  # type: ignore[arg-type]
        firs=FakeFIRRepository(firs),
        arrests=None,  # type: ignore[arg-type]
        chargesheets=None,  # type: ignore[arg-type]
    )


def _override_repos(repos: RepositoryCollection) -> None:
    app.dependency_overrides[get_repositories] = lambda: repos


def _clear_overrides() -> None:
    app.dependency_overrides.clear()


class TestNetworkGraphAPI:
    def test_graph_endpoint_returns_200(self) -> None:
        repos = _build_fake_repos()
        _override_repos(repos)
        try:
            client = TestClient(app)
            resp = client.get(f"{settings.API_PREFIX}/network/graph")
            assert resp.status_code == 200
            body = resp.json()
            assert "nodes" in body
            assert "edges" in body
            assert "metadata" in body
        finally:
            _clear_overrides()

    def test_graph_response_schema(self) -> None:
        repos = _build_fake_repos()
        _override_repos(repos)
        try:
            client = TestClient(app)
            resp = client.get(f"{settings.API_PREFIX}/network/graph")
            body = resp.json()
            meta = body["metadata"]
            assert isinstance(meta["node_count"], int)
            assert isinstance(meta["edge_count"], int)
            assert isinstance(meta["truncated"], bool)
            assert isinstance(meta["filters_applied"], dict)
        finally:
            _clear_overrides()

    def test_graph_with_district_filter(self) -> None:
        repos = _build_fake_repos()
        _override_repos(repos)
        try:
            client = TestClient(app)
            resp = client.get(
                f"{settings.API_PREFIX}/network/graph",
                params={"district": "Nonexistent"},
            )
            assert resp.status_code == 200
            body = resp.json()
            assert body["metadata"]["node_count"] == 0
        finally:
            _clear_overrides()

    def test_graph_with_crime_head_filter(self) -> None:
        repos = _build_fake_repos()
        _override_repos(repos)
        try:
            client = TestClient(app)
            resp = client.get(
                f"{settings.API_PREFIX}/network/graph",
                params={"crime_head": "Theft"},
            )
            assert resp.status_code == 200
        finally:
            _clear_overrides()

    def test_graph_with_date_range(self) -> None:
        repos = _build_fake_repos()
        _override_repos(repos)
        try:
            client = TestClient(app)
            resp = client.get(
                f"{settings.API_PREFIX}/network/graph",
                params={
                    "start_date": "2025-01-01",
                    "end_date": "2025-12-31",
                },
            )
            assert resp.status_code == 200
        finally:
            _clear_overrides()


class TestNetworkEntityDetailAPI:
    def test_entity_detail_fir(self) -> None:
        repos = _build_fake_repos()
        _override_repos(repos)
        try:
            client = TestClient(app)
            resp = client.get(
                f"{settings.API_PREFIX}/network/entities/fir/FIR001",
            )
            assert resp.status_code == 200
            body = resp.json()
            assert body["entity_type"] == "fir"
        finally:
            _clear_overrides()

    def test_entity_detail_station(self) -> None:
        repos = _build_fake_repos()
        _override_repos(repos)
        try:
            client = TestClient(app)
            resp = client.get(
                f"{settings.API_PREFIX}/network/entities/station/PS0001",
            )
            assert resp.status_code == 200
            body = resp.json()
            assert body["entity_type"] == "station"
        finally:
            _clear_overrides()

    def test_entity_detail_district(self) -> None:
        repos = _build_fake_repos()
        _override_repos(repos)
        try:
            client = TestClient(app)
            resp = client.get(
                f"{settings.API_PREFIX}/network/entities/district/1",
            )
            assert resp.status_code == 200
            body = resp.json()
            assert body["entity_type"] == "district"
        finally:
            _clear_overrides()

    def test_entity_detail_person(self) -> None:
        repos = _build_fake_repos()
        _override_repos(repos)
        try:
            client = TestClient(app)
            resp = client.get(
                f"{settings.API_PREFIX}/network/entities/person/P000003",
            )
            assert resp.status_code == 200
        finally:
            _clear_overrides()

    def test_entity_detail_invalid_type(self) -> None:
        repos = _build_fake_repos()
        _override_repos(repos)
        try:
            client = TestClient(app)
            resp = client.get(
                f"{settings.API_PREFIX}/network/entities/vehicle/V001",
            )
            assert resp.status_code == 422
        finally:
            _clear_overrides()

    def test_entity_detail_not_found(self) -> None:
        repos = _build_fake_repos()
        _override_repos(repos)
        try:
            client = TestClient(app)
            resp = client.get(
                f"{settings.API_PREFIX}/network/entities/fir/NONEXISTENT",
            )
            assert resp.status_code == 404
        finally:
            _clear_overrides()

    def test_entity_detail_no_pii(self) -> None:
        repos = _build_fake_repos()
        _override_repos(repos)
        try:
            client = TestClient(app)
            resp = client.get(
                f"{settings.API_PREFIX}/network/entities/person/P000003",
            )
            if resp.status_code == 200:
                body = resp.json()
                props = body.get("properties", {})
                for field in ("full_name", "dob", "phone", "email", "address"):
                    assert field not in props
        finally:
            _clear_overrides()


class TestNetworkSearchAPI:
    def test_search_valid_query(self) -> None:
        repos = _build_fake_repos()
        _override_repos(repos)
        try:
            client = TestClient(app)
            resp = client.get(
                f"{settings.API_PREFIX}/network/search",
                params={"q": "FIR"},
            )
            assert resp.status_code == 200
            body = resp.json()
            assert "results" in body
            assert "total" in body
        finally:
            _clear_overrides()

    def test_search_short_query_rejected(self) -> None:
        repos = _build_fake_repos()
        _override_repos(repos)
        try:
            client = TestClient(app)
            resp = client.get(
                f"{settings.API_PREFIX}/network/search",
                params={"q": "A"},
            )
            assert resp.status_code == 422
        finally:
            _clear_overrides()

    def test_search_empty_results(self) -> None:
        repos = _build_fake_repos()
        _override_repos(repos)
        try:
            client = TestClient(app)
            resp = client.get(
                f"{settings.API_PREFIX}/network/search",
                params={"q": "ZZZZNOTEXIST"},
            )
            assert resp.status_code == 200
            body = resp.json()
            assert body["total"] == 0
            assert body["results"] == []
        finally:
            _clear_overrides()

    def test_search_limit_parameter(self) -> None:
        repos = _build_fake_repos()
        _override_repos(repos)
        try:
            client = TestClient(app)
            resp = client.get(
                f"{settings.API_PREFIX}/network/search",
                params={"q": "FIR", "limit": 2},
            )
            assert resp.status_code == 200
            body = resp.json()
            assert len(body["results"]) <= 2
        finally:
            _clear_overrides()

    def test_search_response_schema(self) -> None:
        repos = _build_fake_repos()
        _override_repos(repos)
        try:
            client = TestClient(app)
            resp = client.get(
                f"{settings.API_PREFIX}/network/search",
                params={"q": "FIR"},
            )
            body = resp.json()
            for r in body["results"]:
                assert "entity_id" in r
                assert "entity_type" in r
                assert "label" in r
                assert "description" in r
        finally:
            _clear_overrides()
