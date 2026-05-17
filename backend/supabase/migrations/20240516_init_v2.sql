-- CollabSpace v2.0 - Database Schema
-- Dual-Role Platform | Student + College Separate Systems

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cleanup old tables if they exist
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversation_participants CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.connections CASCADE;
DROP TABLE IF EXISTS public.extended_profiles CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.event_bookmarks CASCADE;
DROP TABLE IF EXISTS public.college_profiles CASCADE;
DROP TABLE IF EXISTS public.collaboration_requests CASCADE;
DROP TABLE IF EXISTS public.student_interests CASCADE;
DROP TABLE IF EXISTS public.student_skills CASCADE;
DROP TABLE IF EXISTS public.skills CASCADE;
DROP TABLE IF EXISTS public.student_profiles CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

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
  interests     TEXT[],
  goal          TEXT,
  avatar_url    TEXT,
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  event_type    TEXT CHECK (event_type IN ('Hackathon', 'Workshop', 'Competition')),
  organizer     TEXT,
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

-- ==========================================
-- 4. MESSAGING TABLES
-- ==========================================

CREATE TABLE public.conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.conversation_participants (
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE public.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 6. Messaging RLS Policies
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conversations_read_participant" ON public.conversations FOR SELECT
  USING (id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()));

ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conv_participants_read_own" ON public.conversation_participants FOR SELECT
  USING (user_id = auth.uid());

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_read_participant" ON public.messages FOR SELECT
  USING (conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()));
CREATE POLICY "messages_insert_own" ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- ==========================================
-- 5. TEAMS TABLES
-- ==========================================

CREATE TABLE public.teams (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  event_name  TEXT,
  created_by  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  max_members INT DEFAULT 4,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.team_members (
  team_id   UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role      TEXT CHECK (role IN ('Leader', 'Member')) DEFAULT 'Member',
  skill_tag TEXT,
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (team_id, user_id)
);

-- 7. Teams RLS Policies
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teams_read_member" ON public.teams FOR SELECT
  USING (id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()));
CREATE POLICY "teams_insert_all" ON public.teams FOR INSERT
  WITH CHECK (true);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team_members_read_member" ON public.team_members FOR SELECT
  USING (team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()));

-- ==========================================
-- 6. NOTIFICATIONS TABLE
-- ==========================================

CREATE TABLE public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type       TEXT CHECK (type IN ('connection_accepted', 'team_invite', 'event_post', 'connection_request')),
  content    TEXT NOT NULL,
  is_read    BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Notifications RLS Policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_read_update_own" ON public.notifications FOR ALL
  USING (user_id = auth.uid());
