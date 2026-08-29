"""PostgreSQL connection management for production persistence.

Uses psycopg2 with connection pooling when PostgreSQL is enabled.
Connection string comes from environment variables via Settings.

This module is the single source of truth for PostgreSQL connectivity.
All PostgreSQL repositories depend on this module.
"""

import contextlib
import logging
from typing import Any, Generator, Optional

try:
    import psycopg2
    import psycopg2.extras
    from psycopg2.pool import ThreadedConnectionPool
except ImportError:
    psycopg2 = None
    ThreadedConnectionPool = None

logger = logging.getLogger(__name__)

_pool: Optional[Any] = None


def init_pool(
    dsn: str,
    minconn: int = 1,
    maxconn: int = 10,
    connect_timeout: int = 5,
) -> None:
    """Initialize the connection pool. Call once at startup."""
    global _pool
    if _pool is not None:
        logger.warning("Connection pool already initialized; ignoring re-init")
        return
    if psycopg2 is None or ThreadedConnectionPool is None:
        logger.warning("psycopg2 is not installed; PostgreSQL connection pool cannot be initialized")
        return
    if "connect_timeout" not in dsn:
        sep = "&" if "?" in dsn else "?"
        dsn = f"{dsn}{sep}connect_timeout={connect_timeout}"
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
def get_connection() -> Generator[Any, None, None]:
    """Check out a connection from the pool and return it on exit."""
    if _pool is None:
        raise RuntimeError(
            "PostgreSQL connection pool is not initialized. "
            "Call init_pool() before acquiring connections."
        )
    conn = _pool.getconn()
    try:
        yield conn
    finally:
        _pool.putconn(conn)


@contextlib.contextmanager
def get_cursor(
    commit: bool = False,
    cursor_factory: Any = None,
) -> Generator[Any, None, None]:
    """Context manager for obtaining a database cursor."""
    if cursor_factory is None and psycopg2 is not None:
        cursor_factory = psycopg2.extras.RealDictCursor

    with get_connection() as conn:
        cursor_kwargs = {}
        if cursor_factory is not None:
            cursor_kwargs["cursor_factory"] = cursor_factory
        cur = conn.cursor(**cursor_kwargs)
        try:
            yield cur
            if commit:
                conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            cur.close()
