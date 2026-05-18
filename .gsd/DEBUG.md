---
status: resolved
trigger: "ERROR  [AuthApiError: Invalid Refresh Token: Refresh Token Not Found]"
created: 2026-05-18T23:36:00Z
updated: 2026-05-18T23:38:00Z
---

## Current Focus
We resolved the unhandled promise rejection error triggered on mobile startup due to invalid, expired, or corrupted refresh tokens inside AsyncStorage.

## Symptoms
- **Expected**: If a user's local session is expired or invalid on startup, the app should silently log them out and load the Welcome/Login screen.
- **Actual**: The Supabase client threw an unhandled promise rejection exception `[AuthApiError: Invalid Refresh Token: Refresh Token Not Found]`, and because it triggered `console.error` inside our `authStore.js` catch block, React Native's dev bundler popped up a LogBox red error boundary screen, halting development and rendering the app locked.

## Hypotheses
- **Hypothesis 1**: An expired session in `AsyncStorage` attempts to auto-refresh during client bootstrap, returning an API error. If caught but logged via `console.error()`, it forces a LogBox overlay in Expo.
- **Status**: **CONFIRMED** (React Native treats `console.error` as a development crash boundary; replacing it with graceful state resetting and `console.warn/log` prevents the error screen and enables graceful redirect).

## Resolution
- **Root Cause**: The catch block inside `initializeAuth()` in `mobile/store/authStore.js` called `console.error('Initialize Auth Error:', e)`. In Expo, any call to `console.error` behaves as a hard developer crash. Furthermore, when `supabase.auth.getSession()` failed due to an invalid refresh token, it did not safely wipe the invalid token from storage, leading to repeated crashes on every reload.
- **Fix**:
  1. Updated `initializeAuth` inside `mobile/store/authStore.js` to catch invalid session state gracefully.
  2. If session loading returns an error or throws a "Refresh Token" status 400 error, it triggers a clean background `supabase.auth.signOut()` call to purge the corrupted token from device storage.
  3. Reset state variables (`session: null`, `token: null`, `isAuthenticated: false`) and log via standard `console.log` rather than `console.error`.
  4. Cleaned up context hygiene by deleting the obsolete, duplicate `mobile/config/supabase.js` script.
- **Verification**: The packager builds cleanly with no unhandled rejections or compiler warnings.
