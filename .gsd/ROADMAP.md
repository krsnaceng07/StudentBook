# Roadmap: CollabSpace v2.0

## Phase 1: Foundation (COMPLETED)
- [x] Initial codebase analysis and architecture mapping.
- [x] GSD Workflow installation and global setup.
- [x] Cross-platform script integration in root `package.json`.
- [x] Dependency synchronization.

## Phase 2: Supabase Migration (COMPLETED)
- [x] Research Supabase Auth/DB patterns and mapping from MongoDB/Firebase.
- [x] Setup Supabase Project and Database Schema (SQL).
- [x] Migrate Backend: Remove Mongoose/Firebase and integrate Supabase SDK.
- [x] Migrate Mobile: Remove Firebase and integrate Supabase Client.

## Phase 3: CollabSpace Dual-Role Foundation ✅
- [x] Refactor Backend to TypeScript & `src/` Architecture.
- [x] Implement v2.0 Database Schema (11 Tables) + RLS Policies.
- [x] Develop Dual-Role Auth System (Student vs College Signup/Login).
- [x] Mobile: Implement "Welcome Screen" role selection and Auth flow.
- [x] Simplify Onboarding (Deferred Profile Setup).

## Phase 4: Core Features Rebuild (CollabMate UI) ✅
- [x] Database Schema: Add profiles extension, events, connections, and activities.
- [x] Backend APIs: Endpoints for teammates, events, and recent activity.
- [x] Frontend: Implement Bottom Tabs and Home Screen matching the CollabMate UI design.

## Phase 5: Discover Screen Implementation ✅
- [x] Database Schema: Add `university` and `bio` fields to `extended_profiles`.
- [x] Backend APIs: Create `GET /api/v1/discover` endpoint with search and filter capabilities.
- [x] Frontend: Build Discover screen UI matching the "Find teammates" design with search bar, filter pills, and user cards.

## Phase 6: Events Screen Implementation ✅
- [x] Database Schema: Add `event_type` and `organizer` fields to `events`.
- [x] Backend APIs: Create `GET /api/v1/events` endpoint with search and filter capabilities.
- [x] Frontend: Build Events screen UI matching the reference image.

## Phase 7: Messages Screen Implementation ✅
- [x] Database Schema: Implement conversations and messages tables.
- [x] Backend APIs: Endpoints for inbox and chat history.
- [x] Frontend: Build Messages inbox UI matching the reference image.

## Phase 8: Chat Screen Implementation ✅
- [x] Backend APIs: Endpoint for conversation message history.
- [x] Frontend: Build 1-on-1 Chat screen with speech bubbles, online status header, message input bar.

## Phase 9: Team Screen Implementation ✅
- [x] Database Schema: Add `teams` and `team_members` tables with roles.
- [x] Backend APIs: Endpoint for `GET /api/v1/teams/my` to return user's team and member list.
- [x] Frontend: Build "My Team" screen with member cards, role badges, open slot, and Invite button.

## Phase 10: Profile Screen Implementation ✅
- [x] Database Schema: Add `interests` and `goal` fields to `extended_profiles`.
- [x] Backend APIs: Endpoint for `GET /api/v1/profile/me` returning stats, skills, interests, goal.
- [x] Frontend: Build "My Profile" screen with stats, skill/interest badges, and goal section.

## Phase 11: Notifications Screen Implementation ✅
- [x] Database Schema: Add `notifications` table with type, actor, and action fields.
- [x] Backend APIs: Endpoint for `GET /api/v1/notifications` returning grouped New/Earlier notifications.
- [x] Frontend: Build Notifications screen with Accept/Decline buttons for connection and team invites.

## Phase 12: Final UI Update ✅
- [x] Database Schema: Add `event_bookmarks` table.
- [x] Backend APIs: Endpoint for `GET /api/v1/dashboard/home` returning connectionsCount, bookmarksCount, pendingCount, and upcomingEvents.
- [x] Frontend: Update bottom tab bar structure (Home, Discover, Events, Requests, Profile).
- [x] Frontend: Re-build Home screen to match the final top banner and cards layout.

