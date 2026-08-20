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
    role,
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
    %(role)s,
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

    Append-only: only the ``append`` method mutates data. ``query`` is
    read-only. Uses the shared psycopg2 connection pool from
    ``app.database.postgres``.
    """

    # Allowed filter columns (exact-match equality operators).
    # No arbitrary column filtering — this is an explicit allowlist.
    _EXACT_FILTERS = (
        "user_id",
        "role",
        "action",
        "resource_type",
        "resource_id",
        "outcome",
        "status_code",
        "route",
        "request_id",
    )

    def append(self, event: dict) -> None:
        """Persist a single audit event via parameterized INSERT."""
        execute_write(_INSERT_SQL, event)

    def query(self, filters: dict, limit: int, offset: int) -> tuple[list[dict], int]:
        """Read audit events with optional filters (read-only).

        Returns ``(rows, total)`` where ``total`` is the number of rows
        matching the filters *without* pagination applied. All filters
        are exact-match and restricted to the allowlist in
        ``_EXACT_FILTERS`` plus the timestamp range filters
        ``start_time``/``end_time``. SQL is fully parameterized.
        """
        where_clauses: list[str] = []
        params: list[object] = []

        for key in self._EXACT_FILTERS:
            value = filters.get(key)
            if value is None or value == "":
                continue
            where_clauses.append(f"{key} = %s")
            params.append(value)

        for key, operator in (("start_time", ">="), ("end_time", "<=")):
            value = filters.get(key)
            if value is None or value == "":
                continue
            where_clauses.append(f"event_timestamp {operator} %s")
            params.append(value)

        where_sql = (" WHERE " + " AND ".join(where_clauses)) if where_clauses else ""

        count_sql = f"SELECT COUNT(*) AS total FROM audit_events{where_sql}"
        query_sql = (
            f"SELECT * FROM audit_events{where_sql} "
            "ORDER BY event_timestamp DESC "
            "LIMIT %s OFFSET %s"
        )

        rows = execute_query(query_sql, (*params, limit, offset))
        count_row = execute_one(count_sql, tuple(params))
        total = int(count_row["total"]) if count_row else 0

        # Keep resource_id/request_id/etc as plain values; convert
        # timestamps to ISO strings for a stable JSON contract.
        for row in rows:
            ts = row.get("event_timestamp")
            if ts is not None and hasattr(ts, "isoformat"):
                row["event_timestamp"] = ts.isoformat()
        return rows, total
