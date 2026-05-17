---
phase: 9
plan: 1
wave: 1
---

# Plan 9.1: Database Schema for Teams

## Objective
Add `teams` and `team_members` tables to the migration to support the Team screen.

## Context
- `e:\studentsociety\backend\supabase\migrations\20240516_init_v2.sql`

## Tasks

<task type="auto">
  <name>Add teams and team_members tables with RLS</name>
  <files>
    e:\studentsociety\backend\supabase\migrations\20240516_init_v2.sql
  </files>
  <action>
    - Append two new tables before the RLS section:
    
    ```sql
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
    ```
    
    - Add RLS: teams readable by members, insertable by any auth user. team_members readable by members of the team.
    - Also add DROP TABLE for `teams` and `team_members` in the cleanup section at the top.
  </action>
  <verify>grep "CREATE TABLE public.teams" "e:\studentsociety\backend\supabase\migrations\20240516_init_v2.sql"</verify>
  <done>Migration contains teams and team_members table definitions with RLS.</done>
</task>

## Success Criteria
- [ ] `teams` and `team_members` tables defined in migration.
- [ ] RLS policies added.
- [ ] DROP TABLE statements updated in cleanup section.
