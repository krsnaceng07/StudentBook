---
phase: 18
plan: 2
wave: 2
---

# Plan 18.2: Apply Joi Middleware to Auth Routes and Verify Build

## Objective
Apply the Joi validation middleware to all Auth POST routes and perform a complete verification of build compilation to ensure flawless operational status.

## Context
- `e:\studentsociety\backend\src\modules\auth\auth.routes.ts`

## Tasks

<task type="auto">
  <name>Register Validation Middleware and Build</name>
  <files>
    e:\studentsociety\backend\src\modules\auth\auth.routes.ts
  </files>
  <action>
    - Import the Joi schemas and `validateRequest` middleware into `auth.routes.ts`.
    - Enforce the validation middleware on:
      - `POST /signup/student` with student signup validation.
      - `POST /signup/college` with college signup validation.
      - `POST /login` with login validation.
    - Compile the project using `npm run build` in the backend directory.
  </action>
  <verify>npm run build --prefix "e:\studentsociety\backend"</verify>
  <done>All POST routes fully protected by robust, secure input validators.</done>
</task>

## Success Criteria
- [ ] Authentication endpoints reject invalid/malformed JSON inputs with clean descriptive 400 errors.
- [ ] Backend compiles without any import or parameter errors.
