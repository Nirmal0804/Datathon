"""Audit logging for the crime analytics backend.

Provides a deterministic, append-only security audit trail for
authenticated API access. Records who accessed what, when, and
with what outcome — without storing JWTs, secrets, PII, response
bodies, or raw request payloads.

Architecture:
    AuditMiddleware (ASGI)
        ↓
    AuditService
        ↓
    AuditRepository Protocol
        ↓
    PostgreSQL implementation (production) / No-op adapter (development)

Health probes (/health, /health/live, /health/ready) are excluded from
audit events to prevent high-frequency infrastructure probes from
flooding the security audit table.
"""

from __future__ import annotations

import logging
import re
import time
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any

from starlette.types import ASGIApp, Receive, Scope, Send

logger = logging.getLogger("crime_analytics.audit")


# ---------------------------------------------------------------------------
# Outcome classification
# ---------------------------------------------------------------------------


class AuditOutcome(str, Enum):
    """Deterministic request outcome classification."""

    SUCCESS = "SUCCESS"
    DENIED = "DENIED"
    FAILURE = "FAILURE"


# ---------------------------------------------------------------------------
# Audit event model
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class AuditEvent:
    """Immutable audit event record.

    All fields are explicitly allowlisted. No JWTs, secrets, PII,
    request bodies, response bodies, or raw search text are stored.
    """

    event_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    event_timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    request_id: str = ""
    user_id: str | None = None
    http_method: str = ""
    route: str = ""
    action: str = ""
    resource_type: str = ""
    resource_id: str | None = None
    outcome: str = AuditOutcome.SUCCESS.value
    status_code: int = 200
    schema_version: int = 1


# ---------------------------------------------------------------------------
# Route classification taxonomy
# ---------------------------------------------------------------------------

# Deterministic mapping: normalized route template → (action, resource_type)
# Only explicitly classified routes are audited. Unknown routes are skipped.

_ROUTE_CLASSIFICATIONS: dict[str, tuple[str, str]] = {
    "/api/v1/dashboard/summary": ("READ", "dashboard_summary"),
    "/api/v1/map/field/cases": ("LIST", "fir"),
    "/api/v1/map/field/case/{fir_identifier}": ("READ", "fir"),
    "/api/v1/map/field/filters": ("READ", "field_filters"),
    "/api/v1/map/field/hotspots": ("READ", "hotspot"),
    "/api/v1/map/intelligence/analytics": ("READ", "crime_map"),
    "/api/v1/map/intelligence/heatmap": ("READ", "crime_map"),
    "/api/v1/map/intelligence/clusters": ("READ", "crime_map"),
    "/api/v1/map/intelligence/hotspots": ("READ", "hotspot"),
    "/api/v1/map/intelligence/district-comparison": ("READ", "district"),
    "/api/v1/map/intelligence/timeline": ("READ", "crime_map"),
    "/api/v1/map/intelligence/export": ("EXPORT", "crime_data"),
    "/api/v1/districts": ("LIST", "district"),
    "/api/v1/districts/{district_id}/intelligence": ("READ", "district"),
    "/api/v1/stations": ("LIST", "station"),
    "/api/v1/stations/{station_id}": ("READ", "station"),
    "/api/v1/network/graph": ("READ", "network_graph"),
    "/api/v1/network/entities/{entity_type}/{entity_id}": ("READ", "network_entity"),
    "/api/v1/network/search": ("SEARCH", "network"),
    "/api/v1/auth/me": ("READ", "authenticated_identity"),
}

# Patterns for dynamic path segments (used for normalization + resource ID extraction)
_DYNAMIC_SEGMENT_PATTERNS: list[tuple[re.Pattern, str]] = [
    (re.compile(r"^/api/v1/map/field/case/[^/]+$"), "/api/v1/map/field/case/{fir_identifier}"),
    (re.compile(r"^/api/v1/districts/\d+/intelligence$"), "/api/v1/districts/{district_id}/intelligence"),
    (re.compile(r"^/api/v1/stations/[^/]+$"), "/api/v1/stations/{station_id}"),
    (re.compile(r"^/api/v1/network/entities/[^/]+/[^/]+$"), "/api/v1/network/entities/{entity_type}/{entity_id}"),
]

# Patterns for safe resource ID extraction (route → resource_id)
_RESOURCE_ID_EXTRACTORS: list[tuple[re.Pattern, str, str]] = [
    (re.compile(r"^/api/v1/map/field/case/([^/]+)$"), "fir_identifier", "fir"),
    (re.compile(r"^/api/v1/districts/(\d+)/intelligence$"), "district_id", "district"),
    (re.compile(r"^/api/v1/stations/([^/]+)$"), "station_id", "station"),
    (re.compile(r"^/api/v1/network/entities/([^/]+)/([^/]+)$"), "entity_id", "entity"),
]

