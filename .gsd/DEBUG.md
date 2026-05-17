# Debug Session: Requests Tab NavigationContainer Crash and API 404

## Symptom
1. Transitioning to or rendering the Requests tab (`requests.tsx`) throws a React Navigation context error:
   `ERROR  [Error: Couldn't find a navigation context. Have you wrapped your app with 'NavigationContainer'?]`
2. API warning: `WARN [API Error] 404 - /dashboard` followed by request failure.

**When:** Screen render of the Requests tab.
**Expected:** Requests screen renders smoothly, fetching pending and outgoing metrics from the backend.
**Actual:** Screen crashes with React Native CSS Interop print warnings traversing unmounted react-navigation contexts, and backend throws 404.

## Hypotheses

| # | Hypothesis | Likelihood | Status |
|---|------------|------------|--------|
| 1 | Typo in tailwind color class `bg-slate-850` triggers NativeWind warnings, which recursively serializes non-serializable navigation contexts | 90% | CONFIRMED |
| 2 | Endpoint mismatch calling `/dashboard` when backend registered `/dashboard/home` | 95% | CONFIRMED |

## Attempts

### Attempt 1
**Testing:** H1 — Invalid Tailwind class `bg-slate-850`.
**Action:** Replaced both instances of `bg-slate-850` with standard `bg-slate-800` in `requests.tsx`.
**Result:** Warning eliminated and serialization crash resolved completely!
**Conclusion:** CONFIRMED

### Attempt 2
**Testing:** H2 — API 404 Endpoint.
**Action:** Changed the API request in `requests.tsx` from `/dashboard` to `/dashboard/home`.
**Result:** 404 Warning resolved and live statistics are fetched cleanly!
**Conclusion:** CONFIRMED

## Resolution

**Root Cause:**
1. A typo in style color `bg-slate-850` triggered a NativeWind warning, which recursively stringified component properties, traversing unmounted navigation context states.
2. Mismatch in router registration.

**Fix:**
1. Replaced `bg-slate-850` with `bg-slate-800`.
2. Changed API endpoint to `/dashboard/home`.

**Verified:** Compiled perfectly and fetched statistics flawlessly.
