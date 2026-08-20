from __future__ import annotations

import logging
from typing import Optional

from app.database.postgres import execute_one, execute_query
from app.database.records import FIRRecord

logger = logging.getLogger(__name__)


class PostgresFIRRepository:
    """PostgreSQL implementation of FIR data access.

    The source CSV contains comma-separated Accused_ID fields.
    In production, these are normalized into the fir_person_roles junction table.
    This repository reconstructs the FIRRecord with accused_ids tuple by joining
    the junction table on every FIR read.
    """

    _COLUMNS = (
        "f.fir_id, f.fir_number, f.station_id, f.district, "
        "f.incident_date, f.fir_date, f.crime_head, f.crime_subhead, "
        "f.bns_sections, f.latitude, f.longitude, f.complainant_id, "
        "f.victim_id, f.investigating_officer, f.status"
    )

    _ACCUSED_SUBQUERY = (
        "(SELECT COALESCE(string_agg(fpr.person_id, ',' ORDER BY fpr.id), '') "
        "FROM fir_person_roles fpr "
        "WHERE fpr.fir_id = f.fir_id AND fpr.role = 'accused')"
    )

    def _build_select(self, where: str = "", params: tuple = (), order: str = "f.fir_id") -> list[dict]:
        sql = (
            f"SELECT {self._COLUMNS}, {self._ACCUSED_SUBQUERY} AS accused_ids_raw "
            f"FROM firs f "
            f"{where} ORDER BY {order}"
        )
        return execute_query(sql, params) if params else execute_query(sql)

    def list_all(self) -> list[FIRRecord]:
        rows = self._build_select()
        return [self._to_record(r) for r in rows]

    def get_by_id(self, fir_id: str) -> Optional[FIRRecord]:
        rows = self._build_select("WHERE f.fir_id = %s", (fir_id,))
        return self._to_record(rows[0]) if rows else None

    def get_by_number(self, fir_number: str) -> Optional[FIRRecord]:
        rows = self._build_select("WHERE f.fir_number = %s", (fir_number,))
        return self._to_record(rows[0]) if rows else None

    def list_by_station(self, station_id: str) -> list[FIRRecord]:
        rows = self._build_select("WHERE f.station_id = %s", (station_id,))
        return [self._to_record(r) for r in rows]

    def list_by_district(self, district: str) -> list[FIRRecord]:
        rows = self._build_select("WHERE f.district = %s", (district,))
        return [self._to_record(r) for r in rows]

    def list_by_incident_date_range(
        self, start_date: str, end_date: str
    ) -> list[FIRRecord]:
        rows = self._build_select(
            "WHERE (f.incident_date AT TIME ZONE 'UTC')::date >= %s "
            "AND (f.incident_date AT TIME ZONE 'UTC')::date <= %s",
            (start_date, end_date),
            order="f.incident_date",
        )
        return [self._to_record(r) for r in rows]

    def list_by_crime_head(self, crime_head: str) -> list[FIRRecord]:
        rows = self._build_select("WHERE f.crime_head = %s", (crime_head,))
        return [self._to_record(r) for r in rows]

    def list_by_status(self, status: str) -> list[FIRRecord]:
        rows = self._build_select("WHERE f.status = %s", (status,))
        return [self._to_record(r) for r in rows]

    def list_filtered(
        self,
        district: str | None = None,
        station_id: str | None = None,
        crime_head: str | None = None,
        status: str | None = None,
        start_date=None,
        end_date=None,
    ) -> list[FIRRecord]:
        conditions: list[str] = []
        params: list = []
        if district is not None:
            conditions.append("f.district = %s")
            params.append(district)
        if station_id is not None:
            conditions.append("f.station_id = %s")
            params.append(station_id)
        if crime_head is not None:
            conditions.append("f.crime_head = %s")
            params.append(crime_head)
        if status is not None:
            conditions.append("f.status = %s")
            params.append(status)
        if start_date is not None:
            conditions.append("(f.incident_date AT TIME ZONE 'UTC')::date >= %s")
            params.append(start_date)
        if end_date is not None:
            conditions.append("(f.incident_date AT TIME ZONE 'UTC')::date <= %s")
            params.append(end_date)
        where = ("WHERE " + " AND ".join(conditions)) if conditions else ""
        rows = self._build_select(where, tuple(params))
        return [self._to_record(r) for r in rows]

    @staticmethod
    def _parse_accused_ids(raw: str) -> tuple[str, ...]:
        """Parse comma-separated accused IDs into a tuple."""
        if not raw or not raw.strip():
            return ()
        return tuple(accused_id.strip() for accused_id in raw.split(",") if accused_id.strip())

    @staticmethod
    def _to_record(row: dict) -> FIRRecord:
        return FIRRecord(
            fir_id=row["fir_id"],
            fir_number=row["fir_number"],
            station_id=row["station_id"],
            district=row["district"],
            incident_date=row["incident_date"],
            fir_date=row["fir_date"],
            crime_head=row["crime_head"],
            crime_subhead=row["crime_subhead"],
            bns_sections=row["bns_sections"],
            latitude=row["latitude"],
            longitude=row["longitude"],
            complainant_id=row["complainant_id"],
            victim_id=row["victim_id"],
            accused_ids=PostgresFIRRepository._parse_accused_ids(
                row.get("accused_ids_raw", "")
            ),
            investigating_officer=row["investigating_officer"],
            status=row["status"],
        )
