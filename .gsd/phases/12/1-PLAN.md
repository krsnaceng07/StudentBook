---
phase: 12
plan: 1
wave: 1
---

# Plan 12.1: Final UI Update (Frontend, Backend, and Database)

## Objective
Implement database updates (event bookmarks), backend dashboard API, tab layout restructuring, and a complete rebuild of the Home screen to match the final UI design with live dynamic stats.

## Context
- `e:\studentsociety\backend\supabase\migrations\20240516_init_v2.sql`
- `e:\studentsociety\backend\src\server.ts`
- `e:\studentsociety\mobile\app\(tabs)\_layout.tsx`
- `e:\studentsociety\mobile\app\(tabs)\index.tsx`
- `e:\studentsociety\mobile\app\(tabs)\requests.tsx` (new file, renamed from alerts.tsx)

## Tasks

<task type="auto">
  <name>Update Database Schema for Event Bookmarks</name>
  <files>
    e:\studentsociety\backend\supabase\migrations\20240516_init_v2.sql
  </files>
  <action>
    - Add the `event_bookmarks` table definition to the migration file:
      ```sql
      CREATE TABLE public.event_bookmarks (
        user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
        event_id   UUID REFERENCES public.events(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT now(),
        PRIMARY KEY (user_id, event_id)
      );
      ```
    - Enable RLS and add policies:
      - Read own bookmarks: `user_id = auth.uid()`
      - Insert own bookmarks: `user_id = auth.uid()`
      - Delete own bookmarks: `user_id = auth.uid()`
  </action>
  <verify>grep "CREATE TABLE public.event_bookmarks" "e:\studentsociety\backend\supabase\migrations\20240516_init_v2.sql"</verify>
  <done>Database schema defines event_bookmarks table with RLS.</done>
</task>

<task type="auto">
  <name>Implement Backend Dashboard API</name>
  <files>
    e:\studentsociety\backend\src\modules\dashboard\dashboard.controller.ts
    e:\studentsociety\backend\src\modules\dashboard\dashboard.routes.ts
    e:\studentsociety\backend\src\server.ts
  </files>
  <action>
    - Create a new backend module `dashboard` with `GET /api/v1/dashboard/home` endpoint.
    - Inside `dashboard.controller.ts`, query:
      - Active connections count where status is 'accepted' and user is sender or receiver.
      - Bookmarks count where user_id is `req.user.id`.
      - Pending requests count where receiver_id is `req.user.id` and status is 'pending'.
      - Upcoming events from `events` table ordered by event_date ascending.
      - User extended profile (Tribhuvan University, Aarav Sharma).
    - Mount `dashboardRoutes` in `server.ts` at `/api/v1/dashboard`.
  </action>
  <verify>grep "/api/v1/dashboard" "e:\studentsociety\backend\src\server.ts"</verify>
  <done>Dashboard API is implemented and mounted.</done>
</task>

<task type="auto">
  <name>Update Tab Navigation and Screen Names</name>
  <files>
    e:\studentsociety\mobile\app\(tabs)\alerts.tsx
    e:\studentsociety\mobile\app\(tabs)\requests.tsx
    e:\studentsociety\mobile\app\(tabs)\_layout.tsx
  </files>
  <action>
    - If `app/(tabs)/alerts.tsx` exists, rename it to `app/(tabs)/requests.tsx`.
    - Update the internal component name inside `requests.tsx` to `Requests`.
    - Update `app/(tabs)/_layout.tsx` to have exactly these tabs in order:
      1. `index` (Title: "Home", Icon: "home-outline")
      2. `discover` (Title: "Discover", Icon: "people-outline")
      3. `events` (Title: "Events", Icon: "calendar-outline")
      4. `requests` (Title: "Requests", Icon: "handshake-outline")
      5. `profile` (Title: "Profile", Icon: "person-outline")
    - Remove the `messages` tab from `_layout.tsx` (it will still be accessible via URL but not in the bottom tab bar).
  </action>
  <verify>grep "name=\"requests\"" "e:\studentsociety\mobile\app\(tabs)\_layout.tsx"</verify>
  <done>Tabs are correctly named and ordered with proper icons.</done>
</task>

<task type="auto">
  <name>Rebuild Home Screen UI & Integrate API</name>
  <files>
    e:\studentsociety\mobile\app\(tabs)\index.tsx
  </files>
  <action>
    - Rewrite `index.tsx` entirely to match the new UI.
    - Fetch stats and events from `GET /api/v1/dashboard/home`.
    - Add a white top safe area header showing the text `CollabSpace` in bold.
    - Add a solid blue banner below the header saying "Good morning 👋", "Aarav Sharma" (bold, fallback from profile), "Tribhuvan University" (fallback from profile).
    - Under the banner, add a row of 3 cards (white cards on grey background) showing:
      - 🤝 {connections} Connections
      - 🔖 {bookmarks} Bookmarks
      - 📬 {pending} Pending
    - Add "Upcoming Events" section with cards (e.g. HackTU 2026, Web3 Workshop Series). Event cards should have a small icon on the left, Title + Uni + Badge in middle, Date on top right.
    - Add a "Complete your profile" banner at the very bottom (blue text, light blue background).
  </action>
  <verify>grep "Connections\|Bookmarks\|Pending" "e:\studentsociety\mobile\app\(tabs)\index.tsx"</verify>
  <done>Home screen matches the new design and displays live/fallback data.</done>
</task>

## Success Criteria
- [ ] Database contains event_bookmarks table with RLS.
- [ ] Backend API endpoint /api/v1/dashboard/home is functional.
- [ ] Tabs are correctly structured: Home, Discover, Events, Requests, Profile.
- [ ] Home screen displays the blue header, 3 metric cards, upcoming events, and complete profile banner.
