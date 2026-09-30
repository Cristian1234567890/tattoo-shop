-- =====================================================================
-- Migration: 06_contact_whatsapp.sql
-- Project: Tattoo Shop V2 Modernization
-- Description: Add country, city, phone_prefix, and whatsapp_number
--              columns to public.user_profiles for international contact
--              and direct WhatsApp messaging.
-- =====================================================================

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Panamá',
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS phone_prefix TEXT DEFAULT '+507',
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- Performance indexes for regional search and filtering
CREATE INDEX IF NOT EXISTS idx_user_profiles_country ON public.user_profiles(country);
CREATE INDEX IF NOT EXISTS idx_user_profiles_city ON public.user_profiles(city);
