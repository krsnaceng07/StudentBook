---
phase: 15
plan: 1
wave: 1
---

# Plan 15.1: Premium Onboarding Flow & Event Details Screen

## Objective
Implement a fully functional and beautifully premium onboarding selection flow matching screenshot 2, and an elegant Event Details nested screen routing matching screenshot 1.

## Context
- `e:\studentsociety\.gsd\SPEC.md`
- `e:\studentsociety\mobile\app\_layout.tsx`

## Tasks

<task type="auto">
  <name>Build Premium Onboarding Flow UI</name>
  <files>
    e:\studentsociety\mobile\app\onboarding.tsx
  </files>
  <action>
    - Create `mobile/app/onboarding.tsx` to build the step-by-step onboarding visualizer.
    - Render a solid blue top section containing a multi-step horizontal progress bar ("STEP 1 OF 4") and a bold white title "Your Goal".
    - Render 3 large selection buttons inside the main body matching the options exactly:
      - 🚀 **Looking for a Team** ("I have an idea and need teammates")
      - 🤝 **Open to Join** ("I want to join an existing team")
      - 👀 **Just Exploring** ("Browsing and learning")
    - Style selection items with custom active states (e.g. blue outline when selected, light shadow, and clean icons).
    - Render a spanning blue button at the bottom labeled "Continue →" that routes the user to `/(tabs)` home screen.
  </action>
  <verify>test -f "e:\studentsociety\mobile\app\onboarding.tsx" && grep "Your Goal" "e:\studentsociety\mobile\app\onboarding.tsx"</verify>
  <done>Onboarding screen created with 3 selection items and styled progress header.</done>
</task>

<task type="auto">
  <name>Build Nested Event Details Screen</name>
  <files>
    e:\studentsociety\mobile\app\events\[id].tsx
  </files>
  <action>
    - Create `mobile/app/events/[id].tsx` to display complete details of a specific event when clicked.
    - Structure a header banner with back arrow `←`, orange bookmark tag 🔖, bold white title "HackTU 2026", and subtitle "Tribhuvan University".
    - Render a 2x2 grid card set:
      - 📅 **Date**: "June 15, 2026"
      - ⏰ **Deadline**: "Jun 1"
      - 📍 **Venue**: "Pulchowk Engineering Campus"
      - 👥 **Team Size**: "2–4 members"
    - Highlight the prize pool in a premium yellow-themed card: "🏆 Prize Pool: NPR 1,00,000".
    - Include section lists for "About this Event" and "Tags" (e.g. AI, FinTech, Social Impact).
  </action>
  <verify>test -f "e:\studentsociety\mobile\app\events/[id].tsx" && grep "About this Event" "e:\studentsociety\mobile\app\events/[id].tsx"</verify>
  <done>Event details page created with grid information blocks and colored header.</done>
</task>

## Success Criteria
- [ ] Onboarding page renders with progress visualizer and Goal options.
- [ ] Dynamic event details routing is fully configured at `/events/[id]`.
- [ ] All UI blocks match reference screenshots exactly.
