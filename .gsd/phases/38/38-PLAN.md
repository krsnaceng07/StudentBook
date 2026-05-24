---
phase: 38
plan: 1
wave: 1
---

# Plan 38.1: Student Registration Forms & College Roster Download Engine

## Objective
Enable a comprehensive, premium internal registration experience where:
1. **Students** fill in basic details (Full Name, Email, Department, Year, Motivation/Remarks) inside a beautiful modal form before registering.
2. **Colleges** can inspect student registration details (including motivation/remarks) inside the manage-events roster, easily navigate to their full profiles, and download the entire applicant list directly to their device as a CSV spreadsheet.

## Context
- .gsd/ROADMAP.md
- e:\studentsociety\backend\src\modules\events\events.controller.ts
- e:\studentsociety\backend\src\modules\events\events.college.routes.ts
- e:\studentsociety\mobile\app\events\[id].tsx
- e:\studentsociety\mobile\app\(college)\manage-events.tsx

## Tasks

<task type="auto">
  <name>Database Patch & Backend Controller Upgrade</name>
  <files>
    - e:\studentsociety\backend\supabase\migrations\20260525000000_event_registrations_details.sql
    - e:\studentsociety\backend\src\modules\events\events.controller.ts
    - e:\studentsociety\backend\src\modules\events\events.college.routes.ts
  </files>
  <action>
    1. Create a database migration `20260525000000_event_registrations_details.sql` that adds a `registration_details` JSONB column with default `'{}'::jsonb` to the `event_registrations` table. Apply this migration.
    2. Upgrade the `registerForEvent` controller in `events.controller.ts` to retrieve `registration_details` from `req.body` and insert it into the database record.
    3. Upgrade the `getEventRegistrants` controller to select `registration_details` and return it in the registrant mapping.
    4. Implement a new controller `getEventRegistrantsDownload` in `events.controller.ts`. It must:
       - Validate that the requesting user is the event organizer.
       - Fetch all event registrants and their registration details.
       - Generate clean CSV format string content with headers: "Student Name", "Email", "Department", "Year", "Motivation/Remarks", "Registered At".
       - Send the CSV content with `Content-Type: text/csv` and appropriate `Content-Disposition` header.
    5. Register the route `router.get('/:id/registrants/download', getEventRegistrantsDownload)` in `events.college.routes.ts`.
  </action>
  <verify>Run the test server and verify that endpoints compile without type errors.</verify>
  <done>Database column is added and backend endpoints for registering details and CSV download are implemented.</done>
</task>

<task type="auto">
  <name>Student-Side High-Fidelity Registration Modal Form UI</name>
  <files>
    - e:\studentsociety\mobile\app\events\[id].tsx
  </files>
  <action>
    1. Design a beautiful, premium bottom sheet or modal form (`showRegFormModal`) on the student Event Details screen.
    2. The form must capture:
       - Full Name (pre-filled from logged-in user profile, editable)
       - Email (pre-filled from logged-in user profile, editable)
       - Department (pre-filled, editable)
       - Year (pre-filled, editable)
       - Motivation/Remarks (TextInput with multi-line support)
    3. Connect the "Register for Event" button: if `event.registration_type === 'internal'`, open this modal instead of registering instantly.
    4. Upon clicking "Confirm Registration" inside the modal, make the POST API call with `registration_details: { full_name, email, department, year, remarks }` using Axios, then sync registration count and close the modal.
    5. Implement proper validation (e.g. name, email cannot be blank) and premium styling with glassmorphic borders and active state transitions.
  </action>
  <verify>Verify that npx tsc --noEmit completes without typescript compilation errors.</verify>
  <done>Students fill in registration details inside a modal form before registering for internal events.</done>
</task>

<task type="auto">
  <name>College-Side Detailed Roster Inspection & CSV Download Share Action</name>
  <files>
    - e:\studentsociety\mobile\app\(college)\manage-events.tsx
  </files>
  <action>
    1. Upgrade the applicant card inside the Roster Viewer Bottom Sheet in `manage-events.tsx` to beautifully show the submitted `registration_details` (Motivation/Remarks, Department, Year, and Contact Email).
    2. Add a premium "Download Roster (CSV)" button at the top header of the Roster Modal.
    3. Implement the download action:
       - Call `/college/events/:id/registrants/download` to fetch the CSV file text content.
       - Use Expo's `FileSystem.writeAsStringAsync` to save the CSV text as a temporary local file (e.g. `${FileSystem.documentDirectory}event_registrants.csv`).
       - Use Expo's `Sharing.shareAsync` to open the native device share sheet so the college organizer can download, share, save to Files, or send the CSV file directly!
    4. Ensure the chevron navigates to the student's profile `/profile/[id]` successfully.
  </action>
  <verify>Verify that npx tsc --noEmit compiles successfully.</verify>
  <done>Colleges can view applicant registration details, navigate to their profiles, and share/download the applicant roster as a CSV file natively.</done>
</task>

## Success Criteria
- [ ] Students fill in a modal form when registering for internal events, sending customized details to the backend.
- [ ] Colleges can inspect motivations and departments of registered applicants, and click cards to view full student profiles.
- [ ] Colleges can download all registration details at once as a CSV file directly through their mobile device share sheet.
