---
phase: 12
plan: 1
wave: 1
---

# Plan 12.1: Final UI Update (Home & Tabs)

## Objective
Update the tab navigation structure and completely rebuild the Home screen to match the provided final UI design reference.

## Context
- `e:\studentsociety\mobile\app\(tabs)\_layout.tsx`
- `e:\studentsociety\mobile\app\(tabs)\index.tsx`
- `e:\studentsociety\mobile\app\(tabs)\requests.tsx` (new file, renamed from alerts.tsx)

## Tasks

<task type="auto">
  <name>Update Tab Navigation and Screen Names</name>
  <files>
    e:\studentsociety\mobile\app\(tabs)\alerts.tsx
    e:\studentsociety\mobile\app\(tabs)\requests.tsx
    e:\studentsociety\mobile\app\(tabs)\_layout.tsx
  </files>
  <action>
    - If `app/(tabs)/alerts.tsx` exists, rename it to `app/(tabs)/requests.tsx`.
    - Update the internal component name inside `requests.tsx` to `Requests`.
    - Update `app/(tabs)/_layout.tsx` to have exactly these tabs in order:
      1. `index` (Title: "Home", Icon: "home-outline")
      2. `discover` (Title: "Discover", Icon: "people-outline")
      3. `events` (Title: "Events", Icon: "calendar-outline")
      4. `requests` (Title: "Requests", Icon: "handshake-outline")
      5. `profile` (Title: "Profile", Icon: "person-outline")
    - Remove the `messages` tab from `_layout.tsx` (it will still be accessible via URL but not in the bottom tab bar).
  </action>
  <verify>grep "name=\"requests\"" "e:\studentsociety\mobile\app\(tabs)\_layout.tsx"</verify>
  <done>Tabs are correctly named and ordered with proper icons.</done>
</task>

<task type="auto">
  <name>Rebuild Home Screen UI</name>
  <files>
    e:\studentsociety\mobile\app\(tabs)\index.tsx
  </files>
  <action>
    - Rewrite `index.tsx` entirely to match the new UI.
    - Add a white top safe area header showing the text `CollabSpace` in bold.
    - Add a solid blue banner below the header saying "Good morning 👋", "Aarav Sharma" (bold), "Tribhuvan University".
    - Under the banner, add a row of 3 cards (white cards on grey background) showing:
      - 🤝 0 Connections
      - 🔖 0 Bookmarks
      - 📬 0 Pending
    - Add "Upcoming Events" section with cards (e.g. HackTU 2026, Web3 Workshop Series). Event cards should have a small icon on the left, Title + Uni + Badge in middle, Date on top right.
    - Add a "Complete your profile" banner at the very bottom (blue text, light blue background).
  </action>
  <verify>grep "Connections\|Bookmarks\|Pending\|HackTU" "e:\studentsociety\mobile\app\(tabs)\index.tsx"</verify>
  <done>Home screen exactly matches the new design provided.</done>
</task>

## Success Criteria
- [ ] Tabs are correctly structured: Home, Discover, Events, Requests, Profile.
- [ ] Home screen displays the blue header, 3 metric cards, upcoming events, and complete profile banner.
