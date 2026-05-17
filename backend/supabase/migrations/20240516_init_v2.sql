-- CollabSpace v2.0 - Database Schema
-- Dual-Role Platform | Student + College Separate Systems

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cleanup old tables if they exist
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.event_bookmarks CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.college_profiles CASCADE;
DROP TABLE IF EXISTS public.collaboration_requests CASCADE;
DROP TABLE IF EXISTS public.student_interests CASCADE;
DROP TABLE IF EXISTS public.student_skills CASCADE;
DROP TABLE IF EXISTS public.skills CASCADE;
DROP TABLE IF EXISTS public.student_profiles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.conversation_participants CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.connections CASCADE;

-- ==========================================
-- 1. CORE AUTH & PROFILES
-- ==========================================

-- Core Auth Table (Extends Supabase Auth)
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT UNIQUE NOT NULL,
  role          TEXT CHECK (role IN ('student', 'college')) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 2. COLLABMATE TABLES
-- ==========================================

CREATE TABLE public.extended_profiles (
  id            UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  initials      TEXT,
  full_name     TEXT,
  role_title    TEXT,
  university    TEXT,
  location      TEXT,
  bio           TEXT,
  skills        TEXT[],
  avatar_url    TEXT,
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  event_date    DATE,
  location      TEXT,
  banner_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.connections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status        TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE (sender_id, receiver_id)
);

CREATE TABLE public.activities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type   TEXT NOT NULL,
  description   TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 3. RLS POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "profiles_read_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_service" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Extended Profiles Policies
ALTER TABLE public.extended_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "extended_profiles_read_all" ON public.extended_profiles FOR SELECT USING (true);
CREATE POLICY "extended_profiles_update_own" ON public.extended_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "extended_profiles_insert_own" ON public.extended_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Events Policies
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_read_all" ON public.events FOR SELECT USING (true);
CREATE POLICY "events_insert_all" ON public.events FOR INSERT WITH CHECK (true);

-- 4. Connections Policies
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "connections_read_own" ON public.connections FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "connections_insert_own" ON public.connections FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 5. Activities Policies
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activities_read_all" ON public.activities FOR SELECT USING (true);
CREATE POLICY "activities_insert_own" ON public.activities FOR INSERT WITH CHECK (auth.uid() = user_id);
