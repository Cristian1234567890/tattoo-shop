-- =====================================================================
-- Migration: 08_hub_expansions.sql
-- Project: Tattoo Shop V2 Modernization
-- Description: Adds tables for schedules, promotions, sketches, 
--              payments, and agenda for the Artist Hub.
-- =====================================================================

-- 1. Table: public.artist_schedules
CREATE TABLE IF NOT EXISTS public.artist_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table: public.promotions
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    discount_percentage INT CHECK (discount_percentage BETWEEN 0 AND 100),
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Table: public.sketches
CREATE TABLE IF NOT EXISTS public.sketches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Table: public.payments
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_method TEXT,
    sketch_id UUID REFERENCES public.sketches(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Table: public.agenda (Appointments)
CREATE TABLE IF NOT EXISTS public.agenda (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS set_updated_at_artist_schedules ON public.artist_schedules;
CREATE TRIGGER set_updated_at_artist_schedules
    BEFORE UPDATE ON public.artist_schedules
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_promotions ON public.promotions;
CREATE TRIGGER set_updated_at_promotions
    BEFORE UPDATE ON public.promotions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_sketches ON public.sketches;
CREATE TRIGGER set_updated_at_sketches
    BEFORE UPDATE ON public.sketches
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_payments ON public.payments;
CREATE TRIGGER set_updated_at_payments
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_agenda ON public.agenda;
CREATE TRIGGER set_updated_at_agenda
    BEFORE UPDATE ON public.agenda
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add RLS Policies
ALTER TABLE public.artist_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sketches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda ENABLE ROW LEVEL SECURITY;

-- Artist Schedules RLS
CREATE POLICY "Public read for artist_schedules" ON public.artist_schedules FOR SELECT USING (true);
CREATE POLICY "Artists can insert own schedules" ON public.artist_schedules FOR INSERT TO authenticated WITH CHECK (auth.uid() = artist_id);
CREATE POLICY "Artists can update own schedules" ON public.artist_schedules FOR UPDATE TO authenticated USING (auth.uid() = artist_id);
CREATE POLICY "Artists can delete own schedules" ON public.artist_schedules FOR DELETE TO authenticated USING (auth.uid() = artist_id);
CREATE POLICY "Service role full access artist_schedules" ON public.artist_schedules FOR ALL TO service_role USING (true);

-- Promotions RLS
CREATE POLICY "Public read for promotions" ON public.promotions FOR SELECT USING (true);
CREATE POLICY "Artists can insert own promotions" ON public.promotions FOR INSERT TO authenticated WITH CHECK (auth.uid() = artist_id);
CREATE POLICY "Artists can update own promotions" ON public.promotions FOR UPDATE TO authenticated USING (auth.uid() = artist_id);
CREATE POLICY "Artists can delete own promotions" ON public.promotions FOR DELETE TO authenticated USING (auth.uid() = artist_id);
CREATE POLICY "Service role full access promotions" ON public.promotions FOR ALL TO service_role USING (true);

-- Sketches RLS
CREATE POLICY "Clients read own sketches, artists read sketches assigned to them" ON public.sketches FOR SELECT TO authenticated USING (auth.uid() = client_id OR auth.uid() = artist_id);
CREATE POLICY "Clients insert sketches" ON public.sketches FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients and Artists update sketches" ON public.sketches FOR UPDATE TO authenticated USING (auth.uid() = client_id OR auth.uid() = artist_id);
CREATE POLICY "Service role full access sketches" ON public.sketches FOR ALL TO service_role USING (true);

-- Payments RLS
CREATE POLICY "Clients read own payments, artists read received payments" ON public.payments FOR SELECT TO authenticated USING (auth.uid() = client_id OR auth.uid() = artist_id);
CREATE POLICY "Clients insert payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients update own payments" ON public.payments FOR UPDATE TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "Service role full access payments" ON public.payments FOR ALL TO service_role USING (true);

-- Agenda RLS
CREATE POLICY "Clients read own agenda, artists read own agenda" ON public.agenda FOR SELECT TO authenticated USING (auth.uid() = client_id OR auth.uid() = artist_id);
CREATE POLICY "Clients and Artists insert agenda" ON public.agenda FOR INSERT TO authenticated WITH CHECK (auth.uid() = client_id OR auth.uid() = artist_id);
CREATE POLICY "Clients and Artists update agenda" ON public.agenda FOR UPDATE TO authenticated USING (auth.uid() = client_id OR auth.uid() = artist_id);
CREATE POLICY "Service role full access agenda" ON public.agenda FOR ALL TO service_role USING (true);
