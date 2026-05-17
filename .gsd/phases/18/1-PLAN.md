---
phase: 18
plan: 1
wave: 1
---

# Plan 18.1: Create Joi Validation Middleware and Sanitize Search Queries

## Objective
Build a robust Joi request validation middleware to securely sanitize, parse, and validate user-supplied parameters. Sanitize all search query inputs inside discover controller to completely block NoSQL, SQL, and command injection attempts.

## Context
- `e:\studentsociety\backend\src\middleware\validation.middleware.ts`
- `e:\studentsociety\backend\src\modules\discover\discover.controller.ts`

## Tasks

<task type="auto">
  <name>Build Validation Middleware and Sanitize Queries</name>
  <files>
    e:\studentsociety\backend\src\middleware\validation.middleware.ts
    e:\studentsociety\backend\src\modules\discover\discover.controller.ts
  </files>
  <action>
    - Create `e:\studentsociety\backend\src\middleware\validation.middleware.ts`.
    - Define robust validation schemas for student signup, college signup, and login:
      - Enforce valid email syntax, minimum password length (6 characters), and sanitize fields (stripping html/script tags using `xss`).
      - Create a generic `validateRequest` Express middleware that checks `req.body` against the appropriate Joi schema and returns clean 400 validation error responses if invalid.
    - Edit `e:\studentsociety\backend\src\modules\discover\discover.controller.ts` to sanitize the search parameter:
      - Replace any non-alphanumeric or non-whitespace characters in `search` with empty strings to prevent Supabase/PostgREST parameter injection or crash.
  </action>
  <verify>test -f "e:\studentsociety\backend\src\middleware\validation.middleware.ts"</verify>
  <done>Middleware created and search query sanitization applied.</done>
</task>

## Success Criteria
- [ ] Joi request validation middleware successfully handles bad or missing inputs.
- [ ] Search query parameter sanitization completely filters out query-breaking injection characters.
