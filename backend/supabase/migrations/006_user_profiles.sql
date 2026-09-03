-- Production user profiles and role authorization schema
-- Migration: 006_user_profiles
-- Target: Supabase PostgreSQL (Project ref: gcxppkdtbvmleynrzqao)
--
-- Purpose:
--   1. Create public.user_profiles referencing auth.users(id).
--   2. Strict foreign keys to police_stations(station_id TEXT) and districts(district_id INTEGER).
--   3. Row Level Security (RLS) ensuring least privilege and privacy.
--   4. Non-recursive SECURITY DEFINER is_admin() helper.
--   5. Automatic user profile synchronization via trigger on auth.users (app_metadata only).
--   6. Departmental role provisioning for official accounts.

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
-- 2. Security Helper: is_admin() (Non-recursive, SECURITY DEFINER)
-- =====================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT (
    COALESCE((auth.jwt() -> 'app_metadata' ->> 'role') = 'ADMIN', FALSE)
    OR EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid() AND role = 'ADMIN'
    )
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;

-- =====================================================================
-- 3. Row Level Security (RLS)
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

-- Authenticated users can update permitted non-role display fields of their own profile
CREATE POLICY "user_profiles_update_own"
    ON public.user_profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id
        AND role = (SELECT p.role FROM public.user_profiles p WHERE p.user_id = auth.uid())
    );

-- System administrators can view and manage all profiles via safe helper
CREATE POLICY "user_profiles_admin_all"
    ON public.user_profiles
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- =====================================================================
-- 4. Automatic Profile Creation Trigger on auth.users
-- =====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    assigned_role TEXT;
    user_full_name TEXT;
    user_badge TEXT;
    user_station TEXT;
    user_district INTEGER;
BEGIN
    -- Determine role ONLY from server-trusted app_metadata (never raw_user_meta_data)
    assigned_role := COALESCE(
        NULLIF(TRIM(NEW.raw_app_meta_data->>'role'), ''),
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
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- 5. Backfill / Provisioning for the Three Existing Official Accounts
-- =====================================================================

DO $$
DECLARE
    fo_id UUID;
    ia_id UUID;
    sa_id UUID;
BEGIN
    -- Locate Field Officer by confirmed official address
    SELECT id INTO fo_id FROM auth.users WHERE email = 'crimeintel.officer@gmail.com' LIMIT 1;
    IF fo_id IS NOT NULL THEN
        UPDATE auth.users
        SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "FIELD_OFFICER"}'::jsonb
        WHERE id = fo_id;

        INSERT INTO public.user_profiles (
            user_id, email, full_name, role, is_active
        ) VALUES (
            fo_id, 'crimeintel.officer@gmail.com', 'Field Officer', 'FIELD_OFFICER', TRUE
        )
        ON CONFLICT (user_id) DO UPDATE SET
            role = 'FIELD_OFFICER',
            updated_at = NOW();
    END IF;

    -- Locate Intelligence Analyst by confirmed official address
    SELECT id INTO ia_id FROM auth.users WHERE email = 'crimeintel.analystt@gmail.com' LIMIT 1;
    IF ia_id IS NOT NULL THEN
        UPDATE auth.users
        SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "ANALYST"}'::jsonb
        WHERE id = ia_id;

        INSERT INTO public.user_profiles (
            user_id, email, full_name, role, is_active
        ) VALUES (
            ia_id, 'crimeintel.analystt@gmail.com', 'Intelligence Analyst', 'ANALYST', TRUE
        )
        ON CONFLICT (user_id) DO UPDATE SET
            role = 'ANALYST',
            updated_at = NOW();
    END IF;

    -- Locate System Administrator by confirmed official address
    SELECT id INTO sa_id FROM auth.users WHERE email = 'crimeintel.admin@gmail.com' LIMIT 1;
    IF sa_id IS NOT NULL THEN
        UPDATE auth.users
        SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "ADMIN"}'::jsonb
        WHERE id = sa_id;

        INSERT INTO public.user_profiles (
            user_id, email, full_name, role, is_active
        ) VALUES (
            sa_id, 'crimeintel.admin@gmail.com', 'System Administrator', 'ADMIN', TRUE
        )
        ON CONFLICT (user_id) DO UPDATE SET
            role = 'ADMIN',
            updated_at = NOW();
    END IF;
END $$;
