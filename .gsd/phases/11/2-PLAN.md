---
phase: 11
plan: 2
wave: 2
depends_on: ["1"]
---

# Plan 11.2: Backend API + Frontend — Notifications Screen

## Objective
Create the `GET /api/v1/notifications` endpoint and build the Alerts/Notifications UI screen matching the reference image.

## Context
- `e:\studentsociety\backend\src\modules\notifications\` (new directory)
- `e:\studentsociety\backend\src\server.ts`
- `e:\studentsociety\mobile\app\(tabs)\alerts.tsx` (new or existing placeholder)
- Reference: "Notifications" header with "Mark all read" link. "New" section with light blue background containing connection accept and team invite (with Accept/Decline buttons). "Earlier" section with grey background containing event post and connection request (with Accept/Decline buttons). 

## Tasks

<task type="auto">
  <name>Create Notifications Backend Module</name>
  <files>
    e:\studentsociety\backend\src\modules\notifications\notifications.controller.ts
    e:\studentsociety\backend\src\modules\notifications\notifications.routes.ts
    e:\studentsociety\backend\src\server.ts
  </files>
  <action>
    - Create `notifications.controller.ts` with `getNotifications`:
      - Fetch from `notifications` where `user_id = req.user.id`.
      - Join with `extended_profiles` on `actor_id` to get initials and names.
      - Return `{ new: [...], earlier: [...] }` (mock the split for now).
    - Create `notifications.routes.ts` mounted at `/api/v1/notifications`.
  </action>
  <verify>grep "/api/v1/notifications" "e:\studentsociety\backend\src\server.ts"</verify>
  <done>Notifications route is mounted and functioning.</done>
</task>

<task type="auto">
  <name>Build Notifications Screen UI</name>
  <files>
    e:\studentsociety\mobile\app\(tabs)\alerts.tsx
  </files>
  <action>
    - Build UI using NativeWind and `useUIStore`.
    - Header: "Notifications" left, "Mark all read" right (blue text).
    - "New" section: section header text "New". Contains 2 rows with a light blue background.
    - Row 1: PR initials, "Priya Rana accepted your connection request", "2 minutes ago".
    - Row 2: AK initials, "Aakash KC sent you a team invite...", "1 hour ago", with "Accept" (blue solid) and "Decline" (white outlined) buttons.
    - "Earlier" section: section header text "Earlier". Contains 2 rows with a light grey background.
    - Row 3: Blank green initials, "New event: AI Workshop...", "5 hours ago".
    - Row 4: RB initials, "Roshan Bhandari sent you a connection request", "Yesterday", with "Accept" / "Decline" buttons.
  </action>
  <verify>grep "Mark all read\|Decline" "e:\studentsociety\mobile\app\(tabs)\alerts.tsx"</verify>
  <done>Notifications screen visually matches the reference design.</done>
</task>

## Success Criteria
- [ ] Notifications endpoint returns grouped notifications.
- [ ] UI matches the reference with New/Earlier sections and action buttons.
