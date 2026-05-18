---
phase: 26
plan: 1
wave: 1
---

# Plan 26.1: High-Fidelity Tab Screens (Skills, Interests, Settings)

## Objective
Revamp the Skills, Interests, and Settings tabs inside the Student Edit Profile screen to match the high-fidelity UI layout from the screenshots exactly. This includes implementing a premium selection grid for preset skills and interests, a green availability toggle switch, and a high-fidelity selector list for goals, fully backed by the database and API.

## Context
- `e:\studentsociety\mobile\app\(student)\edit-profile.tsx`
- `e:\studentsociety\backend\src\modules\profile\profile.controller.ts`
- `e:\studentsociety\supabase\migrations\20260518000000_profile_edit_columns.sql`

## Tasks

<task type="auto">
  <name>Database Availability Column Patch</name>
  <files>
    e:\studentsociety\supabase\migrations\20260518000000_profile_edit_columns.sql
  </files>
  <action>
    - Update `20260518000000_profile_edit_columns.sql` to add `availability` BOOLEAN DEFAULT true column to the `extended_profiles` table so availability toggles can be saved in the database.
  </action>
  <verify>grep -q "availability" e:\studentsociety\supabase\migrations\20260518000000_profile_edit_columns.sql</verify>
  <done>Database schema updated with availability column check.</done>
</task>

<task type="auto">
  <name>Backend Profile Controller Expansion</name>
  <files>
    e:\studentsociety\backend\src\modules\profile\profile.controller.ts
  </files>
  <action>
    - Update the `updateProfile` and `getMe` controllers in `profile.controller.ts` to fully support and return the `availability` and `goal` fields.
    - Standardize default responses so that a student's availability status is initialized correctly.
  </action>
  <verify>grep -q "availability" e:\studentsociety\backend\src\modules\profile\profile.controller.ts</verify>
  <done>Backend controllers support getting and saving availability and goals.</done>
</task>

<task type="auto">
  <name>High-Fidelity Tab Screens UI implementation</name>
  <files>
    e:\studentsociety\mobile\app\(student)\edit-profile.tsx
    e:\studentsociety\mobile\app\(student)\profile.tsx
  </files>
  <action>
    - Refactor `mobile/app/(student)/edit-profile.tsx` to match the custom screenshot designs exactly:
      1. **Skills Tab**:
         - Render "Selected: {N}" counter.
         - Show a premium responsive grid of preset skill pills (React Native, React, Node.js, Python, Machine Learning, UI/UX, Figma, Flutter, Java, C++, PostgreSQL, MongoDB, Docker, IoT, Arduino, Blockchain, TypeScript, Swift).
         - Active selection: blue bordered card with blue text. Unselected: gray/slate border.
         - Toggling a pill updates the state arrays directly.
      2. **Interests Tab**:
         - Render "Selected: {N}" counter.
         - Show grid of preset interests (AI, FinTech, Web3, Social Impact, E-Commerce, EdTech, Gaming, IoT, Design Systems, Research, Startup, Open Source).
         - Active selection: blue bordered card with blue text.
      3. **Settings Tab**:
         - Render **Availability** section with switch toggle in green ("Available to collaborate").
         - Render **Your Goal** section with high-fidelity select cards (🚀 Looking for a Team, 🤝 Open to Join, 👀 Just Exploring) with a blue checked indicator for active selection.
    - Refactor student [`profile.tsx`](file:///e:/studentsociety/mobile/app/(student)/profile.tsx) to read and render the dynamic `availability` and `goal` states cleanly.
  </action>
  <verify>grep -q "Looking for a Team" e:\studentsociety\mobile\app\(student)\edit-profile.tsx</verify>
  <done>Mobile client matches the target high-fidelity edit profile mock designs 100%.</done>
</task>

## Success Criteria
- [ ] Skills and Interests tabs display exact grid list of presets with dynamic active blue/slate style changes.
- [ ] Settings tab toggle switch matches premium green branding.
- [ ] Goal select card updates are persisted and reflected immediately in profile.
