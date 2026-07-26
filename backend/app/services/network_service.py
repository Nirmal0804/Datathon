"""Network Analysis service layer.

Constructs deterministic, privacy-safe network graphs from authoritative
database relationships.  No ML, no risk scoring, no criminal association
inference.

Graph semantics (derived from stored data):
  - Person → FIR edges from fir_person_roles (accused, complainant, victim)
  - Co-accused edges from multiple accused persons in the same FIR
  - FIR → Station edges from firs.station_id
  - Station → District edges from police_stations.district_id
"""

from __future__ import annotations

import itertools
from collections import defaultdict
from datetime import date
from typing import Any, Optional, Protocol, runtime_checkable

from app.database.records import FIRRecord, StationRecord, DistrictRecord


# ---------------------------------------------------------------------------
# Graph bounds
# ---------------------------------------------------------------------------

MAX_GRAPH_NODES = 500
MAX_GRAPH_EDGES = 2000
MAX_SEARCH_RESULTS = 50
MIN_SEARCH_LENGTH = 2


# ---------------------------------------------------------------------------
# Narrow protocol readers (interface segregation)
# ---------------------------------------------------------------------------


@runtime_checkable
class FIRGraphReader(Protocol):
    def list_all(self) -> list[FIRRecord]: ...

    def get_by_id(self, fir_id: str) -> FIRRecord | None: ...

    def get_by_number(self, fir_number: str) -> FIRRecord | None: ...

    def list_filtered(
        self,
        district: str | None = ...,
        station_id: str | None = ...,
        crime_head: str | None = ...,
        status: str | None = ...,
        start_date: date | None = ...,
        end_date: date | None = ...,
    ) -> list[FIRRecord]: ...


@runtime_checkable
class StationGraphReader(Protocol):
    def get_by_id(self, station_id: str) -> StationRecord | None: ...

    def get_by_name(self, station_name: str) -> StationRecord | None: ...

    def list_all(self) -> list[StationRecord]: ...


@runtime_checkable
class DistrictGraphReader(Protocol):
    def get_by_id(self, district_id: int) -> DistrictRecord | None: ...

    def get_by_name(self, district_name: str) -> DistrictRecord | None: ...

    def list_all(self) -> list[DistrictRecord]: ...


# ---------------------------------------------------------------------------
# Network service
# ---------------------------------------------------------------------------


