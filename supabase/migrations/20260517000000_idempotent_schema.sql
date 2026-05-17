-- Supabase Combined Master Schema (Self-Healing & Idempotent)
-- Designed to upgrade existing tables dynamically if they exist, or create them new!

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

-- ===================================================
-- SELF-HEALING: DYNAMICALLY UPGRADE PROFILES COLUMNS IF THEY ARE MISSING
-- ===================================================
DO $$
BEGIN
    -- profiles.name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='name') THEN
        ALTER TABLE public.profiles ADD COLUMN name TEXT NOT NULL DEFAULT 'Student';
    END IF;

    -- profiles.username
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='username') THEN
        ALTER TABLE public.profiles ADD COLUMN username TEXT UNIQUE;
    END IF;

    -- profiles.provider
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='provider') THEN
        ALTER TABLE public.profiles ADD COLUMN provider TEXT DEFAULT 'email';
    END IF;

    -- profiles.status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='status') THEN
        ALTER TABLE public.profiles ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'banned', 'deleted'));
    END IF;

    -- profiles.bio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='bio') THEN
        ALTER TABLE public.profiles ADD COLUMN bio TEXT;
    END IF;

    -- profiles.headline
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='headline') THEN
        ALTER TABLE public.profiles ADD COLUMN headline TEXT DEFAULT 'Student at University';
    END IF;

    -- profiles.experience_level
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='experience_level') THEN
        ALTER TABLE public.profiles ADD COLUMN experience_level TEXT DEFAULT 'Beginner';
    END IF;

    -- profiles.field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='field') THEN
        ALTER TABLE public.profiles ADD COLUMN field TEXT;
    END IF;

    -- profiles.skills
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='skills') THEN
        ALTER TABLE public.profiles ADD COLUMN skills TEXT[] DEFAULT '{}';
    END IF;

    -- profiles.interests
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='interests') THEN
        ALTER TABLE public.profiles ADD COLUMN interests TEXT[] DEFAULT '{}';
    END IF;

    -- profiles.goals
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='goals') THEN
        ALTER TABLE public.profiles ADD COLUMN goals TEXT[] DEFAULT '{}';
    END IF;

    -- profiles.availability
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='availability') THEN
        ALTER TABLE public.profiles ADD COLUMN availability TEXT DEFAULT 'Open for Projects';
    END IF;

    -- profiles.avatar
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='avatar') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar TEXT;
    END IF;

    -- profiles.is_private
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='is_private') THEN
        ALTER TABLE public.profiles ADD COLUMN is_private BOOLEAN DEFAULT false;
    END IF;

    -- profiles.show_email
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='show_email') THEN
        ALTER TABLE public.profiles ADD COLUMN show_email BOOLEAN DEFAULT false;
    END IF;

    -- profiles.show_online_status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='show_online_status') THEN
        ALTER TABLE public.profiles ADD COLUMN show_online_status BOOLEAN DEFAULT true;
    END IF;

    -- profiles.show_mutual_connections
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='show_mutual_connections') THEN
        ALTER TABLE public.profiles ADD COLUMN show_mutual_connections BOOLEAN DEFAULT true;
    END IF;

    -- profiles.allow_messages_from
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='allow_messages_from') THEN
        ALTER TABLE public.profiles ADD COLUMN allow_messages_from TEXT DEFAULT 'everyone' CHECK (allow_messages_from IN ('everyone', 'connections'));
    END IF;
END $$;


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

-- ===================================================
-- SELF-HEALING: DYNAMICALLY UPGRADE CONVERSATIONS COLUMNS IF THEY ARE MISSING
-- ===================================================
DO $$
BEGIN
    -- conversations.is_group
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='conversations' AND column_name='is_group') THEN
        ALTER TABLE public.conversations ADD COLUMN is_group BOOLEAN DEFAULT false;
    END IF;

    -- conversations.name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='conversations' AND column_name='name') THEN
        ALTER TABLE public.conversations ADD COLUMN name TEXT;
    END IF;

    -- conversations.avatar
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='conversations' AND column_name='avatar') THEN
        ALTER TABLE public.conversations ADD COLUMN avatar TEXT;
    END IF;

    -- conversations.last_message_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='conversations' AND column_name='last_message_at') THEN
        ALTER TABLE public.conversations ADD COLUMN last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;


-- Conversation Participants Table
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

-- ===================================================
-- SELF-HEALING: DYNAMICALLY UPGRADE CONVERSATION PARTICIPANTS COLUMNS IF THEY ARE MISSING
-- ===================================================
DO $$
BEGIN
    -- conversation_participants.role
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='conversation_participants' AND column_name='role') THEN
        ALTER TABLE public.conversation_participants ADD COLUMN role TEXT DEFAULT 'member';
    END IF;

    -- conversation_participants.joined_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='conversation_participants' AND column_name='joined_at') THEN
        ALTER TABLE public.conversation_participants ADD COLUMN joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;


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

-- ===================================================
-- SELF-HEALING: DYNAMICALLY UPGRADE MESSAGES COLUMNS IF THEY ARE MISSING
-- ===================================================
DO $$
BEGIN
    -- messages.text
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='messages' AND column_name='text') THEN
        ALTER TABLE public.messages ADD COLUMN text TEXT;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='messages' AND column_name='content') THEN
            UPDATE public.messages SET text = content;
        END IF;
    END IF;

    -- messages.attachments
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='messages' AND column_name='attachments') THEN
        ALTER TABLE public.messages ADD COLUMN attachments JSONB DEFAULT '[]';
    END IF;

    -- messages.reply_to
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='messages' AND column_name='reply_to') THEN
        ALTER TABLE public.messages ADD COLUMN reply_to UUID REFERENCES public.messages(id);
    END IF;

    -- messages.status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='messages' AND column_name='status') THEN
        ALTER TABLE public.messages ADD COLUMN status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'seen', 'deleted'));
    END IF;

    -- messages.updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='messages' AND column_name='updated_at') THEN
        ALTER TABLE public.messages ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;


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

