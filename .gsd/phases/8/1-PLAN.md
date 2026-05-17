---
phase: 8
plan: 1
wave: 1
---

# Plan 8.1: Backend API for Chat History

## Objective
Create `GET /api/v1/messages/:conversationId` endpoint that returns the message history for a conversation so the Chat screen can display bubbles.

## Context
- `e:\studentsociety\backend\src\modules\messages\messages.controller.ts`
- `e:\studentsociety\backend\src\modules\messages\messages.routes.ts`

## Tasks

<task type="auto">
  <name>Add getChatHistory controller action and route</name>
  <files>
    e:\studentsociety\backend\src\modules\messages\messages.controller.ts
    e:\studentsociety\backend\src\modules\messages\messages.routes.ts
  </files>
  <action>
    - In `messages.controller.ts`, add a new export `getChatHistory`:
      - Accepts `req.params.conversationId`.
      - Verifies the caller is a participant (query `conversation_participants` where `conversation_id = id AND user_id = req.user.id`).
      - If not a participant, return 403.
      - Fetches all messages for that conversation ordered by `created_at ASC`.
      - Returns `{ success: true, data: messages }`.
    - In `messages.routes.ts`, add `GET /:conversationId` protected by `authMiddleware`, calling `getChatHistory`.
  </action>
  <verify>grep "getChatHistory" "e:\studentsociety\backend\src\modules\messages\messages.controller.ts"</verify>
  <done>The controller exports getChatHistory and the route is registered.</done>
</task>

## Success Criteria
- [ ] `GET /api/v1/messages/:conversationId` returns ordered messages for valid participants.
- [ ] Returns 403 for non-participants.
