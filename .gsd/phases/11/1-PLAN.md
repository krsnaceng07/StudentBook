---
phase: 11
plan: 1
wave: 1
---

# Plan 11.1: Database Schema for Notifications

## Objective
Add a `notifications` table to the database schema.

## Context
- `e:\studentsociety\backend\supabase\migrations\20240516_init_v2.sql`

## Tasks

<task type="auto">
  <name>Add notifications table with RLS</name>
  <files>
    e:\studentsociety\backend\supabase\migrations\20240516_init_v2.sql
  </files>
  <action>
    - Append the `notifications` table before the RLS section:
    
    ```sql
    CREATE TABLE public.notifications (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
      actor_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
      type       TEXT CHECK (type IN ('connection_accepted', 'team_invite', 'event_post', 'connection_request')),
      content    TEXT NOT NULL,
      is_read    BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    ```
    - Add RLS policy: notifications readable and updateable by `user_id = auth.uid()`.
    - Add `DROP TABLE IF EXISTS public.notifications CASCADE;` to the cleanup section at the top.
  </action>
  <verify>grep "CREATE TABLE public.notifications" "e:\studentsociety\backend\supabase\migrations\20240516_init_v2.sql"</verify>
  <done>Migration contains notifications table definitions with RLS.</done>
</task>

## Success Criteria
- [ ] `notifications` table defined in migration.
- [ ] RLS policies added.
