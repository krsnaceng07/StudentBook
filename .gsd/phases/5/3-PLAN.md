---
phase: 5
plan: 3
wave: 3
depends_on: ["2"]
---

# Plan 5.3: Frontend Discover Screen UI

## Objective
Build the Discover screen (`app/(tabs)/discover.tsx`) matching the "Find teammates" UI reference image, incorporating the search bar, filter pills, and teammate cards.

## Context
- `e:\studentsociety\mobile\app\(tabs)\discover.tsx`

## Tasks

<task type="auto">
  <name>Build Discover Screen UI</name>
  <files>
    e:\studentsociety\mobile\app\(tabs)\discover.tsx
  </files>
  <action>
    - Replace the placeholder UI in `discover.tsx` with a fully styled screen using NativeWind.
    - Include a "Find teammates" header.
    - Add a Search Bar ("Search by skill or name...").
    - Add Filter Pills (All, Development, Design, Business).
    - Add a scrollable list of teammate cards (using mock data initially, or integrate with real API structure). Each card must contain:
      - Initials inside a colored circle.
      - Name and University/Location ("Priya Rana", "Tribhuvan University · Lalitpur").
      - Skill badges with soft backgrounds (e.g. React, Node.js).
      - Bio text ("Looking to join a startup...").
      - Buttons: "Connect" (solid blue) and "View" (outline).
    - Ensure perfect visual match with the provided image reference.
  </action>
  <verify>grep "Search by skill or name" e:\studentsociety\mobile\app\(tabs)\discover.tsx</verify>
  <done>The file contains the requested layout, classes, and dummy components matching the design.</done>
</task>

## Success Criteria
- [ ] Discover screen looks exactly like the reference UI.
- [ ] UI is responsive and scrollable.
