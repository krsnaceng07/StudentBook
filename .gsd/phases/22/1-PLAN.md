---
phase: 22
plan: 1
wave: 1
---

# Plan 22.1: Connect Discover and Profile Screens to Active Backend APIs

## Objective
Enable real-time dynamic data fetching on the Discover screen and user Profile screen in the Expo mobile app by replacing local mock data setups with live HTTP calls utilizing the configured API Client.

## Context
- `e:\studentsociety\mobile\app\(tabs)\discover.tsx`
- `e:\studentsociety\mobile\app\(tabs)\profile.tsx`

## Tasks

<task type="auto">
  <name>Connect Discover Screen UI to Backend API</name>
  <files>
    e:\studentsociety\mobile\app\(tabs)\discover.tsx
  </files>
  <action>
    - Refactor `fetchTeammates` inside `discover.tsx` to query `/discover` endpoint using the `client` API package.
    - Set the teammates state with response array or gracefully fall back to local mocks if API fails.
  </action>
  <verify>grep -q "client.get" "e:\studentsociety\mobile\app\(tabs)\discover.tsx"</verify>
  <done>Discover screen connected to backend and fetches live users list.</done>
</task>

<task type="auto">
  <name>Connect Profile Screen UI to Backend API</name>
  <files>
    e:\studentsociety\mobile\app\(tabs)\profile.tsx
  </files>
  <action>
    - Add a `useEffect` hook to `profile.tsx` fetching user profile via `/profile/me` using the `client` API package.
    - Dynamically render name, initials, university, status, bio, and skills based on the returned response from the backend.
  </action>
  <verify>grep -q "client.get" "e:\studentsociety\mobile\app\(tabs)\profile.tsx"</verify>
  <done>Profile screen connected to backend and fetches profile details dynamically.</done>
</task>

## Success Criteria
- [ ] Discover screen queries live users from the database.
- [ ] Profile screen renders authenticated user details from the database.
