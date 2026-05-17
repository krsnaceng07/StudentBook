---
phase: 4
plan: 3
wave: 3
depends_on: ["2"]
---

# Plan 4.3: Frontend CollabMate UI Rebuild

## Objective
Rebuild the mobile frontend to match the CollabMate UI design: a tabbed layout and a rich Home screen featuring Suggested Teammates, Upcoming Events, and Recent Activity sections.

## Context
- .gsd/SPEC.md
- e:\studentsociety\mobile\app\_layout.tsx
- e:\studentsociety\mobile\app\home.tsx (to be replaced)

## Tasks

<task type="auto">
  <name>Implement Tabs Layout</name>
  <files>
    e:\studentsociety\mobile\app\(tabs)\_layout.tsx
    e:\studentsociety\mobile\app\_layout.tsx
  </files>
  <action>
    - Create `app/(tabs)/_layout.tsx` to define the bottom navigation bar (Home, Discover, Events, Messages, Profile).
    - Update the root `_layout.tsx` to redirect authenticated users to `/(tabs)` instead of `/home`.
  </action>
  <verify>grep "(tabs)" e:\studentsociety\mobile\app\_layout.tsx</verify>
  <done>Root layout directs to the newly created (tabs) navigation.</done>
</task>

<task type="auto">
  <name>Build Home Screen UI</name>
  <files>
    e:\studentsociety\mobile\app\(tabs)\index.tsx
  </files>
  <action>
    - Recreate the Home screen UI strictly matching the reference image.
    - Add a Header with "CollabMate" and icon placeholders.
    - Add "Suggested teammates" section (horizontal scrollable list of teammate cards with avatar/initials, name, role, location, skills, and Connect button).
    - Add "Upcoming events" section (large card with banner, title, date, location, Register, and Find team buttons).
    - Add "Recent activity" section (vertical list of activity cards).
    - Ensure NativeWind CSS classes are used for modern styling matching the image exactly.
  </action>
  <verify>grep "Suggested teammates" e:\studentsociety\mobile\app\(tabs)\index.tsx</verify>
  <done>The index file contains the complete JSX structure for the CollabMate home UI.</done>
</task>

## Success Criteria
- [ ] Bottom tabs navigation is functional.
- [ ] The Home screen faithfully reproduces the CollabMate design provided by the user.
