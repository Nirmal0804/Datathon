-- Production audit logging schema — add identity role
-- Migration: 004_audit_role
-- Target: Supabase PostgreSQL
--
-- Purpose: Add the resolved application role (server-side RBAC) to the
-- audit trail so security forensic queries can answer "who (role)
-- accessed what". The role is resolved by the backend from the verified
-- Supabase Auth JWT claim paths; it is never supplied by the client.
--
-- Non-destructive: additive column only. Existing rows keep NULL role,
-- matching identities authenticated before RBAC role resolution shipped.
--
-- RLS: remains deny-by-default (see 002_audit_events.sql). This column
-- inherits the same protections.

-- =====================================================================
-- Audit events — add role
-- =====================================================================

ALTER TABLE audit_events
    ADD COLUMN IF NOT EXISTS role TEXT;

COMMENT ON COLUMN audit_events.role IS
    'Application role resolved server-side for the authenticated subject '
    '(FIELD_OFFICER, ANALYST, ADMIN). NULL for anonymous requests or '
    'pre-RBAC events.';

-- Supporting index for role-based audit queries
CREATE INDEX IF NOT EXISTS idx_audit_events_role
    ON audit_events (role);