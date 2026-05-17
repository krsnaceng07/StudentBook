---
phase: 10
plan: 2
wave: 2
depends_on: ["1"]
---

# Plan 10.2: Backend API + Frontend — Profile Screen

## Objective
Create the `GET /api/v1/profile/me` endpoint and build the "My Profile" UI screen matching the reference image.

## Context
- `e:\studentsociety\backend\src\modules\profile\` (new directory)
- `e:\studentsociety\backend\src\server.ts`
- `e:\studentsociety\mobile\app\(tabs)\profile.tsx`
- Reference: Top colored banner area, large circular initials avatar overlapping banner, bold name, university/location string, role_title + "Final Year" string, three stats (Connections, Events joined, Teams) separated by thin dividers, a Skills section with colored pill badges, an Interests section with pill badges, and a Goal section with body text.

## Tasks

<task type="auto">
  <name>Create Profile Backend Module</name>
  <files>
    e:\studentsociety\backend\src\modules\profile\profile.controller.ts
    e:\studentsociety\backend\src\modules\profile\profile.routes.ts
    e:\studentsociety\backend\src\server.ts
  </files>
  <action>
    - Create `profile.controller.ts` with `getMe` that returns the `extended_profiles` row for `req.user.id`.
    - Also fetch mock or real stats counts (e.g. connections=12, events_joined=3, teams=2).
    - Create `profile.routes.ts` mounted at `/api/v1/profile`.
  </action>
  <verify>grep "/api/v1/profile" "e:\studentsociety\backend\src\server.ts"</verify>
  <done>Profile route is mounted and functioning.</done>
</task>

<task type="auto">
  <name>Build Profile Screen UI</name>
  <files>
    e:\studentsociety\mobile\app\(tabs)\profile.tsx
  </files>
  <action>
    - Build UI using NativeWind and `useUIStore`.
    - Header: "My profile" left, settings icon right.
    - Banner: Top section with a solid light blue background color.
    - Avatar: Large circular initials (KS), positioned overlapping the banner.
    - Info: Name (Krishna Sharma), Uni (Tribhuvan University), Role (Android Developer).
    - Stats: 3 columns showing counts and labels (12 Connections, 3 Events joined, 2 Teams).
    - Skills: Tags (Kotlin, Android, Firebase, Figma) using different background colors.
    - Interests: Tags (Hackathons, AI/ML, Startups).
    - Goal: Text paragraph showing the user's goal.
  </action>
  <verify>grep "My profile\|Tribhuvan University" "e:\studentsociety\mobile\app\(tabs)\profile.tsx"</verify>
  <done>Profile screen visually matches the reference design.</done>
</task>

## Success Criteria
- [ ] Profile endpoint returns profile data and stats.
- [ ] UI matches the reference with banner, overlapping avatar, stats, skills, interests, and goal sections.
