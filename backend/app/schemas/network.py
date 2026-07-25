"""Network Analysis API schemas.

Privacy-safe response models for the deterministic network graph API.
Person nodes expose only operational metadata — no PII.
"""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Graph nodes
# ---------------------------------------------------------------------------


class GraphNode(BaseModel):
    """A node in the network graph."""

    id: str = Field(..., description="Entity identifier")
    node_type: str = Field(
        ...,
        description="Node type: 'person', 'fir', 'station', or 'district'",
    )
    label: str = Field(
        ...,
        description="Human-readable display label (privacy-safe)",
    )
    properties: dict[str, Any] = Field(
        default_factory=dict,
        description="Additional properties depending on node_type",
    )


# ---------------------------------------------------------------------------
# Graph edges
# ---------------------------------------------------------------------------


class GraphEdge(BaseModel):
    """An edge in the network graph."""

    source: str = Field(..., description="Source node ID")
    target: str = Field(..., description="Target node ID")
    edge_type: str = Field(
        ...,
        description="Edge type: 'accused_in', 'complainant_in', 'victim_of', "
        "'station_fir', 'district_station', 'co_accused'",
    )
    properties: dict[str, Any] = Field(
        default_factory=dict,
        description="Additional edge properties",
    )


# ---------------------------------------------------------------------------
# Graph metadata
# ---------------------------------------------------------------------------


class GraphMetadata(BaseModel):
    """Metadata about the returned graph."""

    node_count: int = Field(..., description="Number of nodes in the response")
    edge_count: int = Field(..., description="Number of edges in the response")
    truncated: bool = Field(
        ...,
        description="Whether the graph was truncated due to bounds",
    )
    filters_applied: dict[str, Any] = Field(
        default_factory=dict,
        description="Filters that were applied to the graph",
    )


# ---------------------------------------------------------------------------
# Graph response
# ---------------------------------------------------------------------------


class NetworkGraphResponse(BaseModel):
    """Response for the network graph endpoint."""

    nodes: list[GraphNode] = Field(..., description="Graph nodes")
    edges: list[GraphEdge] = Field(..., description="Graph edges")
    metadata: GraphMetadata = Field(..., description="Graph metadata")


# ---------------------------------------------------------------------------
# Entity detail
# ---------------------------------------------------------------------------


class NetworkEntityDetail(BaseModel):
    """Privacy-safe entity detail for any node type."""

    entity_id: str = Field(..., description="Entity identifier")
    entity_type: str = Field(..., description="Entity type")
    properties: dict[str, Any] = Field(
        default_factory=dict,
        description="Entity properties (privacy-safe)",
    )


# ---------------------------------------------------------------------------
# Search result
# ---------------------------------------------------------------------------


class NetworkSearchResult(BaseModel):
    """A single search result."""

    entity_id: str = Field(..., description="Entity identifier")
    entity_type: str = Field(..., description="Entity type")
    label: str = Field(..., description="Display label")
    description: str = Field("", description="Additional context")


class NetworkSearchResponse(BaseModel):
    """Response for the network search endpoint."""

    results: list[NetworkSearchResult] = Field(
        default_factory=list,
        description="Search results",
    )
    total: int = Field(..., description="Total number of results")


# ---------------------------------------------------------------------------
# Error response
# ---------------------------------------------------------------------------


class NetworkErrorResponse(BaseModel):
    """Structured error response for network endpoints."""

    error: dict[str, str] = Field(
        ...,
        description="Error details with code, message, request_id",
    )
