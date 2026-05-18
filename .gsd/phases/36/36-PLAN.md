---
phase: 36
plan: 1
wave: 1
---

# Plan 36.1: Discover Peer Suggestions & Connection System

## Objective
Refactor the Student Discover screen from a simple "find teammates" search to an advanced "Suggested Peers" recommendation engine. Students will see recommended classmates with shared mindsets/fields (same department, same university, or overlapping skills), send instant connection requests directly from the classmate cards with immediate (optimistic) feedback, and open direct chat links if already connected.

## Context
- [.gsd/SPEC.md](file:///e:/studentsociety/.gsd/SPEC.md)
- [mobile/app/(student)/discover.tsx](file:///e:/studentsociety/mobile/app/(student)/discover.tsx)
- [backend/src/modules/discover/discover.controller.ts](file:///e:/studentsociety/backend/src/modules/discover/discover.controller.ts)
- [backend/src/modules/connections/connections.controller.ts](file:///e:/studentsociety/backend/src/modules/connections/connections.controller.ts)

## Tasks

<task type="auto">
  <name>Implement Backend Suggested Peers API Endpoint</name>
  <files>
    - backend/src/modules/discover/discover.controller.ts
    - backend/src/modules/discover/discover.routes.ts
  </files>
  <action>
    1. Create a new controller function `getSuggestedUsers` (or refactor `getDiscoverUsers`) at route `GET /student/discover/suggestions` (or update `/student/discover`).
    2. The controller should query other `student` profiles from `extended_profiles`.
    3. Exclude the current requesting user's own profile.
    4. Fetch the connection status for each candidate profile from the `connections` table to determine if they are `'none'`, `'pending_sent'` (sent by requester), `'pending_received'` (received by requester), or `'accepted'`.
    5. Prioritize/recommend candidates based on shared fields (same `department`, same `university`, or overlapping values in `skills`).
    6. Return a list of student records including an array of matching reasons/labels (e.g. `["Same Department", "3 Common Skills"]`) and the `connectionStatus` string.
  </action>
  <verify>Run a GET request to http://localhost:5000/api/v1/student/discover using the authenticated student token and assert the response returns a success flag and records contain 'connectionStatus'.</verify>
  <done>The API endpoint successfully returns suggested classmate profiles complete with true connection status fields and department/skills matching metadata.</done>
</task>

<task type="auto">
  <name>Refactor Mobile Discover Screen & Optimistic Connection Actions</name>
  <files>
    - mobile/app/(student)/discover.tsx
  </files>
  <action>
    1. Update the discover component to query the new suggested classmates endpoint.
    2. Remove legacy filter pills and teammate goal badges (Seeking Team, Exploring, etc.), replacing them with a premium header titled "Suggested Peers" and a simple, powerful peer search bar.
    3. Display classmate cards with customized badges based on backend suggestions metadata (e.g., green badge showing "Same Department", blue badge showing "2 Shared Skills").
    4. Implement an inline action button on each classmate card that adapts dynamically based on `connectionStatus`:
       - If `'none'`: Display "Connect" button. Tapping it triggers an **Optimistic UI update** instantly changing the button to "Pending" and firing `client.post('/connections/request', { receiverId: classmateId })` in the background.
       - If `'pending_sent'` / `'pending_received'`: Display a disabled "Pending" or "Accept Request" button.
       - If `'accepted'`: Display "Message" button that calls `router.push('/messages')` to start a direct collaboration chat immediately.
  </action>
  <verify>Build the mobile app, navigate to the Discover screen, verify suggested peer cards render correctly, and assert clicking "Connect" triggers immediate optimistic feedback without blocking overlays.</verify>
  <done>The student Discover page renders suggested peers matching the user's field, supports direct, optimistic Connect actions, and enables direct Messaging routing for connected classmates.</done>
</task>

## Success Criteria
- [ ] Backend returns personalized classmate recommendations containing connection status.
- [ ] Mobile UI shows Suggested Peers with matching indicators (shared skills/dept) instead of team goals.
- [ ] Tapping Connect immediately updates UI state and sends background API request without throwing errors.
