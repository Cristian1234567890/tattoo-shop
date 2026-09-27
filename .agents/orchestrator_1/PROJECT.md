# Project: Tattoo Shop V2 Modernization

## Architecture
- **Overview**: Complete architectural refactor and rebuild of the Tattoo Shop application inside `v2/`.
- **Target Directories**:
  - Frontend SPA: `c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\v2\frontend`
  - Backend API: `c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\v2\backend`
  - E2E Tests: `c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\v2\e2e`
- **Tech Stack**:
  - Frontend: React 18+ / Vite + TypeScript + React Router + Tailwind CSS / SCSS modules + Lucide icons.
  - Backend: Node.js + Express + TypeScript + `@supabase/supabase-js` + `nodemailer` + `axios` (PayPal REST).
  - Database: PostgreSQL on Supabase (`https://mftthukphffirdcoqprz.supabase.co`).
  - Storage: Supabase Storage bucket `user_profile`.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | DB DDL Migration | Create `tatuadores_data`, `user_subscription` tables and `user_profile` storage bucket in Supabase | M1 | specminer |
| 2 | Backend Server Setup | Express 4 + TypeScript, 50MB body limit, CORS, typed error middleware, port 8080 default | M2 | backend survey |
| 3 | Auth Sign In | `POST /login` via Supabase Auth email/password, returning user & session | M2 | specminer |
| 4 | Auth Sign Up | `POST /register` with user metadata, role selection, auto-insert into `tatuadores_data` for artists | M2 | specminer |
| 5 | Auth Sign Out | `POST /logout` with Supabase session invalidation | M2 | specminer |
| 6 | MFA TOTP Enroll | `POST /enroll` generating TOTP secret & QR code | M2 | specminer |
| 7 | MFA TOTP Verify | `POST /verify2fa` verifying TOTP challenge code | M2 | specminer |
| 8 | User Profile Update | `POST /updateuser` updating auth metadata & syncing `tatuadores_data` for artists | M2 | specminer |
| 9 | User Avatar Upload | `POST /updateuserimg` decoding base64 image, uploading to `user_profile` bucket, generating signed URL | M2 | specminer |
| 10 | Artist Public Catalog | `GET /gettatto` querying public artist profiles from `tatuadores_data` | M2 | specminer |
| 11 | PayPal Catalog Product | `POST /createproduct` creating PayPal Sandbox product with `PAYPAL_KEY=pendiente` fallback | M2 | specminer |
| 12 | PayPal Subscription Plan | `POST /subscribe` creating monthly $1.99 plan with fallback | M2 | specminer |
| 13 | PayPal Subscription Query | `GET /paypalsubscription/:id` retrieving plan status | M2 | specminer |
| 14 | User Subscription Query | `GET /usersubscription/:id` fetching user subscription binding | M2 | specminer |
| 15 | User Subscription Store | `POST /usersubscription` persisting subscription mapping in DB | M2 | specminer |
| 16 | Contact Email Dispatch | `POST /mail` sending inquiry with message & base64 attachment via Nodemailer | M2 | specminer |
| 17 | Frontend SPA Shell | Vite + React + TypeScript SPA setup, routing, header/navbar, footer, theme switcher | M3 | frontend survey |
| 18 | Theme Toggle | Dark/Light theme toggle with animated SVG Sun & Moon icons | M3 | frontend survey |
| 19 | Landing Page | Hero banner ("Bienvenido a TooTienda más confiable"), nav links, auth entry buttons, footer | M3 | frontend survey |
| 20 | Login View | Email & password form, validation, session storage, TOTP 2FA modal (`#mensajeEmergente`) | M3 | frontend survey |
| 21 | Register View | Registration form with role selector, TOTP QR modal (`#ventanaQR`), subscription modal, PayPal button | M3 | frontend survey |
| 22 | Password Recovery | Password reset request (`/forget-password`) and reset form (`/change-password`) | M3 | frontend survey |
| 23 | User Dashboard | Style filter checkboxes, search bar ("Buscar tatuador"), dynamic artist card grid, off-canvas menu | M3 | frontend survey |
| 24 | Artist Profile Card | Circular glowing avatar, name, location, metrics row, social links, action buttons ("Mensaje", "Seguir") | M3 | frontend survey |
| 25 | Artist Inquiry Drawer | Expandable inquiry form on card with textarea, drag & drop zone, file upload, invoking `/mail` | M3 | frontend survey |
| 26 | Client Profile View | Avatar upload preview, personal info, Panamanian province select, update via `/updateuser` | M3 | frontend survey |
| 27 | Artist Profile View | Avatar upload, specialization, social links, location, credentials syncing to `tatuadores_data` | M3 | frontend survey |
| 28 | 3D Credit Card Simulator | 3D interactive flip card (number, holder, expiry, CVV flip) and credit card payment form | M3 | frontend survey |
| 29 | E2E Backend Test Suite | Automated API test harness executing cURL/HTTP requests against all 14 endpoints | M4 | E2E track |
| 30 | E2E Frontend Test Suite | Automated DOM/UI structural inspection and `npm run build` verification | M4 | E2E track |
| 31 | Full E2E & Forensic Audit | Verification of 100% test pass rate and clean Forensic Auditor verdict | M5 | audit gate |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Database Provisioning | Supabase DDL execution (`tatuadores_data`, `user_subscription`, `user_profile` bucket, RLS) | none | DONE |
| M2 | Backend Rebuild (Express + TS) | Complete `v2/backend` implementation, TypeScript types, routes, controllers, services | M1 | DONE |
| M3 | Frontend Rebuild (React + TS) | Complete `v2/frontend` Vite+React+TS SPA, all views, components, styles, API integration | M1 | DONE |
| M4 | E2E Test Suite Development | Independent opaque-box test runner in `v2/e2e` covering Tiers 1-4 | M1 | DONE |
| M5 | Integration & Forensic Audit | 100% E2E test pass, independent UI auditor verification, clean integrity forensic audit | M2, M3, M4 | IN_PROGRESS |

