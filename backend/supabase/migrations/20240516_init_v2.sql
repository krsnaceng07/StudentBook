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
-- 2. STUDENT WORLD
-- ==========================================

-- Student Profiles
CREATE TABLE public.student_profiles (
  id              UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  college_name    TEXT NOT NULL,
  department      TEXT,
  year            TEXT CHECK (year IN ('1st', '2nd', '3rd', '4th', 'Graduate')),
  bio             TEXT,
  goal            TEXT CHECK (goal IN (
                    'looking_for_team',
                    'open_to_join',
                    'just_exploring'
                  )),
  availability    BOOLEAN DEFAULT true,
  github_url      TEXT,
  portfolio_url   TEXT,
  linkedin_url    TEXT,
  avatar_url      TEXT,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Skills (Master List)
CREATE TABLE public.skills (
  id    SERIAL PRIMARY KEY,
  name  TEXT UNIQUE NOT NULL
);

-- Student Skills (Many-to-Many)
CREATE TABLE public.student_skills (
  student_id  UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  skill_id    INT REFERENCES public.skills(id) ON DELETE CASCADE,
  PRIMARY KEY (student_id, skill_id)
);

-- Student Interests
CREATE TABLE public.student_interests (
  student_id  UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  interest    TEXT NOT NULL,
  PRIMARY KEY (student_id, interest)
);

-- Collaboration Requests
CREATE TABLE public.collaboration_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id    UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  receiver_id  UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  message      TEXT,
  status       TEXT CHECK (status IN (
                 'pending', 'accepted', 'declined'
               )) DEFAULT 'pending',
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (sender_id, receiver_id)
);

-- ==========================================
-- 3. COLLEGE WORLD
-- ==========================================

-- College Profiles
CREATE TABLE public.college_profiles (
  id                UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  college_name      TEXT NOT NULL,
  college_type      TEXT CHECK (college_type IN (
                      'university', 'engineering', 'management',
                      'polytechnic', 'other'
                    )),
  location          TEXT NOT NULL,
  website_url       TEXT,
  contact_email     TEXT,
  contact_phone     TEXT,
  description       TEXT,
  logo_url          TEXT,
  banner_url        TEXT,
  established_year  TEXT,
  is_verified       BOOLEAN DEFAULT false,
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- Events
CREATE TABLE public.events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id      UUID REFERENCES public.college_profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  type            TEXT CHECK (type IN (
                    'hackathon', 'workshop',
                    'competition', 'seminar', 'other'
                  )),
  event_date      DATE NOT NULL,
  deadline        DATE,
  venue           TEXT,
  is_online       BOOLEAN DEFAULT false,
  max_team_size   INT,
  min_team_size   INT,
  prize_pool      TEXT,
  external_link   TEXT,
  banner_url      TEXT,
  tags            TEXT[],
  target_domains  TEXT[],
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 4. SHARED / SYSTEM
-- ==========================================

-- Messages
CREATE TABLE public.messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id  UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  is_read      BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Event Bookmarks
CREATE TABLE public.event_bookmarks (
  student_id  UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  event_id    UUID REFERENCES public.events(id) ON DELETE CASCADE,
  saved_at    TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (student_id, event_id)
);

-- Reports
CREATE TABLE public.reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id   UUID REFERENCES public.profiles(id),
  target_id     UUID,
  target_type   TEXT CHECK (target_type IN ('student', 'college', 'event')),
  reason        TEXT NOT NULL,
  status        TEXT DEFAULT 'pending',
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 5. RLS POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "profiles_read_own" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- 2. Student Profiles Policies
CREATE POLICY "students_read_all" ON public.student_profiles FOR SELECT USING (true);
CREATE POLICY "students_update_own" ON public.student_profiles FOR UPDATE USING (auth.uid() = id);

-- 3. College Profiles Policies
CREATE POLICY "colleges_read_all" ON public.college_profiles FOR SELECT USING (true);
CREATE POLICY "colleges_update_own" ON public.college_profiles FOR UPDATE USING (auth.uid() = id);

-- 4. Events Policies
CREATE POLICY "anyone_read_active_events" ON public.events FOR SELECT USING (is_active = true);
CREATE POLICY "colleges_manage_own_events" ON public.events FOR ALL USING (
  auth.uid() = college_id AND
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'college'
);

-- 5. Messages Policies
CREATE POLICY "messages_private" ON public.messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "messages_send" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id
);

-- 6. Collaboration Requests Policies
CREATE POLICY "requests_private" ON public.collaboration_requests FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "students_send_requests" ON public.collaboration_requests FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'student'
);

-- 7. Bookmarks Policies
CREATE POLICY "students_manage_own_bookmarks" ON public.event_bookmarks FOR ALL USING (
  auth.uid() = student_id
);

-- 8. Skills Policies (Read-only for all, Insert for system/auth)
CREATE POLICY "anyone_read_skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "anyone_read_student_skills" ON public.student_skills FOR SELECT USING (true);
CREATE POLICY "students_manage_own_skills" ON public.student_skills FOR ALL USING (auth.uid() = student_id);

-- 9. Interests Policies
CREATE POLICY "anyone_read_student_interests" ON public.student_interests FOR SELECT USING (true);
CREATE POLICY "students_manage_own_interests" ON public.student_interests FOR ALL USING (auth.uid() = student_id);
