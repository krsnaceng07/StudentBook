---
phase: 2
plan: 5
wave: 5
---

# Plan 2.5: Mobile Frontend Auth Refactor

## Objective
Refactor the mobile app to replace Firebase Auth with Supabase Auth, completely removing Firebase dependencies and context.

## Context
- mobile/package.json
- mobile/config/supabase.ts
- mobile/app/(auth)/
- mobile/hooks/ (if exists, e.g. useAuth)
- mobile/store/ (Zustand auth store)

## Tasks

<task type="auto">
  <name>Remove Firebase Config & Logic</name>
  <files>
    - mobile/config/firebase.js
  </files>
  <action>
    - Delete `mobile/config/firebase.js` completely.
    - Check for any other direct Firebase imports and remove them.
  </action>
  <verify>Test-Path mobile/config/firebase.js (Should return False)</verify>
  <done>Firebase configuration is entirely removed.</done>
</task>

<task type="auto">
  <name>Refactor Zustand Auth Store</name>
  <files>
    - mobile/store/useAuthStore.ts (or equivalent file handling auth state)
  </files>
  <action>
    - Ensure the auth state management integrates with Supabase (`supabase.auth.onAuthStateChange`).
    - Remove any Firebase `onAuthStateChanged` listeners.
    - Keep track of the `session` and `user`.
  </action>
  <verify>Check `useAuthStore` uses `supabase.auth` instead of Firebase.</verify>
  <done>Global auth state uses Supabase Auth.</done>
</task>

<task type="auto">
  <name>Refactor Login and Signup Screens</name>
  <files>
    - mobile/app/(auth)/index.tsx
    - mobile/app/(auth)/sign-up.tsx (or equivalent)
  </files>
  <action>
    - Replace Firebase `signInWithEmailAndPassword` and `createUserWithEmailAndPassword` with `supabase.auth.signInWithPassword` and `supabase.auth.signUp`.
    - Update error handling to catch Supabase specific errors.
  </action>
  <verify>Ensure `supabase.auth` is imported and used in the auth screens.</verify>
  <done>Users can sign up and log in using Supabase.</done>
</task>

## Success Criteria
- [ ] No Firebase auth logic remains in the mobile app.
- [ ] Users can successfully authenticate via Supabase Auth.
- [ ] The app maintains the session locally using AsyncStorage.
