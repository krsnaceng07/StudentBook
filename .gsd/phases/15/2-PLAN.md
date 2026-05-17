---
phase: 15
plan: 2
wave: 2
---

# Plan 15.2: College Portal Architecture & UI

## Objective
Implement the core workspace for College accounts featuring a beautiful green-themed bottom tab navigation layout and a detailed College Dashboard matching screenshot 3.

## Context
- `e:\studentsociety\mobile\app\_layout.tsx`

## Tasks

<task type="auto">
  <name>Build College Tab Layout</name>
  <files>
    e:\studentsociety\mobile\app\college\_layout.tsx
  </files>
  <action>
    - Create `mobile/app/college/_layout.tsx` to handle nested bottom tabs for College users.
    - Set custom `screenOptions` with a sleek dark/light style, green active tint (`#10B981`), and 60px tab height matching the style of TabLayout.
    - Register three tabs exactly:
      - **dashboard**: Dashboard (`home-outline` icon)
      - **manage-events**: My Events (`calendar-outline` icon)
      - **profile**: Profile (`school-outline` icon)
  </action>
  <verify>test -f "e:\studentsociety\mobile\app\college/_layout.tsx" && grep "dashboard" "e:\studentsociety\mobile\app\college/_layout.tsx"</verify>
  <done>College layout configured with three green-accent bottom tabs.</done>
</task>

<task type="auto">
  <name>Build College Dashboard Screen</name>
  <files>
    e:\studentsociety\mobile\app\college\dashboard.tsx
  </files>
  <action>
    - Create `mobile/app/college/dashboard.tsx` to serve as the landing page for college managers.
    - Render a prominent green banner containing:
      - A white text avatar inside a rounded light-green box ("TU")
      - Bold university title "Tribhuvan University" and subtitle "College Dashboard".
    - Render a 2x2 grid stats panel:
      - 📅 **Total Events**: "2"
      - 🟢 **Active Events**: "2"
      - 👥 **Total Reach**: "240+"
      - ✅ **Registrations**: "87"
    - Include a "Recent Activity" feed list display card for upcoming campus events like "HackTU 2026" (Hackathon) and "AI Innovation Summit" (Seminar).
  </action>
  <verify>test -f "e:\studentsociety\mobile\app\college/dashboard.tsx" && grep "Recent Activity" "e:\studentsociety\mobile\app\college/dashboard.tsx"</verify>
  <done>College Dashboard implemented with stats grid and green branding headers.</done>
</task>

## Success Criteria
- [ ] College portal contains custom `_layout.tsx` with green theme.
- [ ] Dashboard displays correct numbers and recent activity lists.
