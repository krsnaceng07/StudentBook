-- Supabase Combined Master Schema (Idempotent & Safe)
-- Designed to be run multiple times without errors (Skips existing tables/triggers/policies)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================
-- 1. TABLES CREATION (SAFE & IDEMPOTENT)
-- ===================================================

-- Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    provider TEXT DEFAULT 'email',
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'banned', 'deleted')),
    bio TEXT,
    headline TEXT DEFAULT 'Student at University',
    experience_level TEXT DEFAULT 'Beginner',
    field TEXT,
    skills TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    goals TEXT[] DEFAULT '{}',
    availability TEXT DEFAULT 'Open for Projects',
    avatar TEXT,
    is_private BOOLEAN DEFAULT false,
    show_email BOOLEAN DEFAULT false,
    show_online_status BOOLEAN DEFAULT true,
    show_mutual_connections BOOLEAN DEFAULT true,
    allow_messages_from TEXT DEFAULT 'everyone' CHECK (allow_messages_from IN ('everyone', 'connections')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    author_id UUID REFERENCES public.profiles(id) NOT NULL,
    content TEXT,
    images TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    mentions UUID[] DEFAULT '{}',
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    type TEXT DEFAULT 'post' CHECK (type IN ('post', 'note', 'pdf', 'resource')),
    file_url TEXT,
    field TEXT DEFAULT 'General',
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'connections')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes Table
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    is_group BOOLEAN DEFAULT false,
    name TEXT,
    avatar TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation Participants Table
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

-- Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) NOT NULL,
    text TEXT,
    attachments JSONB DEFAULT '[]',
    reply_to UUID REFERENCES public.messages(id),
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'seen', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'Study Group',
    tags TEXT[] DEFAULT '{}',
    looking_for TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'Recruiting' CHECK (status IN ('Recruiting', 'Active', 'Full', 'Archived')),
    is_public BOOLEAN DEFAULT true,
    leader_id UUID REFERENCES public.profiles(id) NOT NULL,
    avatar TEXT,
    links JSONB DEFAULT '[]',
    conversation_id UUID REFERENCES public.conversations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Members Table
CREATE TABLE IF NOT EXISTS public.team_members (
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (team_id, user_id)
);

-- Connections Table
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

-- Discussions Table
CREATE TABLE IF NOT EXISTS public.discussions (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title        TEXT NOT NULL,
    content      TEXT NOT NULL,
    type         TEXT CHECK (type IN ('question', 'team_search')) NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT now(),
    updated_at   TIMESTAMPTZ DEFAULT now()
);

-- Discussion Comments Table
CREATE TABLE IF NOT EXISTS public.discussion_comments (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE,
    user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content       TEXT NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT now()
);


-- ===================================================
-- 2. FUNCTIONS & PROCEDURES (SAFE RE-DECLARATION)
-- ===================================================

-- Function to auto-update 'updated_at' column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to auto-update discussions 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to auto-create public profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Student'), 
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ===================================================
-- 3. TRIGGERS (DROP IF EXISTS & SAFE RE-CREATE)
-- ===================================================

-- Profiles Trigger
DROP TRIGGER IF EXISTS update_profiles_modtime ON public.profiles;
CREATE TRIGGER update_profiles_modtime 
BEFORE UPDATE ON public.profiles 
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Posts Trigger
DROP TRIGGER IF EXISTS update_posts_modtime ON public.posts;
CREATE TRIGGER update_posts_modtime 
BEFORE UPDATE ON public.posts 
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Messages Trigger
DROP TRIGGER IF EXISTS update_messages_modtime ON public.messages;
CREATE TRIGGER update_messages_modtime 
BEFORE UPDATE ON public.messages 
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Teams Trigger
DROP TRIGGER IF EXISTS update_teams_modtime ON public.teams;
CREATE TRIGGER update_teams_modtime 
BEFORE UPDATE ON public.teams 
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Discussions Trigger
DROP TRIGGER IF EXISTS update_discussions_updated_at ON public.discussions;
CREATE TRIGGER update_discussions_updated_at
BEFORE UPDATE ON public.discussions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Signup Auth Hook Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ===================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES Setup
-- ===================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_comments ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "allow_read_all_profiles" ON public.profiles;
CREATE POLICY "allow_read_all_profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "allow_update_own_profile" ON public.profiles;
CREATE POLICY "allow_update_own_profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Posts Policies
DROP POLICY IF EXISTS "allow_read_all_posts" ON public.posts;
CREATE POLICY "allow_read_all_posts" ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "allow_insert_authenticated_posts" ON public.posts;
CREATE POLICY "allow_insert_authenticated_posts" ON public.posts FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

