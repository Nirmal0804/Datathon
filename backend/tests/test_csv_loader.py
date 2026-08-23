"""Tests for the CSV data loading and parsing layer.

Covers:
- load_csv: happy path, missing file, column count mismatch, empty header
- Type parsers: parse_int, parse_float, parse_date, parse_datetime, parse_bool
- load_all: happy path, missing directory, missing individual file
- Expected row counts and column counts for all six CSV files
"""

from __future__ import annotations

import tempfile
from datetime import date, datetime
from pathlib import Path

import pytest

from app.database.csv_loader import (
    CSVLoadError,
    load_all,
    load_csv,
    parse_bool,
    parse_date,
    parse_datetime,
    parse_float,
    parse_int,
)
from app.core.config import settings

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

FIXTURES_DIR = Path(settings.DATA_DIR)


@pytest.fixture()
def valid_csv(tmp_path: Path) -> Path:
    """Create a minimal valid CSV file for unit tests."""
    p = tmp_path / "test.csv"
    p.write_text("Col_A,Col_B,Col_C\nhello,42,3.14\n", encoding="utf-8")
    return p


@pytest.fixture()
def wrong_column_csv(tmp_path: Path) -> Path:
    """CSV with an unexpected column count."""
    p = tmp_path / "districts.csv"
    p.write_text("a,b\n1,2,3\n", encoding="utf-8")
    return p


@pytest.fixture()
def empty_header_csv(tmp_path: Path) -> Path:
    """CSV with no header (empty file)."""
    p = tmp_path / "test.csv"
    p.write_text("", encoding="utf-8")
    return p


# ---------------------------------------------------------------------------
# load_csv
# ---------------------------------------------------------------------------

class TestLoadCSV:
    def test_returns_list_of_dicts(self, valid_csv: Path) -> None:
        rows = load_csv(valid_csv)
        assert isinstance(rows, list)
        assert len(rows) == 1
        assert rows[0] == {"Col_A": "hello", "Col_B": "42", "Col_C": "3.14"}

    def test_strips_whitespace(self, tmp_path: Path) -> None:
        p = tmp_path / "ws.csv"
        p.write_text(" A , B \n  hello , 42 \n", encoding="utf-8")
        rows = load_csv(p)
        assert rows[0] == {"A": "hello", "B": "42"}

    def test_missing_file_raises(self) -> None:
        with pytest.raises(FileNotFoundError):
            load_csv(Path("/nonexistent/file.csv"))

    def test_wrong_column_count_raises(self, wrong_column_csv: Path) -> None:
        with pytest.raises(CSVLoadError, match="expected.*columns.*got"):
            load_csv(wrong_column_csv)

    def test_empty_header_raises(self, empty_header_csv: Path) -> None:
        with pytest.raises(CSVLoadError, match="Empty header"):
            load_csv(empty_header_csv)

    def test_multiple_rows(self, tmp_path: Path) -> None:
        p = tmp_path / "multi.csv"
        p.write_text("X\n1\n2\n3\n", encoding="utf-8")
        rows = load_csv(p)
        assert len(rows) == 3
        assert [r["X"] for r in rows] == ["1", "2", "3"]


# ---------------------------------------------------------------------------
# Type parsers
# ---------------------------------------------------------------------------

class TestParsers:
    def test_parse_int(self) -> None:
        assert parse_int("42") == 42
        assert parse_int("0") == 0
        with pytest.raises(ValueError):
            parse_int("abc")

    def test_parse_int_error_no_raw_value(self) -> None:
        with pytest.raises(ValueError, match="Invalid integer"):
            parse_int("sensitive_data_123")

    def test_parse_float(self) -> None:
        assert parse_float("3.14") == pytest.approx(3.14)
        with pytest.raises(ValueError):
            parse_float("abc")

    def test_parse_float_error_no_raw_value(self) -> None:
        with pytest.raises(ValueError, match="Invalid float"):
            parse_float("secret_val_9.99")

    def test_parse_date(self) -> None:
        d = parse_date("2025-03-15")
        assert d == date(2025, 3, 15)
        assert isinstance(d, date)

    def test_parse_date_invalid(self) -> None:
        with pytest.raises(ValueError):
            parse_date("not-a-date")

    def test_parse_date_error_no_raw_value(self) -> None:
        with pytest.raises(ValueError, match="Invalid date"):
            parse_date("2025/03/15")

    def test_parse_datetime(self) -> None:
        dt = parse_datetime("2025-03-15 14:30")
        assert dt == datetime(2025, 3, 15, 14, 30)
        assert isinstance(dt, datetime)

    def test_parse_datetime_invalid(self) -> None:
        with pytest.raises(ValueError):
            parse_datetime("2025/03/15")

    def test_parse_datetime_error_no_raw_value(self) -> None:
        with pytest.raises(ValueError, match="Invalid datetime"):
            parse_datetime("15-03-2025 14:30")

    def test_parse_bool_yes(self) -> None:
        assert parse_bool("Yes") is True
        assert parse_bool("yes") is True
        assert parse_bool("YES") is True

    def test_parse_bool_no(self) -> None:
        assert parse_bool("No") is False
        assert parse_bool("no") is False
        assert parse_bool("NO") is False

    def test_parse_bool_invalid(self) -> None:
        with pytest.raises(ValueError):
            parse_bool("maybe")

    def test_parse_bool_error_no_raw_value(self) -> None:
        with pytest.raises(ValueError, match="Invalid boolean"):
            parse_bool("maybe_pii_value")


# ---------------------------------------------------------------------------
# load_all
# ---------------------------------------------------------------------------

class TestLoadAll:
    def test_loads_all_six_files(self) -> None:
        data = load_all(FIXTURES_DIR)
        expected_keys = {"districts", "stations", "people", "firs", "arrests", "chargesheets"}
        assert set(data.keys()) == expected_keys

    def test_expected_row_counts(self) -> None:
        data = load_all(FIXTURES_DIR)
        assert len(data["districts"]) == 31
        assert len(data["stations"]) == 250
        assert len(data["people"]) == 10000
        assert len(data["firs"]) == 5000
        assert len(data["arrests"]) == 2540
        assert len(data["chargesheets"]) == 2469

    def test_expected_column_counts(self) -> None:
        data = load_all(FIXTURES_DIR)
        assert len(data["districts"][0]) == 13
        assert len(data["stations"][0]) == 12
        assert len(data["people"][0]) == 12
        assert len(data["firs"][0]) == 16
        assert len(data["arrests"][0]) == 19
        assert len(data["chargesheets"][0]) == 11

    def test_missing_directory_raises(self) -> None:
        with pytest.raises(FileNotFoundError):
            load_all("/nonexistent/data/dir")

    def test_missing_file_raises(self, tmp_path: Path) -> None:
        with pytest.raises(FileNotFoundError):
            load_all(tmp_path)
