# 🖋️ Tattoo Hub — Project Final Documentation

> **Release**: `v1.0.0` | **Tag**: `release/v1.0.0`
> **Production URL**: [https://tattoo-hub.vercel.app](https://tattoo-hub.vercel.app)
> **Repository**: [Cristian1234567890/tattoo-shop](https://github.com/Cristian1234567890/tattoo-shop)

---

## Architecture Overview

```
tattoo-shop/
├── v2/
│   ├── frontend/          # React 18 + TypeScript + Vite SPA
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── auth/           # OnboardingModal, SubscriptionNoticeModal
│   │   │   │   ├── client/         # ClientHeroHeader, ClientTabsNav, tabs/
│   │   │   │   ├── common/         # Navbar, Footer, Logo, Skeleton, PageTransition
│   │   │   │   ├── hub/            # HubSkeleton (shimmer loading)
│   │   │   │   ├── tattoo/         # TattooTimeline, UploadProgressModal, ProgressDetailModal
│   │   │   │   └── dashboard/      # ArtistCard, StyleFilter
│   │   │   ├── pages/              # HomePage, LoginPage, RegisterPage, ArtistsHubPage, etc.
│   │   │   ├── context/            # AuthContext, ThemeContext
│   │   │   ├── utils/              # geo.ts, storage.ts, whatsapp.ts
│   │   │   └── api/                # client.ts (Axios HTTP client)
│   │   └── vercel.json
│   ├── backend/           # Express + TypeScript REST API
│   │   ├── src/
│   │   │   ├── controllers/        # auth, user, tattoo, subscription, mail
│   │   │   ├── services/           # auth, user, tattoo, subscription, paypal, progress, mail
│   │   │   ├── middlewares/        # auth, error, subscription
│   │   │   ├── routes/             # auth, user, tattoo, subscription, progress, mail
│   │   │   └── config/             # env.ts, supabase.ts
│   │   └── migrations/    # 01-07 SQL migrations
│   └── e2e/               # Playwright + custom E2E test suites
│       ├── tests/                  # hub_audit.spec.ts, client_dashboard_storage.spec.ts
│       ├── playwright.config.ts
│       └── tier1-4 coverage/       # Feature, boundary, cross-feature, real-world tests
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Framer Motion, react-leaflet |
| Backend | Express.js, TypeScript |
| Database | Supabase (PostgreSQL) with RLS |
| Storage | Supabase Storage (bucket: `tattoo-progress`) |
| Auth | Supabase GoTrue (Email + Google OAuth) |
| Payments | PayPal REST API (Sandbox + Live) |
| Deployment | Vercel (Frontend), Render/Railway (Backend) |
| E2E Testing | Playwright (headless Chromium CI) |

## Database Migrations

| # | Migration | Description |
|---|---|---|
| 01 | `01_init.sql` | Base tables, initial schema |
| 02 | `02_rls_security_policies.sql` | Row Level Security policies for all tables |
| 03 | `03_user_profiles.sql` | User profiles with role, legal acceptance, onboarding |
| 04 | `04_chat_messages.sql` | Internal chat messaging system |
| 05 | `05_subscription_fields.sql` | Subscription tracking (trial, active, expired) |
| 06 | `06_contact_whatsapp.sql` | WhatsApp number, phone prefix, country/city fields |
| 07 | `07_tattoo_progress.sql` | Tattoo progress gallery, Supabase Storage bucket, RLS policies |

## Key Features

### 🎨 Premium Dark Mode UI (Estudio de Lujo)
- Deep obsidian background (`#090d16`) with glassmorphic elements
- Framer Motion `AnimatePresence` page transitions
- Shimmer skeleton loaders (`HubSkeleton`, `Skeleton`)
- Micro-interactions on hover/click for cards and filter pills

### 🗺️ Interactive Artist Hub (`/hub`)
- `react-leaflet` map with artist markers and anti-clustering jitter
- Browser GPS auto-centering with `navigator.geolocation`
- Haversine distance-based proximity recommendations
- Style filters (Traditional, Realistic, Watercolor, etc.)
- WhatsApp direct contact button per artist (`wa.me/<number>`)

### 👤 Client Dashboard (`/client-dashboard`)
- **Overview Tab**: Session overview, direct Hub link, Tattoo Progress Timeline
- **Settings Tab**: Avatar picker, notification preferences, language switcher, phone input
- **Security Tab**: Password manager with 4-bar strength meter, device session viewer, privacy toggles

### 📸 Tattoo Progress Gallery
- Real photo uploads via Supabase Storage bucket (`tattoo-progress`, 50MB limit)
- Interactive timeline with stage chips (Cleaning, Healing, Settled, etc.)
- Artist tagging and session notes
- Full-screen detail modal for high-res viewing
- RLS-enforced: clients see their own, tagged artists see their clients'

### 💳 Subscription System
- **Tattoo Artists**: 90-day free trial → mandatory monthly/annual subscription
- **Clients**: Free basic access → optional premium subscription (same pricing)
- PayPal REST API integration (Sandbox + Live credentials configured)
- `subscription.middleware.ts` blocks expired artists from commercial features

### 🔐 Authentication & Onboarding
- Email/Password + Google OAuth via Supabase GoTrue
- Mandatory onboarding flow for new users (role selection + legal acceptance)
- Dynamic redirect: `/client-dashboard` (clients) or `/artist-dashboard` (artists)
- Legal timestamp audit trail (`legal_accepted_at`)

### 🧪 E2E Testing (Playwright)
- Headless Chromium CI suite in `v2/e2e/`
- `hub_audit.spec.ts`: Map rendering, GPS, filters, artist cards
- `client_dashboard_storage.spec.ts`: Tab navigation, settings, security, progress timeline
- 4-tier test coverage: Feature → Boundary → Cross-feature → Real-world

## Running Locally

### Prerequisites
- Node.js >= 18
- npm >= 9

### Frontend
```bash
cd v2/frontend
npm install
npm run dev          # Development server at http://localhost:5173
npm run build        # Production build
```

### Backend
```bash
cd v2/backend
npm install
npm run dev          # Development server at http://localhost:3000
npm run build        # TypeScript compilation
```

### E2E Tests
```bash
cd v2/e2e
npm install
npx playwright install chromium
npm run test:playwright:ci    # Headless Playwright suite
```

## Environment Variables

### Frontend (`v2/frontend/.env`)
```
VITE_SUPABASE_URL=https://mftthukphffirdcoqprz.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_key>
VITE_API_URL=<backend_url>
```

### Backend (`v2/backend/.env`)
```
SUPABASE_URL=https://mftthukphffirdcoqprz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
PAYPAL_CLIENT_ID=<paypal_client_id>
PAYPAL_SECRET=<paypal_secret>
PAYPAL_MODE=sandbox|live
PORT=3000
```

> ⚠️ **IMPORTANT**: Never commit `.env` files to the repository. All secrets are managed via environment variables on Vercel and your backend hosting provider.

## Security Policies

- **Row Level Security (RLS)**: Enabled on all public tables (`user_profiles`, `tattoo_progress`, `messages`)
- **Storage Policies**: Users can only upload/modify files in their own `${auth.uid()}/` subfolder
- **Service Role**: Full bypass for backend orchestration only (never exposed to frontend)
- **CORS**: Configured in Express middleware
- **Input Validation**: Server-side sanitization on all API endpoints

---

*Generated: 2026-09-30 | Tattoo Hub v1.0.0 — Premium Studio Release*
