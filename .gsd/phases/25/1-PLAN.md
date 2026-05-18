---
phase: 25
plan: 1
wave: 1
---

# Plan 25.1: Student Side Edit Profile Screen UI & Functional Integration

## Objective
Implement a fully functional, premium Edit Profile screen on the student side that allows editing Basic details, Skills, Interests, and Settings, matching the premium mock design exactly. This plan spans setting up the database migrations, implementing the backend PUT profile update endpoint, and constructing the frontend UI screen with active backend integration.

## Context
- `e:\studentsociety\backend\src\modules\profile\profile.routes.ts`
- `e:\studentsociety\backend\src\modules\profile\profile.controller.ts`
- `e:\studentsociety\mobile\app\(student)\profile.tsx`
- `e:\studentsociety\mobile\app\(student)\edit-profile.tsx`

## Tasks

<task type="auto">
  <name>Database Schema Migration Patch</name>
  <files>
    e:\studentsociety\supabase\migrations\20260518000000_profile_edit_columns.sql
  </files>
  <action>
    - Create a new migration file `20260518000000_profile_edit_columns.sql` to add:
      1. `social_links` JSONB DEFAULT '{}'::jsonb column to store GitHub, Portfolio, etc.
      2. `university_year` TEXT CHECK (university_year IN ('1st', '2nd', '3rd', '4th', 'Graduate')) to store study year.
      3. `department` TEXT to store academic department/major.
    - Provide the exact SQL migration instructions that can be safely run in the Supabase SQL Editor.
  </action>
  <verify>test -f e:\studentsociety\supabase\migrations\20260518000000_profile_edit_columns.sql</verify>
  <done>Database columns and checks are created and documented to support student edit profile fields.</done>
</task>

<task type="auto">
  <name>Backend PUT Profile Update Endpoint</name>
  <files>
    e:\studentsociety\backend\src\modules\profile\profile.routes.ts
    e:\studentsociety\backend\src\modules\profile\profile.controller.ts
  </files>
  <action>
    - In `profile.controller.ts`, implement an `updateProfile` controller:
      * Validate request body (full_name, university, department, university_year, bio, skills, interests, social_links).
      * Upsert/update user records in `extended_profiles` table using Supabase client `.upsert([{ id: userId, ... }])`.
      * Update `full_name` in main `profiles` table if updated (to sync with auth/onboarding metadata).
      * Return `{ success: true, data: updatedProfile }`.
    - In `profile.routes.ts`, mount `PUT /update` guarded with `authMiddleware` and `roleMiddleware(['student', 'college'])` so both user roles can safely update their profiles.
  </action>
  <verify>grep -q "updateProfile" e:\studentsociety\backend\src\modules\profile\profile.routes.ts</verify>
  <done>Backend PUT /api/v1/profile/update is fully operational and safely integrated with Supabase.</done>
</task>

<task type="auto">
  <name>Frontend Student Edit Profile UI Screen</name>
  <files>
    e:\studentsociety\mobile\app\(student)\edit-profile.tsx
    e:\studentsociety\mobile\app\(student)\profile.tsx
  </files>
  <action>
    - Create `mobile/app/(student)/edit-profile.tsx`:
      * Setup high-fidelity tab bar: Basic, Skills, Interests, Settings.
      * Under **Basic**: Implement inputs for Full Name, College (University), Department, Year Selectors (1st, 2nd, 3rd, 4th, Graduate buttons), Short Bio (TextArea), GitHub URL, and Portfolio URL.
      * Populate inputs dynamically by fetching `/profile/me` on load.
      * Handle validation and submit flow: on pressing the premium "Save" button in the header, call `PUT /profile/update` and display a success toast, then route back.
      * Implement a back button redirecting cleanly.
    - In `mobile/app/(student)/profile.tsx`, connect the header "Edit" button to navigate to `/(student)/edit-profile`.
  </action>
  <verify>grep -q "edit-profile" e:\studentsociety\mobile\app\(student)\profile.tsx</verify>
  <done>Frontend UI for edit profile screen is fully wired up, responsive, and syncs data to the backend.</done>
</task>

## Success Criteria
- [ ] Students can open the Edit Profile screen from their profile page.
- [ ] Custom tab bar filters inputs cleanly (Basic, Skills, Interests, Settings).
- [ ] Save updates the database successfully, and changes are visible in My Profile immediately.
