---
phase: 17
plan: 1
wave: 1
---

# Plan 17.1: Harden Student Routes with roleMiddleware and Security Comments

## Objective
Harden backend API routes with strict Role-Based Access Control (RBAC) by importing and applying the `roleMiddleware` to restrict access strictly to permitted roles.

## Context
- `e:\studentsociety\backend\src\modules\dashboard\dashboard.routes.ts`
- `e:\studentsociety\backend\src\modules\profile\profile.routes.ts`
- `e:\studentsociety\backend\src\modules\discover\discover.routes.ts`
- `e:\studentsociety\backend\src\modules\home\home.routes.ts`
- `e:\studentsociety\backend\src\modules\teams\teams.routes.ts`
- `e:\studentsociety\backend\src\modules\messages\messages.routes.ts`

## Tasks

<task type="auto">
  <name>Enforce RBAC Guards on Routes</name>
  <files>
    e:\studentsociety\backend\src\modules\dashboard\dashboard.routes.ts
    e:\studentsociety\backend\src\modules\profile\profile.routes.ts
    e:\studentsociety\backend\src\modules\discover\discover.routes.ts
    e:\studentsociety\backend\src\modules\home\home.routes.ts
    e:\studentsociety\backend\src\modules\teams\teams.routes.ts
    e:\studentsociety\backend\src\modules\messages\messages.routes.ts
  </files>
  <action>
    - Import `roleMiddleware` into each route file from `../../middleware/role.middleware.js` (or `../middleware/role.middleware.js` depending on directory level).
    - Insert the `roleMiddleware(['student'])` validation to secure student routes:
      - `dashboard.routes.ts` -> `/home` protected by `roleMiddleware(['student'])`
      - `profile.routes.ts` -> `/me` protected by `roleMiddleware(['student'])`
      - `discover.routes.ts` -> `/` protected by `roleMiddleware(['student'])`
      - `home.routes.ts` -> `/` protected by `roleMiddleware(['student'])`
      - `teams.routes.ts` -> `/my` protected by `roleMiddleware(['student'])`
      - `messages.routes.ts` -> `/` and `/:conversationId` protected by `roleMiddleware(['student'])`
    - Add descriptive comments inside each file explaining the authorization and security posture.
  </action>
  <verify>grep "roleMiddleware" "e:\studentsociety\backend\src\modules\dashboard\dashboard.routes.ts"</verify>
  <done>Strict RBAC role validations applied to all student API endpoints.</done>
</task>

## Success Criteria
- [ ] Backend compiling perfectly without any broken imports or types.
- [ ] Route files correctly configured to enforce `student` access control checks.
