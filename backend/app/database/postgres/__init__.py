"""PostgreSQL connection management for production persistence.

Uses psycopg2 with connection pooling. Connection string comes from
environment variables via Settings (never hardcoded).

This module is the single source of truth for PostgreSQL connectivity.
All PostgreSQL repositories depend on this module.
"""

import contextlib
import logging
from typing import Any, Generator, Optional

import psycopg2
import psycopg2.extras
from psycopg2.pool import ThreadedConnectionPool

logger = logging.getLogger(__name__)

_pool: Optional[ThreadedConnectionPool] = None


def init_pool(
    dsn: str,
    minconn: int = 1,
    maxconn: int = 10,
) -> None:
    """Initialize the connection pool. Call once at startup."""
    global _pool
    if _pool is not None:
        logger.warning("Connection pool already initialized; ignoring re-init")
        return
    _pool = ThreadedConnectionPool(minconn, maxconn, dsn)
    logger.info("PostgreSQL connection pool initialized (min=%d, max=%d)", minconn, maxconn)


def close_pool() -> None:
    """Close all connections in the pool. Call at shutdown."""
    global _pool
    if _pool is None:
        return
    _pool.closeall()
    _pool = None
    logger.info("PostgreSQL connection pool closed")


@contextlib.contextmanager
def get_connection() -> Generator[psycopg2.extensions.connection, None, None]:
    """Get a connection from the pool. Returns it to the pool on exit."""
    if _pool is None:
        raise RuntimeError("PostgreSQL connection pool not initialized. Call init_pool() first.")
    conn = _pool.getconn()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        _pool.putconn(conn)


@contextlib.contextmanager
def get_cursor(
    cursor_factory: Any = psycopg2.extras.RealDictCursor,
) -> Generator[psycopg2.extensions.cursor, None, None]:
    """Get a cursor from a pooled connection. Commits on clean exit."""
    with get_connection() as conn:
        cur = conn.cursor(cursor_factory=cursor_factory)
        try:
            yield cur
        finally:
            cur.close()


def execute_query(
    sql: str,
    params: Optional[tuple] = None,
) -> list[dict[str, Any]]:
    """Execute a SELECT query and return rows as list of dicts."""
    with get_cursor() as cur:
        cur.execute(sql, params)
        return [dict(row) for row in cur.fetchall()]


def execute_one(
    sql: str,
    params: Optional[tuple] = None,
) -> Optional[dict[str, Any]]:
    """Execute a SELECT query and return a single row or None."""
    with get_cursor() as cur:
        cur.execute(sql, params)
        row = cur.fetchone()
        return dict(row) if row else None


def execute_write(
    sql: str,
    params: Optional[tuple] = None,
) -> None:
    """Execute an INSERT/UPDATE/DELETE statement."""
    with get_cursor() as cur:
        cur.execute(sql, params)


def execute_many(
    sql: str,
    params_list: list[tuple],
) -> None:
    """Execute a statement with many parameter sets."""
    with get_cursor() as cur:
        psycopg2.extras.execute_batch(cur, sql, params_list, page_size=500)
