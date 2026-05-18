-- ============================================================
-- Phase 27: Profiles Table — College Edit Profile Schema Patch
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add college_type column (University, Engineering, Management, Polytechnic, Other)
ALTER TABLE public.extended_profiles
  ADD COLUMN IF NOT EXISTS college_type TEXT DEFAULT 'Other';

-- Drop and recreate the CHECK constraint for college_type
ALTER TABLE public.extended_profiles
  DROP CONSTRAINT IF EXISTS check_college_type;

ALTER TABLE public.extended_profiles
  ADD CONSTRAINT check_college_type
  CHECK (college_type IN ('University', 'Engineering', 'Management', 'Polytechnic', 'Other'));

-- 2. Add established_year column (TEXT to store year of foundation)
ALTER TABLE public.extended_profiles
  ADD COLUMN IF NOT EXISTS established_year TEXT;

-- 3. Add website column (TEXT for institutional website)
ALTER TABLE public.extended_profiles
  ADD COLUMN IF NOT EXISTS website TEXT;

-- 4. Add contact_email column (TEXT for institutional contact email)
ALTER TABLE public.extended_profiles
  ADD COLUMN IF NOT EXISTS contact_email TEXT;
