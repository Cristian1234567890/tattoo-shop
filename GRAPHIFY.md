# 🕸️ Graphify Architecture & Requirement Dependency Graph
## Sprint 14: Visual Stabilization, Light Mode Map Fix, Delicate Tattoo Watermark & Navbar Avatar Sync

```mermaid
graph TD
    A[REQ-01: Map Tile Watermark Fix] -->|Leaves no CartoDB watermark| D[ArtistsHubPage Leaflet Layer]
    B[REQ-02: Tattoo Pattern Background] -->|Subtle 10-12% opacity in light mode| E[TattooPatternBackground Component]
    C[REQ-03: Reactive Navbar Avatar] -->|Sincroniza avatar_url con Supabase & Google| F[Navbar & AuthContext]
    
    D --> G[REQ-04: Deep Multi-Screen Audit]
    E --> G
    F --> G
    
    G --> H[Audited Screens]
    H --> H1[/hub - ArtistsHubPage]
    H --> H2[/login - LoginPage]
    H --> H3[/register - RegisterPage]
    H --> H4[/client-dashboard - ClientDashboardPage]
    H --> H5[/artist-dashboard - ArtistDashboardPage]
    H --> H6[/precios - PricingPage]
    H --> H7[/beneficios - BenefitsPage]
    H --> H8[/tienda - ShopPage]
    H --> H9[/artistas - ArtistsDirectoryPage]
    
    G --> I[REQ-05: Automated QA Verification]
    I --> I1[Playwright Sprint 14 Browser Audit]
    I --> I2[Backend Test Suite 86/86 Passing]
    I --> I3[Frontend Production Build TSC + Vite]
    
    I --> J[REQ-06: Jira & Discord Tracking]
    J --> J1[Jira Tickets TH-53, TH-54, TH-55, TH-56]
    J --> J2[Discord Webhooks Notifications]
    
    J --> K[REQ-07: Production Deployment & Git Sync]
    K --> K1[Vercel Production Deploy]
    K --> K2[Git Staging & Desarrollo Synchronization]
```

---

## 📌 Node Specifications & Acceptance Criteria

### Node 1: Map Tile Provider (`ArtistsHubPage.tsx`)
- **Problem**: CartoDB Voyager raster tiles require an API key and display error watermarks ("API KEY REQUIRED carto.com/basemaps/apikey").
- **Fix**: Replace tile layer URL with OpenStreetMap canonical tile server (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`).
- **Styles**: In light mode, no color inversion (`filter: none !important;`). In dark mode, smooth high-contrast dark theme via CSS filter inversion (`invert(1) hue-rotate(180deg) brightness(0.85) contrast(1.1) saturate(0.3)`).
- **Popup & Zoom**: Zoom controls have clean contrast (`bg-white/95 text-slate-800`), popup tips match background, no black boxes in light mode.

### Node 2: Lateral Drawer & Hub Contrast (`ArtistsHubPage.tsx`)
- **Problem**: Resident artist pills, style badges, and contact cards have hardcoded `text-white` or `bg-zinc-950` causing unreadable white-on-white or jarring black boxes.
- **Fix**:
  - Resident pills: `bg-slate-100 hover:bg-slate-200 text-slate-700` when inactive; `bg-violet-600 text-white` when active.
  - Rate texts: `text-violet-700 dark:text-violet-300` for WCAG AA contrast.
  - Independent / Studio badges: `bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300`.
  - Manual location button: `bg-slate-100 hover:bg-slate-200 text-violet-700 dark:bg-zinc-900 dark:text-violet-300`.
  - Type toggle & view toggles: `bg-slate-100 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800`.

### Node 3: Tattoo Pattern Watermark (`TattooPatternBackground.tsx`)
- **Problem**: In light mode, the SVG pattern strokes inherited dark foreground color and rendered at 60% opacity, causing dark lines that competed with login forms.
- **Fix**:
  - Set opacity in light mode to `opacity-[0.10]` (10-12% subtle whisper watermark).
  - Explicit stroke colors: gentle slate gray (`#94a3b8` / `text-slate-400`) in light mode, ethereal violet glow in dark mode.
  - Ensures clean readability and elegance across all screen resolutions without interfering with interactive elements.

### Node 4: Superior Navbar Profile Avatar (`Navbar.tsx`)
- **Problem**: When a user logs in with Google or updates their profile picture in Supabase (`avatar_url`), the top-right navbar pill either failed to load or showed an empty black circle.
- **Fix**:
  - Unified avatar resolution: `navAvatar || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || user?.user_metadata?.profile || user?.user_metadata?.avatar || (user as any)?.avatar_url || (user as any)?.identities?.[0]?.identity_data?.avatar_url || (user as any)?.identities?.[0]?.identity_data?.picture || ''`.
  - Added `referrerPolicy="no-referrer"` to bypass Google CDN HTTP 403 Forbidden checks.
  - Added `avatarError` state to gracefully render `<User className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />` if the image URL fails.
  - Updated avatar container from hardcoded `bg-zinc-800` to `bg-slate-200 dark:bg-zinc-800 border-violet-500/40`.
  - Synchronized across desktop pill, mobile menu, and account dropdown menu.

### Node 5: Comprehensive Light Mode Audit Across All Screens
- **Screens Checked & Refined**:
  - `/hub`: Leaflet tiles, drawer details, style filters, marker popups, action buttons.
  - `/login`: Heading 1, inputs, divider label, Google button, signup callout, 2FA screens.
  - `/register`: Headings, role selector cards, labels, phone prefix input, terms container, trust cards.
  - `/client-dashboard`: Healing stage textarea, cancel button, subtitle breadcrumb.
  - `/artist-dashboard`: Full light mode support for background (`bg-slate-50 dark:bg-gray-900`), hero banner, trial counter, summary bar, and feature cards.
  - `/precios`: Card titles, prices, comparative matrix table, and FAQ accordions.
  - `/beneficios`: Manifesto hero, three guarantees, comparison table, philosophy cards, and CTA.
  - `/tienda`: Hero, category buttons, product cards (`atelier-card` without hardcoded black overrides), and reservation modal.
  - `/artistas`: Filter buttons, resident pills, style chips, flash cards, and WhatsApp buttons.
  - `v2/frontend/src/index.css`: Added global contrast rules for `html.light` headings, labels, inputs, and tables.

### Node 6: Verification & Validation
- Automated Playwright browser audit (`qa_sprint14_browser_audit.mjs`).
- Backend test suite (`npm --prefix v2/backend test`) passing 86/86 tests.
- Frontend build (`npm --prefix v2/frontend run build`) clean without TypeScript errors.

### Node 7: Jira & Discord Tracking
- Creation and transition of Sprint 14 tickets (TH-53, TH-54, TH-55, TH-56).
- Discord notifications sent to `#jira` and `#despliegue_desarrollo`.

### Node 8: Production Deployment & Git Sync
- Deployment to Vercel via CLI.
- Git synchronization to `staging` and `desarrollo`.
