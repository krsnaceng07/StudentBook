---
phase: 16
plan: 2
wave: 2
---

# Plan 16.2: All Active Button Actions, Event Details navigation, and Profile redirects

## Objective
Activate all interactive cards and button shortcuts on the home screen to create a cohesive navigation experience.

## Context
- `e:\studentsociety\mobile\app\(tabs)\index.tsx`

## Tasks

<task type="auto">
  <name>Link Interactive Stats Cards and Action Triggers</name>
  <files>
    e:\studentsociety\mobile\app\(tabs)\index.tsx
  </files>
  <action>
    - Add clickable `onPress` actions to the three Stats Cards:
      - **Connections Card**: Redirects to the `/requests` tab workspace.
      - **Bookmarks Card**: Redirects to the `/discover` tab to view/filter bookmarks.
      - **Pending Requests Card**: Redirects to the `/requests` tab.
    - Add `onPress` action to the complete profile callout banner at the bottom that routes users directly to `/profile`.
    - Update each item in the Upcoming Events list to support clicking, navigating users dynamically to the premium details page at `/events/[id]` (passing the actual event ID in the routing parameters).
  </action>
  <verify>grep "events/" "e:\studentsociety\mobile\app\(tabs)\index.tsx" && grep "/requests" "e:\studentsociety\mobile\app\(tabs)\index.tsx"</verify>
  <done>All buttons and stats cards connected with corresponding routing endpoints.</done>
</task>

## Success Criteria
- [ ] Clicking on stats cards switches tabs cleanly.
- [ ] Clicking on event cards takes the student to the premium event page dynamically.
- [ ] Complete profile callout successfully redirects to profile.
