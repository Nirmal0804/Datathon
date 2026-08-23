-- Production audit logging schema for Karnataka Police Crime Analytics
-- Migration: 002_audit_events
-- Target: Supabase PostgreSQL
--
-- Purpose: Durable, append-only security audit trail for authenticated
-- access to operational resources. Records who accessed what, when,
-- and with what outcome — without storing JWTs, secrets, PII,
-- response bodies, or raw request payloads.
--
-- This migration is non-destructive: no existing tables, columns,
-- or data are modified.
--
-- RLS: Direct browser access to audit_events must remain deny-by-default
-- until authoritative RBAC/RLS policies are supplied. The backend's
-- PostgreSQL connection writes audit events via the trusted backend path.

-- =====================================================================
-- Audit events
-- =====================================================================

CREATE TABLE audit_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    request_id      TEXT NOT NULL,
    user_id         TEXT,
    http_method     TEXT NOT NULL,
    route           TEXT NOT NULL,
    action          TEXT NOT NULL,
    resource_type   TEXT NOT NULL,
    resource_id     TEXT,
    outcome         TEXT NOT NULL,
    status_code     INTEGER NOT NULL,
    client_info     JSONB,
    schema_version  INTEGER NOT NULL DEFAULT 1
);

COMMENT ON TABLE audit_events IS 'Append-only security audit trail for authenticated API access';
COMMENT ON COLUMN audit_events.id IS 'Unique audit event identifier (UUID v4)';
COMMENT ON COLUMN audit_events.event_timestamp IS 'UTC timestamp when the HTTP request/response cycle completed';
COMMENT ON COLUMN audit_events.request_id IS 'Correlation ID from X-Request-ID header';
COMMENT ON COLUMN audit_events.user_id IS 'Verified authenticated subject (JWT sub claim). NULL for anonymous/public requests.';
COMMENT ON COLUMN audit_events.http_method IS 'HTTP method (GET, POST, etc.)';
COMMENT ON COLUMN audit_events.route IS 'Normalized route template (e.g. /api/v1/stations/{station_id})';
COMMENT ON COLUMN audit_events.action IS 'Deterministic action classification: READ, LIST, SEARCH, EXPORT';
COMMENT ON COLUMN audit_events.resource_type IS 'Deterministic resource type (e.g. fir, district, station, network_graph)';
COMMENT ON COLUMN audit_events.resource_id IS 'Safe resource identifier where appropriate (e.g. FIR ID, district ID). NULL for aggregate/list endpoints.';
COMMENT ON COLUMN audit_events.outcome IS 'Request outcome: SUCCESS, DENIED, FAILURE';
COMMENT ON COLUMN audit_events.status_code IS 'HTTP response status code';
COMMENT ON COLUMN audit_events.client_info IS 'Optional safe metadata (extensible). NOT populated by default.';
COMMENT ON COLUMN audit_events.schema_version IS 'Audit event schema version for future evolution';

-- Indexes for operational audit queries
CREATE INDEX idx_audit_events_timestamp      ON audit_events (event_timestamp);
CREATE INDEX idx_audit_events_user_id        ON audit_events (user_id);
CREATE INDEX idx_audit_events_request_id     ON audit_events (request_id);
CREATE INDEX idx_audit_events_action_resource ON audit_events (action, resource_type);
CREATE INDEX idx_audit_events_outcome        ON audit_events (outcome);

-- =====================================================================
-- RLS: deny-by-default for browser/anonymous access
-- =====================================================================
-- Audit events must NOT be readable through the Supabase Data API.
-- The backend's service-role connection bypasses RLS for writes.
-- This policy ensures no direct browser access to audit data.

ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- No permissive policies → all direct queries are denied by default.
-- The backend writes using a service-role or trusted connection pool
-- that bypasses RLS (Supabase service_role or direct PostgreSQL connection).
