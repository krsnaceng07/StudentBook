---
phase: 15
plan: 3
wave: 3
---

# Plan 15.3: College Event Management, Profile & Routing

## Objective
Implement event creation, event management, and profile options for College users, and update Root Navigation Guards to automatically split routing by role.

## Context
- `e:\studentsociety\mobile\app\_layout.tsx`

## Tasks

<task type="auto">
  <name>Build Manage Events Screen</name>
  <files>
    e:\studentsociety\mobile\app\college\manage-events.tsx
  </files>
  <action>
    - Create `mobile/app/college/manage-events.tsx` to handle listings and management.
    - Render a prominent green "+ Post New Event" button at the top that navigates to a creation screen.
    - Render a clean listing of posted events (e.g. HackTU 2026, AI Innovation Summit) with:
      - Quick actions row containing green **"Edit"** and pink **"Delete"** outline buttons.
      - Colorful accent borders on the left side of cards.
  </action>
  <verify>test -f "e:\studentsociety\mobile\app\college/manage-events.tsx" && grep "+ Post New Event" "e:\studentsociety\mobile\app\college/manage-events.tsx"</verify>
  <done>Manage Events page created with edit/delete options and posting actions.</done>
</task>

<task type="auto">
  <name>Build College Profile Screen</name>
  <files>
    e:\studentsociety\mobile\app\college\profile.tsx
  </files>
  <action>
    - Create `mobile/app/college/profile.tsx` for managing college portal profiles.
    - Build a green banner header featuring the TU logo avatar, "Tribhuvan University" name, and "Edit ✏️" floating button.
    - Include structured cards below:
      - **About**: "Nepal's oldest and largest university with 60+ years of academic excellence."
      - **Website**: Interactive link card to `tu.edu.np` (using Globe icon).
      - **Contact**: Interactive email link card to `info@tu.edu.np` (using Mail icon).
  </action>
  <verify>test -f "e:\studentsociety\mobile\app\college/profile.tsx" && grep "tu.edu.np" "e:\studentsociety\mobile\app\college/profile.tsx"</verify>
  <done>College profile screen built with verified information segments.</done>
</task>

<task type="auto">
  <name>Build Post Event Form Screen</name>
  <files>
    e:\studentsociety\mobile\app\college\post-event.tsx
  </files>
  <action>
    - Create `mobile/app/college/post-event.tsx` for publishing new campus events.
    - Build an input form supporting: Title, Event Type (Hackathon, Workshop, Seminar), Date, Prize Pool, Team Limit, Venue, and Description.
    - Add a large green publish button that triggers database insertion and updates state.
  </action>
  <verify>test -f "e:\studentsociety\mobile\app\college/post-event.tsx" && grep "Publish Event" "e:\studentsociety\mobile\app\college/post-event.tsx"</verify>
  <done>Post Event creation form implemented.</done>
</task>

<task type="auto">
  <name>Integrate Dual-Role Navigation Guards</name>
  <files>
    e:\studentsociety\mobile\app\_layout.tsx
  </files>
  <action>
    - Update the `NavigationGuard` routing block inside `mobile/app/_layout.tsx` lines 15-30.
    - Inspect user profile details in `useAuthStore`'s `user` session.
    - If `user.role === 'college'`, redirect them to `/college/dashboard`.
    - If `user.role === 'student'`, redirect them to `/(tabs)`.
  </action>
  <verify>grep "college" "e:\studentsociety\mobile\app\_layout.tsx" && grep "student" "e:\studentsociety\mobile\app\_layout.tsx"</verify>
  <done>Authentication redirect logic split seamlessly between college and student layouts.</done>
</task>

## Success Criteria
- [ ] College users can post, view, and inspect their campus events.
- [ ] College profile features working web/email links.
- [ ] Navigation automatically splits student vs college users instantly on login.
