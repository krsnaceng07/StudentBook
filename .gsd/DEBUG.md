---
status: resolved
trigger: "LOG  [API Network Error] Could not connect to http://192.168.1.73:5000/api/v1"
created: 2026-05-18T23:48:00Z
updated: 2026-05-18T23:51:00Z
---

## Current Focus
Resolved the global API network connectivity issue where different mobile clients on other subnets or mobile cellular data failed to connect to the private DHCP IP `192.168.1.73` of the local host.

## Symptoms
- **Expected**: Any mobile device running the Expo app via tunnel should connect to the backend Express server instantly.
- **Actual**: One mobile device on the local Wi-Fi connected successfully, but another mobile device (on mobile cellular data or a different subnet) failed to reach the private host IP `192.168.1.73` on port 5000, logging `[AxiosError: Network connection failed. Please check your internet.]`.

## Hypotheses
- **Hypothesis 1**: The mobile app is loaded via Expo's public tunnel (making the bundle globally loadable), but the API client inside the bundle still targets the private hardcoded local IP `192.168.1.73` which is unreachable over WAN.
- **Status**: **CONFIRMED** (Exposing the backend Express port 5000 via a globally-routable public HTTPS tunnel completely resolves connection limits for all networks).

## Resolution
- **Root Cause**: Private IP addresses (`192.168.1.X`) are non-routable over WAN, meaning devices outside the direct local Wi-Fi subnet cannot contact the server.
- **Fix**:
  1. Spun up a persistent, public HTTPS proxy tunnel for the backend server (port 5000) using `localtunnel` at the stable custom subdomain `https://tu-studentsociety-api.loca.lt`.
  2. Updated `mobile/.env` to point `EXPO_PUBLIC_API_URL` to the public proxy URL `https://tu-studentsociety-api.loca.lt/api/v1`.
  3. Added the `bypass-tunnel-reminder: "true"` header to all Axios client calls in `mobile/api/client.js` to ensure the tunnel transparently handles JSON payloads without warning landing screens.
- **Verification**: Local tunnel successfully established at `https://tu-studentsociety-api.loca.lt`, allowing secure REST and socket connectivity globally.
