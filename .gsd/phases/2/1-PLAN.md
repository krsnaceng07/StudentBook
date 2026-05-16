---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Supabase Infrastructure & Environment

## Objective
Setup the Supabase client in both backend and mobile, and configure environment variables.

## Context
- .gsd/SPEC.md
- .gsd/STACK.md
- mobile/.env
- backend/.env

## Tasks

<task type="auto">
  <name>Install Supabase Dependencies</name>
  <files>
    - backend/package.json
    - mobile/package.json
  </files>
  <action>
    - Install `@supabase/supabase-js` in backend.
    - Install `@supabase/supabase-js`, `@react-native-async-storage/async-storage`, and `react-native-url-polyfill` in mobile.
    - Remove old dependencies: `mongoose`, `firebase-admin`, `firebase`.
  </action>
  <verify>npm list @supabase/supabase-js in both directories</verify>
  <done>Dependencies are installed and old ones are removed.</done>
</task>

<task type="auto">
  <name>Configure Environment Variables</name>
  <files>
    - backend/.env
    - mobile/.env
  </files>
  <action>
    - Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` to both .env files.
    - Add `SUPABASE_SERVICE_ROLE_KEY` to backend/.env (for admin operations).
    - Remove `MONGO_URI`, `FIREBASE_*` variables.
  </action>
  <verify>grep SUPABASE backend/.env</verify>
  <done>Environment variables are set up correctly.</done>
</task>

<task type="auto">
  <name>Initialize Supabase Clients</name>
  <files>
    - backend/config/supabase.js
    - mobile/config/supabase.ts
  </files>
  <action>
    - Create initialization files for Supabase client in both projects.
    - Use AsyncStorage for persistence in mobile.
  </action>
  <verify>Test-Path backend/config/supabase.js</verify>
  <done>Supabase clients are initialized and ready to use.</done>
</task>

## Success Criteria
- [ ] Backend and Mobile projects have Supabase SDKs installed.
- [ ] Environment variables are configured.
- [ ] Clients are initialized without errors.
