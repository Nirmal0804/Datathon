"""Audit service for the crime analytics backend.

Responsible for:
- Converting AuditEvent dataclasses to persistable dicts
- Field allowlisting (only explicitly safe fields are persisted)
- Delegating persistence to the configured AuditRepository

The audit service is a thin persistence wrapper. Route classification
and event construction happen in the AuditMiddleware (core/audit.py).
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from app.core.audit import AuditEvent
from app.database.repositories.protocols import AuditRepository

logger = logging.getLogger("crime_analytics.audit")

# Module-level singleton (initialized at startup)
_repo: AuditRepository | None = None


def init_audit_repository(repo: AuditRepository) -> None:
    """Initialize the global audit repository. Called once at startup."""
    global _repo
    _repo = repo
    logger.info("Audit repository initialized: %s", type(repo).__name__)


def write_audit_event(event: AuditEvent) -> None:
    """Persist an audit event. Called by AuditMiddleware.

    Fail-open policy: if persistence fails, a CRITICAL log is emitted
    but the original request is never blocked.
    """
    if _repo is None:
        logger.critical(
            "AUDIT_WRITE_ATTEMPT_WITH_NO_REPOSITORY request_id=%s route=%s",
            event.request_id,
            event.route,
        )
        return

    # Field allowlisting: only explicitly safe fields are persisted.
    # No JWT, no secrets, no PII, no request/response bodies.
    record: dict[str, Any] = {
        "event_id": event.event_id,
        "event_timestamp": event.event_timestamp,
        "request_id": event.request_id,
        "user_id": event.user_id,
        "http_method": event.http_method,
        "route": event.route,
        "action": event.action,
        "resource_type": event.resource_type,
        "resource_id": event.resource_id,
        "outcome": event.outcome,
        "status_code": event.status_code,
        "schema_version": event.schema_version,
    }

    try:
        _repo.append(record)
    except Exception:
        # Fail-open: never block the original request.
        # CRITICAL ensures operational visibility.
        logger.critical(
            "AUDIT_PERSISTENCE_FAILURE request_id=%s route=%s action=%s outcome=%s status=%d",
            event.request_id,
            event.route,
            event.action,
            event.outcome,
            event.status_code,
            exc_info=True,
        )
