---
phase: 3
plan: 2
wave: 2
depends_on: ["3.1"]
files_modified:
  - backend/src/modules/auth/auth.controller.ts
  - backend/src/modules/auth/auth.routes.ts
  - backend/src/middleware/auth.middleware.ts
  - backend/src/middleware/role.middleware.ts
autonomous: true
user_setup: []

must_haves:
  truths:
    - "Signup endpoint handles both student and college roles separately"
    - "Role middleware correctly identifies student vs college accounts"
  artifacts:
    - "backend/src/modules/auth/auth.controller.ts exists"
    - "backend/src/middleware/role.middleware.ts exists"
---

# Plan 3.2: Dual-Role Auth & Middleware (Backend)

<objective>
Implement the core authentication logic and role-based access control (RBAC) to support the separate student and college "worlds".

Purpose: To ensure students only access student features and colleges only access college features, as per PRD v2.0.
Output: Auth module with signup/login and role-aware middlewares.
</objective>

<context> load for context:
- .gsd/SPEC.md
- backend/src/config/supabase.ts (Wave 1)
- backend/src/server.ts (Wave 1)
</context>

<tasks>

<task type="auto">
  <name>Implement Auth Module (Signup & Login)</name>
  <files>
    - backend/src/modules/auth/auth.controller.ts
    - backend/src/modules/auth/auth.routes.ts
  </files>
  <action>
    1. Implement `signupStudent` and `signupCollege` controllers.
    2. Logic: Create Supabase Auth user -> Insert into `profiles` (shared) -> Insert into `student_profiles` or `college_profiles` (role-specific).
    3. Implement `login` controller: Verify credentials via Supabase -> Validate role in `profiles` matches the login intent (if applicable) or simply return user + role metadata.
    4. Export as a router and mount in `server.ts`.
    AVOID: Complex session management. Use Supabase native session handling and JWTs.
  </action>
  <verify>Curl POST /api/auth/signup/student returns 201.</verify>
  <done>Signup and Login APIs are functional for both roles.</done>
</task>

<task type="auto">
  <name>Auth & Role Middlewares</name>
  <files>
    - backend/src/middleware/auth.middleware.ts
    - backend/src/middleware/role.middleware.ts
  </files>
  <action>
    1. Create `authMiddleware`: Extracts Bearer token, validates with Supabase, and attaches `user` to `req`.
    2. Create `roleMiddleware`: Takes an array of allowed roles (e.g., ['student']) and verifies `req.user.role`.
    AVOID: Hardcoding role strings everywhere; use the constants/enums if possible.
  </action>
  <verify>Unit test middleware with mock req/res.</verify>
  <done>Access control is enforceable at the route level.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Signup creates rows in both `profiles` and role-specific tables.
- [ ] `roleMiddleware` blocks a 'student' from 'college' routes.
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>
