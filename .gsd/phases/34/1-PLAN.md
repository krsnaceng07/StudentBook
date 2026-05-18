---
phase: 34
plan: 1
wave: 1
---

# Plan 34.1: Legacy Components Purge

## Objective
Delete all deprecated UI components from `mobile/components/` that were built for the old Firebase architecture and are no longer used by the new file-based router pages. This will resolve all remaining TypeScript compilation errors, resulting in a 100% clean build.

## Tasks

<task type="auto">
  <name>Delete Unused Legacy Components</name>
  <files>
    <file>e:\studentsociety\mobile\components\</file>
  </files>
  <action>
    Delete the following files:
    1. `ChatListItem.tsx`
    2. `CreateDiscussionModal.tsx`
    3. `CreatePostBox.tsx`
    4. `CreatePostModal.tsx`
    5. `EditTeamModal.tsx`
    6. `NetworkUserCard.tsx`
    7. `RequestCard.tsx`
    8. `UserCard.tsx`
    9. `Toast.tsx`
    10. `PostCard.tsx`
  </action>
  <verify>Run `npx tsc --noEmit` in the mobile directory. It should exit with code 0 (no errors).</verify>
  <done>
    - All legacy components are deleted.
    - TypeScript compilation completes without errors.
  </done>
</task>
