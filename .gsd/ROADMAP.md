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

## Phase 3: CollabSpace Dual-Role Foundation
- [ ] Refactor Backend to TypeScript & `src/` Architecture.
- [ ] Implement v2.0 Database Schema (11 Tables) + RLS Policies.
- [ ] Develop Dual-Role Auth System (Student vs College Signup/Login).
- [ ] Mobile: Implement "Welcome Screen" role selection and Auth flow.

## Phase 4: Core Features (Student & College Worlds)
- [ ] Student: Profile build, Skills/Interests, and Search/Discover.
- [ ] College: Dashboard, Event Management, and Posting.
- [ ] Matching System: Collaboration requests and Acceptance flow.

## Phase 5: Communication & Polish
- [ ] Real-time Messaging via Supabase Realtime.
- [ ] Notification System & Event Bookmarking.
- [ ] UI/UX Polish: Skeleton loaders, theme consistency, and empty states.

