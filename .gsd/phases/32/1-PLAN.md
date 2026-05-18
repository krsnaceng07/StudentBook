---
phase: 32
plan: 1
wave: 1
---

# Plan 32.1: Student-Side Live Event Bookmarking, Team Creation & Real-Time Syncing

## Objective
Enable a fully functional and live-updated experience on the student-side Event Details screen (`mobile/app/events/[id].tsx`). This plan integrates database tables, backend express API endpoints, mobile focus-state fetches, and direct Supabase Realtime subscriptions to ensure all screen details, active bookmarks, and collaboration team registration actions update dynamically in real-time.

## Context
- [SPEC.md](file:///e:/studentsociety/.gsd/SPEC.md)
- [ROADMAP.md](file:///e:/studentsociety/.gsd/ROADMAP.md)
- [events/[id].tsx](file:///e:/studentsociety/mobile/app/events/%5Bid%5D.tsx)
- [events.routes.ts](file:///e:/studentsociety/backend/src/modules/events/events.routes.ts)
- [events.controller.ts](file:///e:/studentsociety/backend/src/modules/events/events.controller.ts)
- [teams.routes.ts](file:///e:/studentsociety/backend/src/modules/teams/teams.routes.ts)
- [teams.controller.ts](file:///e:/studentsociety/backend/src/modules/teams/teams.controller.ts)

## Tasks

<task type="auto">
  <name>Implement Event Bookmarking & Team Creation Endpoints in Backend</name>
  <files>
    <file>e:\studentsociety\backend\src\modules\events\events.controller.ts</file>
    <file>e:\studentsociety\backend\src\modules\events\events.routes.ts</file>
    <file>e:\studentsociety\backend\src\modules\teams\teams.controller.ts</file>
    <file>e:\studentsociety\backend\src\modules\teams\teams.routes.ts</file>
  </files>
  <action>
    1. Update `getEventById` inside `events.controller.ts` to check if the current user has bookmarked the event in `event_bookmarks` table, returning `isBookmarked: true/false` in the response payload.
    2. Implement `bookmarkEvent` and `unbookmarkEvent` controller methods inside `events.controller.ts` that insert or delete rows from the `event_bookmarks` table based on `req.user.id` and `req.params.id`.
    3. Register POST and DELETE routes for `/:id/bookmark` in `events.routes.ts` protected by `authMiddleware` and `roleMiddleware(['student'])`.
    4. Implement `createTeam` inside `teams.controller.ts` to support posting a new team with `{ name, event_name, max_members }` by inserting into `teams` table and automatically assigning the creator as the "Leader" role in `team_members` table.
    5. Register POST router path in `teams.routes.ts`.
  </action>
  <verify>Run the backend test suit or execute http mock requests to verify that bookmarking and team creation endpoints behave correctly and return 200/201 success codes.</verify>
  <done>
    - GET `/api/v1/events/:id` contains the correct `isBookmarked` boolean matching database state.
    - POST `/api/v1/events/:id/bookmark` creates bookmark rows correctly.
    - DELETE `/api/v1/events/:id/bookmark` deletes rows correctly.
    - POST `/api/v1/student/teams` forms teams and adds creators as leaders.
  </done>
</task>

<task type="auto">
  <name>Mobilize Event Details Screen with Dynamic Bookmark Toggle, Bottom Join Button & Supabase Realtime Sync</name>
  <files>
    <file>e:\studentsociety\mobile\app\events\[id].tsx</file>
  </files>
  <action>
    1. Connect the bookmark button (top right header) in `events/[id].tsx` to dynamic toggle API calls (`POST/DELETE /events/:id/bookmark`) to save/remove active bookmarks in the Postgres database live.
    2. Add a dynamic **Bottom Action Button** to the scroll view / floating layout in `events/[id].tsx` that checks if the student belongs to a team for this event:
       - If they don't, render a premium blue button: "Form Collaboration Team". Clicking it displays a nice modal/input prompting for a "Team Name", which triggers `POST /student/teams` and redirects to `/teams` workspace.
       - If they already have a team joined: render a green/neutral button: "View My Team Workspace", which routes directly to `/teams` workspace.
    3. Initialize a **Supabase Postgres Realtime Subscription** inside a `useEffect` hook in `events/[id].tsx` targeting the `events` table for our event ID, automatically re-fetching fresh event info from the API whenever any changes/edits are published by the college admin in real-time.
  </action>
  <verify>Build the mobile app using Expo bundler, navigate to Event Details, toggle bookmarks, form a team, and ensure the state is persisted dynamically across reloads.</verify>
  <done>
    - Bookmarking saves state dynamically to PostgreSQL via our REST backend APIs.
    - Realtime changes instantly trigger UI refetches.
    - Bottom button dynamically manages team creation or workspace redirections.
  </done>
</task>

## Success Criteria
- [ ] Student can toggle event bookmarks dynamically, persisting state securely to Supabase database.
- [ ] Student can form a collaboration team workspace directly from the Event Details screen, linking it to the active event.
- [ ] Student-side Event Details screen live-syncs changes instantly via Supabase Postgres Realtime subscriptions.
