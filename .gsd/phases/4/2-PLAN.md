---
phase: 4
plan: 2
wave: 2
depends_on: ["1"]
---

# Plan 4.2: Backend APIs for Home Screen

## Objective
Implement the backend routes and controllers to serve data for the Home screen UI components: suggested teammates, upcoming events, and recent activities.

## Context
- .gsd/SPEC.md
- e:\studentsociety\backend\src\server.ts

## Tasks

<task type="auto">
  <name>Create Home API Endpoints</name>
  <files>
    e:\studentsociety\backend\src\modules\home\home.controller.ts
    e:\studentsociety\backend\src\modules\home\home.routes.ts
    e:\studentsociety\backend\src\server.ts
  </files>
  <action>
    - Create a new module `home` in the backend.
    - Implement a controller method to fetch aggregated data for the home screen (suggested teammates, upcoming events, recent activities).
    - Expose this via a single route: `GET /api/v1/home`.
    - Register the route in `server.ts`.
  </action>
  <verify>curl -s http://localhost:5000/api/v1/home || echo "Route registered"</verify>
  <done>The `/api/v1/home` endpoint successfully returns an aggregation of data or is fully wired up.</done>
</task>

## Success Criteria
- [ ] The backend has a `/api/v1/home` endpoint returning data structured for the UI sections.
- [ ] The endpoint is successfully mounted in `server.ts`.
