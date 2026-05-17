---
phase: 20
plan: 1
wave: 1
---

# Plan 20.1: Run Dependency Auditing and Configure Node Environment Guard

## Objective
Audit and patch npm packages to achieve zero vulnerability posture, and configure server startup environment validations inside `server.ts` to prevent missing secret configurations.

## Context
- `e:\studentsociety\backend\src\server.ts`

## Tasks

<task type="auto">
  <name>Run Audits and Env Guards</name>
  <files>
    e:\studentsociety\backend\src\server.ts
  </files>
  <action>
    - Add environment variable validations in `e:\studentsociety\backend\src\server.ts` at startup:
      - Log a warning if `process.env.NODE_ENV` is not set to 'production' in production.
      - Ensure essential keys like `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are defined, printing a warning or throwing an error if missing.
  </action>
  <verify>test -f "e:\studentsociety\backend\src\server.ts"</verify>
  <done>Environment variable validation block added inside server.ts.</done>
</task>

## Success Criteria
- [ ] Startup checks log warning or throw error if crucial configurations are absent.
- [ ] Dependencies have zero vulnerabilities when running npm audit.
