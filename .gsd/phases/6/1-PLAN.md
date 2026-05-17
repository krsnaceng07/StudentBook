---
phase: 6
plan: 1
wave: 1
---

# Plan 6.1: Database Schema for Events

## Objective
Enhance the `events` table with `event_type` and `organizer` fields required by the Events screen UI.

## Context
- `e:\studentsociety\backend\supabase\migrations\20240516_init_v2.sql`

## Tasks

<task type="auto">
  <name>Update Events Table Schema</name>
  <files>
    e:\studentsociety\backend\supabase\migrations\20240516_init_v2.sql
  </files>
  <action>
    - Add `event_type TEXT CHECK (event_type IN ('Hackathon', 'Workshop', 'Competition'))` to the `events` table.
    - Add `organizer TEXT` to the `events` table.
    - Ensure they go inside the existing `events` table definition, placed logically before `created_at`.
  </action>
  <verify>grep "event_type" "e:\studentsociety\backend\supabase\migrations\20240516_init_v2.sql"</verify>
  <done>The migration file contains `event_type` and `organizer` columns in the events table.</done>
</task>

## Success Criteria
- [ ] `event_type` column added with constraint.
- [ ] `organizer` column added.
