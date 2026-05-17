# Debug Session: 001

## Symptom
The backend server fails to start with a `SyntaxError: The requested module '../../config/supabase.js' does not provide an export named 'supabase'`.

**When:** During `npm run dev` in the backend.
**Expected:** Backend compiles and starts successfully.
**Actual:** Node crashes with the export mismatch error.

## Hypotheses

| # | Hypothesis | Likelihood | Status |
|---|------------|------------|--------|
| 1 | The export in `config/supabase.ts` is named something else, such as `supabaseAdmin` | 99% | UNTESTED |
| 2 | The path `../../config/supabase.js` is incorrect | 1% | UNTESTED |

## Attempts

### Attempt 1
**Testing:** H1 — The export is named `supabaseAdmin`
**Action:** Examined `e:\studentsociety\backend\src\config\supabase.ts` and confirmed it exports `supabaseAdmin`. 
**Result:** Hypothesis confirmed. The file exports `supabaseAdmin` instead of `supabase`.
**Conclusion:** CONFIRMED

## Resolution

**Root Cause:** `home.controller.ts` incorrectly attempted to import `supabase` instead of the actual exported instance `supabaseAdmin`.
**Fix:** Modify `home.controller.ts` to import `supabaseAdmin` and use it for queries.
**Verified:** Will run the fix and verify via `npm run dev` auto-reload.
**Regression Check:** Server should start properly and `GET /api/v1/home` should function without syntax errors.
