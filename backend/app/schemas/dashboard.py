"""Pydantic API schemas for the Dashboard module.

These are HTTP response contracts — not internal data models.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class DashboardSummaryResponse(BaseModel):
    """Response schema for GET /api/v1/dashboard/summary."""

    total_firs: int = Field(..., description="Total number of FIR records")
    active_cases: int = Field(
        ..., description="FIRs with status 'Under Investigation'"
    )
    closed_cases: int = Field(..., description="FIRs with status 'Closed'")
    chargesheeted_cases: int = Field(
        ..., description="FIRs with status 'Chargesheeted'"
    )
    untraced_cases: int = Field(..., description="FIRs with status 'Untraced'")
    total_arrests: int = Field(
        ..., description="Total arrest records (scoped to filtered FIRs)"
    )
    total_chargesheets: int = Field(
        ..., description="Total chargesheet records (scoped to filtered FIRs)"
    )
