---
phase: 27
plan: 1
wave: 1
---

# Plan 27.1: College Side Settings and Edit College Profile Systems

## Objective
Implement high-fidelity fully functional settings screen and edit college profile systems for the college side of CollabSpace. This includes adding DB columns, backend API controller updates, a beautiful Settings menu page, and an interactive Edit Profile form exactly matching the provided screenshots.

## Context
- `e:\studentsociety\backend\src\modules\profile\profile.controller.ts`
- `e:\studentsociety\mobile\app\(college)\profile.tsx`
- `e:\studentsociety\mobile\app\(college)\_layout.tsx`

## Tasks

<task type="auto">
  <name>Database College Profiles Schema Patch</name>
  <files>
    e:\studentsociety\supabase\migrations\20260519000000_college_profile_columns.sql
  </files>
  <action>
    - Create a new Postgres migration file `20260519000000_college_profile_columns.sql` to add `college_type` (TEXT), `established_year` (TEXT), `website` (TEXT), and `contact_email` (TEXT) columns to the `extended_profiles` table.
  </action>
  <verify>test -f e:\studentsociety\supabase\migrations\20260519000000_college_profile_columns.sql</verify>
  <done>Postgres migration SQL patch file created.</done>
</task>

<task type="auto">
  <name>Backend Profile Controller & Type Alignment</name>
  <files>
    e:\studentsociety\backend\src\modules\profile\profile.controller.ts
  </files>
  <action>
    - Extend `updateProfile` in `profile.controller.ts` to retrieve and save the four new college fields: `college_type`, `established_year`, `website`, and `contact_email`.
    - Ensure both `updateProfile` and `getMe` controllers cleanly fetch and respond with these new columns for college-role logins.
  </action>
  <verify>grep -q "college_type" e:\studentsociety\backend\src\modules\profile\profile.controller.ts</verify>
  <done>Express backend server controllers support college-role properties.</done>
</task>

<task type="auto">
  <name>High-Fidelity College Settings Screen</name>
  <files>
    e:\studentsociety\mobile\app\(college)\settings.tsx
    e:\studentsociety\mobile\app\(college)\_layout.tsx
    e:\studentsociety\mobile\app\(college)\profile.tsx
  </files>
  <action>
    - Create a new premium screen at `mobile/app/(college)/settings.tsx` matching Screenshot 1:
      1. Green top status bar and back navigation button.
      2. Large profile header card containing avatar circle with initials, College Name, Email, and a `"College"` green tag pill.
      3. Account List group (Edit Profile -> navigates to `/edit-profile`, Change Password, Change Email).
      4. Notifications section (Push Notifications switch toggled on in green, Email Digest switch toggled off).
      5. Appearance and Support sections exactly matching visual styles.
    - Mount `settings` inside `mobile/app/(college)/_layout.tsx` set with `href: null` options.
    - Wire the Edit button in `mobile/app/(college)/profile.tsx` to launch `router.push('/(college)/settings')` cleanly.
  </action>
  <verify>test -f e:\studentsociety\mobile\app\(college)\settings.tsx</verify>
  <done>High-fidelity Settings screen v1 completely implemented.</done>
</task>

<task type="auto">
  <name>High-Fidelity Edit College Profile Screen</name>
  <files>
    e:\studentsociety\mobile\app\(college)\edit-profile.tsx
    e:\studentsociety\mobile\app\(college)\_layout.tsx
  </files>
  <action>
    - Create a new edit system screen at `mobile/app/(college)/edit-profile.tsx` matching Screenshot 2:
      1. Save button in header matching `#0F766E` green branding.
      2. Input forms: College Name, Location, Year Established, Website, Contact Email, About your institution (multiline).
      3. Premium **Type** selection grid presets (University, Engineering, Management, Polytechnic, Other). Selected type renders with emerald border (`border-emerald-600`) and emerald text (`text-emerald-600`).
      4. Connect forms with State variables, fetch values on load, and invoke `client.put('/profile/update')` to save all edits in one click.
    - Register `/edit-profile` route inside TabLayout with `href: null` configuration.
  </action>
  <verify>test -f e:\studentsociety\mobile\app\(college)\edit-profile.tsx</verify>
  <done>Edit College Profile layout fully wired and styled to perfection.</done>
</task>

## Success Criteria
- [ ] Settings page renders a beautiful top avatar card, active notification switches, and smooth edit navigation triggers.
- [ ] Edit College Profile shows styled preset type pills and dynamic inputs synced with PUT request payloads.
