---
phase: 9
plan: 2
wave: 2
depends_on: ["1"]
---

# Plan 9.2: Backend API + Frontend — Team Screen

## Objective
Create the `GET /api/v1/teams/my` backend endpoint and build the "My Team" frontend screen matching the reference image.

## Context
- `e:\studentsociety\backend\src\modules\teams\` (new directory)
- `e:\studentsociety\backend\src\server.ts`
- `e:\studentsociety\mobile\app\(tabs)\teams.tsx` (new or existing placeholder)
- Reference: Team name at top, "For: Nepal Tech Hackathon 2025", "3/4 members" and "1 slot open" badges, member list with initials circle + name + skill tag + role badge (Leader/Member), an open slot row with "+" circle + "Need: ML specialist" + "Find" button.

## Tasks

<task type="auto">
  <name>Create Teams Backend Module and Mount Route</name>
  <files>
    e:\studentsociety\backend\src\modules\teams\teams.controller.ts
    e:\studentsociety\backend\src\modules\teams\teams.routes.ts
    e:\studentsociety\backend\src\server.ts
  </files>
  <action>
    - Create `teams.controller.ts` with `getMyTeam`:
      - Find the team where the current user is a member (query `team_members` WHERE `user_id = req.user.id`).
      - Join with `teams` to get team details.
      - For each member, join with `extended_profiles` for name and initials.
      - Return `{ team, members, open_slots }`.
    - Create `teams.routes.ts` with `GET /my` protected by `authMiddleware`.
    - Mount at `/api/v1/teams` in `server.ts`.
  </action>
  <verify>grep "/api/v1/teams" "e:\studentsociety\backend\src\server.ts"</verify>
  <done>Teams route is mounted in server.ts.</done>
</task>

<task type="auto">
  <name>Build My Team Screen UI</name>
  <files>
    e:\studentsociety\mobile\app\(tabs)\teams.tsx
  </files>
  <action>
    - Use NativeWind + `useUIStore`.
    - Header: "My team" title (left) + "+ Invite" outlined blue button (right).
    - Team card: team name bold, "For: Nepal Tech Hackathon 2025" subtitle, "3/4 members" green pill + "1 slot open" yellow pill.
    - "Members" section header.
    - Member rows: colored initials circle (KS=blue, PR=purple, AK=amber) + name bold + role_title below + role badge (Leader=blue/outlined, Member=green/outlined) right-aligned.
    - Open slot row: dashed "+" grey circle + "Need: ML specialist" italic text + "Find" outlined blue button.
    - Use mock data matching the reference.
  </action>
  <verify>grep "slot open\|Leader\|Find" "e:\studentsociety\mobile\app\(tabs)\teams.tsx"</verify>
  <done>File renders team card, member list, and open slot row matching the reference.</done>
</task>

## Success Criteria
- [ ] Team screen shows member roles with correct badges.
- [ ] Open slot row is visible with a "Find" action.
- [ ] Backend endpoint is mounted and returns data.
