---
phase: 13
plan: 1
wave: 1
---

# Plan 13.1: Premium Screens Redesign and Dynamic Integration

## Objective
Remove all legacy UI components for Discover, Events, Requests, and Profile. Rebuild them to match the new beautiful design screenshots exactly, complete with live backend integrations.

## Context
- `e:\studentsociety\mobile\app\(tabs)\discover.tsx`
- `e:\studentsociety\mobile\app\(tabs)\events.tsx`
- `e:\studentsociety\mobile\app\(tabs)\requests.tsx`
- `e:\studentsociety\mobile\app\(tabs)\profile.tsx`
- `e:\studentsociety\mobile\app\profile\[id].tsx` (new user details screen)

## Tasks

<task type="auto">
  <name>Redesign and Implement Discover Screen</name>
  <files>
    e:\studentsociety\mobile\app\(tabs)\discover.tsx
  </files>
  <action>
    - Completely rewrite the Discover screen UI to match the first reference screenshot.
    - Add a safe area header labeled "Discover" in bold.
    - Create a search bar with a magnifying glass icon placeholder "Search by skill...".
    - Create filter pills: "All", "Seeking Team", "Open to Join", "Exploring".
    - Implement a ScrollView of user cards with a modern look:
      - Circle avatar with initials (like "PT", "RK", "SG") styled in light purple, teal, or pink.
      - User's name with an active green status indicator dot.
      - University and year subtitle (e.g. "Kathmandu University · 2nd Year").
      - Pill status badge (e.g. "Open to Join" in green, "Looking for Team" in blue).
      - Skills badges (e.g. "IoT", "C++", "Arduino", "+1").
    - Clicking any user card must navigate to their profile details screen (`/profile/[id]`).
  </action>
  <verify>grep "Search by skill" "e:\studentsociety\mobile\app\(tabs)\discover.tsx"</verify>
  <done>Discover screen matches the first screenshot and navigates to details.</done>
</task>

<task type="auto">
  <name>Redesign and Implement Events Screen</name>
  <files>
    e:\studentsociety\mobile\app\(tabs)\events.tsx
  </files>
  <action>
    - Rebuild the Events screen UI to match the second reference screenshot.
    - Create category filter pills: "All Events", "Hackathon", "Workshop", "Competition".
    - Implement list of event cards:
      - Top accent border color (solid blue, solid green, solid purple, solid pink).
      - Left category pill (e.g. "Hackathon", "Workshop") and right bookmark tag icon 🔖.
      - Bold black event title and gray organizer name.
      - Details row with small icons (📅 Date, 🏆 Prize count, 👥 Team size).
  </action>
  <verify>grep "All Events" "e:\studentsociety\mobile\app\(tabs)\events.tsx"</verify>
  <done>Events screen matches the second screenshot with colorful accent borders.</done>
</task>

<task type="auto">
  <name>Redesign and Implement Requests Screen</name>
  <files>
    e:\studentsociety\mobile\app\(tabs)\requests.tsx
  </files>
  <action>
    - Rebuild the Requests screen UI to match the third reference screenshot.
    - Add a safe area header labeled "Requests".
    - Add a beautiful segmented control/toggle buttons: "Incoming" (blue background, active), "Outgoing" (gray text, inactive).
    - Implement a gorgeous empty state centered graphic:
      - An icon of a blue mailbox 📬.
      - Bold heading "No incoming requests".
      - Subtext "When someone sends you a request, it appears here".
  </action>
  <verify>grep "No incoming requests" "e:\studentsociety\mobile\app\(tabs)\requests.tsx"</verify>
  <done>Requests screen matches the third screenshot with tab switcher and mailbox empty state.</done>
</task>

<task type="auto">
  <name>Redesign and Implement Profile Screen & Details Route</name>
  <files>
    e:\studentsociety\mobile\app\(tabs)\profile.tsx
    e:\studentsociety\mobile\app\profile\[id].tsx
  </files>
  <action>
    - Rebuild the Profile screen to match the fourth reference screenshot:
      - Header title "Profile".
      - Blue main background banner block with Edit button (orange pencil), a white-bordered circular avatar "AS" with name "Aarav Sharma" and subtitle "Tribhuvan University - 3rd" inside it.
      - Section cards on light grey background:
        - Card 1: Status badge ("Looking for Team" and "Available" green dot) + Bio.
        - Card 2: Skills list of badges ("React Native", "Python", "Machine Learning").
        - Card 3: Interests list of badges ("AI", "FinTech").
        - Card 4: Social link (GitHub logo with `github.com/aarav`).
    - Create a new details screen at `mobile/app/profile/[id].tsx` to match the fifth reference screenshot (clicking on any user card from Discover):
      - Purple main background header with back arrow button, "PT" avatar, "Priya Thapa" bold title, and "Electronics - 2nd Year".
      - Cards: Status details, About, Skills badges, Interests, GitHub link.
      - Spanning bottom blue button: "Send Collaboration Request".
  </action>
  <verify>grep "github.com/" "e:\studentsociety\mobile\app\(tabs)\profile.tsx" && test -f "e:\studentsociety\mobile\app\profile/[id].tsx"</verify>
  <done>Profile screen and profile details screens match screenshots 4 and 5 perfectly.</done>
</task>

## Success Criteria
- [ ] Discover screen displays skills search, pills filters, and detailed cards.
- [ ] Events screen features cards with colored top border highlights and detail icons.
- [ ] Requests screen includes Incoming/Outgoing toggle and empty mailbox state.
- [ ] Profile and user details pages look modern, professional, and match the specified blue/purple header designs.
