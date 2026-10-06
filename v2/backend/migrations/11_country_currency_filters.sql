-- =====================================================================
-- Migration: 11_country_currency_filters.sql
-- Project: Tattoo Hub V2
-- Description: Adds currency to user_profiles, products, orders, and order_items;
--              creates public.currencies reference table and seeds supported currencies;
--              creates expression indexes on tatuadores_data for performant filtering.
-- =====================================================================

-- 1. Add currency column to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

CREATE INDEX IF NOT EXISTS idx_user_profiles_currency ON public.user_profiles(currency);

-- 2. Add currency column to store tables (products, orders, order_items)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- 3. Create Currencies & Exchange Rates Reference Table
CREATE TABLE IF NOT EXISTS public.currencies (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    rate_to_usd NUMERIC(10, 4) NOT NULL DEFAULT 1.0000,
    country TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;

-- Currencies RLS Policies
DROP POLICY IF EXISTS "Public read for currencies" ON public.currencies;
CREATE POLICY "Public read for currencies"
ON public.currencies FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Service role full access on currencies" ON public.currencies;
CREATE POLICY "Service role full access on currencies"
ON public.currencies FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Seed currencies with 'USD', 'PAB', 'EUR', 'COP', 'MXN'
INSERT INTO public.currencies (code, name, symbol, rate_to_usd, country, is_active)
VALUES 
    ('USD', 'Dólar Estadounidense', '$', 1.0000, 'Estados Unidos', true),
    ('PAB', 'Balboa Panameño', 'B/.', 1.0000, 'Panamá', true),
    ('EUR', 'Euro', '€', 0.9200, 'España', true),
    ('COP', 'Peso Colombiano', '$', 4150.0000, 'Colombia', true),
    ('MXN', 'Peso Mexicano', '$', 18.5000, 'México', true)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    symbol = EXCLUDED.symbol,
    rate_to_usd = EXCLUDED.rate_to_usd,
    country = EXCLUDED.country,
    is_active = EXCLUDED.is_active,
    updated_at = timezone('utc'::text, now());

-- 4. Expression indexes on tatuadores_data for performant filtering
CREATE INDEX IF NOT EXISTS idx_tatuadores_country_expr 
ON public.tatuadores_data ((lower(data->>'country')));

CREATE INDEX IF NOT EXISTS idx_tatuadores_city_expr 
ON public.tatuadores_data ((lower(data->>'ciudad')));

CREATE INDEX IF NOT EXISTS idx_tatuadores_work_type_expr 
ON public.tatuadores_data ((lower(data->>'work_type')));
