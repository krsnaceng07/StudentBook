---
phase: 6
plan: 2
wave: 2
depends_on: ["1"]
---

# Plan 6.2: Backend API for Events

## Objective
Create a `GET /api/v1/events` endpoint that returns all events, optionally filtered by `event_type`.

## Context
- `e:\studentsociety\backend\src\server.ts`
- `e:\studentsociety\backend\src\modules\events\` (new directory)
- `e:\studentsociety\backend\src\modules\home\home.controller.ts` (reference for pattern)

## Tasks

<task type="auto">
  <name>Create Events Controller and Routes</name>
  <files>
    e:\studentsociety\backend\src\modules\events\events.controller.ts
    e:\studentsociety\backend\src\modules\events\events.routes.ts
  </files>
  <action>
    - Create `events.controller.ts`. Import `supabaseAdmin` from `../../config/supabase.js`.
    - Implement `getEvents` function: query `events` table. If `type` query param is present, filter by `event_type`.
    - Return `{ success: true, data: events }`.
    - Create `events.routes.ts` with `GET /` protected by `authMiddleware`, calling `getEvents`.
  </action>
  <verify>grep "extended_profiles\|events" "e:\studentsociety\backend\src\modules\events\events.controller.ts"</verify>
  <done>Controller fetches from `events` table and supports optional `type` filter.</done>
</task>

<task type="auto">
  <name>Mount Events Routes in Server</name>
  <files>
    e:\studentsociety\backend\src\server.ts
  </files>
  <action>
    - Import `eventsRoutes` from `./modules/events/events.routes.js`.
    - Mount at `/api/v1/events`.
  </action>
  <verify>grep "/api/v1/events" "e:\studentsociety\backend\src\server.ts"</verify>
  <done>Events route is mounted and accessible on the server.</done>
</task>

## Success Criteria
- [ ] `GET /api/v1/events` endpoint works with and without a `?type=` filter.