-- ===================================================
-- SELF-HEALING: DYNAMICALLY UPGRADE TEAMS COLUMNS IF THEY ARE MISSING
-- ===================================================
DO $$
BEGIN
    -- teams.description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='teams' AND column_name='description') THEN
        ALTER TABLE public.teams ADD COLUMN description TEXT DEFAULT 'Study Group and Project Collaboration';
    END IF;

    -- teams.category
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='teams' AND column_name='category') THEN
        ALTER TABLE public.teams ADD COLUMN category TEXT DEFAULT 'Study Group';
    END IF;

    -- teams.tags
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='teams' AND column_name='tags') THEN
        ALTER TABLE public.teams ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;

    -- teams.looking_for
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='teams' AND column_name='looking_for') THEN
        ALTER TABLE public.teams ADD COLUMN looking_for TEXT[] DEFAULT '{}';
    END IF;

    -- teams.status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='teams' AND column_name='status') THEN
        ALTER TABLE public.teams ADD COLUMN status TEXT DEFAULT 'Recruiting' CHECK (status IN ('Recruiting', 'Active', 'Full', 'Archived'));
    END IF;

    -- teams.is_public
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='teams' AND column_name='is_public') THEN
        ALTER TABLE public.teams ADD COLUMN is_public BOOLEAN DEFAULT true;
    END IF;

    -- teams.leader_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='teams' AND column_name='leader_id') THEN
        -- If 'created_by' exists, populate 'leader_id' from it
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='teams' AND column_name='created_by') THEN
            ALTER TABLE public.teams ADD COLUMN leader_id UUID REFERENCES public.profiles(id);
            UPDATE public.teams SET leader_id = created_by;
            ALTER TABLE public.teams ALTER COLUMN leader_id SET NOT NULL;
        ELSE
            -- Fallback if no created_by exists
            ALTER TABLE public.teams ADD COLUMN leader_id UUID REFERENCES public.profiles(id);
        END IF;
    END IF;

    -- teams.avatar
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='teams' AND column_name='avatar') THEN
        ALTER TABLE public.teams ADD COLUMN avatar TEXT;
    END IF;

    -- teams.links
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='teams' AND column_name='links') THEN
        ALTER TABLE public.teams ADD COLUMN links JSONB DEFAULT '[]';
    END IF;

    -- teams.conversation_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='teams' AND column_name='conversation_id') THEN
        ALTER TABLE public.teams ADD COLUMN conversation_id UUID REFERENCES public.conversations(id);
    END IF;
END $$;


-- Team Members Table
CREATE TABLE IF NOT EXISTS public.team_members (
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (team_id, user_id)
);

-- Connections Table (Dual-compatible supporting user1_id/user2_id & sender_id/receiver_id columns)
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

-- ===================================================
-- SELF-HEALING: DYNAMICALLY UPGRADE CONNECTIONS COLUMNS IF THEY ARE MISSING
-- ===================================================
DO $$
BEGIN
    -- connections.user1_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='connections' AND column_name='user1_id') THEN
        ALTER TABLE public.connections ADD COLUMN user1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- connections.user2_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='connections' AND column_name='user2_id') THEN
        ALTER TABLE public.connections ADD COLUMN user2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- connections.sender_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='connections' AND column_name='sender_id') THEN
        ALTER TABLE public.connections ADD COLUMN sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- connections.receiver_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='connections' AND column_name='receiver_id') THEN
        ALTER TABLE public.connections ADD COLUMN receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- Synchronize old records if any
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='connections' AND column_name='sender_id') THEN
        UPDATE public.connections SET user1_id = sender_id WHERE user1_id IS NULL AND sender_id IS NOT NULL;
        UPDATE public.connections SET sender_id = user1_id WHERE sender_id IS NULL AND user1_id IS NOT NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='connections' AND column_name='receiver_id') THEN
        UPDATE public.connections SET user2_id = receiver_id WHERE user2_id IS NULL AND receiver_id IS NOT NULL;
        UPDATE public.connections SET receiver_id = user2_id WHERE receiver_id IS NULL AND user2_id IS NOT NULL;
    END IF;
END $$;


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

-- Function to bidirectionally synchronize connections column pairs
CREATE OR REPLACE FUNCTION sync_connections_columns()
RETURNS TRIGGER AS $$
BEGIN
    -- If sender_id is set, sync to user1_id
    IF NEW.sender_id IS NOT NULL THEN
        NEW.user1_id := NEW.sender_id;
    ELSIF NEW.user1_id IS NOT NULL THEN
        NEW.sender_id := NEW.user1_id;
    END IF;

    -- If receiver_id is set, sync to user2_id
    IF NEW.receiver_id IS NOT NULL THEN
        NEW.user2_id := NEW.receiver_id;
    ELSIF NEW.user2_id IS NOT NULL THEN
        NEW.sender_id := NEW.user2_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


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

-- Bidirectional Connections Columns Trigger
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trg_sync_connections_columns' 
        AND tgrelid = 'public.connections'::regclass
    ) THEN
        EXECUTE 'DROP TRIGGER trg_sync_connections_columns ON public.connections';
    END IF;

    EXECUTE 'CREATE TRIGGER trg_sync_connections_columns
             BEFORE INSERT OR UPDATE ON public.connections
             FOR EACH ROW EXECUTE FUNCTION sync_connections_columns()';
END $$;


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
CREATE POLICY "allow_insert_own_connections" ON public.connections FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND (auth.uid() = user1_id OR auth.uid() = user2_id));

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
