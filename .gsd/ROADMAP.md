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
