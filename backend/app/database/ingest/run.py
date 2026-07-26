"""CLI entry point for CSV-to-PostgreSQL ingestion.

Usage:
    python -m app.database.ingest.run <data_dir>

Requires DATABASE_URL environment variable and DATA_BACKEND=postgres.
The ingestion uses a single direct psycopg2 connection (not the pooled
connections used by the running application) to perform the entire
transaction in one shot.
"""

from __future__ import annotations

import logging
import sys
from pathlib import Path

import psycopg2

from app.core.config import settings
from app.database.ingest import ingest_all

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)


def main() -> None:
    """Run CSV ingestion into PostgreSQL."""
    if settings.DATA_BACKEND != "postgres":
        logger.error(
            "DATA_BACKEND must be 'postgres' for ingestion. Current: '%s'",
            settings.DATA_BACKEND,
        )
        sys.exit(1)

    if not settings.DATABASE_URL:
        logger.error("DATABASE_URL environment variable is required")
        sys.exit(1)

    data_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(settings.DATA_DIR)

    if not data_dir.is_dir():
        logger.error("Data directory not found: %s", data_dir)
        sys.exit(1)

    logger.info("Starting ingestion from %s", data_dir)

    conn: psycopg2.extensions.connection | None = None
    try:
        conn = psycopg2.connect(settings.DATABASE_URL)
        summary = ingest_all(conn, data_dir)

        if summary["status"] == "success":
            logger.info(
                "Ingestion completed: %d records across %d tables",
                summary["total_records"],
                len(summary["tables"]),
            )
            for table, info in summary["tables"].items():
                logger.info("  %s: %s", table, info.get("status", "unknown"))
        else:
            logger.error("Ingestion failed: %s", summary.get("error"))
            sys.exit(1)

    finally:
        if conn is not None and not conn.closed:
            conn.close()


if __name__ == "__main__":
    main()
