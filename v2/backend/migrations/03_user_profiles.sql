-- =====================================================================
-- Migration: 03_user_profiles.sql
-- Project: Tattoo Shop V2 Modernization
-- Description: Creates public.user_profiles table linked to auth.users,
--              storing role, legal acceptance audit trail, user metadata,
--              verification status, and onboarding flag.
-- =====================================================================

-- 1. Table: public.user_profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IS NULL OR role IN ('Cliente', 'Tatuador')),
    legal_accepted BOOLEAN NOT NULL DEFAULT false,
    legal_accepted_at TIMESTAMP WITH TIME ZONE,
    full_name TEXT,
    avatar_url TEXT,
    phone_number TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.1 Ensure column presence if public.user_profiles existed prior to this migration
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IS NULL OR role IN ('Cliente', 'Tatuador'));
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS legal_accepted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS legal_accepted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_id ON public.user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarding ON public.user_profiles(onboarding_completed);

-- 3. Automatic updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_user_profiles ON public.user_profiles;
CREATE TRIGGER set_updated_at_user_profiles
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Row Level Security (RLS) Configuration
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 4.1 Users can view their own profile, or public artist profiles (protects private client phone and audit)
DROP POLICY IF EXISTS "Public read for user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can read own profile or artist profile" ON public.user_profiles;
CREATE POLICY "Users can read own profile or artist profile"
ON public.user_profiles FOR SELECT
USING (
    auth.uid() = id
    OR role = 'Tatuador'
);

-- 4.2 Authenticated users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
ON public.user_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 4.3 Authenticated users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
ON public.user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4.4 Service role full access for backend orchestration
DROP POLICY IF EXISTS "Service role full access on user_profiles" ON public.user_profiles;
CREATE POLICY "Service role full access on user_profiles"
ON public.user_profiles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 5. Trigger function to synchronize auth.users creation into public.user_profiles safely
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public, auth
AS $$
DECLARE
    parsed_legal_accepted_at TIMESTAMPTZ := NULL;
    is_legal_accepted BOOLEAN := false;
BEGIN
    IF lower(COALESCE(NEW.raw_user_meta_data->>'legal_accepted', '')) IN ('true', 't', '1') THEN
        is_legal_accepted := true;
        IF NEW.raw_user_meta_data->>'legal_accepted_at' IS NOT NULL THEN
            BEGIN
                parsed_legal_accepted_at := (NEW.raw_user_meta_data->>'legal_accepted_at')::timestamptz;
            EXCEPTION WHEN OTHERS THEN
                parsed_legal_accepted_at := timezone('utc'::text, now());
            END;
        ELSE
            parsed_legal_accepted_at := timezone('utc'::text, now());
        END IF;
    END IF;

    INSERT INTO public.user_profiles (
        id,
        role,
        legal_accepted,
        legal_accepted_at,
        full_name,
        avatar_url,
        phone_number,
        is_verified,
        onboarding_completed
    ) VALUES (
        NEW.id,
        CASE 
            WHEN NEW.raw_user_meta_data->>'tipo' IN ('Cliente', 'Tatuador') THEN NEW.raw_user_meta_data->>'tipo'
            WHEN NEW.raw_user_meta_data->>'role' IN ('Cliente', 'Tatuador') THEN NEW.raw_user_meta_data->>'role'
            ELSE NULL 
        END,
        is_legal_accepted,
        parsed_legal_accepted_at,
        COALESCE(
            NULLIF(TRIM(CONCAT(NEW.raw_user_meta_data->>'nombre', ' ', NEW.raw_user_meta_data->>'apellido')), ''),
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            ''
        ),
        COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'picture',
            NEW.raw_user_meta_data->>'profile',
            ''
        ),
        COALESCE(NEW.raw_user_meta_data->>'telefono', NEW.raw_user_meta_data->>'phone_number', NULL),
        false,
        CASE 
            WHEN lower(COALESCE(NEW.raw_user_meta_data->>'onboarding_completed', '')) IN ('true', 't', '1') THEN true 
            ELSE false 
        END
    )
    ON CONFLICT (id) DO UPDATE SET
        role = COALESCE(
            CASE 
                WHEN EXCLUDED.role IN ('Cliente', 'Tatuador') THEN EXCLUDED.role 
                ELSE NULL 
            END,
            public.user_profiles.role
        ),
        legal_accepted = CASE WHEN EXCLUDED.legal_accepted THEN true ELSE public.user_profiles.legal_accepted END,
        legal_accepted_at = COALESCE(public.user_profiles.legal_accepted_at, EXCLUDED.legal_accepted_at),
        full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.user_profiles.full_name),
        avatar_url = COALESCE(NULLIF(EXCLUDED.avatar_url, ''), public.user_profiles.avatar_url),
        phone_number = COALESCE(EXCLUDED.phone_number, public.user_profiles.phone_number),
        onboarding_completed = CASE WHEN EXCLUDED.onboarding_completed THEN true ELSE public.user_profiles.onboarding_completed END,
        updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- 6. Attach trigger to auth.users if permissions permit
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_profile();
