---
phase: 6
plan: 3
wave: 3
depends_on: ["2"]
---

# Plan 6.3: Frontend Events Screen UI

## Objective
Build the Events screen (`app/(tabs)/events.tsx`) matching the reference UI — a grouped event list with category filter pills and event cards with Register/Save actions.

## Context
- `e:\studentsociety\mobile\app\(tabs)\events.tsx`
- Reference image: Purple "Nepal Tech Hackathon 2025" group, Green "AI/ML Workshop" group, Yellow "Business Idea Competition" group. Each has a card with event name, date, location, organizer, a badge, and Register + Save buttons.

## Tasks

<task type="auto">
  <name>Build Events Screen UI</name>
  <files>
    e:\studentsociety\mobile\app\(tabs)\events.tsx
  </files>
  <action>
    - Use NativeWind for all styling.
    - Add "Events" header with a light settings icon on the right.
    - Add Filter Pills: All, Hackathon, Workshop, Competition — with active state (blue filled, others white/outlined).
    - Use mock data with 3 events, one per type.
    - Each event group has a tinted section header (purple for Hackathon, green for Workshop, yellow/gold for Competition).
    - Each event card shows: bold event name, date range ("Dec 15-16"), location, organizer ("Organized by TechNepal"), a small colored type badge (e.g. "Hackathon"), a solid blue "Register" button (full width), and a ghost "Save" button.
    - Wrap the list in a `ScrollView` for vertical scroll.
    - Use `SafeAreaView` as root.
    - Import and use `useUIStore` for dark mode support.
  </action>
  <verify>grep "Search messages\|Register\|Hackathon" "e:\studentsociety\mobile\app\(tabs)\events.tsx"</verify>
  <done>The file renders event groups with tinted headers, event cards, filter pills, and Register/Save buttons.</done>
</task>

## Success Criteria
- [ ] Events screen visually matches the reference with 3 grouped event types.
- [ ] Filter pills update `activeFilter` state on press.
