---
title: College Event Management with Live Updates
phase: college-events-phase
goal: Implement full-stack event platform where colleges post events, students register, with real-time updates via Supabase Realtime + Socket.io
created: 2026-05-26
status: in-progress
waves: 5
checksum: pending
---

# College Events Phase — Executable Plan

## Wave 1: Database Schema & Migrations (LOWEST RISK)

### 1.1 Create `events` table migration
- **Task**: Write SQL migration for `public.events`
- **File**: `supabase/migrations/[timestamp]_create_events.sql`
- **Columns**: id, college_id, title, description, type, date, deadline, venue, is_online, max_team, min_team, prize, banner_color, status, contact_email, contact_phone, eligibility, schedule, created_at, updated_at
- **Constraints**: Primary key (id), Foreign key (college_id → profiles.id), Check (status IN active/past/draft/deleted)
- **RLS Policy**: College can edit own events; students read only
- **Dependencies**: None
- **Error Guard**: Check migration syntax, verify foreign key exists
- **Verify**: `psql -c "SELECT * FROM information_schema.tables WHERE table_name='events'"`

### 1.2 Create `event_tags` table migration
- **Task**: Write SQL migration for `public.event_tags` (junction)
- **File**: `supabase/migrations/[timestamp]_create_event_tags.sql`
- **Columns**: event_id (FK → events), tag (TEXT), created_at
- **Constraints**: Primary key (event_id, tag), unique constraint
- **RLS Policy**: Public read; college can write to own events
- **Dependencies**: Wave 1.1 (events table must exist)
- **Verify**: Junction table created, no orphaned tags

### 1.3 Create `event_registrations` table migration
- **Task**: Write SQL migration for `public.event_registrations`
- **File**: `supabase/migrations/[timestamp]_create_event_registrations.sql`
- **Columns**: id, event_id (FK), user_id (FK → profiles.id), team_size (INT), skills (TEXT[]), registered_at
- **Constraints**: Primary key (id), unique (event_id, user_id), Foreign keys
- **RLS Policy**: Student sees own; college reads for own events
- **Dependencies**: Wave 1.1, Wave 1.2
- **Verify**: Table created, no duplicates possible, RLS enabled

### 1.4 Create `event_views` table migration (analytics)
- **Task**: Write SQL migration for `public.event_views`
- **File**: `supabase/migrations/[timestamp]_create_event_views.sql`
- **Columns**: id, event_id (FK), user_id (FK), viewed_at
- **RLS Policy**: User can log own views; college can aggregate for own events
- **Dependencies**: Wave 1.1
- **Verify**: Table structure, indexes on event_id for fast aggregation

### 1.5 Verify Wave 1 schema integrity
- **Task**: Run SQL check scripts
- **Checks**:
  - All 4 tables exist in `public` schema
  - Foreign keys correctly reference `profiles.id`
  - RLS policies enabled and correct
  - No dangling constraints
  - Migrations apply cleanly (no rollback errors)
- **Dependencies**: 1.1–1.4 complete
- **Success Criteria**: All tables queryable, no constraint violations

---

## Wave 2: Backend API Routes & Controllers

### 2.1 Create college events controller
- **File**: `backend/src/modules/events/events.college.controller.ts`
- **Functions**:
  - `getMyEvents()` — list college's events
  - `createEvent()` — insert new event
  - `updateEvent()` — edit event (only college can edit own)
  - `deleteEvent()` — soft-delete (status = 'deleted')
  - `getEventRegistrations()` — paginated registrations for event
  - `getEventAnalytics()` — daily counts, funnel, college breakdown
- **Dependencies**: Wave 1 schema complete
- **Error Guards**: 401/403 for unauthorized college, IDOR prevention
- **Verify**: POST creates event, GET returns paginated list, PUT updates, DELETE soft-deletes

