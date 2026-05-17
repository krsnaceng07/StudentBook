---
phase: 4
plan: 1
wave: 1
---

# Plan 4.1: Database Schema Expansion

## Objective
Update the Supabase migration script to recreate the specific tables needed for the CollabMate UI: extended profiles (teammates), events, connections (for connect requests), and activities (for the recent activity feed).

## Context
- .gsd/SPEC.md
- e:\studentsociety\backend\supabase\migrations\20240516_init_v2.sql

## Tasks

<task type="auto">
  <name>Expand Database Schema</name>
  <files>e:\studentsociety\backend\supabase\migrations\20240516_init_v2.sql</files>
  <action>
    Modify the migration script to include the following tables with proper RLS policies:
    - `extended_profiles`: Linked to `profiles` (for UI initials, names, roles like 'Backend', location, skills array).
    - `events`: Needs id, title, description, date, location, banner_url.
    - `connections`: For "Connect" feature, tracking requests between users.
    - `activities`: To track and display the "Recent activity" feed (e.g., user_id, action_type, description, timestamp).
  </action>
  <verify>grep "CREATE TABLE public.extended_profiles" e:\studentsociety\backend\supabase\migrations\20240516_init_v2.sql</verify>
  <done>The migration script contains CREATE TABLE statements for extended_profiles, events, connections, and activities.</done>
</task>

## Success Criteria
- [ ] Migration script is successfully updated with the 4 new tables.
- [ ] RLS policies are attached to the new tables.
