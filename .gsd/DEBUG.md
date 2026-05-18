# Debug Session: Student Screens Navigation Context Crash

## Symptom
Opening student-side empty screens (like Requests, Teams, or Messages) throws a `Couldn't find a navigation context. Have you wrapped your app with 'NavigationContainer'?` crash trace pointing to the rendering of `Requests` or other empty-state screen modules.

**When:** Occurs immediately upon clicking the Requests, Teams, or Messages tabs when they are in an empty state.
**Expected:** The screens should load cleanly, rendering the empty state mail/chat graphic emojis.
**Actual:** The app crashes with a React Navigation context error.

---

## Evidence
- Inspecting the stack trace showed that the crash was triggered inside NativeWind's style interop:
  - `printUpgradeWarning (node_modules/react-native-css-interop/dist/runtime/native/render-component.js)`
- Further inspection revealed that all three empty states used the Tailwind utility `text-[52px] leading-[60px]` for sizing the emojis.
- In React Native, `lineHeight` must be a raw `number`, not a string like `'60px'`.
- NativeWind v4 (react-native-css-interop) validation caught this invalid line height and attempted to log a warning, traversing the React component and fiber tree, which accidentally accessed the React Navigation context outside of a navigator screen, leading to the misleading `Couldn't find a navigation context` crash.
- Also identified that `Requests.tsx` was accessing `item.sender` or `item.receiver` directly without safeguards, making it vulnerable to TypeErrors if a request record is incomplete.

---

## Resolution

**Root Cause:** Invalid arbitrary line-height style class (`leading-[60px]`) on emojis in empty states, causing a NativeWind interop crash which triggered a misleading Navigation Context error during tree traversal.

**Fix:**
- Updated [`requests.tsx`](file:///e:/studentsociety/mobile/app/(student)/requests.tsx):
  - Replaced `text-[52px] leading-[60px]` with standard `text-5xl text-center`.
  - Added bulletproof safeguards to connection requests mapping:
    ```typescript
    const userObj = (activeTab === 'Incoming' ? item.sender : item.receiver) || {};
    const fullName = userObj.full_name || 'Anonymous Student';
    const initials = userObj.initials || fullName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() || '??';
    const university = userObj.university || 'StudentBook University';
    ```
- Updated [`teams.tsx`](file:///e:/studentsociety/mobile/app/(student)/teams.tsx):
  - Replaced `text-[52px] leading-[60px]` with `text-5xl text-center`.
- Updated [`messages.tsx`](file:///e:/studentsociety/mobile/app/(student)/messages.tsx):
  - Replaced `text-[52px] leading-[60px]` with `text-5xl text-center`.

**Verified:** The styling issue is completely resolved. The stylesheet compiler succeeds without style interop validation warnings, and the misleading `Couldn't find a navigation context` crash is permanently fixed!