## Interface Contracts
### Frontend (`v2/frontend`) ↔ Backend (`v2/backend`)
- Base URL: `http://localhost:8080` (configured via `VITE_API_URL` with default `http://localhost:8080`)
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>`
  - `refresh_token: <refresh_token>` (backend also accepts `refresh` header)
- Response Envelope:
  - Success: `{ "success": true, "data": <T> }`
  - Error: `{ "success": false, "error": <ErrorPayload> }`
  - Special endpoints: `/mail` returns plain text with HTTP 200/500; PayPal endpoints return PayPal JSON objects.

### Backend (`v2/backend`) ↔ Supabase Database (`mftthukphffirdcoqprz`)
- Tables:
  - `public.tatuadores_data`: `id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, data JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ`
  - `public.user_subscription`: `id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, product_id TEXT, subscription_id TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ`
- Storage:
  - Bucket: `user_profile` (public read, authenticated insert/update at `${userId}/profile.png`).

## Code Layout
### `v2/backend/`
- `package.json`, `tsconfig.json`, `.env.example`, `.env`
- `src/`
  - `index.ts` (entry point, port binding 8080)
  - `app.ts` (Express setup, CORS, body-parser 50MB, routes mounting, error handling)
  - `config/` (environment variables, Supabase client initialization)
  - `middlewares/` (auth extraction, error handler, validation)
  - `routes/` (`auth.routes.ts`, `user.routes.ts`, `tattoo.routes.ts`, `subscription.routes.ts`, `mail.routes.ts`)
  - `controllers/` (`auth.controller.ts`, `user.controller.ts`, `tattoo.controller.ts`, `subscription.controller.ts`, `mail.controller.ts`)
  - `services/` (`supabase.service.ts`, `paypal.service.ts`, `mail.service.ts`)
  - `types/` (TypeScript interfaces for requests, responses, models, Supabase schema)
  - `templates/` (mail HTML template)

### `v2/frontend/`
- `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `tailwind.config.js`
- `src/`
  - `main.tsx`, `App.tsx`
  - `types/` (API responses, user metadata, artist model, style categories)
  - `services/` (typed API client, auth service, user service, mail service, subscription service)
  - `context/` (AuthContext, ThemeContext)
  - `components/`
    - `common/` (Navbar, Footer, ThemeToggle, Modal, Button, Input)
    - `auth/` (LoginForm, RegisterForm, TwoFactorModal, QrModal, SubscriptionNoticeModal)
    - `dashboard/` (StyleFilter, SearchBar, ArtistCard, OffCanvasMenu)
    - `inquiry/` (InquiryModal, DragDropZone)
    - `profile/` (ClientProfileForm, ArtistProfileForm, AvatarUploader)
    - `creditcard/` (FlipCreditCard, CreditCardForm)
  - `pages/` (HomePage, LoginPage, RegisterPage, DashboardPage, ClientProfilePage, ArtistProfilePage, CreditCardPage, ForgetPasswordPage, ChangePasswordPage)
  - `assets/` (images, icons migrated from `frontend/Img/`)
  - `styles/` (global CSS, animations: panning background, 3D flip card, glowing cards)
