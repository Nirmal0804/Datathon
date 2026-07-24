"""Centralized CSV loading and parsing for the crime analytics data layer.

All six approved CSV files are loaded through this module.  It uses the
Python stdlib ``csv`` module exclusively — no pandas, no external parsers.

Parsing rules:
- INT columns are converted to ``int``.
- FLOAT columns are converted to ``float``.
- DATE columns (``YYYY-MM-DD``) are converted to :class:`datetime.date`.
- DATETIME columns (``YYYY-MM-DD HH:MM``) are converted to
  :class:`datetime.datetime` (timezone-naive, UTC assumed).
- Yes/No boolean columns are converted to ``bool``.
- Whitespace is stripped from all string values.
- Missing files raise ``FileNotFoundError``.
- Malformed rows (wrong column count) raise ``CSVLoadError``.
"""

from __future__ import annotations

import csv
import logging
from datetime import date, datetime
from pathlib import Path

logger = logging.getLogger("crime_analytics.data")

EXPECTED_COLUMNS: dict[str, int] = {
    "districts.csv": 13,
    "stations.csv": 12,
    "people.csv": 12,
    "firs.csv": 16,
    "arrests.csv": 19,
    "chargesheets.csv": 11,
}


class CSVLoadError(Exception):
    """Raised when a CSV file cannot be loaded or has structural issues."""


# ---------------------------------------------------------------------------
# Low-level loader
# ---------------------------------------------------------------------------

def load_csv(file_path: Path) -> list[dict[str, str]]:
    """Read a single CSV file and return a list of row dictionaries.

    Every value is a stripped string.  The caller is responsible for type
    conversion.

    Raises
    ------
    FileNotFoundError
        If *file_path* does not exist.
    CSVLoadError
        If the header row is missing or a row has an unexpected column count.
    """
    if not file_path.exists():
        raise FileNotFoundError(f"CSV file not found: {file_path}")

    file_name = file_path.name
    expected_cols = EXPECTED_COLUMNS.get(file_name)
    rows: list[dict[str, str]] = []

    with open(file_path, newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)

        if reader.fieldnames is None:
            raise CSVLoadError(f"Empty header row in {file_name}")

        for line_num, row in enumerate(reader, start=2):
            actual = len(row)
            if expected_cols is not None and actual != expected_cols:
                raise CSVLoadError(
                    f"Row {line_num} in {file_name}: expected "
                    f"{expected_cols} columns, got {actual}"
                )
            rows.append({k.strip(): (v.strip() if v is not None else "") for k, v in row.items()})

    logger.info("Loaded %d rows from %s", len(rows), file_name)
    return rows


# ---------------------------------------------------------------------------
# Type parsers
# ---------------------------------------------------------------------------

def parse_int(value: str) -> int:
    """Convert a string to ``int``.  Raises ``ValueError`` on failure."""
    try:
        return int(value)
    except (ValueError, TypeError):
        raise ValueError("Invalid integer value")


def parse_float(value: str) -> float:
    """Convert a string to ``float``.  Raises ``ValueError`` on failure."""
    try:
        return float(value)
    except (ValueError, TypeError):
        raise ValueError("Invalid float value")


def parse_date(value: str) -> date:
    """Parse ``YYYY-MM-DD`` into :class:`datetime.date`."""
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        raise ValueError("Invalid date value (expected YYYY-MM-DD)")


def parse_datetime(value: str) -> datetime:
    """Parse ``YYYY-MM-DD HH:MM`` into :class:`datetime.datetime`."""
    try:
        return datetime.strptime(value, "%Y-%m-%d %H:%M")
    except (ValueError, TypeError):
        raise ValueError("Invalid datetime value (expected YYYY-MM-DD HH:MM)")


def parse_bool(value: str) -> bool:
    """Convert ``'Yes'``/``'No'`` (case-insensitive) to ``bool``."""
    normalised = value.strip().lower()
    if normalised in ("yes", "true", "1"):
        return True
    if normalised in ("no", "false", "0"):
        return False
    raise ValueError("Invalid boolean value (expected Yes or No)")


def parse_int_list(value: str) -> list[int]:
    """Parse a comma-separated string of integers into a list."""
    if not value:
        return []
    return [int(item.strip()) for item in value.split(",") if item.strip()]


# ---------------------------------------------------------------------------
# Bulk loader
# ---------------------------------------------------------------------------

_DATA_FILES = (
    "districts.csv",
    "stations.csv",
    "people.csv",
    "firs.csv",
    "arrests.csv",
    "chargesheets.csv",
)


def load_all(data_dir: str | Path) -> dict[str, list[dict[str, str]]]:
    """Load all six approved CSV files from *data_dir*.

    Returns a dictionary keyed by file stem (e.g. ``"firs"``).

    Raises
    ------
    FileNotFoundError
        If *data_dir* or any expected CSV file is missing.
    CSVLoadError
        If any file has structural issues.
    """
    data_path = Path(data_dir)

    if not data_path.is_dir():
        raise FileNotFoundError(f"Data directory not found: {data_path}")

    result: dict[str, list[dict[str, str]]] = {}
    for file_name in _DATA_FILES:
        file_path = data_path / file_name
        stem = file_path.stem
        result[stem] = load_csv(file_path)

    logger.info(
        "Loaded all CSV data: %s",
        ", ".join(f"{k}={len(v)}" for k, v in result.items()),
    )
    return result
