---
phase: 39
plan: 1
wave: 1
---

# Plan 39.1: UI/UX Refining & Layout Hardening of Key Screens

## Objective
To redesign and harden three crucial mobile screens (Peer Profile, Own Profile, and Settings & Privacy) by improving text hierarchy, resolving layout overflow/truncation issues, hiding the bottom tab bar on full-screen stack views, and adding graceful placeholders for empty state cards.

## Context
- .gsd/SPEC.md
- .gsd/ROADMAP.md
- mobile/app/profile/[id].tsx
- mobile/app/(student)/profile.tsx
- mobile/app/(student)/settings.tsx
- mobile/app/(student)/_layout.tsx

## Tasks

<task type="auto" done="true">
  <name>Hide Bottom Tab Bar on Stack Screens</name>
  <files>
    <file>mobile/app/(student)/_layout.tsx</file>
  </files>
  <action>
    - Add `tabBarStyle: { display: 'none' }` in `options` for non-tab screens inside the `TabLayout` (`settings` and `edit-profile`, and others like `messages` or `teams` if needed).
    - This will prevent the bottom tab bar from bleeding into these screens, giving them a proper full-screen stack overlay appearance.
  </action>
  <verify>Check settings and verify tab bar display is hidden.</verify>
  <done>Bottom tab bar is hidden when navigating to settings and edit profile screens.</done>
</task>

<task type="auto" done="true">
  <name>Redesign Peer and Own Profile Screens</name>
  <files>
    <file>mobile/app/profile/[id].tsx</file>
    <file>mobile/app/(student)/profile.tsx</file>
  </files>
  <action>
    - Refine the colorful top header: adjust paddings, ensure the back button has a balanced size and margin, and increase name font-sizes for a premium look.
    - Resolve text wrapping/truncation for long university and department names (e.g. "Tribhuvan University") so they display cleanly without trailing ellipsis or typos.
    - Harden "Skills" and "Interests" cards by checking for empty arrays:
      - If empty, render a beautifully styled, friendly placeholder text (e.g., "No interests selected yet. Edit your profile to add some!") instead of an empty box.
      - Ensure badges use rich dark-mode colors (e.g., bg-slate-900 border-slate-800 text-slate-300) and consistent padding.
    - Improve spacing, margins, and section divider cards.
  </action>
  <verify>Compile and run type checks on profiles.</verify>
  <done>Profiles render beautifully with consistent text sizes, wrap correctly, and show graceful empty placeholders.</done>
</task>

<task type="auto" done="true">
  <name>Redesign Settings & Privacy Screen</name>
  <files>
    <file>mobile/app/(student)/settings.tsx</file>
  </files>
  <action>
    - Tidy up the profile card block at the top: optimize alignment of avatar initials and spacing of email/role badge.
    - Improve layout spacing under "ACCOUNT SETTINGS", "NOTIFICATIONS & ALERTS", "PRIVACY SETTINGS", "APPEARANCE", and "SUPPORT & LEGAL".
    - Redesign the Discover Privacy grid selectors: increase row paddings, add consistent margins, and ensure the descriptive helper text has an elegant hierarchy (e.g., text-xs font-semibold for label, text-[11px] text-slate-400 for description).
    - Align toggles and checkboxes beautifully.
  </action>
  <verify>Compile and check settings layout.</verify>
  <done>Settings & Privacy page features clean spacing, balanced typography, and a modern, premium grid selector interface.</done>
</task>

## Success Criteria
- [x] Bottom tab bar is successfully hidden on Settings and Edit Profile screens.
- [x] User and Peer profiles wrap long names cleanly and render friendly empty-state helpers.
- [x] Settings screen has harmonious card paddings, matching font sizes, and consistent layout spacing.
- [x] Code passes all TypeScript compiler validation checks (`npx tsc --noEmit`) with zero errors.
