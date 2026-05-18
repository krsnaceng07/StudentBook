# Debug Session: College Settings UI Bug Fix

## Symptom
The Settings screen inside the College Portal crashed at runtime, throwing a `ReferenceError` for missing variables when navigating or focusing.

**When:** Occurs immediately upon clicking the Settings button or entering the Settings screen.
**Expected:** The Settings screen should load cleanly, rendering dynamic profile name/email and settings menu items.
**Actual:** The screen crashed due to `Can't find variable: useFocusEffect` and `Can't find variable: useCallback`.

---

## Evidence
- Checking imports inside `settings.tsx` revealed that:
  * `useCallback` was called in `useFocusEffect(useCallback(...))` but was NOT imported from `'react'`.
  * `useFocusEffect` was called but was NOT imported from `'expo-router'`.
- Additionally, found a dynamic Tailwind opacity shortcut class `bg-emerald-50/10` on the avatar badge wrapper that could trigger interop warnings on NativeWind v4 engines.

---

## Resolution

**Root Cause:** Missing imports for hooks (`useCallback` and `useFocusEffect`) in `settings.tsx`.
**Fix:**
- Updated imports in [`settings.tsx`](file:///e:/studentsociety/mobile/app/(college)/settings.tsx#L1-L8):
  * Added `useCallback` to `'react'` imports.
  * Added `useFocusEffect` to `'expo-router'` imports.
- Refactored `bg-emerald-50/10` to style-safe inline RGBA background color mapping:
  * `style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}`
**Verified:** Compile succeeds and runtime dependencies resolve cleanly. No ReferenceErrors remaining!
**Regression Check:** Verified Dashboard and Profile screens also have complete and correct imports for `useFocusEffect` / `useCallback`.
