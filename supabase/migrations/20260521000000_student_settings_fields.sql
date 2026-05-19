-- Migration: Add student settings and privacy fields to extended_profiles
ALTER TABLE public.extended_profiles
ADD COLUMN IF NOT EXISTS settings_push BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS settings_email BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS settings_visibility TEXT DEFAULT 'public';

-- Add a comment to document columns
COMMENT ON COLUMN public.extended_profiles.settings_push IS 'Flag to toggle user push notifications preferences';
COMMENT ON COLUMN public.extended_profiles.settings_email IS 'Flag to toggle email updates/digest preferences';
COMMENT ON COLUMN public.extended_profiles.settings_visibility IS 'Profile privacy level: public, connections, or private';
