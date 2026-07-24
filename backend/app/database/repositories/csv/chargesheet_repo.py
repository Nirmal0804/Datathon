"""CSV-backed chargesheet repository."""

from __future__ import annotations

from typing import List, Optional

from app.database.csv_loader import parse_date, parse_int
from app.database.records import ChargeSheetRecord


class CSVChargeSheetRepository:
    """ChargeSheet repository backed by ``chargesheets.csv``.

    Parameters
    ----------
    rows:
        Pre-parsed CSV rows from ``chargesheets.csv``.
    fir_station_map:
        A mapping of ``FIR_ID → Station_ID`` built from the FIR data.
        Used to resolve the station for each chargesheet via its FIR.
    """

    def __init__(
        self,
        rows: list[dict[str, str]],
        fir_station_map: dict[str, str] | None = None,
    ) -> None:
        self._rows = rows
        self._all: list[ChargeSheetRecord] = []
        self._by_fir: dict[str, ChargeSheetRecord] = {}
        self._by_station: dict[str, list[ChargeSheetRecord]] = {}
        self._build_indices(rows, fir_station_map or {})

    def _build_indices(
        self,
        rows: list[dict[str, str]],
        fir_station_map: dict[str, str],
    ) -> None:
        for row in rows:
            record = self._row_to_record(row)
            self._all.append(record)
            self._by_fir[record.fir_id] = record
            station_id = fir_station_map.get(record.fir_id)
            if station_id is not None:
                self._by_station.setdefault(station_id, []).append(record)

    @staticmethod
    def _row_to_record(row: dict[str, str]) -> ChargeSheetRecord:
        return ChargeSheetRecord(
            chargesheet_id=row["ChargeSheet_ID"],
            fir_id=row["FIR_ID"],
            accused_id=row["Accused_ID"],
            crime_type=row["Crime_Type"],
            sections=row["Sections"],
            investigating_officer=row["Investigating_Officer"],
            court=row["Court"],
            witness_count=parse_int(row["Witness_Count"]),
            evidence_count=parse_int(row["Evidence_Count"]),
            chargesheet_date=parse_date(row["ChargeSheet_Date"]),
            status=row["Status"],
        )

    def get_by_fir_id(self, fir_id: str) -> Optional[ChargeSheetRecord]:
        return self._by_fir.get(fir_id)

    def list_by_station(self, station_id: str) -> List[ChargeSheetRecord]:
        return list(self._by_station.get(station_id, []))

    def list_all_chargesheets(self) -> List[ChargeSheetRecord]:
        return list(self._all)
