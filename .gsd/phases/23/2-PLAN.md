---
phase: 23
plan: 2
wave: 2
---

# Plan 23.2: College Event Management Mobilization

## Objective
Connect the College Event Management screens (Post Event and Manage Events) to live Supabase backend APIs to allow real-time creation, reading, and deletion of college-sponsored events securely.

## Context
- `e:\studentsociety\mobile\app\college\manage-events.tsx`
- `e:\studentsociety\mobile\app\college\post-event.tsx`
- `e:\studentsociety\backend\src\modules\events\events.controller.ts`
- `e:\studentsociety\backend\src\modules\events\events.routes.ts`

## Tasks

<task type="auto">
  <name>Mobilize College Post Event Flow</name>
  <files>
    e:\studentsociety\mobile\app\college\post-event.tsx
  </files>
  <action>
    - Import `api` from `../../utils/api`.
    - Modify the `handlePostEvent` function to send a `POST /api/v1/events` request with the form state payload.
    - Ensure loading states disable the submit button to prevent duplicate submissions.
    - On success, reset the form and dynamically route back to `manage-events` or `dashboard` using Expo Router's `router.push`.
  </action>
  <verify>grep "api.post('/api/v1/events'" e:\studentsociety\mobile\app\college\post-event.tsx</verify>
  <done>Colleges can successfully post live events to the database.</done>
</task>

<task type="auto">
  <name>Mobilize College Manage Events Flow</name>
  <files>
    e:\studentsociety\mobile\app\college\manage-events.tsx
    e:\studentsociety\backend\src\modules\events\events.controller.ts
    e:\studentsociety\backend\src\modules\events\events.routes.ts
  </files>
  <action>
    - Backend: Create a `GET /api/v1/events/my-events` endpoint strictly returning events authored by the authenticated college.
    - Frontend: In `manage-events.tsx`, use `api.get('/api/v1/events/my-events')` to fetch the events list dynamically.
    - Replace the hardcoded events list with mapping over the fetched events.
    - Implement a `handleDeleteEvent(eventId)` function using `api.delete` to dynamically remove events and update the state without reloading.
  </action>
  <verify>grep "/api/v1/events/my-events" e:\studentsociety\backend\src\modules\events\events.routes.ts</verify>
  <done>Manage events screen accurately fetches live data and supports dynamic deletion without conflict.</done>
</task>

## Success Criteria
- [ ] Post event screen securely creates database rows tagged with the college's author ID.
- [ ] Manage events screen dynamically lists only the authenticated college's events and supports live deletion.
