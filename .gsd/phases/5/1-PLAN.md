---
phase: 5
plan: 1
wave: 1
---

# Plan 5.1: Database Schema Updates for Discover

## Objective
Enhance the `extended_profiles` table to store data required by the new Discover screen.

## Context
- `e:\studentsociety\backend\supabase\migrations\20240516_init_v2.sql`

## Tasks

<task type="auto">
  <name>Update Extended Profiles Schema</name>
  <files>
    e:\studentsociety\backend\supabase\migrations\20240516_init_v2.sql
  </files>
  <action>
    - Add `university TEXT` to the `extended_profiles` table definition.
    - Add `bio TEXT` to the `extended_profiles` table definition.
    - Ensure they are placed logically within the table definition.
  </action>
  <verify>grep "university" e:\studentsociety\backend\supabase\migrations\20240516_init_v2.sql</verify>
  <done>The migration script contains the new columns.</done>
</task>

## Success Criteria
- [ ] `university` column added.
- [ ] `bio` column added.
