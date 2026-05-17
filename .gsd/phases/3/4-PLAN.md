---
phase: 3
plan: 4
wave: 1
---

# Plan 3.4: Simplified Onboarding & Deferred Profile Setup

## Objective
Reduce friction during signup by removing mandatory profile setup. Users should be able to create an account with just an email/password and login immediately. Detailed profile completion will be moved to a later phase.

## Context
- .gsd/ROADMAP.md
- e:\studentsociety\mobile\app\(auth)\student\signup.tsx
- e:\studentsociety\mobile\app\(auth)\college\signup.tsx
- e:\studentsociety\backend\src\modules\auth\auth.controller.ts

## Tasks

<task type="auto">
  <name>Simplify Backend Signup</name>
  <files>e:\studentsociety\backend\src\modules\auth\auth.controller.ts</files>
  <action>
    Modify `signupStudent` and `signupCollege` to make most profile fields optional or defaulted.
    - Keep only essential fields: email, password, role.
    - Default `full_name` and `college_name` to empty strings or email prefix if not provided.
    - Ensure `profiles` table is always populated to maintain RBAC.
  </action>
  <verify>Check controller logic for optional fields.</verify>
  <done>Signup succeeds with minimal payload.</done>
</task>

<task type="auto">
  <name>Simplify Mobile Signup UI</name>
  <files>
    e:\studentsociety\mobile\app\(auth)\student\signup.tsx,
    e:\studentsociety\mobile\app\(auth)\college\signup.tsx
  </files>
  <action>
    - Remove extra input fields (Department, Year, College Type, Location, etc.) from the signup screens.
    - Keep only: Full Name, Email, Password.
    - Update the validation logic and store calls to match.
  </action>
  <verify>Run mobile app and check Signup forms.</verify>
  <done>Signup screens are clean and only ask for essentials.</done>
</task>

<task type="auto">
  <name>Relax Navigation Guard</name>
  <files>e:\studentsociety\mobile\app\_layout.tsx</files>
  <action>
    Update the `useEffect` guard to allow users with a valid `profiles` row but missing sub-profile data to remain logged in.
    - Do NOT force logout if `profiles` row exists.
  </action>
  <verify>Login with a new user and ensure no logout loop happens.</verify>
  <done>User stays logged in after signup.</done>
</task>

## Success Criteria
- [ ] Signup takes less than 30 seconds.
- [ ] Users can login immediately after signup.
- [ ] No mandatory "Profile Setup" screen blocks entry to the app.
