"""Admin API router.

Provides permission-gated administrative endpoints. Currently exposes
the security audit log read API.

All endpoints under ``/api/v1/admin/*`` require the ``ADMIN`` role with
the relevant permission (e.g. ``audit.read``). Access is logged by the
audit middleware itself.
"""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.api.rbac_deps import require_permission
from app.schemas.auth import AuthenticatedIdentity
from app.schemas.audit import AuditEventPage
from app.services.audit_service import query_audit_events

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get(
    "/audit/events",
    response_model=AuditEventPage,
    summary="List security audit events (admin only)",
    description="Returns a paginated, filterable view of security audit "
    "events. Requires the 'audit.read' permission. In deployments where "
    "audit events are not persisted (development CSV backend) this "
    "returns HTTP 503 rather than a fabricated empty list.",
)
async def list_audit_events(
    user_id: Optional[str] = Query(None, description="Filter by user ID (exact)"),
    role: Optional[str] = Query(
        None, description="Filter by application role (exact)"
    ),
    action: Optional[str] = Query(None, description="Filter by action (exact)"),
    resource_type: Optional[str] = Query(
        None, description="Filter by resource type (exact)"
    ),
    outcome: Optional[str] = Query(
        None, description="Filter by outcome: SUCCESS, DENIED, FAILURE"
    ),
    status_code: Optional[int] = Query(None, description="Filter by HTTP status code"),
    route: Optional[str] = Query(None, description="Filter by route (exact)"),
    request_id: Optional[str] = Query(
        None, description="Filter by correlation request ID"
    ),
    start_time: Optional[str] = Query(
        None, description="Include events on/after ISO timestamp (UTC)"
    ),
    end_time: Optional[str] = Query(
        None, description="Include events on/before ISO timestamp (UTC)"
    ),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(50, ge=1, le=200, description="Items per page (max 200)"),
    _identity: AuthenticatedIdentity = Depends(
        require_permission("audit.read")
    ),
) -> AuditEventPage:
    filters = {
        "user_id": user_id,
        "role": role,
        "action": action,
        "resource_type": resource_type,
        "outcome": outcome,
        "status_code": status_code,
        "route": route,
        "request_id": request_id,
        "start_time": start_time,
        "end_time": end_time,
    }
    result = query_audit_events(filters, page=page, page_size=page_size)
    return AuditEventPage(**result)