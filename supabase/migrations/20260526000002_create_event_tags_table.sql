-- Migration: Create event_tags table (junction)
-- Wave: 1 (Database Schema)
-- Purpose: Tags for events (AI, Web3, FinTech, etc.)

CREATE TABLE IF NOT EXISTS public.event_tags (
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (event_id, tag)
);

-- Index for efficient tag queries
CREATE INDEX idx_event_tags_tag ON public.event_tags(tag);

-- Enable Row Level Security
ALTER TABLE public.event_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policy: College can view/manage tags for own events
CREATE POLICY "college_select_own_event_tags" ON public.event_tags
  FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM public.events WHERE college_id = auth.uid()
    )
  );

CREATE POLICY "college_insert_own_event_tags" ON public.event_tags
  FOR INSERT
  WITH CHECK (
    event_id IN (
      SELECT id FROM public.events WHERE college_id = auth.uid()
    )
  );

CREATE POLICY "college_delete_own_event_tags" ON public.event_tags
  FOR DELETE
  USING (
    event_id IN (
      SELECT id FROM public.events WHERE college_id = auth.uid()
    )
  );

-- RLS Policy: Authenticated users can read tags for active events
CREATE POLICY "public_select_active_event_tags" ON public.event_tags
  FOR SELECT
  USING (
    event_id IN (
      SELECT id FROM public.events 
      WHERE status != 'deleted' AND auth.role() = 'authenticated'
    )
  );

COMMENT ON TABLE public.event_tags IS 'Junction table: event tags (AI, Web3, FinTech, etc.)';