class NetworkService:
    """Builds deterministic, privacy-safe network graphs.

    The service constructs graphs exclusively from stored database
    relationships.  No edges are inferred beyond what the data supports.
    """

    def __init__(
        self,
        fir_reader: FIRGraphReader,
        station_reader: StationGraphReader,
        district_reader: DistrictGraphReader,
    ) -> None:
        self._firs = fir_reader
        self._stations = station_reader
        self._districts = district_reader

    # ------------------------------------------------------------------
    # Graph endpoint
    # ------------------------------------------------------------------

    def get_graph(
        self,
        *,
        district: str | None = None,
        station_id: str | None = None,
        fir_id: str | None = None,
        crime_head: str | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> dict[str, Any]:
        """Build a bounded network graph from filtered FIRs."""
        if fir_id is not None:
            firs = self._get_firs_for_graph(
                district=district,
                station_id=station_id,
                crime_head=crime_head,
                start_date=start_date,
                end_date=end_date,
            )
            fir = self._firs.get_by_id(fir_id)
            if fir is None:
                return self._empty_graph(
                    district=district,
                    station_id=station_id,
                    fir_id=fir_id,
                    crime_head=crime_head,
                    start_date=start_date,
                    end_date=end_date,
                )
            firs = [fir] if fir not in firs else firs
        else:
            firs = self._get_firs_for_graph(
                district=district,
                station_id=station_id,
                crime_head=crime_head,
                start_date=start_date,
                end_date=end_date,
            )

        return self._build_graph(
            firs,
            district=district,
            station_id=station_id,
            fir_id=fir_id,
            crime_head=crime_head,
            start_date=start_date,
            end_date=end_date,
        )

    def _get_firs_for_graph(
        self,
        *,
        district: str | None = None,
        station_id: str | None = None,
        crime_head: str | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> list[FIRRecord]:
        has_filter = any(
            v is not None
            for v in (district, station_id, crime_head, start_date, end_date)
        )
        if has_filter:
            return self._firs.list_filtered(
                district=district,
                station_id=station_id,
                crime_head=crime_head,
                start_date=start_date,
                end_date=end_date,
            )
        return self._firs.list_all()

    # ------------------------------------------------------------------
    # Graph construction
    # ------------------------------------------------------------------

    def _build_graph(
        self,
        firs: list[FIRRecord],
        *,
        district: str | None = None,
        station_id: str | None = None,
        fir_id: str | None = None,
        crime_head: str | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> dict[str, Any]:
        nodes_by_id: dict[str, dict[str, Any]] = {}
        edges: list[dict[str, Any]] = []

        # Track FIR→person relationships for co-accused derivation
        fir_accused_map: dict[str, list[str]] = {}

        for fir in firs:
            # FIR node
            fir_node_id = f"fir:{fir.fir_id}"
            nodes_by_id.setdefault(fir_node_id, {
                "id": fir_node_id,
                "node_type": "fir",
                "label": fir.fir_number,
                "properties": {
                    "fir_id": fir.fir_id,
                    "fir_number": fir.fir_number,
                    "crime_head": fir.crime_head,
                    "crime_subhead": fir.crime_subhead,
                    "status": fir.status,
                    "incident_date": fir.incident_date.isoformat()
                    if fir.incident_date
                    else None,
                    "station_id": fir.station_id,
                    "district": fir.district,
                },
            })

            # Station node
            station_node_id = f"station:{fir.station_id}"
            if station_node_id not in nodes_by_id:
                station = self._stations.get_by_id(fir.station_id)
                nodes_by_id[station_node_id] = {
                    "id": station_node_id,
                    "node_type": "station",
                    "label": station.station_name if station else fir.station_id,
                    "properties": {
                        "station_id": fir.station_id,
                        "station_name": station.station_name
                        if station
                        else fir.station_id,
                        "district_id": station.district_id
                        if station
                        else None,
                        "district_name": station.district_name
                        if station
                        else fir.district,
                    },
                }
                # District → Station edge
                district_node_id = f"district:{station.district_id if station else fir.district}"
                if district_node_id not in nodes_by_id:
                    district_rec = (
                        self._districts.get_by_id(station.district_id)
                        if station
                        else None
                    )
                    nodes_by_id[district_node_id] = {
                        "id": district_node_id,
                        "node_type": "district",
                        "label": district_rec.district_name
                        if district_rec
                        else fir.district,
                        "properties": {
                            "district_id": station.district_id
                            if station
                            else None,
                            "district_name": district_rec.district_name
                            if district_rec
                            else fir.district,
                        },
                    }
                edges.append({
                    "source": district_node_id,
                    "target": station_node_id,
                    "edge_type": "district_station",
                    "properties": {},
                })

            # FIR → Station edge
            edges.append({
                "source": fir_node_id,
                "target": station_node_id,
                "edge_type": "station_fir",
                "properties": {},
            })

            # Complainant person node + edge
            if fir.complainant_id:
                person_node_id = f"person:{fir.complainant_id}"
                nodes_by_id.setdefault(person_node_id, {
                    "id": person_node_id,
                    "node_type": "person",
                    "label": person_node_id,
                    "properties": {"entity_id": fir.complainant_id},
                })
                edges.append({
                    "source": person_node_id,
                    "target": fir_node_id,
                    "edge_type": "complainant_in",
                    "properties": {"role": "complainant"},
                })

            # Victim person node + edge
            if fir.victim_id:
                person_node_id = f"person:{fir.victim_id}"
                nodes_by_id.setdefault(person_node_id, {
                    "id": person_node_id,
                    "node_type": "person",
                    "label": person_node_id,
                    "properties": {"entity_id": fir.victim_id},
                })
                edges.append({
                    "source": person_node_id,
                    "target": fir_node_id,
                    "edge_type": "victim_of",
                    "properties": {"role": "victim"},
                })

            # Accused person nodes + edges
            accused_list = list(fir.accused_ids) if fir.accused_ids else []
            if accused_list:
                fir_accused_map[fir.fir_id] = accused_list
                for accused_id in accused_list:
                    person_node_id = f"person:{accused_id}"
                    nodes_by_id.setdefault(person_node_id, {
                        "id": person_node_id,
                        "node_type": "person",
                        "label": person_node_id,
                        "properties": {"entity_id": accused_id},
                    })
                    edges.append({
                        "source": person_node_id,
                        "target": fir_node_id,
                        "edge_type": "accused_in",
                        "properties": {"role": "accused"},
                    })

        # Derive co-accused edges
        co_accused_edges = self._derive_co_accused_edges(fir_accused_map)
        edges.extend(co_accused_edges)

        # Apply bounds
        truncated = False
        node_list = sorted(nodes_by_id.values(), key=lambda n: (n["node_type"], n["id"]))
        edge_list = sorted(edges, key=lambda e: (e["source"], e["target"], e["edge_type"]))

        if len(node_list) > MAX_GRAPH_NODES:
            node_list = node_list[:MAX_GRAPH_NODES]
            truncated = True
        if len(edge_list) > MAX_GRAPH_EDGES:
            edge_list = edge_list[:MAX_GRAPH_EDGES]
            truncated = True

        # Filter edges to only include nodes that are in the final node set
        valid_node_ids = {n["id"] for n in node_list}
        edge_list = [
            e for e in edge_list
            if e["source"] in valid_node_ids and e["target"] in valid_node_ids
        ]

        return {
            "nodes": node_list,
            "edges": edge_list,
            "metadata": {
                "node_count": len(node_list),
                "edge_count": len(edge_list),
                "truncated": truncated,
                "filters_applied": {
                    k: v
                    for k, v in {
                        "district": district,
                        "station_id": station_id,
                        "fir_id": fir_id,
                        "crime_head": crime_head,
                        "start_date": start_date.isoformat()
                        if start_date
                        else None,
                        "end_date": end_date.isoformat()
                        if end_date
                        else None,
                    }.items()
                    if v is not None
                },
            },
        }

    # ------------------------------------------------------------------
    # Co-accused derivation
    # ------------------------------------------------------------------

    @staticmethod
    def _derive_co_accused_edges(
        fir_accused_map: dict[str, list[str]],
    ) -> list[dict[str, Any]]:
        """Derive co-accused edges from FIR-person-role relationships.

        Rules:
        - A and B appearing as accused in same FIR → one undirected edge
        - Multiple shared FIRs → one edge with shared_fir_count
        - No self-edges, no duplicate reverse edges
        - Deterministic ordering
        """
        pair_to_firs: dict[frozenset[str], list[str]] = defaultdict(list)

        for fir_id, accused_ids in fir_accused_map.items():
            unique_accused = sorted(set(accused_ids))
            for a, b in itertools.combinations(unique_accused, 2):
                pair_key = frozenset((a, b))
                pair_to_firs[pair_key].append(fir_id)

        edges: list[dict[str, Any]] = []
        for pair_key, fir_ids in sorted(
            pair_to_firs.items(), key=lambda item: sorted(item[0])
        ):
            sorted_pair = sorted(pair_key)
            edges.append({
                "source": f"person:{sorted_pair[0]}",
                "target": f"person:{sorted_pair[1]}",
                "edge_type": "co_accused",
                "properties": {
                    "shared_fir_count": len(fir_ids),
                    "fir_ids": sorted(fir_ids),
                },
            })

        return edges

    def _empty_graph(
        self,
        *,
        district: str | None = None,
        station_id: str | None = None,
        fir_id: str | None = None,
        crime_head: str | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> dict[str, Any]:
        return {
            "nodes": [],
            "edges": [],
            "metadata": {
                "node_count": 0,
                "edge_count": 0,
                "truncated": False,
                "filters_applied": {
                    k: v
                    for k, v in {
                        "district": district,
                        "station_id": station_id,
                        "fir_id": fir_id,
                        "crime_head": crime_head,
                        "start_date": start_date.isoformat()
                        if start_date
                        else None,
                        "end_date": end_date.isoformat()
                        if end_date
                        else None,
                    }.items()
                    if v is not None
                },
            },
        }

    # ------------------------------------------------------------------
    # Entity detail
    # ------------------------------------------------------------------

    def get_entity_detail(self, entity_type: str, entity_id: str) -> dict[str, Any] | None:
        """Return privacy-safe entity detail."""
        if entity_type == "fir":
            return self._get_fir_detail(entity_id)
        if entity_type == "station":
            return self._get_station_detail(entity_id)
        if entity_type == "district":
            return self._get_district_detail(entity_id)
        if entity_type == "person":
            return self._get_person_detail(entity_id)
        return None

    def _get_fir_detail(self, fir_id: str) -> dict[str, Any] | None:
        fir = self._firs.get_by_id(fir_id)
        if fir is None:
            return None
        accused_ids = list(fir.accused_ids) if fir.accused_ids else []
        return {
            "entity_id": fir.fir_id,
            "entity_type": "fir",
            "properties": {
                "fir_id": fir.fir_id,
                "fir_number": fir.fir_number,
                "crime_head": fir.crime_head,
                "crime_subhead": fir.crime_subhead,
                "bns_sections": fir.bns_sections,
                "status": fir.status,
                "incident_date": fir.incident_date.isoformat()
                if fir.incident_date
                else None,
                "investigating_officer": fir.investigating_officer,
                "station_id": fir.station_id,
                "district": fir.district,
                "accused_count": len(accused_ids),
                "has_complainant": bool(fir.complainant_id),
                "has_victim": bool(fir.victim_id),
            },
        }

    def _get_station_detail(self, station_id: str) -> dict[str, Any] | None:
        station = self._stations.get_by_id(station_id)
        if station is None:
            return None
        return {
            "entity_id": station.station_id,
            "entity_type": "station",
            "properties": {
                "station_id": station.station_id,
                "station_name": station.station_name,
                "district_id": station.district_id,
                "district_name": station.district_name,
                "zone": station.zone,
                "station_type": station.station_type,
                "personnel_strength": station.personnel_strength,
            },
        }

    def _get_district_detail(self, district_id: str) -> dict[str, Any] | None:
        try:
            did = int(district_id)
        except (ValueError, TypeError):
            return None
        district = self._districts.get_by_id(did)
        if district is None:
            return None
        return {
            "entity_id": str(district.district_id),
            "entity_type": "district",
            "properties": {
                "district_id": district.district_id,
                "district_name": district.district_name,
                "police_range": district.police_range,
            },
        }

    def _get_person_detail(self, person_id: str) -> dict[str, Any] | None:
        # Privacy-safe: only return operational metadata
        # Count FIR links by searching FIRs where this person appears
        firs = self._firs.list_all()
        linked_fir_ids: list[str] = []
        for fir in firs:
            if fir.complainant_id == person_id or fir.victim_id == person_id:
                linked_fir_ids.append(fir.fir_id)
            elif fir.accused_ids and person_id in fir.accused_ids:
                linked_fir_ids.append(fir.fir_id)

        if not linked_fir_ids:
            return None

        # Count co-accused connections
        co_accused_ids: set[str] = set()
        for fir in firs:
            if fir.accused_ids and person_id in fir.accused_ids:
                for other_id in fir.accused_ids:
                    if other_id != person_id:
                        co_accused_ids.add(other_id)

        return {
            "entity_id": person_id,
            "entity_type": "person",
            "properties": {
                "entity_id": person_id,
                "linked_fir_count": len(linked_fir_ids),
                "co_accused_count": len(co_accused_ids),
            },
        }

    # ------------------------------------------------------------------
    # Search
    # ------------------------------------------------------------------

    def search(
        self,
        query: str,
        *,
        limit: int = MAX_SEARCH_RESULTS,
    ) -> dict[str, Any]:
        """Search privacy-safe identifiers and operational fields.

        Searches FIR ID, FIR number, station name, district name, and
        crime head.  Does NOT search person names, phone numbers, or
        other PII.
        """
        if not query or len(query.strip()) < MIN_SEARCH_LENGTH:
            return {"results": [], "total": 0}

        q = query.strip()
        q_lower = q.lower()
        results: list[dict[str, Any]] = []

        # Search FIRs by ID and number
        for fir in self._firs.list_all():
            if q_lower in fir.fir_id.lower() or q_lower in fir.fir_number.lower():
                results.append({
                    "entity_id": fir.fir_id,
                    "entity_type": "fir",
                    "label": fir.fir_number,
                    "description": f"{fir.crime_head} — {fir.status}",
                })

        # Search stations by name
        for station in self._stations.list_all():
            if q_lower in station.station_name.lower():
                results.append({
                    "entity_id": station.station_id,
                    "entity_type": "station",
                    "label": station.station_name,
                    "description": station.district_name,
                })

        # Search districts by name
        for district in self._districts.list_all():
            if q_lower in district.district_name.lower():
                results.append({
                    "entity_id": str(district.district_id),
                    "entity_type": "district",
                    "label": district.district_name,
                    "description": district.police_range,
                })

        # Deterministic ordering: by entity_type, then entity_id
        results.sort(key=lambda r: (r["entity_type"], r["entity_id"]))

        total = len(results)
        if len(results) > limit:
            results = results[:limit]

        return {
            "results": results,
            "total": total,
        }
