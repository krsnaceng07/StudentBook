---
phase: 10
plan: 1
wave: 1
---

# Plan 10.1: Database Schema for Profile

## Objective
Update the `extended_profiles` table to include `interests` and `goal` fields.

## Context
- `e:\studentsociety\backend\supabase\migrations\20240516_init_v2.sql`

## Tasks

<task type="auto">
  <name>Add interests and goal fields</name>
  <files>
    e:\studentsociety\backend\supabase\migrations\20240516_init_v2.sql
  </files>
  <action>
    - Add `interests TEXT[]` to the `extended_profiles` table definition.
    - Add `goal TEXT` to the `extended_profiles` table definition.
  </action>
  <verify>grep "interests" "e:\studentsociety\backend\supabase\migrations\20240516_init_v2.sql"</verify>
  <done>extended_profiles table contains interests and goal fields.</done>
</task>

## Success Criteria
- [ ] `interests` and `goal` fields exist in `extended_profiles` table.
