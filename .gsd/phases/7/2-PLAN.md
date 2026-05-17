---
phase: 7
plan: 2
wave: 2
depends_on: ["1"]
---

# Plan 7.2: Backend API for Messages Inbox

## Objective
Create a `GET /api/v1/messages` endpoint that returns the user's inbox — a list of conversations with the last message and the other participant's profile info.

## Context
- `e:\studentsociety\backend\src\server.ts`
- `e:\studentsociety\backend\src\modules\messages\` (new directory)
- `e:\studentsociety\backend\src\config\supabase.ts` (use `supabaseAdmin`)

## Tasks

<task type="auto">
  <name>Create Messages Controller and Routes</name>
  <files>
    e:\studentsociety\backend\src\modules\messages\messages.controller.ts
    e:\studentsociety\backend\src\modules\messages\messages.routes.ts
  </files>
  <action>
    - Create `messages.controller.ts` with a `getInbox` function:
      - Query `conversation_participants` to get all conversation IDs for the current user (`req.user.id`).
      - For each conversation, fetch the last message from `messages`.
      - Fetch the other participant's profile from `extended_profiles`.
      - Return a list of inbox items: `{ conversation_id, other_user: { initials, full_name, color }, last_message, time_ago }`.
    - Create `messages.routes.ts` with `GET /` protected by `authMiddleware`, calling `getInbox`.
  </action>
  <verify>grep "conversation_participants" "e:\studentsociety\backend\src\modules\messages\messages.controller.ts"</verify>
  <done>Controller queries conversations and returns inbox items with participant profiles.</done>
</task>

<task type="auto">
  <name>Mount Messages Routes in Server</name>
  <files>
    e:\studentsociety\backend\src\server.ts
  </files>
  <action>
    - Import `messagesRoutes` from `./modules/messages/messages.routes.js`.
    - Mount at `/api/v1/messages`.
  </action>
  <verify>grep "/api/v1/messages" "e:\studentsociety\backend\src\server.ts"</verify>
  <done>Messages route is mounted on the server.</done>
</task>

## Success Criteria
- [ ] `GET /api/v1/messages` returns inbox data for the authenticated user.
