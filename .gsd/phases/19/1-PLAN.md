---
phase: 19
plan: 1
wave: 1
---

# Plan 19.1: Enforce Helmet Headers, Strict CORS, and Rate-Limiting

## Objective
Harden network and API security boundaries inside Express application core. Install secure Helmet headers, prevent wild-card CORS configurations, and deploy strict and general rate-limiters.

## Context
- `e:\studentsociety\backend\src\server.ts`

## Tasks

<task type="auto">
  <name>Harden Server Security Configuration</name>
  <files>
    e:\studentsociety\backend\src\server.ts
  </files>
  <action>
    - Import `helmet` and `rateLimit` inside `e:\studentsociety\backend\src\server.ts`.
    - Configure robust CORS rules replacing raw `app.use(cors())` with a strict configuration allowing specific local/expo/production domains, or permitting authorization headers dynamically.
    - Mount `helmet` middleware to set essential HTTP headers (like CSP, Frame Options, etc.).
    - Define a strict auth rate-limiter: 15 attempts max per 15 minutes, blocking password guessers.
    - Define a general API rate-limiter: 100 requests per 15 minutes, mitigating DDoS/scraping attempts.
  </action>
  <verify>test -f "e:\studentsociety\backend\src\server.ts"</verify>
  <done>Helmet headers, strict CORS, and rate limiters registered inside server.ts.</done>
</task>

## Success Criteria
- [ ] Strict CORS overrides standard wildcard domain permissions safely.
- [ ] Helmet middleware registered and rate-limiters applied to auth and general API routes.
