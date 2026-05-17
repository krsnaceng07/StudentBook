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

## Phase 11: Notifications Screen Implementation
- [ ] Database Schema: Add `notifications` table with type, actor, and action fields.
- [ ] Backend APIs: Endpoint for `GET /api/v1/notifications` returning grouped New/Earlier notifications.
- [ ] Frontend: Build Notifications screen with Accept/Decline buttons for connection and team invites.
