---
phase: 24
plan: 1
wave: 1
---

# Plan 24.1: Mobile Router Isolation

## Objective
To completely decouple the student and college layouts in the mobile application. Currently, the student tabs are at `mobile/app/(tabs)` and the college screens are in `mobile/app/college`. We need to move `(tabs)` to `(student)` and update routing so that the two app architectures never conflict.

## Context
- `e:\studentsociety\mobile\app\` directory structure
- `e:\studentsociety\mobile\app\_layout.tsx` (Root Navigation Router)
- `e:\studentsociety\mobile\app\auth\login.tsx` (Route redirection based on role)

## Tasks

<task type="auto">
  <name>Isolate Student Mobile Routes</name>
  <files>
    e:\studentsociety\mobile\app\(tabs)
    e:\studentsociety\mobile\app\(student)
  </files>
  <action>
    - Rename `e:\studentsociety\mobile\app\(tabs)` to `e:\studentsociety\mobile\app\(student)`.
    - Update all nested paths within `_layout.tsx` and screens inside `(student)` that refer to `/(tabs)` to `/(student)`.
  </action>
  <verify>ls e:\studentsociety\mobile\app\(student)</verify>
  <done>Student navigation folder is physically renamed to (student) for explicit namespace separation.</done>
</task>

<task type="auto">
  <name>Isolate College Mobile Routes</name>
  <files>
    e:\studentsociety\mobile\app\college
    e:\studentsociety\mobile\app\(college)
  </files>
  <action>
    - Rename `e:\studentsociety\mobile\app\college` to `e:\studentsociety\mobile\app\(college)`.
    - Update all internal routes in `(college)` to map to the new route group.
  </action>
  <verify>ls e:\studentsociety\mobile\app\(college)</verify>
  <done>College routes are explicitly encapsulated in the (college) route group.</done>
</task>

<task type="auto">
  <name>Update Authentication Routing Logic</name>
  <files>
    e:\studentsociety\mobile\app\auth\login.tsx
    e:\studentsociety\mobile\app\_layout.tsx
  </files>
  <action>
    - In `login.tsx`, update role-based navigation:
      - If user role is `student`, route to `/(student)`.
      - If user role is `college`, route to `/(college)/dashboard`.
    - In `_layout.tsx`, ensure `(student)` and `(college)` are configured as root level stacks.
  </action>
  <verify>grep "/(student)" e:\studentsociety\mobile\app\auth\login.tsx</verify>
  <done>Upon login, users are explicitly directed to their isolated route groups based on RBAC.</done>
</task>

## Success Criteria
- [ ] No mixed `/tabs` routes exist in the project; they are cleanly separated into `/(student)` and `/(college)`.
- [ ] Login effectively splits the navigation tree without bleed between structures.
