---
phase: 2
plan: 4
wave: 4
---

# Plan 2.4: Remaining Backend Controllers Refactor

## Objective
Refactor the remaining backend controllers (`postController`, `teamController`, `chatController`, `connectionController`) to use the new Supabase SQL database schema, strictly adhering to the architectural rule: "Supabase for auth and database only".

## Context
- backend/controllers/postController.js
- backend/controllers/teamController.js
- backend/controllers/chatController.js
- backend/controllers/connectionController.js
- supabase/migrations/20260516000000_initial_schema.sql

## Tasks

<task type="auto">
  <name>Refactor postController.js</name>
  <files>
    - backend/controllers/postController.js
  </files>
  <action>
    - Replace Mongoose queries with `supabaseAdmin.from('posts')`.
    - Ensure complex queries (e.g., feed generation) are adapted to Supabase SQL queries or JS-level filtering where necessary.
    - Cloudinary upload integration remains untouched.
  </action>
  <verify>Check that `postController.js` has no `mongoose` dependencies.</verify>
  <done>Post controller successfully uses Supabase for database operations.</done>
</task>

<task type="auto">
  <name>Refactor teamController.js</name>
  <files>
    - backend/controllers/teamController.js
  </files>
  <action>
    - Replace Mongoose queries with `supabaseAdmin.from('teams')` and `supabaseAdmin.from('team_members')`.
    - Update logic for joining, leaving, and managing teams.
  </action>
  <verify>Check that `teamController.js` uses Supabase relational inserts/updates.</verify>
  <done>Team controller uses Supabase for database operations.</done>
</task>

<task type="auto">
  <name>Refactor chatController.js & connectionController.js</name>
  <files>
    - backend/controllers/chatController.js
    - backend/controllers/connectionController.js
  </files>
  <action>
    - Replace `Message`, `Conversation`, and `Connection` Mongoose logic with `supabaseAdmin` queries to the respective SQL tables.
    - Ensure chat logic supports attachments and real-time triggers if needed (or relies on Supabase Realtime later).
  </action>
  <verify>Ensure no Mongoose models are imported.</verify>
  <done>Chat and Connection controllers use Supabase.</done>
</task>

## Success Criteria
- [ ] No MongoDB/Mongoose imports remain in any of the targeted controllers.
- [ ] All database operations strictly use `supabaseAdmin`.
- [ ] Cloudinary and AI logic remain completely separated from Supabase.
