"""Admin/audit API schemas.

The audit read API returns persistable, allowlisted audit fields only —
never JWTs, secrets, PII, or request/response bodies.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class AuditEventItem(BaseModel):
    """A single audit event as persisted to ``audit_events``."""

    event_id: str
    event_timestamp: str | None = None
    request_id: str
    user_id: str | None = None
    role: str | None = None
    http_method: str
    route: str
    action: str
    resource_type: str
    resource_id: str | None = None
    outcome: str
    status_code: int
    schema_version: int = 1


class AuditEventPage(BaseModel):
    """Paginated audit event listing."""

    items: list[AuditEventItem] = Field(default_factory=list)
    page: int = 1
    page_size: int = 50
    total: int = 0
    total_pages: int = 1