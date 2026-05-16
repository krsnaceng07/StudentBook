# Project Specification: StudentSociety [FINALIZED]

## Product Vision
A comprehensive social and academic platform for college students to connect, share posts, manage teams/societies, and access AI-powered study resources.

## Core Features
1. **Authentication:** Student login/signup with email and social providers via **Supabase Auth**.
2. **Social Feed:** Post creation, viewing, and interaction stored in **Supabase (PostgreSQL)**.
3. **Teams/Societies:** Management of college clubs and societies via Supabase.
4. **Study Hub:** AI-powered mentor for academic queries (Groq + Tavily).
5. **Real-time Chat:** Instant messaging using **Supabase Realtime**.
6. **Notifications:** Push notifications via Supabase/Edge Functions (or direct integration).
7. **Profile Management:** Customizable student profiles.

## Technical Stack
- **Mobile:** Expo SDK 54, Expo Router, NativeWind v4, Zustand, Supabase Client.
- **Backend:** Node.js, Express, Supabase Admin SDK, Cloudinary.
- **AI Integration:** Groq (Llama 3.3), Tavily Search, Google Generative AI.

## Architecture
- **Database:** Relational schema in Supabase (PostgreSQL).
- **Auth:** Managed by Supabase (JWT based).
- **Mobile Routing:** File-based routing in `mobile/app/`.
- **Backend Routing:** Express routes acting as a proxy/wrapper for Supabase logic where needed.
- **Media:** Cloudinary for images/videos.
