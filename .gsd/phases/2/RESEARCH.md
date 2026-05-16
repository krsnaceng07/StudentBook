# Research: Migration from MongoDB/Firebase to Supabase

## Overview
The goal is to replace the existing NoSQL (MongoDB) and Firebase (Auth/Admin) infrastructure with a unified Supabase (PostgreSQL + Auth) solution.

## Database Mapping (NoSQL to SQL)

| MongoDB Model | Supabase Table | Relations |
| :--- | :--- | :--- |
| `User` | `profiles` | Linked to `auth.users` via `id` |
| `Post` | `posts` | `user_id` -> `profiles.id` |
| `Comment` | `comments` | `post_id`, `user_id` |
| `Like` | `likes` | `post_id`, `user_id` |
| `Team` | `teams` | `owner_id` |
| `Message` | `messages` | `conversation_id`, `sender_id` |
| `Conversation` | `conversations` | Multiple participants |
| `Connection` | `connections` | `user1_id`, `user2_id` |

## Authentication Workflow
1. **Frontend:** Use `@supabase/supabase-js` for sign-up, sign-in, and session management.
2. **Backend:** Verify the JWT sent in the `Authorization` header using `supabase.auth.getUser(token)`.
3. **Database Security:** Enable **Row Level Security (RLS)** to ensure users can only access their own data or public data.

## Implementation Steps
### 1. Supabase Setup
- Create project on Supabase dashboard.
- Generate SQL schema for all tables.
- Set up RLS policies.

### 2. Backend Migration
- Install `@supabase/supabase-js`.
- Remove `mongoose`, `firebase-admin`, `bcryptjs`, `jsonwebtoken`.
- Update `authMiddleware.js` to use Supabase.
- Refactor controllers to use Supabase client.

### 3. Frontend Migration
- Install `@supabase/supabase-js`, `@react-native-async-storage/async-storage`, `react-native-url-polyfill`.
- Remove `firebase` client SDK.
- Replace auth logic in `context` or `store`.
- Update API calls to use Supabase client.

## Risks & Considerations
- **Data Integrity:** PostgreSQL is strict about types. MongoDB was flexible.
- **Socket.io vs Supabase Realtime:** Supabase Realtime can replace Socket.io for many things, but if custom complex socket logic exists, it might need translation.
- **File Uploads:** Currently using Cloudinary. Supabase Storage is an alternative, but we'll stick to Cloudinary as per STACK.md unless requested otherwise.
