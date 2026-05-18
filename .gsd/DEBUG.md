---
status: resolved
trigger: "Android Bundled ... LOG [API Client] Initialized with Base URL: http://192.168.1.67:5000/api/v1 LOG [API Network Error] Could not connect to http://192.168.1.67:5000/api/v1"
created: 2026-05-18T17:08:00Z
updated: 2026-05-18T17:10:00Z
---

## Current Focus
hypothesis: Node.js connects to Supabase using IPv4 priority, and the host machine has stabilized on the DHCP IP `192.168.1.73`.
test: Start the Express backend with `NODE_OPTIONS="--dns-result-order=ipv4first"`, terminate orphaned node instances blocking port 5000, and update `mobile/.env` to point to `192.168.1.73`.
expecting: The backend runs stably, connects to Supabase instantly, and the mobile client successfully establishes connection.
next_action: None. Both client and server configurations are synchronized and fully operational.

## Symptoms
expected: Backend should connect to Supabase, start listening on port 5000, and serve incoming connections from the mobile client.
actual: Backend crashed on startup with `UND_ERR_CONNECT_TIMEOUT` while contacting Supabase, which stopped the server and resulted in network errors on the mobile client.
errors:
  - `TypeError: fetch failed`
  - `code: 'UND_ERR_CONNECT_TIMEOUT'`
  - `LOG  [API Network Error] Could not connect to http://192.168.1.67:5000/api/v1`

## Eliminated
- hypothesis: The host machine has no internet or Supabase is down.
  evidence: `curl.exe -i https://poipjybhnxuwfjtchhqu.supabase.co` connects instantly and returns a Cloudflare/Supabase HTTP 404 response.
- hypothesis: The IP `192.168.1.67` is currently active.
  evidence: A real-time ping to `192.168.1.67` returned `Reply from 192.168.1.73: Destination host unreachable` and fresh `ipconfig` output confirmed the adapter IP shifted dynamically back to `192.168.1.73` via DHCP.

## Evidence
- checked: Local Wi-Fi IPv6 adapter presence.
  found: `ipconfig` shows temporary IPv6 addresses active on the Wi-Fi adapter.
  implication: Windows advertisements of IPv6 lead Node.js to try IPv6 queries to `supabase.co` first, which fail/timeout due to local router limitations.
- checked: Port 5000 listening status.
  found: The port was occupied by an orphaned `node.exe` process (PID `11284`) from a previous terminal crash, preventing new instances from binding.
  implication: Terminated the orphaned process using taskkill.

## Resolution
root_cause:
  1. The Node.js 18+ runtime on Windows prioritizes IPv6 DNS resolution by default, which timed out (`UND_ERR_CONNECT_TIMEOUT`) because the local Wi-Fi router advertised IPv6 but had broken WAN routing for it.
  2. The DHCP lease of the host machine dynamically shifted in real-time between `192.168.1.67` and `192.168.1.73` during the session.
  3. An orphaned background Node.js process (PID `11284`) blocked port 5000, preventing the newly launched backend server from binding.
fix:
  1. Killed the orphaned process PID `11284` using `taskkill`.
  2. Launched the backend server using the global Node option `NODE_OPTIONS="--dns-result-order=ipv4first"` to force IPv4 DNS resolution first, bypassing the broken IPv6 route and successfully connecting to Supabase instantly.
  3. Configured `mobile/.env` to point to the active DHCP-stabilized IP address `192.168.1.73`.
verification:
  - Server is active, listening on port 5000 (PID `5396`), and connected successfully to Supabase.
  - Testing `curl.exe -i http://192.168.1.73:5000/health` returned `200 OK` and a healthy payload instantly.
  - Downstream mobile connectivity is fully restored!
