-- Production index addition for Karnataka Police Crime Analytics
-- Migration: 003_indexes
-- Target: Supabase PostgreSQL
--
-- Purpose: Add a single justified index for an actual production query.
--
-- Justification
-- -------------
-- PostgresFIRRepository.list_by_incident_date_range and list_filtered
-- filter FIRs with date predicates:
--
--     (f.incident_date AT TIME ZONE 'UTC')::date >= %s
--     (f.incident_date AT TIME ZONE 'UTC')::date <= %s
--
-- `firs.incident_date` is TIMESTAMPTZ. Its plain `::date` cast depends on
-- the session timezone (STABLE, not IMMUTABLE) and is therefore rejected
-- inside an index expression; it is also non-sargable for the plain B-tree
-- index on incident_date. Casting to UTC first yields an IMMUTABLE
-- expression `(incident_date AT TIME ZONE 'UTC')::date` that both matches
-- the repository predicate and supports an index range scan.
--
-- This is the only new index introduced: every other WHERE / JOIN /
-- ORDER BY / lookup column used by the PostgreSQL repositories is
-- already covered by indexes created in migration 001.

-- =====================================================================
-- firs: expression index for date-range queries
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_firs_incident_date_date
    ON firs ((CAST(incident_date AT TIME ZONE 'UTC' AS date)));

COMMENT ON INDEX idx_firs_incident_date_date IS
    'Supports (incident_date AT TIME ZONE ''UTC'')::date range predicates '
    'used by list_by_incident_date_range and list_filtered';
