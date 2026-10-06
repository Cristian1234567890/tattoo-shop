-- =====================================================================
-- Migration: 09_test_users_agenda_inventory.sql
-- Project: Tattoo Hub
-- Description: Adds is_test_account to profiles, expands agenda statuses,
--              adds inventory table, and enforces RLS for isolation.
-- =====================================================================

-- 1. Sandboxing: Add is_test_account to user_profiles
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS is_test_account BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_test ON public.user_profiles(is_test_account);

-- 2. Expand Agenda Statuses (Using a text check constraint instead of altering enums for simplicity)
ALTER TABLE public.agenda DROP CONSTRAINT IF EXISTS agenda_status_check;
ALTER TABLE public.agenda ADD CONSTRAINT agenda_status_check 
CHECK (status IN ('pending_approval', 'scheduled', 'reschedule_requested_client', 'reschedule_requested_artist', 'completed', 'cancelled'));

-- 3. Add Itinerary Configuration to profiles
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS itinerary_config JSONB DEFAULT '{"send_at": "18:00", "days_before": 1}';

-- 4. Premium Inventory Module
CREATE TABLE IF NOT EXISTS public.artist_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    quantity INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 5,
    last_restocked TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. RLS Policies for Isolation
-- If the requesting user is a test user, they can only see other test users in the hub.
-- If the requesting user is a real user, they can only see real users.

-- First, enable RLS on user_profiles if not already
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- We need a helper function to get the current user's test status
CREATE OR REPLACE FUNCTION get_my_test_status()
RETURNS BOOLEAN AS $$
DECLARE
    is_test BOOLEAN;
BEGIN
    SELECT is_test_account INTO is_test FROM public.user_profiles WHERE id = auth.uid();
    RETURN COALESCE(is_test, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing generic select policy if it exists (assuming it was named 'Users can view any profile')
DROP POLICY IF EXISTS "Users can view any profile" ON public.user_profiles;

-- Create the new Sandboxed Select Policy
CREATE POLICY "Sandboxed profile visibility"
ON public.user_profiles FOR SELECT
USING (
    -- You can always see your own profile
    auth.uid() = id
    OR
    -- Otherwise, test status must match (real sees real, test sees test)
    is_test_account = get_my_test_status()
);

-- Restore the update policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = id);
