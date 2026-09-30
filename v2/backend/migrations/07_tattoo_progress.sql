-- =====================================================================
-- Migration: 07_tattoo_progress.sql
-- Project: Tattoo Shop V2 Modernization
-- Description: Creates public.tattoo_progress table linked to client and
--              artist user profiles, provisions 'tattoo-progress' storage bucket,
--              configures Row Level Security (RLS) policies for clients and artists.
-- =====================================================================

-- 1. Table: public.tattoo_progress
CREATE TABLE IF NOT EXISTS public.tattoo_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    artist_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL DEFAULT 'Progreso de Tatuaje',
    notes TEXT DEFAULT '',
    image_url TEXT NOT NULL DEFAULT '',
    stage TEXT NOT NULL DEFAULT 'Fase 1: Limpieza & Primer Vendaje',
    session_number INTEGER DEFAULT 1,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1.1 Ensure column presence if public.tattoo_progress already existed
ALTER TABLE public.tattoo_progress ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE;
ALTER TABLE public.tattoo_progress ADD COLUMN IF NOT EXISTS artist_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.tattoo_progress ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'Progreso de Tatuaje';
ALTER TABLE public.tattoo_progress ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
ALTER TABLE public.tattoo_progress ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
ALTER TABLE public.tattoo_progress ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'Fase 1: Limpieza & Primer Vendaje';
ALTER TABLE public.tattoo_progress ADD COLUMN IF NOT EXISTS session_number INTEGER DEFAULT 1;
ALTER TABLE public.tattoo_progress ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.tattoo_progress ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.tattoo_progress ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.tattoo_progress ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_tattoo_progress_client_id ON public.tattoo_progress(client_id);
CREATE INDEX IF NOT EXISTS idx_tattoo_progress_artist_id ON public.tattoo_progress(artist_id);
CREATE INDEX IF NOT EXISTS idx_tattoo_progress_date ON public.tattoo_progress(date DESC);
CREATE INDEX IF NOT EXISTS idx_tattoo_progress_stage ON public.tattoo_progress(stage);
CREATE INDEX IF NOT EXISTS idx_tattoo_progress_created_at ON public.tattoo_progress(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tattoo_progress_metadata_gin ON public.tattoo_progress USING gin (metadata);

-- 3. Automatic updated_at trigger
DROP TRIGGER IF EXISTS set_updated_at_tattoo_progress ON public.tattoo_progress;
CREATE TRIGGER set_updated_at_tattoo_progress
    BEFORE UPDATE ON public.tattoo_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Row Level Security (RLS) for public.tattoo_progress
ALTER TABLE public.tattoo_progress ENABLE ROW LEVEL SECURITY;

-- 4.1 SELECT: Clients can view their own entries; Tagged artists can view entries of their clients
DROP POLICY IF EXISTS "Clients and tagged artists can view tattoo progress" ON public.tattoo_progress;
CREATE POLICY "Clients and tagged artists can view tattoo progress"
ON public.tattoo_progress FOR SELECT
TO authenticated
USING (
    auth.uid() = client_id
    OR auth.uid() = artist_id
);

-- 4.2 INSERT: Clients can insert their own progress; Artists can record progress for their clients
DROP POLICY IF EXISTS "Clients and artists can insert tattoo progress" ON public.tattoo_progress;
CREATE POLICY "Clients and artists can insert tattoo progress"
ON public.tattoo_progress FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = client_id
    OR auth.uid() = artist_id
);

-- 4.3 UPDATE: Clients can update their own entries; Tagged artists can update (e.g. feedback)
DROP POLICY IF EXISTS "Clients and tagged artists can update tattoo progress" ON public.tattoo_progress;
CREATE POLICY "Clients and tagged artists can update tattoo progress"
ON public.tattoo_progress FOR UPDATE
TO authenticated
USING (
    auth.uid() = client_id
    OR auth.uid() = artist_id
)
WITH CHECK (
    auth.uid() = client_id
    OR auth.uid() = artist_id
);

-- 4.4 DELETE: Only client owners can delete their tattoo progress entries
DROP POLICY IF EXISTS "Clients can delete their own tattoo progress" ON public.tattoo_progress;
CREATE POLICY "Clients can delete their own tattoo progress"
ON public.tattoo_progress FOR DELETE
TO authenticated
USING (
    auth.uid() = client_id
);

-- 4.5 Service role full access bypass for backend orchestration and background jobs
DROP POLICY IF EXISTS "Service role full access on tattoo_progress" ON public.tattoo_progress;
CREATE POLICY "Service role full access on tattoo_progress"
ON public.tattoo_progress FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 5. Storage Bucket Configuration: tattoo-progress
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'tattoo-progress',
    'tattoo-progress',
    true,
    52428800, -- 50MB
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/heic']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/heic'];

-- 6. Storage Policies on storage.objects for tattoo-progress
-- 6.1 Public read: Anyone with the URL can view progress images (fast CDN caching)
DROP POLICY IF EXISTS "Allow public read from tattoo-progress" ON storage.objects;
CREATE POLICY "Allow public read from tattoo-progress"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tattoo-progress');

-- 6.2 Authenticated upload: Users can only upload into their own subfolder (${auth.uid()}/*)
DROP POLICY IF EXISTS "Allow authenticated uploads to tattoo-progress" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to tattoo-progress"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'tattoo-progress' AND
    ((storage.foldername(name))[1] = auth.uid()::text OR name LIKE auth.uid()::text || '%')
);

-- 6.3 Authenticated update: Users can update files in their own subfolder
DROP POLICY IF EXISTS "Allow authenticated updates to tattoo-progress" ON storage.objects;
CREATE POLICY "Allow authenticated updates to tattoo-progress"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'tattoo-progress' AND
    ((storage.foldername(name))[1] = auth.uid()::text OR name LIKE auth.uid()::text || '%')
)
WITH CHECK (
    bucket_id = 'tattoo-progress' AND
    ((storage.foldername(name))[1] = auth.uid()::text OR name LIKE auth.uid()::text || '%')
);

-- 6.4 Authenticated delete: Users can delete files in their own subfolder
DROP POLICY IF EXISTS "Allow authenticated deletes from tattoo-progress" ON storage.objects;
CREATE POLICY "Allow authenticated deletes from tattoo-progress"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'tattoo-progress' AND
    ((storage.foldername(name))[1] = auth.uid()::text OR name LIKE auth.uid()::text || '%')
);

-- 6.5 Service role full access on tattoo-progress storage
DROP POLICY IF EXISTS "Service role full access on tattoo-progress storage" ON storage.objects;
CREATE POLICY "Service role full access on tattoo-progress storage"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'tattoo-progress')
WITH CHECK (bucket_id = 'tattoo-progress');
