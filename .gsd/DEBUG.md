# Debug Session: Expo Tunnel Body Error

## Symptom
Running `npx expo start --clear --tunnel` crashes with:
`CommandError: TypeError: Cannot read properties of undefined (reading 'body')`
`Check the Ngrok status page for outages: https://status.ngrok.com/`

**When:** Startup of Expo Metro Bundler with the `--tunnel` option enabled.
**Expected:** Expo server starts successfully and creates a working tunnel URL.
**Actual:** The tunnel helper fails to parse ngrok responses and crashes before starting.

## Hypotheses

| # | Hypothesis | Likelihood | Status |
|---|------------|------------|--------|
| 1 | Mismatch or bug in outdated local/global @expo/ngrok package parsing ngrok's new API payload | 95% | CONFIRMED |

## Attempts

### Attempt 1
**Testing:** H1 — Outdated `@expo/ngrok` package.
**Action:** Reinstalled `@expo/ngrok@latest` both locally in `mobile/` and globally.
**Result:** Expo started perfectly with tunnel connection!
**Conclusion:** CONFIRMED

## Resolution

**Root Cause:** The old version of `@expo/ngrok` had a parsing bug with ngrok's updated response schema.
**Fix:** Installed latest stable version of `@expo/ngrok` globally and locally.
**Verified:** Confirmed "Tunnel connected. Tunnel ready." logs output successfully without crashes.
