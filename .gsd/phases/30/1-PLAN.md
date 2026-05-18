---
phase: 30
plan: 1
wave: 1
---

# Plan 30.1: College Portal Live Integration & Data-binding Fixes

## Objective
Address and resolve data mapping mismatches across the College Portal (Profile, Settings, and Dashboard screens). We will ensure edited profile changes are fetched live, saved successfully to the database, and rendered dynamically across all views using focus-triggered effects.

## Context
- `mobile/app/(college)/profile.tsx`
- `mobile/app/(college)/settings.tsx`
- `mobile/app/(college)/dashboard.tsx`
- `mobile/app/(college)/edit-profile.tsx`

## Tasks

<task type="auto">
  <name>College Profile Screen Data Mapping & Focus Sync</name>
  <files>mobile/app/(college)/profile.tsx</files>
  <action>
    - Refactor `extProfile` data mapping from `profile?.extended_profiles?.[0]` to `profile?.profile` to align with the direct backend return data shape.
    - Sync universityName, location, bio, website, and contactEmail bindings with the newly mapped object.
  </action>
  <verify>grep -q "profile\?.profile" mobile/app/(college)/profile.tsx</verify>
  <done>The Profile screen successfully displays edited data live upon receiving focus.</done>
</task>

<task type="auto">
  <name>College Settings Screen Data Mapping & Focus Sync</name>
  <files>mobile/app/(college)/settings.tsx</files>
  <action>
    - Refactor `extProfile` data mapping from `profile?.extended_profiles?.[0]` to `profile?.profile`.
    - Change static `useEffect` to `useFocusEffect` to dynamically refresh the settings view when the user returns from edit-profile.
  </action>
  <verify>grep -q "useFocusEffect" mobile/app/(college)/settings.tsx</verify>
  <done>The Settings screen dynamically loads real, live details on focus.</done>
</task>

<task type="auto">
  <name>College Dashboard Screen Live Name Sync</name>
  <files>mobile/app/(college)/dashboard.tsx</files>
  <action>
    - Refactor `CollegeDashboard` focus effect to fetch the user's actual profile details from `/profile/me` alongside dashboard stats.
    - Bind `universityName` dynamically to the live `profileName` state variable so edits instantly reflect on the dashboard header.
  </action>
  <verify>grep -q "profileResponse" mobile/app/(college)/dashboard.tsx</verify>
  <done>Dashboard headers dynamically update live with modified college names.</done>
</task>

## Success Criteria
- [ ] Edited profile values are successfully persisted to Supabase database.
- [ ] Profile, Settings, and Dashboard screens immediately show the updated college details live on focus.
