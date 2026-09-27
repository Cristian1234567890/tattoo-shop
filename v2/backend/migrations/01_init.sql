-- =====================================================================
-- Migration: 01_init.sql
-- Project: Tattoo Shop V2 Modernization
-- Description: Initial schema setup for tatuadores_data, user_subscription,
--              RLS policies, and user_profile storage bucket.
-- =====================================================================

-- 1. Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Table: public.tatuadores_data
-- Stores public catalog profile, contact, and social information for artists.
CREATE TABLE IF NOT EXISTS public.tatuadores_data (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tatuadores_data_id ON public.tatuadores_data(id);
CREATE INDEX IF NOT EXISTS idx_tatuadores_data_gin ON public.tatuadores_data USING gin (data);

-- 3. Table: public.user_subscription
-- Binds user accounts to PayPal recurring subscription and product records.
CREATE TABLE IF NOT EXISTS public.user_subscription (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    subscription_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_user_subscription_id ON public.user_subscription(id);
CREATE INDEX IF NOT EXISTS idx_user_subscription_subscription_id ON public.user_subscription(subscription_id);

-- 4. Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_tatuadores_data ON public.tatuadores_data;
CREATE TRIGGER set_updated_at_tatuadores_data
    BEFORE UPDATE ON public.tatuadores_data
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_user_subscription ON public.user_subscription;
CREATE TRIGGER set_updated_at_user_subscription
    BEFORE UPDATE ON public.user_subscription
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 5. Row Level Security (RLS) Configuration
ALTER TABLE public.tatuadores_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscription ENABLE ROW LEVEL SECURITY;

-- 5.1 RLS Policies for public.tatuadores_data
-- Public catalog reading: All visitors and authenticated users can view artist profiles
DROP POLICY IF EXISTS "Public read for tatuadores_data" ON public.tatuadores_data;
CREATE POLICY "Public read for tatuadores_data"
ON public.tatuadores_data FOR SELECT
USING (true);

-- Authenticated artist insert: Users can create their own artist record
DROP POLICY IF EXISTS "Users can insert own tatuador data" ON public.tatuadores_data;
CREATE POLICY "Users can insert own tatuador data"
ON public.tatuadores_data FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Authenticated artist update: Artists can only update their own profile
DROP POLICY IF EXISTS "Users can update own tatuador data" ON public.tatuadores_data;
CREATE POLICY "Users can update own tatuador data"
ON public.tatuadores_data FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Authenticated artist delete: Artists can delete their profile
DROP POLICY IF EXISTS "Users can delete own tatuador data" ON public.tatuadores_data;
CREATE POLICY "Users can delete own tatuador data"
ON public.tatuadores_data FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- Service role full access bypass for backend management
DROP POLICY IF EXISTS "Service role full access on tatuadores_data" ON public.tatuadores_data;
CREATE POLICY "Service role full access on tatuadores_data"
ON public.tatuadores_data FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 5.2 RLS Policies for public.user_subscription
-- Subscription read: Users can query their own subscription status
DROP POLICY IF EXISTS "Users can read own subscription" ON public.user_subscription;
CREATE POLICY "Users can read own subscription"
ON public.user_subscription FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Subscription insert: Users can record their subscription binding
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.user_subscription;
CREATE POLICY "Users can insert own subscription"
ON public.user_subscription FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Subscription update: Users can update their subscription details
DROP POLICY IF EXISTS "Users can update own subscription" ON public.user_subscription;
CREATE POLICY "Users can update own subscription"
ON public.user_subscription FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Subscription delete: Users can cancel/delete their subscription record
DROP POLICY IF EXISTS "Users can delete own subscription" ON public.user_subscription;
CREATE POLICY "Users can delete own subscription"
ON public.user_subscription FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- Service role full access bypass for backend management
DROP POLICY IF EXISTS "Service role full access on user_subscription" ON public.user_subscription;
CREATE POLICY "Service role full access on user_subscription"
ON public.user_subscription FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 6. Storage Bucket Configuration: user_profile
-- Create public bucket 'user_profile' for artist and client avatar uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'user_profile',
    'user_profile',
    true,
    52428800, -- 50MB limit matching express body limit
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];

-- 6.1 Storage Policies on storage.objects for user_profile
-- Public read: Anyone can fetch avatar images
DROP POLICY IF EXISTS "Allow public read from user_profile" ON storage.objects;
CREATE POLICY "Allow public read from user_profile"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user_profile');

-- Authenticated insert: Users can upload avatars to their own folder (${auth.uid()}/*)
DROP POLICY IF EXISTS "Allow authenticated uploads to user_profile" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to user_profile"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'user_profile' AND
    ((storage.foldername(name))[1] = auth.uid()::text OR name LIKE auth.uid()::text || '%')
);

-- Authenticated update: Users can update their own avatar files
DROP POLICY IF EXISTS "Allow authenticated updates to user_profile" ON storage.objects;
CREATE POLICY "Allow authenticated updates to user_profile"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'user_profile' AND
    ((storage.foldername(name))[1] = auth.uid()::text OR name LIKE auth.uid()::text || '%')
)
WITH CHECK (
    bucket_id = 'user_profile' AND
    ((storage.foldername(name))[1] = auth.uid()::text OR name LIKE auth.uid()::text || '%')
);

-- Authenticated delete: Users can delete their own avatar files
DROP POLICY IF EXISTS "Allow authenticated deletes from user_profile" ON storage.objects;
CREATE POLICY "Allow authenticated deletes from user_profile"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'user_profile' AND
    ((storage.foldername(name))[1] = auth.uid()::text OR name LIKE auth.uid()::text || '%')
);

-- Service role full access on user_profile bucket
DROP POLICY IF EXISTS "Service role full access on user_profile storage" ON storage.objects;
CREATE POLICY "Service role full access on user_profile storage"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'user_profile')
WITH CHECK (bucket_id = 'user_profile');
