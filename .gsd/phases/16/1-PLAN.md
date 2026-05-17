---
phase: 16
plan: 1
wave: 1
---

# Plan 16.1: Supabase Postgres Changes Subscription & API stats integration

## Objective
Establish high-fidelity database realtime streams and link the student home screen statistics dynamically to live database metrics.

## Context
- `e:\studentsociety\mobile\app\(tabs)\index.tsx`
- `e:\studentsociety\mobile\config\supabase.ts`

## Tasks

<task type="auto">
  <name>Build Realtime Supabase Postgres Stream Listener</name>
  <files>
    e:\studentsociety\mobile\app\(tabs)\index.tsx
  </files>
  <action>
    - Import `supabase` from `../../config/supabase` inside `mobile/app/(tabs)/index.tsx`.
    - Set up a clean `useEffect` listener block using `supabase.channel(...)` to subscribe to Postgres changes on `connections`, `event_bookmarks`, and `events` tables.
    - Whenever a record changes (insert, update, delete), log the payload and automatically trigger `fetchDashboard()` to update data in real-time.
    - Register proper subscription cleanup within the `useEffect` return statement using `supabase.removeChannel(...)` to prevent any resource/memory leaks.
  </action>
  <verify>grep "supabase" "e:\studentsociety\mobile\app\(tabs)\index.tsx" && grep "removeChannel" "e:\studentsociety\mobile\app\(tabs)\index.tsx"</verify>
  <done>Postgres realtime listeners successfully listening to connections, bookmarks, and events updates.</done>
</task>

## Success Criteria
- [ ] Student home screen dynamically initializes live realtime listeners on mount.
- [ ] Subscriptions cleanly detach when the user navigates away or unmounts the component.
