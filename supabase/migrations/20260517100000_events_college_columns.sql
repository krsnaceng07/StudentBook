-- ============================================================
-- Phase 24: Events Table — College Authorship Schema Patch
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add author_id column (links event to the college that created it)
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. Add tags column (event category tags e.g. ['hackathon', 'tech'])
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 3. Add member_limit column (optional max team/participant size)
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS member_limit INT;

-- 4. Allow 'Seminar' as a valid event_type (was missing from CHECK constraint)
ALTER TABLE public.events
  DROP CONSTRAINT IF EXISTS events_event_type_check;

ALTER TABLE public.events
  ADD CONSTRAINT events_event_type_check
  CHECK (event_type IN ('Hackathon', 'Workshop', 'Competition', 'Seminar'));

-- 5. Fix profiles.role constraint to support 'college' role
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student', 'college', 'admin', 'user'));

-- 6. Enable Row Level Security on events (if not already enabled)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 7. Policy: Only the author (college) can insert their own events
DROP POLICY IF EXISTS "college_can_insert_own_events" ON public.events;
CREATE POLICY "college_can_insert_own_events"
  ON public.events
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- 8. Policy: Only the author (college) can delete their own events
DROP POLICY IF EXISTS "college_can_delete_own_events" ON public.events;
CREATE POLICY "college_can_delete_own_events"
  ON public.events
  FOR DELETE
  USING (auth.uid() = author_id);

-- 9. Policy: All authenticated users can read events
DROP POLICY IF EXISTS "authenticated_can_read_events" ON public.events;
CREATE POLICY "authenticated_can_read_events"
  ON public.events
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================
-- VERIFICATION QUERY (run after to confirm):
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'events';
-- ============================================================
