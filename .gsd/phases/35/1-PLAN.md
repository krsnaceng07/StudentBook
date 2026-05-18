---
phase: 35
plan: 1
wave: 1
---

# Plan 35.1: Database Migrations & Backend API Settings Integration

## Objective
Establish the database columns and backend controller endpoints to store, retrieve, and update custom student settings (push notification, email digest, and profile visibility) in real-time.

## Context
- .gsd/SPEC.md
- e:\studentsociety\backend\src\modules\profile\profile.controller.ts
- e:\studentsociety\backend\src\modules\profile\profile.routes.ts

## Tasks

<task type="auto">
  <name>Create settings database migration script</name>
  <files>e:\studentsociety\backend\supabase\migrations\20260521000000_student_settings_fields.sql</files>
  <action>
    Create a new PostgreSQL migration file containing ALTER TABLE statements to add settings columns to the extended_profiles table:
    - Add settings_push BOOLEAN DEFAULT true.
    - Add settings_email BOOLEAN DEFAULT false.
    - Add settings_visibility TEXT DEFAULT 'public'.
    Ensure the columns are added safely using IF NOT EXISTS checks.
  </action>
  <verify>grep "ALTER TABLE" e:\studentsociety\backend\supabase\migrations\20260521000000_student_settings_fields.sql</verify>
  <done>The migration script exists and has the correct DDL statements for public.extended_profiles.</done>
</task>

<task type="auto">
  <name>Update backend profile controller to support settings payload</name>
  <files>e:\studentsociety\backend\src\modules\profile\profile.controller.ts</files>
  <action>
    Modify the updateProfile controller:
    - Extract settings_push, settings_email, and settings_visibility from req.body.
    - Append them to the updateData upsert payload if they are not undefined.
    - Ensure getMe and getProfileById return these fields cleanly as part of the profile object.
  </action>
  <verify>cat e:\studentsociety\backend\src\modules\profile\profile.controller.ts | grep "settings_"</verify>
  <done>The controller parses and upserts the settings fields correctly without any TypeScript compilation warnings.</done>
</task>

## Success Criteria
- [ ] Database schema updated to support push, email, and visibility settings.
- [ ] PUT /api/v1/profile/update accepts and stores settings_push, settings_email, and settings_visibility.
- [ ] GET /api/v1/profile/me retrieves the latest saved settings from the database.
