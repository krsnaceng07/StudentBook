---
phase: 23
plan: 1
wave: 1
---

# Plan 23.1: College Profile and Dashboard Mobilization

## Objective
Connect the College Dashboard and Profile screens to live Supabase backend data, ensuring strict separation between student and college API endpoints to prevent conflicts. 

## Context
- `e:\studentsociety\mobile\app\college\dashboard.tsx`
- `e:\studentsociety\mobile\app\college\profile.tsx`
- `e:\studentsociety\backend\src\modules\profile\profile.controller.ts`

## Tasks

<task type="auto">
  <name>Mobilize College Profile Live Fetch</name>
  <files>
    e:\studentsociety\mobile\app\college\profile.tsx
  </files>
  <action>
    - Import `api` from `../../utils/api` and `useAuthStore`.
    - Fetch the authenticated college's profile using `api.get('/api/v1/profile/me')`.
    - Replace hardcoded placeholders (e.g., University Name, Location, Bio, Social Links) with dynamic state variables.
    - Implement a loading state wrapper.
  </action>
  <verify>grep "api.get" e:\studentsociety\mobile\app\college\profile.tsx</verify>
  <done>College profile screen renders live data fetched from the database securely.</done>
</task>

<task type="auto">
  <name>Mobilize College Dashboard Live Stats</name>
  <files>
    e:\studentsociety\mobile\app\college\dashboard.tsx
    e:\studentsociety\backend\src\modules\dashboard\dashboard.controller.ts
    e:\studentsociety\backend\src\modules\dashboard\dashboard.routes.ts
  </files>
  <action>
    - Create a dedicated backend endpoint `GET /api/v1/dashboard/college` (if it does not exist) that specifically returns college-centric stats (e.g., active events count, total reach/likes) and recent active events, ensuring role isolation.
    - In `dashboard.tsx`, use `useEffect` and `api.get('/api/v1/dashboard/college')` to fetch these live stats and event lists.
    - Bind the dashboard Stat Cards (Total Reach, Active Events) and the Recent Events list to the dynamic state.
  </action>
  <verify>grep "/api/v1/dashboard/college" e:\studentsociety\backend\src\modules\dashboard\dashboard.routes.ts</verify>
  <done>College dashboard displays accurate, real-time statistical summaries explicitly isolated from student stats.</done>
</task>

## Success Criteria
- [ ] Profile screen dynamically updates based on the authenticated college token.
- [ ] Dashboard correctly queries and displays college-centric events and active engagement metrics.