# Public/infrastructure paths excluded from audit
_EXCLUDED_PATHS: frozenset[str] = frozenset({
    "/health",
    "/health/live",
    "/health/ready",
    "/docs",
    "/redoc",
    "/openapi.json",
})


def normalize_route(path: str) -> str | None:
    """Normalize a request path to a route template.

    Returns the normalized template if it matches a known auditable route,
    or None if the path should not be audited.
    """
    # Exact match first
    if path in _ROUTE_CLASSIFICATIONS:
        return path

    # Dynamic segment matching
    for pattern, template in _DYNAMIC_SEGMENT_PATTERNS:
        if pattern.match(path):
            return template

    return None


def extract_resource_id(path: str) -> str | None:
    """Extract a safe resource identifier from the request path.

    Only explicitly allowlisted identifiers are extracted.
    Returns None for aggregate/list endpoints.
    """
    for pattern, _group_name, _label in _RESOURCE_ID_EXTRACTORS:
        match = pattern.match(path)
        if match:
            # Return the last capture group (the actual identifier)
            return match.group(match.lastindex)
    return None


def classify_route(path: str) -> tuple[str, str, str | None]:
    """Classify a request path into (action, resource_type, resource_id).

    Returns ("", "", None) if the path should not be audited.
    """
    normalized = normalize_route(path)
    if normalized is None:
        return ("", "", None)

    classification = _ROUTE_CLASSIFICATIONS.get(normalized)
    if classification is None:
        return ("", "", None)

    action, resource_type = classification
    resource_id = extract_resource_id(path)
    return (action, resource_type, resource_id)


def should_audit(path: str) -> bool:
    """Return True if this path should generate an audit event."""
    if path in _EXCLUDED_PATHS:
        return False
    return normalize_route(path) is not None


# ---------------------------------------------------------------------------
# Audit middleware (ASGI)
# ---------------------------------------------------------------------------


class AuditMiddleware:
    """ASGI middleware that records security audit events for classified routes.

    Middleware ordering (outermost first):
        RequestID → StructuredLogging → Authentication → **Audit** → SecurityHeaders → CORS → App

    The audit middleware is placed inside AuthenticationMiddleware so that
    the verified identity is available on scope["state"]["authenticated_identity"],
    and wraps the remaining inner middleware/app so that the response status
    code is visible.

    Health probes and unclassified paths are silently skipped.
    Audit persistence failures are logged at CRITICAL level but never
    block the original request (fail-open policy).
    """

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = scope.get("path", "")

        # Skip excluded and unclassified paths
        if not should_audit(path):
            await self.app(scope, receive, send)
            return

        # Capture request metadata
        method = scope.get("method", "")
        request_id = ""
        state = scope.get("state")
        if isinstance(state, dict):
            request_id = state.get("request_id", "")

        # Extract authenticated identity (set by AuthenticationMiddleware)
        user_id = None
        if isinstance(state, dict):
            identity = state.get("authenticated_identity")
            if isinstance(identity, dict):
                user_id = identity.get("user_id")

        # Classify route
        action, resource_type, resource_id = classify_route(path)

        # Track response status
        status_code = 500
        response_started = False

        async def send_wrapper(message):
            nonlocal status_code, response_started
            if message["type"] == "http.response.start":
                status_code = message.get("status", 500)
                response_started = True
            await send(message)

        # Process request, then write audit event
        try:
            await self.app(scope, receive, send_wrapper)
        except Exception:
            status_code = 500
            raise
        finally:
            # Determine outcome
            if status_code == 401:
                outcome = AuditOutcome.DENIED.value
            elif status_code >= 500:
                outcome = AuditOutcome.FAILURE.value
            else:
                outcome = AuditOutcome.SUCCESS.value

            # Construct audit event
            event = AuditEvent(
                request_id=request_id,
                user_id=user_id,
                http_method=method,
                route=path,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                outcome=outcome,
                status_code=status_code,
            )

            # Persist audit event (fail-open with high visibility)
            try:
                from app.services.audit_service import write_audit_event
                write_audit_event(event)
            except Exception:
                logger.critical(
                    "AUDIT_WRITE_FAILURE request_id=%s method=%s route=%s action=%s outcome=%s status=%d",
                    request_id, method, path, action, outcome, status_code,
                )
