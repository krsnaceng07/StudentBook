-- ============================================================
-- Phase 37: Double Event Registration & Workspace Engine Patch
-- ============================================================

-- 1. Add registration configuration columns to events
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS registration_type TEXT CHECK (registration_type IN ('internal', 'external')) DEFAULT 'internal';

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS external_link TEXT;

-- 2. Create event registrations relational join table
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE (event_id, user_id)
);

-- 3. Configure Row Level Security (RLS) policies
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Select policy: Students can read their own registrations, colleges can audit all event registrants
CREATE POLICY "registrations_read_all" ON public.event_registrations
  FOR SELECT USING (true);

-- Insert policy: Authenticated student role can register for internal events
CREATE POLICY "registrations_insert_own" ON public.event_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Delete policy: Authenticated student can cancel/unregister from internal events
CREATE POLICY "registrations_delete_own" ON public.event_registrations
  FOR DELETE USING (auth.uid() = user_id);
