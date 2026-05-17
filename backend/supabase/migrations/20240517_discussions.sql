-- Phase 6: Discussions & Comments
-- Support for 'Questions' and 'Team Search'

-- 1. Discussions Table
CREATE TABLE public.discussions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  type         TEXT CHECK (type IN ('question', 'team_search')) NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- 2. Discussion Comments Table
CREATE TABLE public.discussion_comments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_comments ENABLE ROW LEVEL SECURITY;

-- 4. Policies for Discussions
CREATE POLICY "anyone_read_discussions" ON public.discussions FOR SELECT USING (true);
CREATE POLICY "students_create_discussions" ON public.discussions FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'student'
);
CREATE POLICY "owners_manage_discussions" ON public.discussions FOR ALL USING (auth.uid() = user_id);

-- 5. Policies for Comments
CREATE POLICY "anyone_read_comments" ON public.discussion_comments FOR SELECT USING (true);
CREATE POLICY "students_create_comments" ON public.discussion_comments FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'student'
);
CREATE POLICY "owners_manage_comments" ON public.discussion_comments FOR ALL USING (auth.uid() = user_id);

-- 6. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_discussions_updated_at
BEFORE UPDATE ON public.discussions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
