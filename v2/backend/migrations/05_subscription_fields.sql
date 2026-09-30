-- Migration: 05_subscription_fields
-- Description: Add subscription fields to user_profiles

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS has_active_subscription BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS paypal_subscription_id TEXT;
