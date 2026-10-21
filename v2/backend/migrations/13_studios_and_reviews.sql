-- =====================================================================
-- Migration: 13_studios_and_reviews.sql
-- Description: Studios table with unique studio code, owner/delegated admin,
--              operating hours, multi-studio support, certification,
--              studio reviews/ratings (1-5 stars), and promotional coupons.
-- =====================================================================

-- 1. Table: public.studios
CREATE TABLE IF NOT EXISTS public.studios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_normalized TEXT NOT NULL,
    owner_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    delegated_admin_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Panamá',
    province TEXT DEFAULT 'Panamá',
    country TEXT DEFAULT 'Panama',
    lat NUMERIC(10, 6) NOT NULL DEFAULT 8.9824,
    lng NUMERIC(10, 6) NOT NULL DEFAULT -79.5199,
    phone TEXT,
    description TEXT,
    banner_url TEXT,
    opening_hours JSONB DEFAULT '{"mon": "10:00 - 20:00", "tue": "10:00 - 20:00", "wed": "10:00 - 20:00", "thu": "10:00 - 20:00", "fri": "10:00 - 20:00", "sat": "10:00 - 18:00", "sun": "Cerrado"}'::jsonb,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    review_count INT DEFAULT 0,
    verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Unique constraint on normalized name to prevent duplicate studios
CREATE UNIQUE INDEX IF NOT EXISTS idx_studios_name_normalized ON public.studios(name_normalized);
CREATE INDEX IF NOT EXISTS idx_studios_owner_id ON public.studios(owner_id);
CREATE INDEX IF NOT EXISTS idx_studios_studio_code ON public.studios(studio_code);

-- 2. Table: public.studio_artists (collaborators associated to studio)
CREATE TABLE IF NOT EXISTS public.studio_artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'resident' CHECK (role IN ('owner', 'manager', 'resident', 'guest')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(studio_id, artist_id)
);

CREATE INDEX IF NOT EXISTS idx_studio_artists_studio ON public.studio_artists(studio_id);
CREATE INDEX IF NOT EXISTS idx_studio_artists_artist ON public.studio_artists(artist_id);

-- 3. Table: public.studio_reviews (Client ratings 1 to 5 stars + comments)
CREATE TABLE IF NOT EXISTS public.studio_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_id UUID NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    client_name TEXT,
    client_avatar TEXT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_studio_reviews_studio ON public.studio_reviews(studio_id);

-- 4. Table: public.coupons (Promotional coupons for memberships and products)
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_percentage INT NOT NULL CHECK (discount_percentage BETWEEN 1 AND 100),
    description TEXT,
    applies_to TEXT DEFAULT 'all' CHECK (applies_to IN ('all', 'product', 'subscription')),
    max_uses INT DEFAULT 1000,
    used_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);

-- Seed default coupons
INSERT INTO public.coupons (code, discount_percentage, description, applies_to)
VALUES 
    ('TATTOO10', 10, '10% de descuento en membresías o productos del estudio', 'all'),
    ('PROMO20', 20, '20% de descuento especial en tienda', 'product'),
    ('VIP50', 50, '50% de descuento en membresía Coleccionista o Estudio', 'subscription'),
    ('TATTOOHUB', 15, '15% de descuento de bienvenida a la plataforma', 'all')
ON CONFLICT (code) DO NOTHING;

-- RLS Policies
ALTER TABLE public.studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Public read for studios and reviews
CREATE POLICY "Public read for studios" ON public.studios FOR SELECT USING (true);
CREATE POLICY "Public read for studio_artists" ON public.studio_artists FOR SELECT USING (true);
CREATE POLICY "Public read for studio_reviews" ON public.studio_reviews FOR SELECT USING (true);
CREATE POLICY "Public read for active coupons" ON public.coupons FOR SELECT USING (is_active = true);
