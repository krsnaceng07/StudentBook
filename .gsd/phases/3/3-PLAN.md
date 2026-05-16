---
phase: 3
plan: 3
wave: 3
depends_on: ["3.2"]
files_modified:
  - mobile/app/_layout.tsx
  - mobile/app/welcome.tsx
  - mobile/app/(auth)/student/login.tsx
  - mobile/app/(auth)/student/signup.tsx
  - mobile/app/(auth)/college/login.tsx
  - mobile/app/(auth)/college/signup.tsx
  - mobile/store/authStore.js
autonomous: true
user_setup: []

must_haves:
  truths:
    - "User can choose Student or College role on first screen"
    - "Auth store persists the selected role"
  artifacts:
    - "mobile/app/welcome.tsx exists"
    - "mobile/app/(auth)/student/login.tsx exists"
---

# Plan 3.3: Welcome & Dual-Role Auth (Mobile)

<objective>
Implement the primary entry point and authentication screens for the mobile app, supporting the separate Student and College "worlds".

Purpose: To provide a role-specific user experience from the moment the app opens, as defined in PRD v2.0.
Output: Welcome screen, separate login/signup flows for students and colleges, and an updated auth store.
</objective>

<context> load for context:
- .gsd/SPEC.md
- mobile/app/_layout.tsx
- mobile/store/authStore.js
- backend/src/modules/auth/auth.routes.ts (Wave 2 reference)
</context>

<tasks>

<task type="auto">
  <name>Welcome Screen & Navigation Guard</name>
  <files>
    - mobile/app/welcome.tsx
    - mobile/app/_layout.tsx
  </files>
  <action>
    1. Create `welcome.tsx` with two prominent buttons: "I am a Student" and "I am a College".
    2. Store the role choice temporarily or pass it as a param to the auth screens.
    3. Update `_layout.tsx` to redirect unauthenticated users to `/welcome` instead of just `/login`.
    AVOID: Complex animations for now; focus on the flow.
  </action>
  <verify>Open app and confirm it lands on the Welcome screen.</verify>
  <done>Entry role selection is implemented.</done>
</task>

<task type="auto">
  <name>Dual-Role Auth Screens & Store Update</name>
  <files>
    - mobile/app/(auth)/student/login.tsx
    - mobile/app/(auth)/student/signup.tsx
    - mobile/app/(auth)/college/login.tsx
    - mobile/app/(auth)/college/signup.tsx
    - mobile/store/authStore.js
  </files>
  <action>
    1. Reorganize auth folder: Create `student/` and `college/` subfolders.
    2. Implement role-specific signup forms (Students need: college, dept, year; Colleges need: type, location).
    3. Update `authStore.js` to include `role` in the state and handle role-based signup APIs.
    4. Ensure `fetchMe` correctly fetches the role-specific profile data based on the `role` in `profiles`.
    AVOID: Duplicate code; use common components for inputs and buttons.
  </action>
  <verify>Perform a successful student signup and confirm role is saved in store.</verify>
  <done>Auth flows for both roles are functional.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Welcome screen correctly branches to student or college auth.
- [ ] Auth store contains the user's role after login.
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>