### 2.2 Enhance events routes
- **File**: `backend/src/modules/events/events.college.routes.ts` (new)
- **Routes**:
  - `POST /college/events` → createEvent (emit `event_published` socket)
  - `PUT /college/events/:id` → updateEvent (emit `event_updated`)
  - `DELETE /college/events/:id` → deleteEvent
  - `GET /college/events/:id/registrations` → getEventRegistrations
  - `GET /college/events/:id/analytics` → getEventAnalytics
  - `GET /college/events/:id/registrations/export` → CSV download
- **Middleware**: `authMiddleware`, `roleMiddleware(['college'])`
- **Dependencies**: 2.1 controller complete
- **Verify**: All 6 routes callable, correct HTTP methods

### 2.3 Create student registration controller
- **File**: `backend/src/modules/events/registrations.controller.ts` (new)
- **Functions**:
  - `registerForEvent()` — POST create registration (emit `registration_updated`)
  - `cancelRegistration()` — DELETE remove registration
  - `getMyRegistrations()` — student's registered events
- **Dependencies**: Wave 1 schema, 2.1
- **Error Guards**: Duplicate registration check, team_size validation
- **Verify**: Registration created, counted in analytics, socket emitted

### 2.4 Enhance public events routes
- **File**: `backend/src/modules/events/events.routes.ts` (update existing)
- **Add Routes**:
  - `GET /events` → list with filters (type, tags, date range)
  - `GET /events/:id` → detail + live registration count
  - `POST /student/events/:id/register` → create registration
  - `DELETE /student/events/:id/register` → cancel
- **Dependencies**: 2.3 controller
- **Verify**: Public can list, students can register, registration count updates

### 2.5 Set up Socket.io namespaces
- **File**: `backend/src/server.ts` (update)
- **Add**:
  - `io.on('connection')` — track active clients
  - Namespace: `join_event_room/:eventId` → join room for live updates
  - Broadcast handlers: `registration_count_updated`, `analytics_updated`, `event_status_changed`
  - Emit on database changes from controllers
- **Dependencies**: 2.1–2.4 complete
- **Verify**: Socket connections work, rooms joinable, broadcasts received

### 2.6 Verify Wave 2 API completeness
- **Task**: Integration test all endpoints
- **Tests**:
  - College can create/edit/delete own events
  - College cannot edit other college's events (403)
  - Student can register/view events
  - Registration count updates in real-time
  - CSV export works
- **Dependencies**: 2.1–2.5 complete
- **Success Criteria**: All endpoints callable, no 500 errors, sockets emit on changes

---

## Wave 3: Frontend Screens & State Management

### 3.1 Create events store
- **File**: `mobile/store/eventsStore.js` (new)
- **State**: collegeEvents, studentEvents, myRegistrations, analytics
- **Actions**:
  - `fetchCollegeEvents()`, `createEvent()`, `updateEvent()`, `deleteEvent()`
  - `fetchStudentEvents()`, `registerEvent()`, `cancelRegistration()`
  - `fetchEventAnalytics()`
- **Supabase Realtime**: Subscribe to `events`, `event_registrations` tables
- **Dependencies**: Wave 1 schema exists, Wave 2 API ready
- **Verify**: Store state updates on Supabase changes

### 3.2 Create college post-event screen
- **File**: `mobile/app/(college)/post-event.tsx` (new)
- **UI**: Multi-step form (basic info → type/date → details → tags)
- **Validation**: Client-side real-time, server-side on submit
- **Fields**: title, description, type, date, deadline, venue, is_online, max_team, min_team, prize, tags, contact_email, eligibility
- **Dependencies**: 3.1 store
- **Verify**: Form submits, event appears in manage-events instantly

### 3.3 Enhance college manage-events screen
- **File**: `mobile/app/(college)/manage-events.tsx` (update)
- **Add Features**:
  - Search, filter by type, sort by registrations/views
  - Edit, duplicate, delete, view registrations, analytics buttons
  - Live badge showing registration count updates
  - Delete confirmation modal (soft-delete)
- **Dependencies**: 3.1 store, Wave 2 API
- **Verify**: All CRUD operations work, live updates on card badges

