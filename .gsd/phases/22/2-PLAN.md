---
phase: 22
plan: 2
wave: 2
---

# Plan 22.2: Connect Events and Requests Screens to Active Backend APIs and Verify Compile

## Objective
Enable real-time dynamic data fetching on the Events and Requests screens in the Expo mobile app, and compile the mobile bundle to verify complete structural and component integrity.

## Context
- `e:\studentsociety\mobile\app\(tabs)\events.tsx`
- `e:\studentsociety\mobile\app\(tabs)\requests.tsx`

## Tasks

<task type="auto">
  <name>Connect Events Screen UI to Backend API</name>
  <files>
    e:\studentsociety\mobile\app\(tabs)\events.tsx
  </files>
  <action>
    - Add a `useEffect` hook to `events.tsx` that fetches live upcoming event items from the `/events` endpoint using the `client` API package.
    - Set the fetched events list into state and render the items on screen.
  </action>
  <verify>grep -q "client.get" "e:\studentsociety\mobile\app\(tabs)\events.tsx"</verify>
  <done>Events screen connected to backend and fetches live event listings.</done>
</task>

<task type="auto">
  <name>Connect Requests Screen UI to Backend API</name>
  <files>
    e:\studentsociety\mobile\app\(tabs)\requests.tsx
  </files>
  <action>
    - Update `fetchRequests` inside `requests.tsx` to retrieve live connection incoming and outgoing requests list.
    - Gracefully show clean fallback empty statuses if lists are empty.
  </action>
  <verify>grep -q "client.get" "e:\studentsociety\mobile\app\(tabs)\requests.tsx"</verify>
  <done>Requests screen connected to backend and fetches live requests data.</done>
</task>

## Success Criteria
- [ ] Events screen lists active events from the Supabase database.
- [ ] Requests screen retrieves live incoming/outgoing requests list.
