---
phase: 35
plan: 2
wave: 1
---

# Plan 35.2: Student Settings Screen UI & Live Data Synchronization

## Objective
Build a premium, high-fidelity settings dashboard for students in React Native that provides real-time toggle adjustments, account management, support links, and native dark mode toggle, fully synchronized with the backend.

## Context
- .gsd/SPEC.md
- e:\studentsociety\mobile\app\(student)\profile.tsx
- e:\studentsociety\mobile\app\(student)\settings.tsx

## Tasks

<task type="auto">
  <name>Build Student Settings Screen UI and API Integration</name>
  <files>e:\studentsociety\mobile\app\(student)\settings.tsx</files>
  <action>
    Create a new high-fidelity mobile screen:
    - Re-use premium NativeWind layouts and dark/light color schemes.
    - Implement a focus-triggered hook using useFocusEffect to pull the latest profile data from GET /profile/me.
    - Add dynamic switches for Push Notifications and Email digest that fire PUT /profile/update immediately upon toggle for instant, seamless database syncing.
    - Add a Privacy selector (Public vs Private) that instantly updates the settings_visibility field.
    - Include password change forms with clean field inputs, secure text entry, and local validations.
    - Add Help FAQs and Support policy static text rows.
    - Include a functional "Sign Out" row tied to useAuthStore's logout handler.
  </action>
  <verify>test-path e:\studentsociety\mobile\app\(student)\settings.tsx</verify>
  <done>The settings screen file exists, contains the full UI switches, is fully typed, and has zero TypeScript compile errors.</done>
</task>

<task type="auto">
  <name>Link Settings Screen from Student Profile Page</name>
  <files>e:\studentsociety\mobile\app\(student)\profile.tsx</files>
  <action>
    Integrate settings route navigation:
    - Add a cog settings icon at the top-right corner of the profile header, using Ionicons name="settings-outline" and linking to router.push('/(student)/settings').
    - Add a Settings & Privacy list card above the Sign Out button to make navigation extremely accessible.
  </action>
  <verify>grep "settings" e:\studentsociety\mobile\app\(student)\profile.tsx</verify>
  <done>The profile page has been updated with active settings buttons in both the header and card menus.</done>
</task>

## Success Criteria
- [ ] Student settings screen fully operational and accessible from the Profile screen.
- [ ] Push, Email, and Visibility switches update their values live in the database upon user toggle.
- [ ] Dark Mode toggle works seamlessly across light/dark UI themes.
- [ ] Sign Out cleanly terminates the user session and redirects to onboarding/welcome.
