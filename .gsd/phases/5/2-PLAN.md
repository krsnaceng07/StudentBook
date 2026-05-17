---
phase: 5
plan: 2
wave: 2
depends_on: ["1"]
---

# Plan 5.2: Backend API for Discover

## Objective
Create an API endpoint `GET /api/v1/discover` to fetch user profiles for the Discover screen with search and filter capabilities.

## Context
- `e:\studentsociety\backend\src\server.ts`
- `e:\studentsociety\backend\src\modules\discover\` (new directory)

## Tasks

<task type="auto">
  <name>Create Discover Controller and Routes</name>
  <files>
    e:\studentsociety\backend\src\modules\discover\discover.controller.ts
    e:\studentsociety\backend\src\modules\discover\discover.routes.ts
  </files>
  <action>
    - Create `discover.controller.ts` with logic to fetch from `extended_profiles`.
    - It should support a `search` query parameter (for name or skill matching).
    - Create `discover.routes.ts` protecting the route with `authMiddleware`.
  </action>
  <verify>cat e:\studentsociety\backend\src\modules\discover\discover.controller.ts | grep "extended_profiles"</verify>
  <done>The controller uses Supabase to fetch extended profiles with search logic.</done>
</task>

<task type="auto">
  <name>Mount Discover Routes</name>
  <files>
    e:\studentsociety\backend\src\server.ts
  </files>
  <action>
    - Import `discoverRoutes`.
    - Mount it at `/api/v1/discover`.
  </action>
  <verify>grep "/api/v1/discover" e:\studentsociety\backend\src\server.ts</verify>
  <done>Discover routes are successfully mounted in the server.</done>
</task>

## Success Criteria
- [ ] Backend endpoint `/api/v1/discover` is functional and protected.
