---
phase: 29
plan: 1
wave: 1
---

# Plan 29.1: NativeWind v4 Rendering Stability & Performance Optimizations

## Objective
Address and fix the React Navigation container race condition crash (`Couldn't find a navigation context`) that occurs due to NativeWind v4's CSS Interop runtime parsing issues. We will replace color/opacity shorthand classes (`bg-emerald-500/5`, `bg-blue-500/5`, `bg-red-500/5`, `bg-blue-500/50`) and complex dynamic dynamic-shadow classes with stable inline style backups, ensuring the mobile app is highly responsive, optimized, and completely crash-proof.

## Context
- `e:\studentsociety\mobile\app\(college)\edit-profile.tsx`
- `e:\studentsociety\mobile\app\(college)\manage-events.tsx`
- `e:\studentsociety\mobile\app\(student)\edit-profile.tsx`
- `e:\studentsociety\mobile\app\(student)\profile.tsx`

## Tasks

<task type="auto">
  <name>College Side Profile and Event Listing Stability Fixes</name>
  <files>
    e:\studentsociety\mobile\app\(college)\edit-profile.tsx,
    e:\studentsociety\mobile\app\(college)\manage-events.tsx
  </files>
  <action>
    - Replace `bg-emerald-500/5` shorthand in the dynamic college type pills loops in `edit-profile.tsx` with `{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }`.
    - Remove runtime CSS interop parser triggers (`shadow-sm`) from screen headers to resolve race conditions.
    - Replace the `bg-red-500/5` shorthand on the delete event action buttons inside loops in `manage-events.tsx` with `{ backgroundColor: 'rgba(239, 68, 68, 0.05)' }` inline style.
  </action>
  <verify>grep -q "rgba(16" e:\studentsociety\mobile\app\(college)\edit-profile.tsx</verify>
  <done>Dynamic looping elements are 100% crash-proof and stable on the College side.</done>
</task>

<task type="auto">
  <name>Student Side Profile and Skill Selectors Stability Fixes</name>
  <files>
    e:\studentsociety\mobile\app\(student)\edit-profile.tsx,
    e:\studentsociety\mobile\app\(student)\profile.tsx
  </files>
  <action>
    - Replace all `bg-blue-500/5` shorthands inside loop components (Preset Skills grid, Preset Interests grid, and Goal select cards) inside `(student)/edit-profile.tsx` with `{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }` inline styles.
    - Replace `bg-blue-500/50` on the profile banner Edit button in `(student)/profile.tsx` with `{ backgroundColor: 'rgba(59, 130, 246, 0.5)' }`.
  </action>
  <verify>grep -q "rgba(59" e:\studentsociety\mobile\app\(student)\edit-profile.tsx</verify>
  <done>Dynamic looping elements are 100% crash-proof and stable on the Student side.</done>
</task>

## Success Criteria
- [ ] No more "Couldn't find a navigation context" crashes on launching profile editing on either college or student accounts.
- [ ] CSS Interop parsing lag is completely eliminated, making screens open instantly.