### 3.4 Create college event-analytics screen
- **File**: `mobile/app/(college)/event-analytics.tsx` (new)
- **Charts**:
  - Daily registrations bar chart (7 days)
  - Funnel visualization (views → clicks → registrations)
  - College distribution pie/bar chart
  - Top skills tags
- **Insights**: Conversion rate, days left, college breakdown
- **Dependencies**: 3.1 store, Wave 2 analytics endpoint
- **Verify**: Charts render, data updates live on registration

### 3.5 Enhance student events discovery
- **File**: `mobile/app/(student)/events.tsx` (update)
- **Add**:
  - Live registration count badge on event cards
  - Search, filter, sort
  - Link to event detail screen
- **Dependencies**: 3.1 store
- **Verify**: Events list updates live, registration counts refresh

### 3.6 Create event detail screen
- **File**: `mobile/app/events/[id].tsx` (new)
- **UI**:
  - Event poster, description, date, deadline, venue
  - Registration count + skills distribution
  - College profile card
  - Register/cancel button
- **Dependencies**: 3.1 store, Route parameter `[id]`
- **Verify**: Detail loads, can register, button state updates

### 3.7 Verify Wave 3 UI completeness
- **Task**: Manual E2E test
- **Tests**:
  - College posts event → appears instantly in manage-events
  - Student sees event in discover within 1-2 sec
  - Student registers → count updates live
  - Analytics dashboard shows real-time registrations
  - No duplicate renders, no stale data
- **Dependencies**: 3.1–3.6 complete
- **Success Criteria**: All screens load, all buttons work, live updates visible

---

## Wave 4: Real-Time Integration (Supabase + Socket.io)

### 4.1 Wire Supabase Realtime subscriptions (mobile)
- **File**: `mobile/store/eventsStore.js` (extend)
- **Subscribe to**:
  - `events` table: ON INSERT/UPDATE → trigger `fetchCollegeEvents()`
  - `event_registrations`: ON INSERT → update registration count
- **Handlers**: Refresh affected event card, update analytics
- **Dependencies**: Wave 3.1 store created
- **Verify**: Data updates within 1-2 sec of DB change

### 4.2 Wire Socket.io listeners (mobile)
- **File**: `mobile/api/client.js` (update)
- **Listeners**:
  - `registration_count_updated` → update event card badge
  - `analytics_updated` → refresh analytics dashboard
  - `event_published` → add to student discover list
- **Connection**: `io(SOCKET_URL).on('event_room/:eventId')`
- **Dependencies**: Wave 2.5 Socket setup, Wave 3.1 store
- **Verify**: Receive socket events, update UI

### 4.3 Emit Socket.io events on backend (on DB changes)
- **File**: `backend/src/modules/events/events.college.controller.ts` (extend)
- **After DB writes, emit**:
  - `io.to('event_' + eventId).emit('registration_count_updated', {eventId, count})`
  - `io.to('event_' + eventId).emit('analytics_updated', {eventId, dailyData})`
  - `io.emit('event_published', {event})` (for discovery page)
- **Dependencies**: Wave 2.1–2.5 complete
- **Verify**: Emissions logged, clients receive

### 4.4 Handle offline + reconnect edge cases (mobile)
- **File**: `mobile/store/eventsStore.js` (extend)
- **Logic**:
  - On socket disconnect: show "offline" indicator
  - On reconnect: refetch latest data from API
  - Debounce fast reconnects (1-2 sec window)
- **Dependencies**: 4.1–4.3 complete
- **Verify**: Offline mode handled gracefully, no duplicate fetches

### 4.5 Verify Wave 4 real-time completeness
- **Task**: Real-time E2E test
- **Tests**:
  - College creates event (browser/mobile) → other student sees it < 1 sec
  - Student registers → count updates live on other devices
  - Analytics refresh every time new registration arrives
  - Offline mobile reconnects and fetches latest data
  - No race conditions or stale data
- **Dependencies**: 4.1–4.4 complete
- **Success Criteria**: Real-time updates work across devices, offline resilience

---

## Wave 5: Testing, Verification & Future-Proofing

