-- ============================================================
-- Phase 31: Events Table — High-Fidelity Mockup Fields Patch
-- ============================================================

-- 1. Add registration deadline column
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS reg_deadline TIMESTAMPTZ;

-- 2. Add online event toggle column
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;

-- 3. Add min_team and max_team size columns
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS min_team INT DEFAULT 2;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS max_team INT DEFAULT 4;

-- 4. Add prize_pool text column
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS prize_pool TEXT;
