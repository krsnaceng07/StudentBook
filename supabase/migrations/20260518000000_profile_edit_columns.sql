-- ============================================================
-- Phase 25: Profiles Table — Student Edit Profile Schema Patch
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add social_links column as JSONB (to store GitHub, Portfolio, LinkedIn, etc.)
ALTER TABLE public.extended_profiles
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- 2. Add university_year column (1st, 2nd, 3rd, 4th, Graduate)
ALTER TABLE public.extended_profiles
  ADD COLUMN IF NOT EXISTS university_year TEXT;

-- Drop and recreate the CHECK constraint for university_year
ALTER TABLE public.extended_profiles
  DROP CONSTRAINT IF EXISTS check_university_year;

ALTER TABLE public.extended_profiles
  ADD CONSTRAINT check_university_year
  CHECK (university_year IN ('1st', '2nd', '3rd', '4th', 'Graduate'));

-- 3. Add department column (TEXT to store student's field of study)
ALTER TABLE public.extended_profiles
  ADD COLUMN IF NOT EXISTS department TEXT;

-- 4. Add availability column (BOOLEAN to store collaboration status)
ALTER TABLE public.extended_profiles
  ADD COLUMN IF NOT EXISTS availability BOOLEAN DEFAULT true;

-- Verify columns:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'extended_profiles';

