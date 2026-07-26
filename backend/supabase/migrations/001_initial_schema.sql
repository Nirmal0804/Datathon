-- Production PostgreSQL schema for Karnataka Police Crime Analytics
-- Migration: 001_initial_schema
-- Target: Supabase PostgreSQL
--
-- Normalization decisions:
--   - firs.Accused_ID (comma-separated) → fir_person_roles junction table
--   - firs.Complainant_ID → fir_person_roles with role='complainant'
--   - firs.Victim_ID → fir_person_roles with role='victim'
--   - Denormalized district text preserved for query convenience but FK chain exists
--   - Source identifiers preserved as UNIQUE constraints for traceability
--
-- Identifier strategy:
--   - Internal SERIAL 'id' as primary key
--   - Source identifiers (District_ID, Station_ID, Person_ID, FIR_ID, etc.)
--     preserved as UNIQUE NOT NULL for ingestion idempotency and traceability

-- =====================================================================
-- Custom types
-- =====================================================================

CREATE TYPE person_role AS ENUM ('complainant', 'victim', 'accused');

-- =====================================================================
-- Districts
-- =====================================================================

CREATE TABLE districts (
    id SERIAL PRIMARY KEY,
    district_id INTEGER UNIQUE NOT NULL,
    district_name TEXT UNIQUE NOT NULL,
    police_range TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'Karnataka',
    population INTEGER NOT NULL,
    area_sq_km INTEGER NOT NULL,
    population_density INTEGER NOT NULL,
    literacy_rate DOUBLE PRECISION NOT NULL,
    urban_population_pct INTEGER NOT NULL,
    rural_population_pct INTEGER NOT NULL,
    police_stations INTEGER NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE districts IS 'Karnataka Police district reference data (31 districts)';
COMMENT ON COLUMN districts.district_id IS 'Source identifier from approved CSV dataset';
COMMENT ON COLUMN districts.district_name IS 'District display name (unique)';

-- =====================================================================
-- Police stations
-- =====================================================================

CREATE TABLE police_stations (
    id SERIAL PRIMARY KEY,
    station_id TEXT UNIQUE NOT NULL,
    station_name TEXT NOT NULL,
    district_id INTEGER NOT NULL,
    district_name TEXT NOT NULL,
    zone TEXT NOT NULL,
    station_type TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    personnel_strength INTEGER NOT NULL,
    patrol_vehicles INTEGER NOT NULL,
    contact_number TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_stations_district FOREIGN KEY (district_id)
        REFERENCES districts(district_id)
);

COMMENT ON TABLE police_stations IS 'Police station reference data (250 stations)';
COMMENT ON COLUMN police_stations.station_id IS 'Source identifier (PS0001-PS0250)';

CREATE INDEX idx_stations_district ON police_stations(district_id);

-- =====================================================================
-- People
-- =====================================================================

CREATE TABLE people (
    id SERIAL PRIMARY KEY,
    person_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    gender TEXT NOT NULL,
    dob DATE NOT NULL,
    age INTEGER NOT NULL,
    occupation TEXT NOT NULL,
    education TEXT NOT NULL,
    marital_status TEXT NOT NULL,
    blood_group TEXT NOT NULL,
    nationality TEXT NOT NULL DEFAULT 'Indian',
    district TEXT NOT NULL,
    station_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_people_station FOREIGN KEY (station_id)
        REFERENCES police_stations(station_id)
);

COMMENT ON TABLE people IS 'Person records (10,000). Contains PII - handle with care.';
COMMENT ON COLUMN people.person_id IS 'Source identifier (P000001-P010000)';
COMMENT ON COLUMN people.full_name IS 'PII - minimize in API responses';

CREATE INDEX idx_people_district ON people(district);
CREATE INDEX idx_people_station ON people(station_id);

-- =====================================================================
-- FIRs (normalized - no comma-separated Accused_ID)
-- =====================================================================

CREATE TABLE firs (
    id SERIAL PRIMARY KEY,
    fir_id TEXT UNIQUE NOT NULL,
    fir_number TEXT UNIQUE NOT NULL,
    station_id TEXT NOT NULL,
    district TEXT NOT NULL,
    incident_date TIMESTAMPTZ NOT NULL,
    fir_date TIMESTAMPTZ NOT NULL,
    crime_head TEXT NOT NULL,
    crime_subhead TEXT NOT NULL,
    bns_sections TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    complainant_id TEXT NOT NULL,
    victim_id TEXT NOT NULL,
    investigating_officer TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_firs_station FOREIGN KEY (station_id)
        REFERENCES police_stations(station_id),
    CONSTRAINT fk_firs_complainant FOREIGN KEY (complainant_id)
        REFERENCES people(person_id),
    CONSTRAINT fk_firs_victim FOREIGN KEY (victim_id)
        REFERENCES people(person_id)
);

COMMENT ON TABLE firs IS 'First Information Reports (5,000). Core transactional table.';
COMMENT ON COLUMN firs.fir_id IS 'Source identifier (FIR2025XXXXX)';
COMMENT ON COLUMN firs.status IS 'Case status: Under Investigation, Closed, Chargesheeted, Untraced';

CREATE INDEX idx_firs_station ON firs(station_id);
CREATE INDEX idx_firs_district ON firs(district);
CREATE INDEX idx_firs_status ON firs(status);
CREATE INDEX idx_firs_crime_head ON firs(crime_head);
CREATE INDEX idx_firs_incident_date ON firs(incident_date);

-- =====================================================================
-- FIR-Person roles (normalized junction table)
-- Replaces comma-separated Accused_ID + Complainant_ID + Victim_ID
-- =====================================================================

CREATE TABLE fir_person_roles (
    id SERIAL PRIMARY KEY,
    fir_id TEXT NOT NULL,
    person_id TEXT NOT NULL,
    role person_role NOT NULL,
    CONSTRAINT fk_fpr_fir FOREIGN KEY (fir_id)
        REFERENCES firs(fir_id),
    CONSTRAINT fk_fpr_person FOREIGN KEY (person_id)
        REFERENCES people(person_id),
    CONSTRAINT uq_fir_person_role UNIQUE (fir_id, person_id, role)
);

COMMENT ON TABLE fir_person_roles IS 'Normalized FIR-person relationships. Replaces CSV comma-separated Accused_ID.';
COMMENT ON COLUMN fir_person_roles.role IS 'Person role: complainant, victim, or accused';

CREATE INDEX idx_fpr_fir ON fir_person_roles(fir_id);
CREATE INDEX idx_fpr_person ON fir_person_roles(person_id);
CREATE INDEX idx_fpr_role ON fir_person_roles(role);

-- =====================================================================
-- Arrests
-- =====================================================================

CREATE TABLE arrests (
    id SERIAL PRIMARY KEY,
    arrest_id TEXT UNIQUE NOT NULL,
    fir_id TEXT NOT NULL,
    person_id TEXT NOT NULL,
    accused_name TEXT NOT NULL,
    gender TEXT NOT NULL,
    age INTEGER NOT NULL,
    district TEXT NOT NULL,
    station_id TEXT NOT NULL,
    arrest_date TIMESTAMPTZ NOT NULL,
    arrest_location TEXT NOT NULL,
    arresting_officer TEXT NOT NULL,
    custody_type TEXT NOT NULL,
    bail_status TEXT NOT NULL,
    recovery_item TEXT NOT NULL,
    recovery_value INTEGER NOT NULL DEFAULT 0,
    medical_examination BOOLEAN NOT NULL DEFAULT FALSE,
    fingerprint_taken BOOLEAN NOT NULL DEFAULT FALSE,
    dna_sample BOOLEAN NOT NULL DEFAULT FALSE,
    photograph_taken BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_arrests_fir FOREIGN KEY (fir_id)
        REFERENCES firs(fir_id),
    CONSTRAINT fk_arrests_person FOREIGN KEY (person_id)
        REFERENCES people(person_id),
    CONSTRAINT fk_arrests_station FOREIGN KEY (station_id)
        REFERENCES police_stations(station_id)
);

COMMENT ON TABLE arrests IS 'Arrest records (2,540). 1:0..1 relationship with FIRs.';
COMMENT ON COLUMN arrests.arrest_id IS 'Source identifier (ARRXXXXX)';

CREATE INDEX idx_arrests_fir ON arrests(fir_id);
CREATE INDEX idx_arrests_person ON arrests(person_id);
CREATE INDEX idx_arrests_station ON arrests(station_id);

-- =====================================================================
-- Chargesheets
-- =====================================================================

CREATE TABLE chargesheets (
    id SERIAL PRIMARY KEY,
    chargesheet_id TEXT UNIQUE NOT NULL,
    fir_id TEXT NOT NULL,
    accused_id TEXT NOT NULL,
    crime_type TEXT NOT NULL,
    sections TEXT NOT NULL,
    investigating_officer TEXT NOT NULL,
    court TEXT NOT NULL,
    witness_count INTEGER NOT NULL,
    evidence_count INTEGER NOT NULL,
    chargesheet_date DATE NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_chargesheets_fir FOREIGN KEY (fir_id)
        REFERENCES firs(fir_id),
    CONSTRAINT fk_chargesheets_accused FOREIGN KEY (accused_id)
        REFERENCES people(person_id)
);

COMMENT ON TABLE chargesheets IS 'Chargesheet records (2,469). Multiple chargesheets may reference the same FIR.';
COMMENT ON COLUMN chargesheets.chargesheet_id IS 'Source identifier (CS2025XXXXX)';

CREATE INDEX idx_chargesheets_fir ON chargesheets(fir_id);
CREATE INDEX idx_chargesheets_accused ON chargesheets(accused_id);

-- =====================================================================
-- Ingestion audit
-- =====================================================================

CREATE TABLE ingestion_batches (
    id SERIAL PRIMARY KEY,
    batch_id TEXT UNIQUE NOT NULL,
    source_type TEXT NOT NULL,
    source_file TEXT NOT NULL,
    ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    records_processed INTEGER NOT NULL,
    records_accepted INTEGER NOT NULL,
    records_rejected INTEGER NOT NULL,
    status TEXT NOT NULL,
    failure_reason TEXT
);

COMMENT ON TABLE ingestion_batches IS 'Audit trail for data ingestion batches';
