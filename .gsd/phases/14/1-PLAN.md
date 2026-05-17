---
phase: 14
plan: 1
wave: 1
---

# Plan 14.1: Student-Friendly Navigation Shifting

## Objective
Enforce exactly 5 main tabs in the bottom navigation bar (Home, Discover, Events, Requests, Profile). Shifting the other critical collaborative features (Messages & My Team workspace) to highly prominent, student-friendly, and intuitive locations like the Home screen header and Profile dashboard.

## Context
- `e:\studentsociety\mobile\app\(tabs)\_layout.tsx`
- `e:\studentsociety\mobile\app\(tabs)\index.tsx`
- `e:\studentsociety\mobile\app\(tabs)\profile.tsx`

## Tasks

<task type="auto">
  <name>Configure Bottom Tabs to Exactly 5 Screens</name>
  <files>
    e:\studentsociety\mobile\app\(tabs)\_layout.tsx
  </files>
  <action>
    - Ensure TabLayout contains exactly 5 bottom tab screens (index, discover, events, requests, profile).
    - Explicitly hide any extra tabs by marking them `href: null` in their options, or just make sure only the 5 standard tabs are registered in `<Tabs.Screen>`.
  </action>
  <verify>grep "name=\"index\"\|name=\"discover\"\|name=\"events\"\|name=\"requests\"\|name=\"profile\"" "e:\studentsociety\mobile\app\(tabs)\_layout.tsx"</verify>
  <done>Bottom navigation contains only the 5 designated tabs.</done>
</task>

<task type="auto">
  <name>Add Messages and Teams Shortcuts to Home Screen Header</name>
  <files>
    e:\studentsociety\mobile\app\(tabs)\index.tsx
  </files>
  <action>
    - Overhaul the Home Screen's top-right header row to offer three clean, modern student-friendly shortcut buttons:
      - 👥 **My Team** icon (`people-outline`): Navigates to `/teams` when clicked.
      - 💬 **Messages/Chat** icon (`chatbubble-ellipses-outline`): Navigates to `/messages` when clicked.
      - 🔔 **Notifications** icon (`notifications-outline`).
    - Use `router.push('/messages')` and `router.push('/teams')` for seamless, fast transitions.
  </action>
  <verify>grep "chatbubble-ellipses-outline" "e:\studentsociety\mobile\app\(tabs)\index.tsx" && grep "people-outline" "e:\studentsociety\mobile\app\(tabs)\index.tsx"</verify>
  <done>Home screen top-right header includes dynamic Chat and Team workspace icons.</done>
</task>

<task type="auto">
  <name>Integrate Team Workspace Access into Profile Dashboard</name>
  <files>
    e:\studentsociety\mobile\app\(tabs)\profile.tsx
  </files>
  <action>
    - Add a new premium, interactive list card button inside `profile.tsx` for **"My Team Workspace"** right below the Social Links.
    - Style the card beautifully with a group icon (`people-circle-outline`) and a modern chevron arrow to create an extremely professional look.
    - Wire it to navigate to `/teams` using `router.push('/teams')`.
  </action>
  <verify>grep "My Team Workspace" "e:\studentsociety\mobile\app\(tabs)\profile.tsx"</verify>
  <done>Profile screen includes a prominent entry point card for "My Team Workspace".</done>
</task>

## Success Criteria
- [ ] Bottom tab navigation strictly shows exactly 5 items.
- [ ] Top-right corner of the Home screen features Chat and Team shortcuts.
- [ ] Profile dashboard includes a direct entry card for My Team Workspace.
