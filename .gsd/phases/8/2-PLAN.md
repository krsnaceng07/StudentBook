---
phase: 8
plan: 2
wave: 2
depends_on: ["1"]
---

# Plan 8.2: Frontend Chat Screen UI

## Objective
Build the 1-on-1 Chat screen (`app/chat/[conversationId].tsx`) matching the reference — speech bubbles, online status header, and message input bar.

## Context
- `e:\studentsociety\mobile\app\chat\[conversationId].tsx` (new file)
- Reference: White received bubbles on the left, blue sent bubbles on the right, user name + "Online" green dot header, "Message..." input bar with blue send button.

## Tasks

<task type="auto">
  <name>Build Chat Screen UI with mock data</name>
  <files>
    e:\studentsociety\mobile\app\chat\[conversationId].tsx
  </files>
  <action>
    - Create the file `app/chat/[conversationId].tsx`.
    - Use NativeWind for all styling. Use `useUIStore` for dark mode.
    - Header: back arrow (left), user initials circle + name + "Online" green dot (center), settings icon (right). Use `useLocalSearchParams` for the conversation ID.
    - Message list: `FlatList` of mock messages. Each message:
      - If `sender === 'me'`: right-aligned blue rounded bubble (`bg-blue-600 text-white`).
      - If `sender === 'other'`: left-aligned white/slate rounded bubble.
    - Show a `Today` divider between date groups.
    - Bottom: `TextInput` with placeholder "Message..." + blue circular send button (Ionicons `send`).
    - Use `KeyboardAvoidingView` to prevent keyboard overlapping the input.
  </action>
  <verify>grep "Message..." "e:\studentsociety\mobile\app\chat\[conversationId].tsx"</verify>
  <done>File exists with FlatList bubbles, header, and input bar.</done>
</task>

## Success Criteria
- [ ] Chat screen renders sent (blue/right) and received (white/left) bubbles.
- [ ] Header shows user name and Online indicator.
- [ ] Keyboard does not cover the input bar.