## Phase 13: Premium Screen Design and Real-Data Integration ✅
- [x] Database Schema: Ensure profiles, events, connections tables support the new fields (e.g. status_badge, bio, university_year, event details like prize/member limit, social links like github).
- [x] Backend APIs: Ensure endpoints `/api/v1/discover`, `/api/v1/events`, `/api/v1/profile/me`, and `/api/v1/connections` support returning and saving these new fields.
- [x] Frontend: Re-build Discover, Events, Requests, Profile and Connection Detail screens to match the final screenshots exactly.

## Phase 14: Student-Friendly Navigation Shifting ✅
- [x] Frontend: Keep bottom tabs strictly at 5 buttons (Home, Discover, Events, Requests, Profile).
- [x] Frontend: Shift Messages and My Team screens to highly intuitive headers (Home screen top-right) and Profile workspace cards.

## Phase 15: Dual-Role College Workspace & Premium Onboarding ✅
- [x] Frontend: Build step-by-step Onboarding goal selection flow with progress bars.
- [x] Frontend: Build dynamic, premium Event Details view screen with colored banners, grids, prize highlight card, and tags.
- [x] Frontend: Build College Tab Portal layout with green theme.
- [x] Frontend: Build College Dashboard with total reach and active event stats cards.
- [x] Frontend: Build College Events Management panel with post event, edit, and delete actions.
- [x] Frontend: Build College Profile screen with About, Website, and Contact info.
- [x] Frontend: Configure Auth navigation split to automatically guide students to `/(tabs)` and colleges to `/college`.

## Phase 16: Dynamic Live Home Workspace & Database Realtime Stream ✅
- [x] Frontend: Build Realtime Supabase Postgres Stream Listener to sync database changes automatically.
- [x] Frontend: Connect stats cards (Connections, Bookmarks, Pending) and complete profile banner to active routing.
- [x] Frontend: Configure upcoming events list items to trigger premium detail routes dynamically.

## Phase 17: Backend API Authentication and Authorization Hardening (RBAC & Security Audit) ✅
- [x] Backend: Enforce strict Role-Based Access Control (RBAC) on all protected routes using `roleMiddleware`.
- [x] Backend: Perform complete code security audit and verify IDOR and privilege escalation mitigations.

## Phase 18: Penetration Testing & API Input Validation Hardening (Injection & Sanitization) ✅
- [x] Backend: Build robust Joi validation middleware to block invalid inputs and XSS scripts.
- [x] Backend: Enforce body validation schemas on auth routes and sanitize query parameters against injections.

## Phase 19: API and Network Security Hardening (Headers, CORS & Rate Limiting) ✅
- [x] Backend: Configure helmet HTTP headers and restrict CORS domains to close wildcard vulnerabilities.
- [x] Backend: Setup brute-force and request rate-limiting middlewares to secure the application boundaries.

## Phase 20: DevSecOps Vulnerability Auditing & Hardening (Secrets & Safe Dependencies) ✅
- [x] Backend: Remediate any moderate or high vulnerabilities in package dependencies using npm audit mechanisms.
- [x] Backend: Configure robust environment guards inside server configurations to enforce safe NODE_ENV configurations.

## Phase 21: Business Logic Audit & Threat Modeling (Workflows & Trust Boundaries) ✅
- [x] Backend: Threat-model signup, login, profile, and dashboard workflows to block step-skipping and parameter manipulation.
- [x] Backend: Enforce strict trust boundaries and document attack vector mitigations in the codebase.

## Phase 22: Mobilizing Key Screen UIs (Discover, Events, Requests, and Profile Live-Data Connect) ✅
- [x] Mobile: Connect the Discover screen UI to backend API to query live user listings.
- [x] Mobile: Connect the Profile screen UI to dynamic profile endpoints to fetch authenticated details.
- [x] Mobile: Connect the Events screen UI to live endpoints to retrieve active database listings.
- [x] Mobile: Connect the Requests screen UI to live connection endpoints.

## Phase 23: College Workspace Live-Data Mobilization
**Status**: ✅ Complete
- [x] Mobile: Mobilize College Dashboard with live stats and active event listings dynamically fetched from backend API.
- [x] Mobile: Mobilize College Events Management panel with real-time post, edit, and delete functionality.
- [x] Mobile: Mobilize College Profile screen with live authenticated user data.
- [x] Backend: Ensure strict endpoint isolation and data separation so student and college roles do not conflict.
