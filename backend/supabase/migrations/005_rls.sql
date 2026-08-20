-- Production row-level security (RLS) for the crime analytics schema
-- Migration: 005_rls
-- Target: Supabase PostgreSQL
--
-- Purpose: Govern direct data access through the Supabase Data API
-- (the ``anon`` / ``authenticated`` roles issued by Supabase Auth).
--
-- IMPORTANT SCOPE: The backend does NOT rely on RLS. The backend's
-- PostgreSQL connection is a privileged service connection that
-- bypasses RLS by design (a database role with table-level privileges,
-- not a Supabase JWT role). RLS is the second, independent control
-- that protects the database if the data API or client SDKs are ever
-- exposed directly.
--
-- Policy decisions (current, revisable):
--   * districts, police_stations — reference/reporting tables:
--       SELECT allowed for any authenticated user; no INSERT/UPDATE/DELETE
--       from the data API.
--   * people, firs, fir_person_roles, arrests, chargesheets,
--     ingestion_batches — operational + PII-bearing tables:
--       deny-by-default (no permissive policies). All access runs
--       through the audit-logged backend API.
--   * audit_events — deny-by-default since migration 002.
--
-- This migration is additive and non-destructive.

-- =====================================================================
-- Reference tables: authenticated users may read
-- =====================================================================

ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE police_stations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_can_select_districts" ON districts;
CREATE POLICY "authenticated_can_select_districts"
    ON districts
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "authenticated_can_select_stations" ON police_stations;
CREATE POLICY "authenticated_can_select_stations"
    ON police_stations
    FOR SELECT
    TO authenticated
    USING (true);

-- No INSERT/UPDATE/DELETE policies → the data API cannot write reference data.

-- =====================================================================
-- Operational + PII-bearing tables: deny-by-default
-- =====================================================================
-- RLS is enabled with NO permissive policies. Direct reads/writes via
-- the Supabase Data API (anon/authenticated roles) are denied, because
-- these tables carry PII (names, identifiers, dates of offense) that must
-- only be served through the audit-logged, permission-checked backend API.

ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE firs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fir_person_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE arrests ENABLE ROW LEVEL SECURITY;
ALTER TABLE chargesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_batches ENABLE ROW LEVEL SECURITY;

-- No policies are created for these tables: default behavior denies all
-- direct access. The backend's privileged connection is unaffected.

-- =====================================================================
-- Audit events (deny-by-default, enforced since 002)
-- =====================================================================
-- Reasserted here for completeness: audit_events remains deny-by-default
-- with no permissive policies.

ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- Verification helpers
-- =====================================================================
-- Run after migrating:
--   SELECT relname, relrowsecurity
--   FROM pg_class
--   WHERE relname IN ('districts','police_stations','people','firs',
--                     'fir_person_roles','arrests','chargesheets',
--                     'ingestion_batches','audit_events')
--   ORDER BY relname;
-- Every table should report rls enabled (relrowsecurity = true).