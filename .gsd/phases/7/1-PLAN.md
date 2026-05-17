---
phase: 7
plan: 1
wave: 1
---

# Plan 7.1: Database Schema for Messages

## Objective
Add `conversations` and `messages` tables to support the Messages inbox feature.

## Context
- `e:\studentsociety\backend\supabase\migrations\20240516_init_v2.sql`
- The schema already has DROP statements for `conversations`, `conversation_participants`, and `messages` tables.

## Tasks

<task type="auto">
  <name>Add Conversations and Messages Tables</name>
  <files>
    e:\studentsociety\backend\supabase\migrations\20240516_init_v2.sql
  </files>
  <action>
    - Append the following two new tables at the bottom of the COLLABMATE TABLES section (before the RLS section):
    
    ```sql
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
    ```
    
    - Also add RLS policies for these tables at the bottom of the RLS section:
      - `conversations`: select if user is a participant.
      - `messages`: select if user is a participant of the conversation; insert if sender_id = auth.uid().
  </action>
  <verify>grep "CREATE TABLE public.messages" "e:\studentsociety\backend\supabase\migrations\20240516_init_v2.sql"</verify>
  <done>Migration file contains conversations, conversation_participants, and messages table definitions.</done>
</task>

## Success Criteria
- [ ] All 3 new tables are defined in the migration.
- [ ] RLS policies are added for security.
