-- Migration: Create events table
-- Wave: 1 (Database Schema)
-- Purpose: Core event data for college event management

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('hackathon', 'workshop', 'competition', 'seminar', 'other')),
  date TIMESTAMPTZ NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  venue TEXT NOT NULL,
  is_online BOOLEAN DEFAULT FALSE,
  max_team INTEGER DEFAULT 4,
  min_team INTEGER DEFAULT 1,
  prize TEXT,
  banner_color TEXT DEFAULT '#2563EB',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past', 'draft', 'deleted')),
  contact_email TEXT,
  contact_phone TEXT,
  eligibility TEXT,
  schedule TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast queries
CREATE INDEX idx_events_college_id ON public.events(college_id);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_date ON public.events(date);
CREATE INDEX idx_events_type ON public.events(type);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: College can view all events they created
CREATE POLICY "college_select_own_events" ON public.events
  FOR SELECT
  USING (college_id = auth.uid());

-- RLS Policy: College can insert own events
CREATE POLICY "college_insert_own_events" ON public.events
  FOR INSERT
  WITH CHECK (college_id = auth.uid());

-- RLS Policy: College can update own events
CREATE POLICY "college_update_own_events" ON public.events
  FOR UPDATE
  USING (college_id = auth.uid())
  WITH CHECK (college_id = auth.uid());

-- RLS Policy: College can delete own events (soft delete via status)
CREATE POLICY "college_delete_own_events" ON public.events
  FOR DELETE
  USING (college_id = auth.uid());

-- RLS Policy: Students and other authenticated users can read non-deleted events
CREATE POLICY "public_select_active_events" ON public.events
  FOR SELECT
  USING (status != 'deleted' AND auth.role() = 'authenticated');

-- Add comment
COMMENT ON TABLE public.events IS 'College-posted events with registrations tracking';
COMMENT ON COLUMN public.events.status IS 'Event lifecycle: active (accepting registrations), past (completed), draft (not published), deleted (soft-deleted)';
