---
phase: 2
plan: 3
wave: 3
---

# Plan 2.3: Backend Auth & Profile Refactor

## Objective
Refactor the backend `authController` and `profileController` to use Supabase instead of MongoDB/Firebase. Supabase handles Auth and Database only.

## Context
- backend/controllers/authController.js
- backend/controllers/profileController.js
- .gsd/phases/2/schema.sql

## Tasks

<task type="auto">
  <name>Refactor authController.js</name>
  <files>
    - backend/controllers/authController.js
  </files>
  <action>
    - Since Supabase handles auth entirely, the backend auth routes (like `/register` or `/login`) are either obsolete or act as wrappers.
    - If the frontend uses Supabase SDK directly to login (which is best practice), the backend `authController` only needs a route to sync/verify the user profile or it can be entirely removed if not needed.
    - Analyze `authController.js` and rewrite it. Replace any manual `bcrypt` hashing or JWT generation with Supabase equivalents (or remove them). Keep routes that the frontend expects but make them use `supabaseAdmin`.
  </action>
  <verify>Ensure `authController.js` no longer imports `User` model, `bcryptjs`, or `jsonwebtoken`.</verify>
  <done>authController is fully decoupled from MongoDB/Firebase and relies on Supabase Auth.</done>
</task>

<task type="auto">
  <name>Refactor profileController.js</name>
  <files>
    - backend/controllers/profileController.js
  </files>
  <action>
    - Replace Mongoose queries (e.g., `Profile.findOne`, `User.findByIdAndUpdate`) with Supabase client queries (`supabaseAdmin.from('profiles').select()`, etc.).
    - Update profile creation, updating, and fetching logic to interact with the `profiles` SQL table.
    - Ensure Cloudinary upload logic remains untouched (if present).
  </action>
  <verify>Check that `profileController.js` performs CRUD operations using `supabaseAdmin`.</verify>
  <done>profileController successfully uses Supabase for database operations.</done>
</task>

## Success Criteria
- [ ] No MongoDB/Mongoose imports remain in auth and profile controllers.
- [ ] Profile updates correctly hit the Supabase PostgreSQL database.
- [ ] Cloudinary logic is preserved.
