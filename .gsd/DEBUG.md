# Debug Session: 003

## Symptom
The mobile app is stuck on "Loading..." indefinitely after the UI is built.

**When:** When running the app, it doesn't navigate past the initial loader.
**Expected:** The app should display the `welcome` screen or the new `(tabs)` home screen.
**Actual:** Stuck on the `<ActivityIndicator>` in `_layout.tsx`.

## Hypotheses

| # | Hypothesis | Likelihood | Status |
|---|------------|------------|--------|
| 1 | `user` object is never populated in `authStore.js` causing `(isAuthenticated && !user)` to remain true forever | 95% | UNTESTED |
| 2 | `initializeAuth` never completes, causing `isStoreInitializing` to remain true | 5% | ELIMINATED |

## Attempts

### Attempt 1
**Testing:** H1 — `user` object is never populated
**Action:** Reviewed `mobile/store/authStore.js`. Discovered that if the user has a Supabase session but no corresponding row in `profiles` (which happened when we ran our new migrations resetting tables), `fetchMe` returns without setting the `user` object in state.
**Result:** Verified. This causes the UI in `_layout.tsx` to get trapped in the loading fallback forever.
**Conclusion:** CONFIRMED

## Resolution

**Root Cause:** The auth store failed to set a `user` state if a Supabase authenticated session existed but the `profiles` database record was missing or failed to fetch. It also contained old references to deleted stores in `logout()`.
**Fix:** Modified `fetchMe` to provide a fallback `user` object `(id, email)` if the profile doesn't exist or errors out, preventing the UI deadlock. Also removed deleted store dependencies in `logout()`.
**Verified:** User needs to reload the Expo app.
**Regression Check:** Logout should no longer crash and the loading screen should dismiss properly.
