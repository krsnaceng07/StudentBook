---
phase: 31
plan: 1
wave: 1
---

# Plan 31.1: College Events Management & High-Fidelity Event Details Sync

## Objective
To implement 100% active, fully-functional, live-fetching systems for Event posting, editing, and details viewing. This will connect the mock visual layouts (from user mockup images) directly to dynamic backend APIs and database columns.

## Context
- .gsd/SPEC.md
- e:\studentsociety\backend\src\modules\events\events.controller.ts
- e:\studentsociety\backend\src\modules\events\events.routes.ts
- e:\studentsociety\mobile\app\(college)\post-event.tsx
- e:\studentsociety\mobile\app\events\[id].tsx

## Tasks

<task type="auto">
  <name>Database & Backend Setup</name>
  <files>
    - supabase/migrations/20260520000000_event_mockup_fields.sql
    - backend/src/modules/events/events.controller.ts
    - backend/src/modules/events/events.routes.ts
  </files>
  <action>
    1. Create a migration file `20260520000000_event_mockup_fields.sql` to add `reg_deadline` (DATE), `is_online` (BOOLEAN, default false), `min_team` (INT, default 1), `max_team` (INT, default 4), and `prize_pool` (TEXT) to the `events` table.
    2. In `events.controller.ts`:
       - Update `createEvent` to extract and insert: `reg_deadline`, `is_online`, `min_team`, `max_team`, and `prize_pool`.
       - Update `getEvents` to query all columns (`*`) so all new fields are sent to the mobile client.
       - Implement a new controller `getEventById` to retrieve a single event by ID dynamically from the `events` table: `const { id } = req.params;`
    3. In `events.routes.ts`:
       - Register `router.get('/:id', authMiddleware, getEventById);` so students and colleges can view individual details.
  </action>
  <verify>Run the backend dev server and curl or request a single event details endpoint GET /api/v1/events/:id</verify>
  <done>
    - Database migrations are successfully run and all columns exist in `events` table.
    - GET /api/v1/events/:id successfully queries and returns a single event.
  </done>
</task>

<task type="auto">
  <name>Post New Event UI & Function Integration</name>
  <files>
    - mobile/app/(college)/post-event.tsx
  </files>
  <action>
    1. Update the event type pills array to include all five options from the mockup: `['Hackathon', 'Workshop', 'Competition', 'Seminar', 'Other']`.
    2. Implement State hooks and UI controls for the new mockup inputs:
       - `deadline` (Reg. Deadline mm/dd/yyyy input)
       - `isOnline` (Online Event Switch/toggle)
       - `minTeam` (Min Team numeric input, default '2')
       - `maxTeam` (Max Team numeric input, default '4')
       - `prizePool` (Prize Pool text input)
    3. Modify `handlePublish` to pass these new state values in the `api.post('/college/events', ...)` request body so they are saved to the backend database!
  </action>
  <verify>Open post-event screen, fill in all mockup fields, save, and ensure it resolves with alert and returns back.</verify>
  <done>
    - Post new event form supports 5 event types, deadline, online event toggle, min/max team limits, and prize pool.
    - Publishing successfully submits all details to the database without errors.
  </done>
</task>

<task type="auto">
  <name>Event Details Screen Integration</name>
  <files>
    - mobile/app/events/[id].tsx
  </files>
  <action>
    1. Remove the static hardcoded fallback mocks mapping `FALLBACK_EVENTS`.
    2. Implement `useState` hooks for event loading state and parsed event details.
    3. Use `useFocusEffect` and `useCallback` to query `api.get('/events/' + id)` dynamically on screen focus.
    4. Bind retrieved dynamic properties to the premium visual components:
       - Title & Organizer name
       - Grid Cards: Date, Deadline (formatted nicely), Venue (`location`), and Team Size (`${min_team}-${max_team} members`).
       - Prize Pool highlight card (`prize_pool`).
       - Description (`description` under "About this Event").
       - Tags (dynamic array `tags` pill listing).
  </action>
  <verify>Navigate to an event detail screen, verify that details match the database record rather than fallback mock templates.</verify>
  <done>
    - Event details screen loads individual event data dynamically via REST API.
    - All grids, banners, deadlines, and team limits display correctly in the responsive UI.
  </done>
</task>

## Success Criteria
- [ ] Post Event screen fully matches the mockup layout and saves all 10 fields to the database.
- [ ] Event Details screen fetches dynamic, active data live from Supabase rather than fallback mocks.
