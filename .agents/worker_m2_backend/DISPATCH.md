# Dispatch: Milestone 2 - Backend Modernization (Express + TypeScript)
Target: c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\v2\backend
Original Request: c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\ORIGINAL_REQUEST.md
Project Scope: c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\PROJECT.md
Backend Survey Report: c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\explorer_backend_survey\handoff.md
Spec Miner Report: c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\specminer_api_survey\handoff.md
Database Provisioning Report: c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\worker_m1_db\handoff.md
E2E Test Certification: c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\v2\e2e\TEST_READY.md
Working Directory: c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\worker_m2_backend
Role: Backend Rebuild Worker
Exclusive File Ownership: c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\v2\backend (excluding migrations/01_init.sql)

## 2026-09-23T23:48:41Z
You are worker_m2_backend, a specialized backend implementation worker.
Working directory: c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\worker_m2_backend

MANDATORY: Read ORIGINAL_REQUEST.md at:
c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\ORIGINAL_REQUEST.md
and PROJECT.md at:
c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\PROJECT.md
and backend survey report at:
c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\explorer_backend_survey\handoff.md
and specminer report at:
c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\specminer_api_survey\handoff.md
and database provisioning report at:
c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\worker_m1_db\handoff.md
and E2E test suite certificate at:
c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\v2\e2e\TEST_READY.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your task (Milestone 2 - Backend Modernization):
1. Rebuild the backend from scratch with Express/Node.js + TypeScript inside:
   c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\v2\backend
   Exclusive file ownership: `v2/backend/*` (keep the existing `v2/backend/migrations/01_init.sql` intact).
2. Setup & Configuration:
   - `package.json`: scripts `build` ("tsc"), `start` ("node dist/index.js"), `dev` ("tsx src/index.ts"). Dependencies: `express`, `@supabase/supabase-js`, `cors`, `nodemailer`, `dotenv`, `axios`, `base64-arraybuffer`. DevDependencies: `typescript`, `@types/express`, `@types/cors`, `@types/nodemailer`, `@types/node`, `tsx`.
   - `tsconfig.json`: strict TypeScript configuration, `rootDir: src`, `outDir: dist`, target `ES2022`.
   - `.env` & `.env.example`:
     - `PORT=8080` (default 8080 to match frontend and E2E test suite)
     - `SUPABASE_URL=https://mftthukphffirdcoqprz.supabase.co`
     - `ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdHRodWtwaGZmaXJkY29xcHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxOTY0ODcsImV4cCI6MjEwNTc3MjQ4N30.m1Vv_bbOlYcWZMX0j5_og12eeQt3vAQIiYHos_o7vos`
     - `SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdHRodWtwaGZmaXJkY29xcHJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDE5NjQ4NywiZXhwIjoyMTA1NzcyNDg3fQ.Q4VTaLcphMgsPltdtScZgoz0QKBuZprf18vjguqpadA`
     - `PAYPAL_KEY=pendiente`
     - `PAYPAL_ID=pendiente`
     - `EMAIL=dummy@gmail.com`
     - `PASSW=dummy_pass`
3. Architecture & Routes (100% contract parity):
   - Express app with 50MB body limit (`express.json({ limit: '50mb' })`, `express.urlencoded({ limit: '50mb', extended: true })`) and `cors()`.
   - Safe auth extraction middleware handling `Authorization: Bearer <token>` and `refresh_token` (or `refresh`), returning clean 401 on missing auth instead of crashing.
   - All 14 endpoints:
     - `POST /login`: authenticate with Supabase Auth -> `{ success: true, data: { user, session } }` or `{ success: false, error }`.
     - `POST /register`: register user with user_metadata, and if `tipo === 'Tatuador'`, insert into `public.tatuadores_data`.
     - `POST /logout`: terminate Supabase session.
     - `POST /enroll`: Supabase TOTP MFA enrollment -> returns QR code / secret.
     - `POST /verify2fa`: Supabase TOTP challenge & verify.
     - `POST /updateuser`: update user metadata and sync `tatuadores_data` for artists.
     - `POST /updateuserimg`: decode base64, upload to storage `user_profile/${user.id}/profile.png`, generate 1-year signed URL, update metadata and `tatuadores_data`.
     - `GET /gettatto`: query all artist profiles from `public.tatuadores_data`.
     - `POST /createproduct`: PayPal product creation with fallback/mock simulation when `PAYPAL_KEY=pendiente`.
     - `POST /subscribe`: PayPal plan creation ($1.99/mo) with fallback simulation when `PAYPAL_KEY=pendiente`.
     - `GET /paypalsubscription/:id`: PayPal plan details query.
     - `GET /usersubscription/:id`: query user subscription from `public.user_subscription`.
     - `POST /usersubscription`: insert `{ id, product_id, subscription_id }` into `public.user_subscription`.
     - `POST /mail`: Nodemailer email dispatch with attached base64 image, returning plain text "Mensaje enviado" (200) or "Error al enviar correo" (500).
4. Build & Verification:
   - Run `npm run build` (`tsc`). Ensure zero compilation/type errors.
   - Start the backend server and verify with healthcheck / endpoint queries.
   - Run the E2E test suite in `v2/e2e` (`npm test`) against the server to confirm endpoint behavior.
5. Documentation & Handoff:
   - Update `c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\worker_m2_backend\progress.md`
   - Write comprehensive report to `c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\worker_m2_backend\handoff.md`
6. Message orchestrator when completed.
