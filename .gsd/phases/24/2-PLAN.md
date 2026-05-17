---
phase: 24
plan: 2
wave: 2
---

# Plan 24.2: Backend API Namespace Isolation

## Objective
To strictly isolate backend routing paths between students and colleges. Mixed modular routes (e.g., `/api/v1/events/my-events` and `/api/v1/dashboard/college`) create a risk of logic bleeding across roles. We will encapsulate all student capabilities under `/api/v1/student/*` and college capabilities under `/api/v1/college/*`, enforced heavily by RBAC router sub-groupings.

## Context
- `e:\studentsociety\backend\src\server.ts`
- `e:\studentsociety\mobile\api\client.js`

## Tasks

<task type="auto">
  <name>Create Strict Sub-Routers for Roles</name>
  <files>
    e:\studentsociety\backend\src\routes\student.routes.ts
    e:\studentsociety\backend\src\routes\college.routes.ts
  </files>
  <action>
    - Create `backend/src/routes/student.routes.ts`. This router will compose all modules specifically for students (discover, connections, student-dashboard). Apply `roleMiddleware(['student'])` at the root of this sub-router.
    - Create `backend/src/routes/college.routes.ts`. This router will compose modules specific to colleges (college-dashboard, manage-events). Apply `roleMiddleware(['college'])` at the root of this sub-router.
  </action>
  <verify>ls e:\studentsociety\backend\src\routes\student.routes.ts</verify>
  <done>Explicit sub-routers exist for both roles with root-level RBAC enforcement.</done>
</task>

<task type="auto">
  <name>Refactor Server.ts API Mounts</name>
  <files>
    e:\studentsociety\backend\src\server.ts
  </files>
  <action>
    - Remove the flat mounting of `eventsRoutes`, `dashboardRoutes`, `discoverRoutes` directly onto `/api/v1`.
    - Import `studentRoutes` and `collegeRoutes` from the newly created `routes/` directory.
    - Mount them at `/api/v1/student` and `/api/v1/college`. (Authentication routes remain public/shared).
  </action>
  <verify>grep "/api/v1/student" e:\studentsociety\backend\src\server.ts</verify>
  <done>The main Express application structure is strictly divided into functional namespaces.</done>
</task>

<task type="auto">
  <name>Update Mobile API Clients to Match New Sub-namespaces</name>
  <files>
    e:\studentsociety\mobile\app\(student)
    e:\studentsociety\mobile\app\(college)
  </files>
  <action>
    - Using regex or precise search, update API fetch paths in the mobile app.
    - Change `/api/v1/dashboard/home` to `/api/v1/student/dashboard/home`.
    - Change `/api/v1/dashboard/college` to `/api/v1/college/dashboard`.
    - Change `/api/v1/events/my-events` to `/api/v1/college/events/my-events`, etc.
  </action>
  <verify>grep -r "/api/v1/college" e:\studentsociety\mobile\app\</verify>
  <done>Mobile API paths correctly resolve to the heavily isolated backend routes.</done>
</task>

## Success Criteria
- [ ] No API calls fail due to 404s after refactoring the namespaces.
- [ ] It is physically impossible for a student token to hit a `/api/v1/college/*` endpoint due to root sub-router middleware.
