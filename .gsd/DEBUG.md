# Debug Session: Expo Tunnel Connection Error

## Symptom
When starting the mobile application with the `--tunnel` option, Expo CLI throws a fatal `TypeError: Cannot read properties of undefined (reading 'body')` and terminates.

**When:** During the Metro Bundler initial launch sequence when generating the tunneling url.
**Expected:** The bundler should launch successfully and output a QR code or tunnel url (e.g. `exp+studentsociety://...`).
**Actual:**
```
CommandError: TypeError: Cannot read properties of undefined (reading 'body')
Check the Ngrok status page for outages: https://status.ngrok.com/
```

---

## Hypotheses

| # | Hypothesis | Likelihood | Status |
|---|------------|------------|--------|
| 1 | Expo Tunnel server API or Ngrok API is experiencing a temporary outage or rate-limiting block, returning empty/unparsable response payloads. | 90% | UNTESTED |
| 2 | Port `8081` is already bound by an orphan node process, causing port collision during tunnel startup. | 10% | UNTESTED |

---

## Attempts

### Attempt 1
**Testing:** H1 — Expo Tunnel Server / Ngrok Outage
**Action:** Recommend starting Metro server locally without `--tunnel` since the local IP endpoint (`192.168.1.73`) is fully functional.
**Result:** Pending user feedback.
**Conclusion:** UNTESTED

---

## Resolution Options

1. **Option A (Highly Recommended):** Start the bundler directly on the local network (no tunnel overhead):
   ```powershell
   npx expo start --clear
   ```
2. **Option B (If Tunnel is Required):** Run native ngrok to map the Metro port manually:
   ```powershell
   ngrok http 8081
   ```
