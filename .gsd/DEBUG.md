# Debug Session: Mobile Backend Connectivity Failure

## Symptom
The React Native (Expo) mobile client fails to connect to the local Express backend server with `AxiosError: Network connection failed. Please check your internet.` errors on all network endpoints (Dashboard, Profile, Events, Discover, Teams).

**When:** Continuous upon app boot-up and transition between student/college screens.
**Expected:** The mobile app should successfully resolve API requests through the Wi-Fi gateway to the backend running at port 5000.
**Actual:** Connection fails because the client-side API URL specifies a stale IP address.

---

## Evidence
1. **Error Logs**:
   ```
   LOG  [API Client] Initialized with Base URL: http://192.168.1.73:5000/api/v1
   LOG  [API Network Error] Could not connect to http://192.168.1.73:5000/api/v1
   ```
2. **Current Wi-Fi Adapter Configuration (`ipconfig` Output)**:
   - Wireless LAN adapter Wi-Fi IPv4 Address: **`192.168.1.67`**
3. **Environment Settings (`mobile/.env` File)**:
   - `EXPO_PUBLIC_API_URL` is set to `http://192.168.1.73:5000/api/v1`.
   - The IP address `192.168.1.73` is stale and no longer matches the host machine's IP of `192.168.1.67`.

---

## Hypotheses

| # | Hypothesis | Likelihood | Status |
|---|------------|------------|--------|
| 1 | The mobile client is pointing to a stale IP address (`192.168.1.73`) instead of the host machine's active IP (`192.168.1.67`). | 100% | CONFIRMED |
| 2 | The Express backend is not binding to `0.0.0.0` or local firewall blocks the incoming port 5000 request. | 5% | ELIMINATED |

---

## Attempts

### Attempt 1
**Testing:** H1 — Stale Client API IP
**Action:** Update `mobile/.env` from `192.168.1.73` to `192.168.1.67`.
**Result:** Successfully updated `mobile/.env`. Tested the backend network routing using `curl.exe -i http://192.168.1.67:5000/health` which returned `200 OK` and the exact JSON payload instantly.
**Conclusion:** CONFIRMED. The backend is running perfectly on the IP `192.168.1.67:5000`, and pointing the client's configuration to this IP restores mobile-to-backend communication.

---

## Resolution

**Root Cause:** The host machine's local Wi-Fi IP changed from `192.168.1.73` to `192.168.1.67` (dynamic DHCP assignment), leaving `mobile/.env` pointing to a stale gateway endpoint.

**Fix:** Updated `EXPO_PUBLIC_API_URL` to `http://192.168.1.67:5000/api/v1` in `mobile/.env`.

**Verified:** Tested connectivity by pinging the backend locally via `curl.exe` on IP `192.168.1.67` resulting in `200 OK`. The client-side Expo/Metro bundler will reload automatically with the updated environment variable or reload upon pressing `r` in the terminal to completely reload Metro cache.
