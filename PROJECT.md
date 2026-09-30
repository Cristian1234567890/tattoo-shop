# Project: Tattoo Hub Platform Expansion & Luxury Studio Polish

## Architecture
- **Frontend**: React 18 SPA built with Vite, Tailwind CSS, React-Leaflet 5 / Leaflet 1.9, Lucide React, and Framer Motion.
- **Backend**: Express + TypeScript in `v2/backend/`, Supabase client / PostgreSQL database with RLS policies, migrations in `v2/backend/migrations`, and Supabase Storage.
- **E2E Testing**: Dual Track test runner: Node.js ESM TypeScript test runner + Playwright Headless CI suite in `v2/e2e/`.

## Code Layout
- `v2/frontend/src/components/common/`: Shared UI (`Logo.tsx`, `Navbar.tsx`, `Footer.tsx`, `PageTransition.tsx`, `Skeleton.tsx`, `InternationalPhoneInput.tsx`).
- `v2/frontend/src/components/hub/`: Hub components (`HubSkeleton.tsx`, map overlays).
- `v2/frontend/src/components/client/`: Client dashboard components (`ClientHeroHeader.tsx`, `ClientTabsNav.tsx`, `tabs/TattoosOverviewTab.tsx`, `tabs/ClientSettingsTab.tsx`, `tabs/ClientSecurityTab.tsx`).
- `v2/frontend/src/components/tattoo/`: Progress components (`TattooTimeline.tsx`, `UploadProgressModal.tsx`, `ProgressDetailModal.tsx`).
- `v2/frontend/src/pages/`: Page views (`HomePage.tsx`, `AboutPage.tsx`, `ArtistsHubPage.tsx`, `ArtistProfilePage.tsx`, `ClientDashboardPage.tsx`, `ClientProfilePage.tsx`, `DashboardPage.tsx`).
- `v2/frontend/src/utils/`: Utilities (`whatsapp.ts`, `geo.ts`, `storage.ts`).
- `v2/frontend/src/App.tsx`: Routing, navigation gates, AnimatePresence transitions.
- `v2/backend/migrations/`: Database SQL migrations (`06_contact_whatsapp.sql`, `07_tattoo_progress.sql`, `08_client_preferences.sql`).
- `v2/backend/src/services/`: Backend logic (`user.service.ts`, `tattoo.service.ts`, `progress.service.ts`).
- `v2/backend/src/routes/`: Express endpoints (`tattoo.routes.ts`, `user.routes.ts`, `progress.routes.ts`).
- `v2/e2e/`: E2E test suites, Playwright headless CI config (`playwright.config.ts`), and specs (`tests/hub_audit.spec.ts`, `tests/client_dashboard_storage.spec.ts`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Pure SVG Logo | Stylized vector tattoo machine emblem + typography in `Logo.tsx` & favicon `logo.svg` | M1 | ORIGINAL_REQUEST R1 (Prior) |
| 2 | Transparent Header | Glassmorphic / body-style header with floating action buttons in `Navbar.tsx` | M1 | ORIGINAL_REQUEST R1 (Prior) |
| 3 | Responsive Mobile Nav | Hamburger toggle button and animated mobile drawer menu | M1 | ORIGINAL_REQUEST R1 (Prior) |
| 4 | Framer Motion Scroll Animations | Scroll reveals and staggered entrance on Hero, Benefits, and Pricing in `HomePage.tsx` | M1 | ORIGINAL_REQUEST R1 (Prior) |
| 5 | Independent "Sobre Nosotros" Route | Create `AboutPage.tsx`, route at `/about`, add to `exemptPaths` in `App.tsx` | M1 | ORIGINAL_REQUEST R1 (Prior) |
| 6 | Depuración del Footer | Clean dark footer with links to `/about`, `/legal/*`, `/hub`, and brand mission | M1 | ORIGINAL_REQUEST R1 (Prior) |
| 7 | Full i18n & Text Generalization | Replace Panama-specific mentions across 10 frontend files with international phrasing | M1 | ORIGINAL_REQUEST R1 (Prior) |
| 8 | Database Migration for Contact | Add `country`, `city`, `phone_prefix`, and `whatsapp_number` in `06_contact_whatsapp.sql` | M2 | ORIGINAL_REQUEST R2 (Prior) |
| 9 | Backend Contact Sync & Lookup | Update `user.service.ts` to sync fields and add `GET /gettatto/:id` | M2 | ORIGINAL_REQUEST R2 (Prior) |
| 10 | InternationalPhoneInput Component | Reusable dial prefix dropdown (`+507`, `+57`, `+52`, `+1`, `+34`) + `type="tel"` input | M2 | ORIGINAL_REQUEST R2 (Prior) |
| 11 | Dynamic WhatsApp URL Generator | Utility `whatsapp.ts` to construct clean `https://wa.me/<digits>` URLs | M2 | ORIGINAL_REQUEST R2 (Prior) |
| 12 | Dual-Mode ArtistProfilePage | Public profile view for clients with prominent WhatsApp button vs Edit view for artist | M2 | ORIGINAL_REQUEST R2 (Prior) |
| 13 | ArtistCard WhatsApp Integration | Render direct WhatsApp button on catalog cards | M2 | ORIGINAL_REQUEST R2 (Prior) |
| 14 | Fix /hub Artist Data Mapping | Fix `artist.data` property mapping and empty database fallback dataset | M3 | ORIGINAL_REQUEST R3 (Prior) |
| 15 | Functional /hub Style Filters | Connect style filter buttons to dynamically filter displayed artists | M3 | ORIGINAL_REQUEST R3 (Prior) |
| 16 | Automatic Browser GPS Geolocation | Request GPS permission, capture user coords, handle denial gracefully | M3 | ORIGINAL_REQUEST R3 (Prior) |
| 17 | Dynamic Map Re-centering | Child component `MapRecenter` with `useMap().flyTo()` to center map on user GPS | M3 | ORIGINAL_REQUEST R3 (Prior) |
| 18 | Pulsing User GPS Marker | Custom Leaflet `divIcon` showing user location with animated pulse effect | M3 | ORIGINAL_REQUEST R3 (Prior) |
| 19 | Proximity Recommendations | Haversine formula + city dictionary to sort and recommend nearest artists | M3 | ORIGINAL_REQUEST R3 (Prior) |
| 20 | WhatsApp Link in /hub Popups & Drawer | Allow direct WhatsApp contact from interactive map markers | M3 | ORIGINAL_REQUEST R3 (Prior) |
| 21 | Comprehensive E2E Test Suite | Automated tests for Logo, Header, Animations, About, WhatsApp, /hub GPS | M4 | Acceptance Criteria (Prior) |
| 22 | Forensic Integrity & UI/UX Audit | Verification of authentic implementation without shortcuts or cheats | M5 | Acceptance Criteria (Prior) |
| 23 | Seamless Navigation & PageTransition | Motion wrapper `PageTransition.tsx` with `<AnimatePresence mode="wait">` in `App.tsx` | M6 | ORIGINAL_REQUEST R1 (Current) |
| 24 | Fix Navigation Bounces & Deep Linking | Point Card 3 in ClientDashboardPage to `/hub`; clean redirect `/profile` -> `/client-dashboard?tab=configuracion` | M6 | ORIGINAL_REQUEST R1 (Current) |
| 25 | Glassmorphic Shimmer Skeletons | Skeleton loaders (`Skeleton.tsx`, `HubSkeleton.tsx`, Dashboard skeleton) replacing raw spinners | M6 | ORIGINAL_REQUEST R1 (Current) |
| 26 | Luxury Obsidian Aesthetic Polish | Deep obsidian `#090d16` in `globals.css`, tactile micro-interactions on filter pills & cards | M6 | ORIGINAL_REQUEST R1 (Current) |
| 27 | Unified 3-Tab Client Dashboard | Rebuilt `ClientDashboardPage.tsx` with tabs (`overview`, `configuracion`, `seguridad`) and URL query param sync | M7 | ORIGINAL_REQUEST R2 (Current) |
| 28 | Client Profile Customization | Avatar upload to Supabase Storage + preset styles, identity inputs, phone with WhatsApp preview | M7 | ORIGINAL_REQUEST R2 (Current) |
| 29 | Notification Preferences Management | Granular toggles for email (appointments, chat, care, promos) and in-app (sounds, push, alerts) | M7 | ORIGINAL_REQUEST R2 (Current) |
| 30 | Multi-language Selector (ES/EN) | Reactive language selector with instant client UI translation | M7 | ORIGINAL_REQUEST R2 (Current) |
| 31 | Password Management & Strength Meter | Password update flow with 4-level color strength meter & GoTrue / backend sync | M7 | ORIGINAL_REQUEST R2 (Current) |
| 32 | Active Sessions UI & Revocation | Live device detection (`navigator.userAgent`), remote session list, individual and global revocation | M7 | ORIGINAL_REQUEST R2 (Current) |
| 33 | Account Privacy Controls | Public/private profile visibility toggle, artist photo sharing permissions, analytics consent | M7 | ORIGINAL_REQUEST R2 (Current) |
| 34 | Database Migration `tattoo_progress` | SQL DDL `07_tattoo_progress.sql` with client_id, artist_id, stage, image_url, notes, indexes, RLS | M8 | ORIGINAL_REQUEST R3 (Current) |
| 35 | Supabase Storage Bucket Setup | Configure `tattoo-progress` bucket (public read CDN, authenticated client write RLS) | M8 | ORIGINAL_REQUEST R3 (Current) |
| 36 | Backend Progress Service & Routes | Express routes (`/progress`) and service (`progress.service.ts`) with client VIP checks | M8 | ORIGINAL_REQUEST R3 (Current) |
| 37 | Interactive Tattoo Progress Timeline | `TattooTimeline.tsx` with glowing vertical spine, stage filtering, chronological session cards | M8 | ORIGINAL_REQUEST R3 (Current) |
| 38 | Progress Upload & Detail Lightbox | Modals for photo upload with drag-and-drop & live preview, and photo detail lightbox with artist chat | M8 | ORIGINAL_REQUEST R3 (Current) |
| 39 | Headless Playwright CI Configuration | Setup `@playwright/test`, `playwright.config.ts` (silent background execution, webServer, reporting) | M9 | ORIGINAL_REQUEST R1 & Criteria |
| 40 | Comprehensive Playwright /hub E2E Spec | `hub_audit.spec.ts` testing map load, GPS emulation, style filters, cards, and WhatsApp links | M9 | ORIGINAL_REQUEST R1 & Criteria |
| 41 | Playwright Client Dashboard & Storage Spec | `client_dashboard_storage.spec.ts` testing tabs, settings, security, and photo upload | M9 | ORIGINAL_REQUEST R2/R3 & Criteria |
| 42 | Adversarial Coverage Hardening | Tier 5 white-box edge case testing and robustness verification | M10 | Project Pattern Acceptance |
| 43 | Forensic Integrity & Luxury UI/UX Audit | Forensic auditor checks against shortcuts, mocks, or cheating + UX certification | M10 | Project Pattern Acceptance |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Branding, Header, Landing & i18n | Features 1-7 (Logo, Header, Nav, Framer Motion, AboutPage, Footer, i18n) | none | DONE |
| 2 | M2: Contact & WhatsApp Integration | Features 8-13 (Migration, Backend sync, PhoneInput, WhatsApp button, Dual-mode profile) | M1 | DONE |
| 3 | M3: Interactive /hub Map & Geolocation | Features 14-20 (/hub refactor, GPS geolocation, MapRecenter, Haversine sorting, Drawer) | M2 | DONE |
| 4 | M4: E2E Test Suite (Dual Track) | Feature 21 (Tier 1-4 tests covering all 20 features) | M1, M2, M3 | DONE |
| 5 | M5: Forensic Integrity & UI/UX Audit | Feature 22 (Forensic Auditor & UI/UX review) | M4 | DONE |
| 6 | M6: Luxury Studio Navigation & UX Polish | Features 23-26 (PageTransition, Bounce Fix, Shimmer Skeletons, Obsidian Theme) | M1-M5 | DONE |
| 7 | M7: Client Dashboard Rebuild (Tabs, Settings, Security) | Features 27-33 (Unified Dashboard, Tabs, Profile, Notifications, Language, Security, Sessions) | M6 | DONE |
| 8 | M8: Tattoo Progress Timeline & Supabase Storage | Features 34-38 (SQL Migration, Bucket, Progress Service, Timeline, Upload/Detail Modals) | M7 | DONE |
| 9 | M9: Headless Playwright CI E2E Suite | Features 39-41 (Playwright Config, Hub Audit Spec, Client Dashboard & Storage Spec) | M6, M7, M8 | DONE |
| 10 | M10: Adversarial Hardening & Forensic Audit | Features 42-43 (Tier 5 Whitebox Testing & Forensic Integrity Audit) | M9 | PLANNED |

## Interface Contracts
### Common ↔ Router: `PageTransition.tsx`
- Component: `PageTransition: React.FC<{ children: React.ReactNode }>`
- Wraps routed pages with Framer Motion enter/exit opacity and translation.

### Common ↔ Skeletons: `Skeleton.tsx` & `HubSkeleton.tsx`
- Component: `Skeleton: React.FC<{ className?: string }>`
- Shimmer glassmorphic placeholders for cards, avatars, and text lines.

### Client Dashboard ↔ Tabs
- Component: `ClientTabsNav: React.FC<{ activeTab: 'overview' | 'configuracion' | 'seguridad'; onTabChange: (tab: string) => void }>`
- URL Query Param: `?tab=overview|configuracion|seguridad`

### Client ↔ Tattoo Progress: `TattooTimeline.tsx`
- Component: `TattooTimeline: React.FC<{ clientId: string; isVip?: boolean; onAddProgress?: () => void }>`
- Data schema: `TattooProgressEntry` (`id`, `client_id`, `artist_id`, `title`, `stage`, `image_url`, `notes`, `created_at`)

### Storage ↔ Supabase Bucket: `tattoo-progress`
- Bucket: `tattoo-progress` (public: true, allowed mime types: `image/jpeg`, `image/png`, `image/webp`)
- Path format: `${clientId}/${Date.now()}_${filename}`

### E2E ↔ Playwright: `playwright.config.ts`
- Headless execution with zero GUI windows
- WebServer target: `http://localhost:5173`
- Geolocation emulation: `{ latitude: 8.9824, longitude: -79.5199 }` (Panama City)
