---
phase: 2
plan: 2
wave: 2
---

# Plan 2.2: Database Schema & Backend Refactor

## Objective
Migrate the database logic from Mongoose to Supabase (SQL) and update the backend middleware.

## Context
- .gsd/phases/2/RESEARCH.md
- backend/models/
- backend/middleware/authMiddleware.js

## Tasks

<task type="auto">
  <name>Generate SQL Schema</name>
  <files>
    - .gsd/phases/2/schema.sql
  </files>
  <action>
    - Translate all Mongoose models in `backend/models/` into a single PostgreSQL schema file.
    - Include tables for users, posts, teams, messages, etc.
    - Set up foreign key relationships.
  </action>
  <verify>Check the generated SQL file for syntax and completeness.</verify>
  <done>SQL schema is ready for application to Supabase.</done>
</task>

<task type="auto">
  <name>Refactor Auth Middleware</name>
  <files>
    - backend/middleware/authMiddleware.js
  </files>
  <action>
    - Replace JWT/Firebase verification logic with `supabase.auth.getUser()`.
    - Ensure the `req.user` object is populated from the Supabase profile table.
  </action>
  <verify>Ensure no references to firebase-admin or custom JWT logic remain.</verify>
  <done>Authentication middleware is using Supabase.</done>
</task>

<task type="auto">
  <name>Refactor User Controller</name>
  <files>
    - backend/controllers/userController.js
  </files>
  <action>
    - Replace Mongoose queries with Supabase client calls.
    - Update login/signup routes if they are handled by the backend (though Supabase usually handles this via client-side SDK).
  </action>
  <verify>Test the refactored controller logic.</verify>
  <done>User controller is migrated to Supabase.</done>
</task>

## Success Criteria
- [ ] SQL schema covers all existing data models.
- [ ] Auth middleware correctly validates Supabase sessions.
- [ ] Initial controllers are migrated and operational.
