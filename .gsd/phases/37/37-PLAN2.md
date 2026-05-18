---
phase: 37
plan: 2
wave: 2
---

# Plan 37.2: Double Event Registration & Workspace Engine (Wave 2)

## Objective
Refactor the student-side Event Details screen and college-side Event Management portals to support the double registration interface. Introduce instant, optimistic "Register/Cancel" actions for students and allow college organizers to set registration modes and review student rosters.

## Context
- [.gsd/SPEC.md](file:///e:/studentsociety/.gsd/SPEC.md)
- [mobile/app/events/[id].tsx](file:///e:/studentsociety/mobile/app/events/%5Bid%5D.tsx)
- [mobile/app/(college)/post-event.tsx](file:///e:/studentsociety/mobile/app/%28college%29/post-event.tsx)
- [mobile/app/(college)/manage-events.tsx](file:///e:/studentsociety/mobile/app/%28college%29/manage-events.tsx)

## Tasks

<task type="auto">
  <name>Upgrade Student Event Details Page</name>
  <files>
    - mobile/app/events/[id].tsx
  </files>
  <action>
    1. Update the Event Details component to read the backend parameters `registration_type`, `external_link`, `isRegistered`, and `registrationCount`.
    2. Display the registration count cleanly as a metadata statistic on the event card.
    3. Modify the primary action button at the bottom of the details page:
       - If `registration_type === 'external'`: Render "Apply on External Site" (indigo bg). Tapping it calls `Linking.openURL(external_link)` securely.
       - If `registration_type === 'internal'`:
         - If NOT registered: Render "Register Now" (blue bg). Tapping it instantly fires `handleRegister()`, optimistically setting `isRegistered = true` and incrementing count.
         - If ALREADY registered: Render "✓ Registered" (green bg) with a subtle "Cancel Registration" option. Tapping it instantly fires `handleCancelRegister()`, optimistically setting `isRegistered = false` and decrementing count.
  </action>
  <verify>Launch the mobile application, navigate to Event Details, check external redirect and internal registration buttons compile with zero regressions.</verify>
  <done>The student-side Event Details screen renders the dual registration flows with responsive, latency-free optimistic updates.</done>
</task>

<task type="auto">
  <name>Upgrade College Creation, Edit, & Applicant Roster UI</name>
  <files>
    - mobile/app/(college)/post-event.tsx
    - mobile/app/(college)/manage-events.tsx
  </files>
  <action>
    1. Upgrade `post-event.tsx` form UI to include:
       - A segment selector for "Registration Type": Direct (Internal) vs External Link.
       - If External Link is active, show an Input Field for "External Registration URL".
       - Post this metadata to the `/college/events` endpoints.
    2. Upgrade `manage-events.tsx` organizer dashboard:
       - Display a clean indicator showing the number of internal registrants for each event.
       - Introduce a "View Registrants" button/icon on each event card.
       - Tapping it opens a premium bottom sheet/modal modal listing classmates who registered internally (displaying initials, name, department, and skills tags).
  </action>
  <verify>Launch the college portal, verify events can be created with external URLs, and assert that the registrant roster modal loads details dynamically.</verify>
  <done>Colleges can seamlessly set registration constraints and review live student rosters directly within the event dashboard.</done>
</task>

## Success Criteria
- [ ] Students can click "Apply on External Site" to trigger a secure browser redirect or register internally with instant optimistic updates.
- [ ] Colleges can specify registration targets (direct vs URL link) in the event builder.
- [ ] Colleges can open a dedicated modal displaying a clean roster of student details for their events.