### 5.1 Database migration rollback test
- **Task**: Test migration up/down
- **Steps**:
  - Apply migrations: `supabase migration up`
  - Verify tables exist
  - Rollback: `supabase migration down`
  - Verify tables removed cleanly
  - Re-apply: `supabase migration up`
- **Error Guard**: No orphaned data, no constraint errors
- **Verify**: Migrations reversible, idempotent

### 5.2 Backend integration tests
- **File**: `backend/src/modules/events/events.test.ts` (create)
- **Tests**:
  - POST /college/events creates event + emits socket
  - GET /college/events/:id/registrations returns paginated list
  - DELETE soft-deletes (status = 'deleted', not removed)
  - CSV export streams without memory overflow
  - 401/403 for unauthorized access
- **Dependencies**: Wave 2 API complete
- **Verify**: All tests pass, no SQL errors

### 5.3 Frontend E2E tests
- **File**: `mobile/app/(college)/__tests__/post-event.e2e.ts` (create)
- **Tests**:
  - College form submission creates event in backend
  - Event appears in manage-events within 2 sec
  - Real-time updates work on other device
  - CSV export downloads
- **Dependencies**: Wave 3 screens complete
- **Verify**: Tests pass, no flaky timing issues

### 5.4 Data consistency checks
- **Task**: Audit for future-proofing
- **Checks**:
  - No N+1 queries (analytics aggregation efficient)
  - RLS policies prevent unauthorized reads
  - Foreign key cascades set correctly (delete event → delete registrations)
  - Indexes exist on frequently queried columns (event_id, college_id, user_id)
  - Soft-delete queries filter `status != 'deleted'`
- **Dependencies**: All waves complete
- **Verify**: No orphaned data, queries performant

### 5.5 Documentation & handoff
- **File**: `docs/EVENTS_FEATURE.md` (create)
- **Contents**:
  - Schema diagram (tables, relationships)
  - API endpoint reference (all routes, params, examples)
  - Realtime subscription guide (Supabase + Socket.io)
  - Troubleshooting (offline, socket reconnect, duplicate prevention)
  - Migration rollback procedure
- **Dependencies**: All waves complete
- **Verify**: Documentation complete, no code examples missing

### 5.6 Final verification & go-live readiness
- **Task**: Full system verification
- **Checks**:
  - ✅ All migrations apply cleanly
  - ✅ All API endpoints return 200/201 on success
  - ✅ All frontend screens render without errors
  - ✅ Real-time updates work across devices
  - ✅ No duplicate data or race conditions
  - ✅ Offline + reconnect handled gracefully
  - ✅ CSV export works
  - ✅ RLS policies block unauthorized access
  - ✅ Tests pass (backend + frontend)
  - ✅ Documentation complete
- **Dependencies**: 5.1–5.5 complete
- **Success Criteria**: All checks pass, zero known issues, ready for production

---

## Dependency Graph

```
Wave 1 (DB Schema)
  ↓
Wave 2 (Backend API) → depends on Wave 1
  ↓
Wave 3 (Frontend) → depends on Wave 1, 2
  ↓
Wave 4 (Real-time) → depends on Wave 2, 3
  ↓
Wave 5 (Testing + Verification) → depends on all
```

**Parallel Execution:** Waves 2 and 3 can start together once Wave 1 is complete (minor dependencies can be mocked).

---

## Success Criteria (Overall)

- ✅ All 5 waves execute without errors
- ✅ No duplicate code or migrations
- ✅ Real-time updates verified (< 2 sec latency)
- ✅ RLS policies enforce security
- ✅ Offline + reconnect handled
- ✅ Tests pass (100% coverage for critical paths)
- ✅ Documentation complete
- ✅ Future-proof (migrations reversible, schemas normalized, no tech debt)

---

## Rollback Plan

If a wave fails:
1. Rollback: `gsd-undo college-events-phase --wave N`
2. Debug: Review error logs in `.planning/phases/college-events-phase/ERROR.log`
3. Fix: Modify failing task in PLAN.md or code
4. Re-execute: `gsd-execute-phase college-events-phase --wave N`
