"""No-op audit event repository for development/testing.

When DATA_BACKEND=csv, audit events are NOT persisted to any durable
store. Each event is logged at INFO level for development visibility.

This adapter is explicitly restricted to development and testing.
Production deployments MUST use PostgresAuditRepository with durable
PostgreSQL persistence.
"""

from __future__ import annotations

import logging

logger = logging.getLogger(__name__)

_WARNED = False


class NoOpAuditRepository:
    """Development-only audit repository that discards events.

    Logs each event at INFO level for development visibility.
    Emits a one-time WARNING that audit events are not being persisted.
    """

    def append(self, event: dict) -> None:
        """Log the audit event instead of persisting it."""
        global _WARNED
        if not _WARNED:
            logger.warning(
                "AUDIT: Using no-op audit repository (DATA_BACKEND=csv). "
                "Audit events are NOT persisted. This is acceptable for "
                "development only — production requires PostgreSQL."
            )
            _WARNED = True

        logger.info(
            "AUDIT_EVENT request_id=%s user_id=%s method=%s route=%s "
            "action=%s resource=%s resource_id=%s outcome=%s status=%d",
            event.get("request_id", "-"),
            event.get("user_id", "-"),
            event.get("http_method", "-"),
            event.get("route", "-"),
            event.get("action", "-"),
            event.get("resource_type", "-"),
            event.get("resource_id", "-"),
            event.get("outcome", "-"),
            event.get("status_code", 0),
        )
