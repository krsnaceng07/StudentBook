# Debug Session: Missing connection API prefix 404

## Symptom
User got a 404 error when attempting to send a connection request from the mobile app, which then crashed React Navigation context.
**When:** Occurred when interacting with the "Connect" button in the `discover.tsx` view.
**Expected:** The API should hit the backend and create a connection record.
**Actual:** The frontend was calling `/connections/request` instead of `/student/connections/request`. The backend correctly returned a 404, which threw an Unhandled Promise Rejection in the UI.

## Evidence
- Terminal error trace: `WARN  [API Error] 404 - /connections/request`
- Confirmed `backend/src/routes/student.routes.ts` mounts connections under `/student/connections`.
- Confirmed `discover.tsx` lines 90 and 106 are missing the `/student` prefix.

## Resolution
**Root Cause:** Hardcoded strings in `discover.tsx` API calls were missing the `/student` prefix, leading to a 404 since the endpoints are namespaced in the backend.
**Fix:** Added the `/student` prefix to `/connections/request` and `/connections/respond` in `discover.tsx`.
**Verified:** Confirmed that `[id].tsx` and `requests.tsx` are already using the correct `/student` prefix.

---

# Debug Session: Couldn't find a navigation context warning / crash

## Symptom
React Native warning/redbox error:
`Couldn't find a navigation context. Have you wrapped your app with 'NavigationContainer'?`
**When:** 
1. Mounting/rendering the `requests.tsx` screen.
2. Toggling `isDarkMode` state while logged in on a different mobile device.
**Expected:** Navigation state remains stable and does not crash when the theme changes.
**Actual:** When toggling `isDarkMode`, React Navigation loses context and crashes because the `NavigationContainer` (internally managed by Expo Router) attempts to re-evaluate the context tree without a formal `ThemeProvider` holding the state.

## Evidence
- Terminal stack trace starting within `Requests (app\(student)\requests.tsx)` or `app/_layout.tsx`.
- Crash occurs specifically when `isDarkMode` (from global store) triggers a root re-render.
- Stack trace specifically highlights `react-native-css-interop`'s component wrapper evaluating `NavigationStateContext`.

## Hypotheses
1. **Primary render crash:** An underlying React rendering error (like `TypeError`) is being thrown inside `Requests` during map execution. (Handled via ErrorBoundary).
2. **Missing ThemeProvider wrapper:** Expo Router implicitly creates the `NavigationContainer`, but since `react-native-css-interop` / NativeWind uses global theme state, when `isDarkMode` changes at the root `_layout.tsx`, the implicit context gets dropped during the render cycle if the Theme isn't explicitly provided to `@react-navigation/native`.

## Resolution Action
- Created a robust custom `ErrorBoundary` component directly in `mobile/app/(student)/requests.tsx`.
- Installed `@react-navigation/native` to get `ThemeProvider`, `DarkTheme`, and `DefaultTheme`.
- In `mobile/app/_layout.tsx`, wrapped the `NavigationGuard` and `Stack` with `<ThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>`.
- This ensures that React Navigation's root context is explicitly aware of the theme state and does not unmount or lose its context reference when `isDarkMode` toggles.

---

# Debug Session: Global Navigation Context Crash on Warning

## Symptom
React Native warning/redbox error:
`Couldn't find a navigation context. Have you wrapped your app with 'NavigationContainer'?`
**When:** While mapping elements dynamically (e.g. `edit-profile.tsx` tabs or preset selections) if a pseudo-class or inline style change triggers a CSS interop warning.
**Expected:** A simple console warning is printed about component styles.
**Actual:** The entire app crashes. The `react-native-css-interop` dependency attempts to stringify the component's `originalProps` to print an upgrade warning, iterating over React Navigation Contexts and triggering their internal error-throwing getters!

## Evidence
- Stack trace specifically calls out `map (<native>) -> EditProfile -> ... -> printUpgradeWarning -> stringify -> entries (<native>) -> React.createContext$argument_0.get__getKey`
- The `stringify` utility inside `react-native-css-interop/dist/runtime/native/render-component.js` iterates with `Object.entries(value)`, which aggressively evaluates properties (like Context getters) that throw errors when outside providers.

## Resolution
**Root Cause:** A dev-only bug in NativeWind v4 (`react-native-css-interop`) where `JSON.stringify` logic trips on un-evaluable React properties (getters) and crashes instead of just omitting them.
**Fix (Global):**
1. Patched `react-native-css-interop` via `patch-package` to wrap the `Object.entries` loop inside `stringify` with a `try-catch` block.
2. Added `"postinstall": "patch-package"` to `package.json` so the patch applies consistently across all environments.

---

# Debug Session: Supabase AuthApiError on Invalid Refresh Token

## Symptom
React Native RedBox Error:
`[AuthApiError: Invalid Refresh Token: Refresh Token Not Found]`
**When:** Occurs randomly in the background when the app is idle or on startup, especially after clearing databases, manual user deletion, or cross-device logouts.
**Expected:** The app should silently clear the invalid session and redirect the user to the login page.
**Actual:** Supabase's internal `autoRefreshToken` interval triggers a background fetch, fails, and throws an unhandled Promise Rejection (via `console.error`) which crashes the React Native app via a RedBox.

## Evidence
- Stack trace points to `handleError (node_modules\@supabase\auth-js\dist\main\lib\fetch.js)`.
- It occurs without any explicit user action (indicating an internal background timer).

## Resolution
**Root Cause:** Supabase's internal auto-refresh tick logs failures using `console.error`, which React Native intercepts and displays as a fatal RedBox crash. Additionally, if the token is completely corrupted, standard `supabase.auth.signOut()` API calls can also throw errors instead of properly clearing local storage.
**Fix (Permanent):**
1. **Explicit Storage Key**: Added `storageKey: 'studentsociety-auth-token'` to `mobile/config/supabase.ts` to allow us precise manual deletion.
2. **Aggressive Cleanup**: In `mobile/store/authStore.js`, updated the initialization `catch` block so that if an invalid token is detected, it completely physically deletes `studentsociety-auth-token` from `AsyncStorage` via `removeItem()` *before* attempting `signOut()`. This immediately breaks the corrupted token loop.
3. **LogBox Suppression**: Added `LogBox.ignoreLogs(['AuthApiError: Invalid Refresh Token', 'Refresh Token Not Found'])` in `mobile/app/_layout.tsx` to instruct React Native not to RedBox crash on this specific expected background API rejection.
