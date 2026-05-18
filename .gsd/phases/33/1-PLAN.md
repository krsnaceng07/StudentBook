---
phase: 33
plan: 1
wave: 1
---

# Plan 33.1: Legacy State & Backup Purge

## Objective
Remove all outdated and unused Zustand store files and backup scripts that were left over from the earlier Firebase architecture. This cleans up technical debt, resolves TypeScript compilation warnings related to missing or broken imports in legacy files, and enforces the new API-driven architecture.

## Tasks

<task type="auto">
  <name>Delete Unused Backups Directory</name>
  <files>
    <file>e:\studentsociety\mobile\backups\</file>
  </files>
  <action>
    1. Delete `e:\studentsociety\mobile\backups\network_backup.tsx`.
    2. Remove the `mobile/backups` folder if it is empty.
  </action>
  <verify>Ensure the backup file is completely removed from the filesystem.</verify>
  <done>
    - `mobile/backups/network_backup.tsx` is deleted.
  </done>
</task>

<task type="auto">
  <name>Delete Legacy Zustand Stores</name>
  <files>
    <file>e:\studentsociety\mobile\store\postStore.js</file>
  </files>
  <action>
    1. Delete `mobile/store/postStore.js` (and any other unneeded store like `connectionStore`, `chatStore` if they exist).
    2. Note: DO NOT delete `uiStore.js`, `authStore.js`, or `aiStore.js` as they are actively used by the new app architecture.
  </action>
  <verify>Check that `postStore.js` is gone.</verify>
  <done>
    - Legacy stores are deleted.
  </done>
</task>
