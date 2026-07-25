"""PostgreSQL audit event repository.

Append-only persistence for security audit events using the existing
psycopg2 connection pool. All SQL is parameterized. No UPDATE or
DELETE operations exist — audit events are immutable once written.
"""

from __future__ import annotations

import logging

from app.database.postgres import execute_write

logger = logging.getLogger(__name__)

_INSERT_SQL = """
INSERT INTO audit_events (
    id,
    event_timestamp,
    request_id,
    user_id,
    http_method,
    route,
    action,
    resource_type,
    resource_id,
    outcome,
    status_code,
    schema_version
) VALUES (
    %(event_id)s,
    %(event_timestamp)s,
    %(request_id)s,
    %(user_id)s,
    %(http_method)s,
    %(route)s,
    %(action)s,
    %(resource_type)s,
    %(resource_id)s,
    %(outcome)s,
    %(status_code)s,
    %(schema_version)s
)
"""


class PostgresAuditRepository:
    """PostgreSQL-backed audit event repository.

    Append-only: only the ``append`` method exists. No update/delete.
    Uses the shared psycopg2 connection pool from ``app.database.postgres``.
    """

    def append(self, event: dict) -> None:
        """Persist a single audit event via parameterized INSERT."""
        execute_write(_INSERT_SQL, event)
