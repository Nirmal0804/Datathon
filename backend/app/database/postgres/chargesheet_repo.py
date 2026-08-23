from __future__ import annotations

import logging
from typing import Optional

from app.database.postgres import execute_one, execute_query
from app.database.records import ChargeSheetRecord

logger = logging.getLogger(__name__)


class PostgresChargeSheetRepository:
    """PostgreSQL implementation of chargesheet data access.

    The source CSV has a denormalized Station_ID field on chargesheets.
    In PostgreSQL, chargesheets link to FIRs via fir_id (UNIQUE),
    and stations are resolved through the FIR → station_id FK.
    """

    _BASE_SELECT = (
        "SELECT cs.chargesheet_id, cs.fir_id, cs.accused_id, "
        "cs.crime_type, cs.sections, cs.investigating_officer, "
        "cs.court, cs.witness_count, cs.evidence_count, "
        "cs.chargesheet_date, cs.status "
        "FROM chargesheets cs"
    )

    def list_all_chargesheets(self) -> list[ChargeSheetRecord]:
        rows = execute_query(f"{self._BASE_SELECT} ORDER BY cs.chargesheet_id")
        return [self._to_record(r) for r in rows]

    def get_by_id(self, chargesheet_id: str) -> Optional[ChargeSheetRecord]:
        row = execute_one(
            f"{self._BASE_SELECT} WHERE cs.chargesheet_id = %s",
            (chargesheet_id,),
        )
        return self._to_record(row) if row else None

    def get_by_fir_id(self, fir_id: str) -> list[ChargeSheetRecord]:
        rows = execute_query(
            f"{self._BASE_SELECT} WHERE cs.fir_id = %s ORDER BY cs.chargesheet_id",
            (fir_id,),
        )
        return [self._to_record(r) for r in rows]

    def list_by_station(self, station_id: str) -> list[ChargeSheetRecord]:
        """List chargesheets for a station, resolved via FIR → station FK."""
        rows = execute_query(
            f"{self._BASE_SELECT} "
            "JOIN firs f ON cs.fir_id = f.fir_id "
            "WHERE f.station_id = %s ORDER BY cs.chargesheet_id",
            (station_id,),
        )
        return [self._to_record(r) for r in rows]

    @staticmethod
    def _to_record(row: dict) -> ChargeSheetRecord:
        return ChargeSheetRecord(
            chargesheet_id=row["chargesheet_id"],
            fir_id=row["fir_id"],
            accused_id=row["accused_id"],
            crime_type=row["crime_type"],
            sections=row["sections"],
            investigating_officer=row["investigating_officer"],
            court=row["court"],
            witness_count=row["witness_count"],
            evidence_count=row["evidence_count"],
            chargesheet_date=row["chargesheet_date"],
            status=row["status"],
        )
