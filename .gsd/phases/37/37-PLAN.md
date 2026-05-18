---
phase: 37
plan: 1
wave: 1
---

# Plan 37.1: Double Event Registration & Workspace Engine (Wave 1)

## Objective
Implement the database schema and backend endpoints to support both "External Link" redirects and "Internal direct" applications for college events. Students can register/unregister internally (triggering activities/notifications) while colleges can review and audit live student applicant rosters.

## Context
- [.gsd/SPEC.md](file:///e:/studentsociety/.gsd/SPEC.md)
- [backend/src/modules/events/events.controller.ts](file:///e:/studentsociety/backend/src/modules/events/events.controller.ts)
- [backend/src/modules/events/events.routes.ts](file:///e:/studentsociety/backend/src/modules/events/events.routes.ts)

## Tasks

<task type="auto">
  <name>Create Database Schema Migration & DDL Patch</name>
  <files>
    - backend/supabase/migrations/20260522000000_event_registrations.sql
  </files>
  <action>
    1. Create a new SQL migration patch adding columns to `public.events`:
       - `registration_type` TEXT CHECK (`registration_type` IN ('internal', 'external')) DEFAULT 'internal'
       - `external_link` TEXT (optional)
    2. Create a new join table `public.event_registrations`:
       - `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
       - `event_id` UUID REFERENCES public.events(id) ON DELETE CASCADE
       - `user_id` UUID REFERENCES public.profiles(id) ON DELETE CASCADE
       - `created_at` TIMESTAMPTZ DEFAULT now()
       - UNIQUE (event_id, user_id)
    3. Enable RLS on `event_registrations` and add policies:
       - Read: Allowed for the user themselves and the event's organizing college.
       - Insert: Allowed for authenticated student role matching `auth.uid() = user_id`.
       - Delete: Allowed for authenticated student role matching `auth.uid() = user_id` to opt-out.
  </action>
  <verify>Examine the SQL file structure and ensure it adheres to PostgreSQL constraints and RLS guidelines.</verify>
  <done>The migration script compiles cleanly, adds the required schema elements, and configures secure RLS rules.</done>
</task>

<task type="auto">
  <name>Upgrade Backend Events Controllers & Roster Endpoints</name>
  <files>
    - backend/src/modules/events/events.controller.ts
    - backend/src/modules/events/events.routes.ts
  </files>
  <action>
    1. Upgrade college event creations (`createEvent`) and edits (`updateEvent` / `deleteEvent`) to validate and store `registration_type` and `external_link` columns.
    2. Enhance events fetch controllers (e.g. `getEvents`, `getEventById`) to:
       - Calculate and append the `registrationCount` (integer count of matching entries in `event_registrations`).
       - If requested by an authenticated student, check if they are registered and append the `isRegistered` boolean.
    3. Implement `registerForEvent` (`POST /student/events/:id/register`):
       - Assure the target event has `registration_type = 'internal'`.
       - Create an entry in `event_registrations` join table.
       - Log a student activity describing the registration.
       - Notify the college organizer in their notifications table.
    4. Implement `unregisterFromEvent` (`DELETE /student/events/:id/register`):
       - Remove the entry from `event_registrations`.
    5. Implement `getEventRegistrants` (`GET /college/events/:id/registrants`):
       - Secure check: Ensure the requester is the college organizer of this event.
       - Query and return detailed classmate cards (full_name, initials, department, skills) of all registered students.
  </action>
  <verify>Perform typechecks on the updated events routes and controllers to ensure full type safety with zero warnings.</verify>
  <done>The backend server handles internal registrations/unregistrations and securely compiles applicant details for college organizers.</done>
</task>

## Success Criteria
- [ ] Database supports registration type toggles and event registration records.
- [ ] Students can register/unregister internally with automatic activity and notification triggers.
- [ ] Colleges can fetch the full roster of registered students for any of their events.
