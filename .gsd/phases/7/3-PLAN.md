---
phase: 7
plan: 3
wave: 3
depends_on: ["2"]
---

# Plan 7.3: Frontend Messages Inbox Screen UI

## Objective
Build the Messages screen (`app/(tabs)/messages.tsx`) matching the reference image — a clean inbox list with avatar initials, name, message preview, and timestamp.

## Context
- `e:\studentsociety\mobile\app\(tabs)\messages.tsx`
- Reference image: White card list. Each row has a colored circular initials avatar on the left, the sender's name (bold) + message preview on the right, a relative time on the top-right, and a small blue dot for unread messages.

## Tasks

<task type="auto">
  <name>Build Messages Inbox Screen UI</name>
  <files>
    e:\studentsociety\mobile\app\(tabs)\messages.tsx
  </files>
  <action>
    - Use NativeWind for all styling.
    - Add "Messages" header with a compose icon on the right.
    - Add a Search Bar ("Search messages...") below the header.
    - Use mock data for 5 conversations matching the reference (PR, AK, RB, SM, BT).
    - Each row is a `TouchableOpacity` containing:
      - Colored initials circle (unique color per user, matching the reference).
      - Column: bold sender name + ellipsized message preview text.
      - Top-right: relative time string (e.g., "2m ago", "1h ago", "Yesterday", "Mon").
      - A small filled blue circle (8px) on the right for unread items (first 2).
    - Add a thin `border-b` separator between rows.
    - Use `FlatList` for the message list.
    - Use `SafeAreaView` as root.
    - Import and use `useUIStore` for dark mode support.
  </action>
  <verify>grep "Search messages" "e:\studentsociety\mobile\app\(tabs)\messages.tsx"</verify>
  <done>The file renders a search bar and a FlatList of conversation rows matching the reference design.</done>
</task>

## Success Criteria
- [ ] Messages screen visually matches the reference with colored avatars and time badges.
- [ ] Unread dot indicator is visible on unread conversations.
