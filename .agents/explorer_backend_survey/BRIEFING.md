# BRIEFING — 2026-09-23T23:36:20Z

## Mission
Survey reference backend implementation (entry points, middleware, endpoints, business logic, integrations, env vars) and formulate an architectural plan for Express/Node.js + TypeScript in v2/backend.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigator, synthesizer
- Working directory: c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\explorer_backend_survey
- Original parent: d512e0de-1504-4fc8-9dda-bf5fa0c144bf
- Milestone: Backend Survey & v2 TypeScript Architecture Plan

## 🔒 Key Constraints
- Read-only investigation — do NOT implement or modify application code files
- Write all notes, progress, and findings only inside .agents/explorer_backend_survey

## Current Parent
- Conversation ID: d512e0de-1504-4fc8-9dda-bf5fa0c144bf
- Updated: 2026-09-23T23:36:20Z

## Investigation State
- **Explored paths**:
  - `backend/backend/` (`app.js`, `auth.js`, `paypal.js`, `mail.js`, `mail-template.js`, `tattoo.js`, `user-subscription.js`, `utils.js`, `package.json`, `.env`, `Dockerfile`)
  - `frontend/JS/` (`user.js`, `tattoo.js`, `profile.js`, `login.js`, `register.js`, `creditcard.js`, `tattoocard.js`)
  - `frontend/Pages/` (`index.html`, `logIn.html`, `register.html`, `changePassword.html`, `forgetPassword.html`, `profile.html`, `tattoo.html`, `user.html`)
  - Supabase connectivity test (`mftthukphffirdcoqprz.supabase.co` via service role key & MCP tools)
- **Key findings**:
  - Exactly 12 endpoint paths / 14 HTTP handlers identified.
  - Critical response convention: almost all endpoints return `{ success: true, data }` or `{ success: false, error }` with HTTP 200, except `/mail` which returns plain text string with HTTP 200/500.
  - Port discrepancies: `3850` in `app.js`, `8080` in frontend AJAX, `3100` in Dockerfile. Default in v2 must be configurable with `8080` default.
  - Supabase database in project `mftthukphffirdcoqprz` currently has empty public schema (needs `tatuadores_data` and `user_subscription` tables created, and `user_profile` storage bucket created).
  - Auth uses Supabase GoTrue with TOTP 2FA.
  - Email notification compiles an HTML template and attaches image to email sent to artist.
  - PayPal integrates OAuth2, product creation, and monthly plan billing ($1.99/mo). Placeholders required (`PAYPAL_KEY=pendiente`).
- **Unexplored areas**: None. Reference backend fully investigated.

## Key Decisions Made
- Architecture for v2/backend will use clean layered Express + TypeScript: `routes/`, `controllers/`, `services/`, `middlewares/`, `config/`, `types/`, `templates/`, `utils/`.
- Response formatters will preserve exact compatibility with reference backend (`{ success: boolean, data/error }` and `/mail` text responses).
- Supabase SQL DDL and Storage Bucket configuration documented in handoff.

## Artifact Index
- DISPATCH.md — Initial dispatch prompt
- progress.md — Heartbeat and step progress tracking
- BRIEFING.md — Persistent memory
- inspect_mail.js — Script used to inspect template variables in `mail-template.js`
- check_supabase.js — Script used to verify schema in new Supabase instance
- check_old_supabase.js — Script used to test old Supabase endpoint
- handoff.md — Final comprehensive survey report
