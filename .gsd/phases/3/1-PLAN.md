---
phase: 3
plan: 1
wave: 1
depends_on: []
files_modified:
  - backend/package.json
  - backend/tsconfig.json
  - backend/src/server.ts
  - backend/src/config/supabase.ts
  - backend/supabase/migrations/20240516_init_v2.sql
autonomous: true
user_setup: []

must_haves:
  truths:
    - "Backend runs using TypeScript (ts-node-dev)"
    - "Supabase schema includes student_profiles and college_profiles"
  artifacts:
    - "backend/src/server.ts exists"
    - "backend/supabase/migrations/20240516_init_v2.sql exists"
---

# Plan 3.1: Backend TS Foundation & Schema Initialization

<objective>
Transition the backend to a professional TypeScript architecture and initialize the dual-role database schema in Supabase.

Purpose: To align with CollabSpace v2.0 requirements for a typed, modular backend and a student/college split database.
Output: TypeScript-enabled backend with initial vertical slice (config/server) and migration SQL.
</objective>

<context> load for context:
- .gsd/SPEC.md
- .gsd/ROADMAP.md
- backend/package.json
- backend/server.js
- backend/config/supabase.js
</context>

<tasks>

<task type="auto">
  <name>Initialize TypeScript & Project Structure</name>
  <files>
    - backend/package.json
    - backend/tsconfig.json
    - backend/src/config/supabase.ts
    - backend/src/server.ts
  </files>
  <action>
    1. Install `typescript`, `@types/node`, `@types/express`, `@types/cors`, `ts-node-dev` as devDependencies.
    2. Create `tsconfig.json` with appropriate Node.js settings (ESNext, strict mode).
    3. Create `backend/src/` directory and subfolders (config, modules, middleware, utils).
    4. Port `backend/config/supabase.js` to `backend/src/config/supabase.ts` (using ES Modules).
    5. Create a minimal `backend/src/server.ts` to verify TS execution.
    AVOID: Moving all controllers at once. We will migrate them module-by-module in subsequent plans.
  </action>
  <verify>Run `npm run dev` (after updating scripts) and confirm server starts with TS.</verify>
  <done>Backend environment is TS-ready and `server.ts` executes.</done>
</task>

<task type="auto">
  <name>Vertical Slice: Database Schema Migration</name>
  <files>
    - backend/supabase/migrations/20240516_init_v2.sql
  </files>
  <action>
    1. Create a consolidated SQL migration file containing all tables, constraints, and RLS policies defined in the PRD v2.0.
    2. Tables to include: `profiles`, `student_profiles`, `skills`, `student_skills`, `student_interests`, `collaboration_requests`, `messages`, `event_bookmarks`, `college_profiles`, `events`, `reports`.
    3. Include the RLS policies provided in the PRD.
    AVOID: Changing table names from the PRD as these are the source of truth.
  </action>
  <verify>Grep migration file for all 11 table definitions.</verify>
  <done>SQL migration file is ready for application to Supabase.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] `backend/package.json` has `ts-node-dev` and TS dependencies.
- [ ] `backend/src/server.ts` exists and is in ESM.
- [ ] Migration SQL contains the complete schema from PRD v2.0.
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>