DROP POLICY IF EXISTS "allow_manage_own_posts" ON public.posts;
CREATE POLICY "allow_manage_own_posts" ON public.posts FOR ALL USING (auth.uid() = author_id);

-- Comments Policies
DROP POLICY IF EXISTS "allow_read_all_comments" ON public.comments;
CREATE POLICY "allow_read_all_comments" ON public.comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "allow_insert_authenticated_comments" ON public.comments;
CREATE POLICY "allow_insert_authenticated_comments" ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

DROP POLICY IF EXISTS "allow_manage_own_comments" ON public.comments;
CREATE POLICY "allow_manage_own_comments" ON public.comments FOR ALL USING (auth.uid() = user_id);

-- Likes Policies
DROP POLICY IF EXISTS "allow_read_all_likes" ON public.likes;
CREATE POLICY "allow_read_all_likes" ON public.likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "allow_insert_own_likes" ON public.likes;
CREATE POLICY "allow_insert_own_likes" ON public.likes FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

DROP POLICY IF EXISTS "allow_delete_own_likes" ON public.likes;
CREATE POLICY "allow_delete_own_likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Conversations Policies
DROP POLICY IF EXISTS "allow_read_my_conversations" ON public.conversations;
CREATE POLICY "allow_read_my_conversations" ON public.conversations FOR SELECT 
USING (id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()));

-- Conversation Participants Policies
DROP POLICY IF EXISTS "allow_read_my_participants" ON public.conversation_participants;
CREATE POLICY "allow_read_my_participants" ON public.conversation_participants FOR SELECT USING (user_id = auth.uid() OR auth.role() = 'authenticated');

-- Messages Policies
DROP POLICY IF EXISTS "allow_read_my_messages" ON public.messages;
CREATE POLICY "allow_read_my_messages" ON public.messages FOR SELECT 
USING (conversation_id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "allow_insert_my_messages" ON public.messages;
CREATE POLICY "allow_insert_my_messages" ON public.messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

-- Teams Policies
DROP POLICY IF EXISTS "allow_read_all_teams" ON public.teams;
CREATE POLICY "allow_read_all_teams" ON public.teams FOR SELECT USING (true);

DROP POLICY IF EXISTS "allow_insert_authenticated_teams" ON public.teams;
CREATE POLICY "allow_insert_authenticated_teams" ON public.teams FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = leader_id);

DROP POLICY IF EXISTS "allow_manage_own_teams" ON public.teams;
CREATE POLICY "allow_manage_own_teams" ON public.teams FOR ALL USING (auth.uid() = leader_id);

-- Connections Policies
DROP POLICY IF EXISTS "allow_read_own_connections" ON public.connections;
CREATE POLICY "allow_read_own_connections" ON public.connections FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "allow_insert_own_connections" ON public.connections;
CREATE POLICY "allow_insert_own_connections" ON public.connections FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Discussions Policies
DROP POLICY IF EXISTS "anyone_read_discussions" ON public.discussions;
CREATE POLICY "anyone_read_discussions" ON public.discussions FOR SELECT USING (true);

DROP POLICY IF EXISTS "students_create_discussions" ON public.discussions;
CREATE POLICY "students_create_discussions" ON public.discussions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "owners_manage_discussions" ON public.discussions;
CREATE POLICY "owners_manage_discussions" ON public.discussions FOR ALL USING (auth.uid() = user_id);

-- Discussion Comments Policies
DROP POLICY IF EXISTS "anyone_read_comments" ON public.discussion_comments;
CREATE POLICY "anyone_read_comments" ON public.discussion_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "students_create_comments" ON public.discussion_comments;
CREATE POLICY "students_create_comments" ON public.discussion_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "owners_manage_comments" ON public.discussion_comments;
CREATE POLICY "owners_manage_comments" ON public.discussion_comments FOR ALL USING (auth.uid() = user_id);
