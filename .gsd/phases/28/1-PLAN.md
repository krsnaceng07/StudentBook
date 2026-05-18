---
phase: 28
plan: 1
wave: 1
---

# Plan 28.1: College Portal End-to-End Live Synchronization

## Objective
Make all college portal screens (Dashboard, Manage Events, Post Event, Profile, Settings, Edit Profile) fully active and dynamically synced. We will verify database structures, fetch live organizers from the DB on event post, and implement automatic live-fetching via focus hooks so the entire portal updates instantly without manual reloading.

## Context
- `e:\studentsociety\backend\src\modules\events\events.controller.ts`
- `e:\studentsociety\mobile\app\(college)\profile.tsx`
- `e:\studentsociety\mobile\app\(college)\dashboard.tsx`

## Tasks

<task type="auto">
  <name>Dynamic Event Organizer Fetching in Backend</name>
  <files>
    e:\studentsociety\backend\src\modules\events\events.controller.ts
  </files>
  <action>
    - Refactor `createEvent` in `events.controller.ts` to dynamically fetch the college's name from `extended_profiles` table:
      ```typescript
      const { data: profile } = await supabase
        .from('extended_profiles')
        .select('full_name')
        .eq('id', userId)
        .single();
      const organizerName = profile?.full_name || 'College';
      ```
    - Insert this dynamic `organizerName` under the `organizer` column instead of the hardcoded `'College'`.
  </action>
  <verify>grep -q "organizerName" e:\studentsociety\backend\src\modules\events\events.controller.ts</verify>
  <done>Backend automatically assigns the true college name to new events.</done>
</task>

<task type="auto">
  <name>Profile Screen Automatic Focus Live Synchronization</name>
  <files>
    e:\studentsociety\mobile\app\(college)\profile.tsx
  </files>
  <action>
    - Refactor `profile.tsx` to import `useFocusEffect` and `useCallback` from `expo-router` / `react`.
    - Change the `useEffect` profile loader to `useFocusEffect` so that when the user returns to their Profile tab after saving edits on the Edit College Profile screen, the banner, location, website, email, and bio are refreshed and displayed immediately.
  </action>
  <verify>grep -q "useFocusEffect" e:\studentsociety\mobile\app\(college)\profile.tsx</verify>
  <done>Profile screen updates and syncs live upon screen refocus.</done>
</task>

<task type="auto">
  <name>Dashboard Screen Automatic Focus Live Synchronization</name>
  <files>
    e:\studentsociety\mobile\app\(college)\dashboard.tsx
  </files>
  <action>
    - Refactor `dashboard.tsx` to import `useFocusEffect` and `useCallback` from `expo-router` / `react`.
    - Replace the one-time `useEffect` data load with a focus-triggered `useFocusEffect` hook.
    - This ensures that when a college representative posts a new event, navigating back to the Dashboard instantly increments the "Total Events" and "Active Events" counters.
  </action>
  <verify>grep -q "useFocusEffect" e:\studentsociety\mobile\app\(college)\dashboard.tsx</verify>
  <done>Dashboard stats and recent activity update automatically on screen focus.</done>
</task>

## Success Criteria
- [ ] Posting a new event automatically updates the Dashboard event counters without manual refreshing.
- [ ] Saving profile changes instantly updates the Profile banner and details when navigated back.
- [ ] Events show the true college name as the organizer dynamically.
