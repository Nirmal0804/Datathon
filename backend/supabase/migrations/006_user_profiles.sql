-- Production user profiles and role authorization schema
-- Migration: 006_user_profiles
-- Target: Supabase PostgreSQL (Project ref: gcxppkdtbvmleynrzqao)
--
-- Purpose:
--   1. Create public.user_profiles referencing auth.users(id).
--   2. Strict foreign keys to police_stations(station_id TEXT) and districts(district_id INTEGER).
--   3. Row Level Security (RLS) ensuring least privilege and privacy.
--   4. Automatic user profile synchronization via trigger on auth.users.

-- =====================================================================
-- 1. Create user_profiles Table
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    badge_number TEXT,
    role TEXT NOT NULL CHECK (role IN ('FIELD_OFFICER', 'ANALYST', 'ADMIN')),
    police_station_id TEXT REFERENCES public.police_stations(station_id),
    district_id INTEGER REFERENCES public.districts(district_id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.user_profiles IS 'Operational user profiles and departmental role mappings for CrimeIntel.';
COMMENT ON COLUMN public.user_profiles.user_id IS 'References auth.users(id) primary key.';
COMMENT ON COLUMN public.user_profiles.role IS 'Authoritative role: FIELD_OFFICER, ANALYST, ADMIN.';
COMMENT ON COLUMN public.user_profiles.police_station_id IS 'Assigned station identifier (PS0001-PS0250).';
COMMENT ON COLUMN public.user_profiles.district_id IS 'Assigned district identifier (1-31).';

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_station ON public.user_profiles(police_station_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_district ON public.user_profiles(district_id);

-- =====================================================================
-- 2. Row Level Security (RLS)
-- =====================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if already defined
DROP POLICY IF EXISTS "user_profiles_select_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_admin_all" ON public.user_profiles;

-- Authenticated users can read their own profile
CREATE POLICY "user_profiles_select_own"
    ON public.user_profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Authenticated users can update non-role fields of their own profile
CREATE POLICY "user_profiles_update_own"
    ON public.user_profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id
        AND role = (SELECT p.role FROM public.user_profiles p WHERE p.user_id = auth.uid())
    );

-- System administrators can view and manage all profiles
CREATE POLICY "user_profiles_admin_all"
    ON public.user_profiles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'ADMIN'
        )
    );

-- =====================================================================
-- 3. Automatic Profile Creation Trigger on auth.users
-- =====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    assigned_role TEXT;
    user_full_name TEXT;
    user_badge TEXT;
    user_station TEXT;
    user_district INTEGER;
BEGIN
    -- Determine role safely from app_metadata or user_metadata (default: FIELD_OFFICER)
    assigned_role := COALESCE(
        NULLIF(TRIM(NEW.raw_app_meta_data->>'role'), ''),
        NULLIF(TRIM(NEW.raw_user_meta_data->>'role'), ''),
        'FIELD_OFFICER'
    );

    -- Normalize role to valid enum set
    IF UPPER(assigned_role) IN ('FIELD_OFFICER', 'OFFICER') THEN
        assigned_role := 'FIELD_OFFICER';
    ELSIF UPPER(assigned_role) IN ('ANALYST', 'INTELLIGENCE_ANALYST') THEN
        assigned_role := 'ANALYST';
    ELSIF UPPER(assigned_role) IN ('ADMIN', 'SYSTEM_ADMINISTRATOR') THEN
        assigned_role := 'ADMIN';
    ELSE
        assigned_role := 'FIELD_OFFICER';
    END IF;

    user_full_name := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
        NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
        split_part(NEW.email, '@', 1)
    );

    user_badge := NULLIF(TRIM(NEW.raw_user_meta_data->>'badge_number'), '');
    user_station := NULLIF(TRIM(NEW.raw_user_meta_data->>'police_station_id'), '');

    BEGIN
        user_district := (NEW.raw_user_meta_data->>'district_id')::INTEGER;
    EXCEPTION WHEN OTHERS THEN
        user_district := NULL;
    END;

    INSERT INTO public.user_profiles (
        user_id,
        email,
        full_name,
        badge_number,
        role,
        police_station_id,
        district_id,
        is_active
    ) VALUES (
        NEW.id,
        NEW.email,
        user_full_name,
        user_badge,
        assigned_role,
        user_station,
        user_district,
        TRUE
    )
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
