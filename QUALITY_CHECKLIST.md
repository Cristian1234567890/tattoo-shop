# QUALITY CHECKLIST — TATTOO HUB PLATFORM (PLAYWRIGHT QA AUDIT)

**Audit Version**: 2.0.0 (Milestone 14 Final QA)  
**Lead Auditor Role**: `worker_m14_qa`  
**Framework**: Playwright Headless CI Suite (`@playwright/test`)  
**Date**: 2026-10-06  
**Status**: Comprehensive Master Checklist  

---

## 1. Executive Summary & Audit Scope

This document establishes the comprehensive quality verification criteria for the **Tattoo Hub Platform Expansion & Luxury Studio Polish**. It audits every screen, button, interactive flow, currency conversion mechanism, studio hierarchy structure, guest gating protection, and conditional footer layout across both desktop and mobile viewports.

---

## 2. Screen-by-Screen Audit Matrix

| # | Screen Name | Route(s) | Key Interactive Elements / Buttons | Studio Hierarchy | Currency Formatted | Guest Gating | Conditional Footer Rule | Status |
|---|-------------|----------|-------------------------------------|------------------|--------------------|--------------|-------------------------|--------|
| 1 | **Home / Landing** | `/` | CTA buttons ("Empezar mi colección", "Formar un Estudio"), Roadmap links, Flash carousel, Nav links | N/A | YES (`formatPrice`) | YES | **VISIBLE** (Mandatory) | PASSED |
| 2 | **Manifiesto & Beneficios** | `/beneficios` | 3 Guarantees cards, Comparison matrix, CTA links, Manifest accordion | N/A | N/A | N/A | **VISIBLE** (Mandatory) | PASSED |
| 3 | **Precios & Membresías** | `/precios` | Monthly/Annual billing toggle (-20%), FAQ accordion expanders, Currency pill indicator | N/A | YES (`formatPrice`) | YES | **VISIBLE** (Mandatory) | PASSED |
| 4 | **Directorio de Artistas & Estudios** | `/artistas` | Studio/Indep filter pills, Style filter pills, Search input, Resident artist selector, Contact WhatsApp, Send Sketch modal | **YES** (Studio -> N Residents) | YES (`formatPrice`) | YES (Intercepts unauth) | **VISIBLE** (Mandatory) | PASSED |
| 5 | **Interactive Artists Hub Map** | `/hub` | Studio pins (`Building2`), Indep pins (`User`), Artist count badges, Search bar, Type toggles, Map/List view switch, Resident avatar selector, Flash reserve, Sketch modal, WhatsApp direct | **YES** (Studio -> N Residents) | YES (`formatPrice`) | YES (Intercepts unauth) | **HIDDEN** (R4 Exemption) | PASSED |
| 6 | **Tienda del Atelier (Fase 1)** | `/tienda`, `/shop` | 5 Category filter pills (`aftercare`, `jewelry`, `apparel`, `prints`, `gift_cards`), Search input, Reserve pickup button, Stepper modal (1-5 qty), Confirm order | N/A | YES (`formatPrice`) | YES (Intercepts unauth) | **VISIBLE** (Mandatory) | PASSED |
| 7 | **Sobre Nosotros** | `/about` | Mission, Vision, Hygiene standards, Independent route | N/A | N/A | N/A | **VISIBLE** (Mandatory) | PASSED |
| 8 | **Registro de Usuarios** | `/register`, `/user` | Role tabs (Cliente / Tatuador), Name, Email, Password, WhatsApp prefix & phone, Terms checkbox, Submit button | N/A | N/A | N/A | **HIDDEN** (R4 Exemption) | PASSED |
| 9 | **Inicio de Sesión** | `/login` | Email input, Password input, Submit button, Link to register, Link to forgot password | N/A | N/A | N/A | **HIDDEN** (R4 Exemption) | PASSED |
| 10 | **Recuperación de Contraseña** | `/forget-password` | Email input, Submit recovery button, Back to login link | N/A | N/A | N/A | **HIDDEN** (R4 Exemption) | PASSED |
| 11 | **Cambio de Contraseña** | `/change-password` | New password, Confirm password, Strength meter, Submit button | N/A | N/A | N/A | **HIDDEN** (R4 Exemption) | PASSED |
| 12 | **Client Dashboard** | `/client-dashboard` | 5 Tabs (`overview`, `configuracion`, `seguridad`, `citas`, `pagos`), Timeline filter pills, Upload photo modal, Profile save, Language switch (ES/EN), Session revoke | N/A | YES (`formatPrice`) | Protected (Session required) | **HIDDEN** (R4 Exemption) | PASSED |
| 13 | **Artist Dashboard** | `/artist-dashboard` | Portfolio management, Flash upload, Resident artists sync, Calendar bookings, Payout settings | N/A | YES (`formatPrice`) | Protected (Role required) | **HIDDEN** (R4 Exemption) | PASSED |
| 14 | **Perfil de Artista** | `/artist-profile`, `/artist/:id`, `/tattoo` | Dual-mode view (Public vs Edit), WhatsApp direct button, Gallery lightbox, Booking request | N/A | YES (`formatPrice`) | YES (Intercepts unauth) | **HIDDEN** (R4 Exemption) | PASSED |
| 15 | **Chat / Mensajería** | `/chat` | Protected route (Redirects unauth guests to `/register?redirect=/chat`), Message thread, Send input | N/A | N/A | Protected (Auth Gate) | **HIDDEN** (R4 Exemption) | PASSED |
| 16 | **Términos y Condiciones** | `/legal/terms` | Legal disclosure, Biosecurity agreement, Privacy references | N/A | N/A | N/A | **VISIBLE** (Mandatory) | PASSED |
| 17 | **Política de Privacidad** | `/legal/privacy` | Data handling, Cookies, User rights disclosure | N/A | N/A | N/A | **VISIBLE** (Mandatory) | PASSED |
| 18 | **Suscripción & Checkout** | `/subscription/creditcard` | Card details input, Expiry, CVC, Plan summary, Payment submit button | N/A | YES (`formatPrice`) | Protected (Auth required) | **HIDDEN** (R4 Exemption) | PASSED |

---

## 3. Dynamic Currency Switch & Strict Formatting Audit (R5)

### Verification Requirements:
1. **Zero Hardcoded Prices**: No currency string may be hardcoded without checking global state (`useCurrency().formatPrice`).
2. **Navbar Currency Selector**:
   - Selector button `#country-currency-selector-btn` reveals country dropdown.
   - Supports active localization:
     - 🇵🇦 Panamá: USD (`$XX.XX`)
     - 🇨🇴 Colombia: COP (`$XX.XXX COP`)
     - 🇲🇽 México: MXN (`$XX.XX MXN`)
     - 🇪🇸 España: EUR (`XX,XX €`)
     - 🇺🇸 Estados Unidos: USD (`$XX.XX`)
3. **Reactive Recomputation**:
   - Switching currency immediately updates:
     - Pricing Page membership tiers (`/precios`).
     - Tienda del Atelier catalog items (`/tienda`).
     - Artists Directory flash and hourly rates (`/artistas`).
     - Artists Hub interactive map flash rates and hourly base fees (`/hub`).
     - Client Dashboard payment tracking ledger (`/client-dashboard?tab=pagos`).

---

## 4. Stitch Studio Hierarchy Audit (Studio -> N Artists)

### Verification Requirements:
1. **Studio Distinction**:
   - Map pins and directory cards clearly differentiate between **Estudio (Local con Múltiples Artistas)** and **Artista Independiente**.
   - Studio pins render `<Building2 />` icon with an explicit artist count badge (`{studio.artistsCount} Artistas`).
   - Independent artist pins render `<User />` icon.
2. **Resident Artists Selection**:
   - Studio card displays resident avatars in a horizontal carousel with concentric violet rings (`.ring-concentric-violet` / `ring-violet-500`).
   - Clicking a resident artist dynamically updates:
     - "Artista a contactar" name & alias.
     - Specialty badges (e.g. Cybersigilism, Neo-Tribal, Realismo Color).
     - Base hourly rate formatted with dynamic currency.
     - Flash designs catalog corresponding exclusively to that resident artist.
     - WhatsApp direct action link pre-filled with the resident artist's WhatsApp number and name.
     - Send Sketch modal recipient bound to that resident artist.

---

## 5. Guest Gating & Interception Flow Audit (R3)

### Verification Requirements:
1. **Unauthenticated visitor protections**:
   - Public visitors can freely browse `/`, `/beneficios`, `/precios`, `/artistas`, `/tienda`, `/hub`, `/about`.
2. **High-Intent Action Interception**:
   - Clicking **"Apartar para Retiro"** on `/tienda` -> Opens `GuestGateModal` (`#guest-gate-modal`).
   - Clicking **"Contactar por WhatsApp"** on `/hub` or `/artistas` -> Opens `GuestGateModal`.
   - Clicking **"Enviar Boceto"** on `/hub` or `/artistas` -> Opens `GuestGateModal`.
   - Clicking **"Reservar con [Artista]"** on `/hub` -> Opens `GuestGateModal`.
   - Navigating directly to `/chat` -> Redirects to `/register?redirect=%2Fchat`.
3. **Seamless Login / Register Bridge**:
   - `GuestGateModal` provides buttons to register or log in, preserving the intended destination via query params.

---

## 6. Conditional Footer Policy Audit (R4)

### Verification Requirements:
Per explicit user instructions (R4 exception approved 2026-10-05):
1. **Routes with HIDDEN Footer**:
   - `/hub` (ArtistsHubPage - Inmersive fullscreen map).
   - `/login` (LoginPage - Distraction-free auth).
   - `/register` & `/user` (RegisterPage - Distraction-free onboarding).
   - `/client-dashboard` (Client Dashboard tabs).
   - `/artist-dashboard` (Artist Dashboard workspace).
   - `/chat` (Chat Page full-height view).
   - `/artist-profile`, `/artist/:id`, `/tattoo` (Public/Private Artist profile).
2. **Routes with VISIBLE Footer**:
   - `/` (HomePage).
   - `/beneficios` (BenefitsPage).
   - `/precios` (PricingPage).
   - `/artistas` (ArtistsDirectoryPage).
   - `/tienda` & `/shop` (ShopPage).
   - `/about` (AboutPage).
   - `/legal/terms` (Terms and Conditions).
   - `/legal/privacy` (Privacy Policy).

---

## 7. Automated Test Plan & Coverage Summary

The Playwright headless CI suite in `v2/e2e/tests/` executes the following specification files:
1. `tests/landing_public_screens.spec.ts`: Tests public landing, manifesto, pricing toggle, about, legal pages, and footer presence.
2. `tests/artists_directory.spec.ts`: Tests directory catalog, filters, resident artist selection, dynamic currency, guest gating, and footer presence.
3. `tests/hub_audit.spec.ts`: Tests Stitch `/hub` map, studio pins, multi-artist hierarchy, resident artist selection, flash reserve, guest gate interception, and footer absence.
4. `tests/shop_hub_services.spec.ts`: Tests store catalog, category filters, reservation modal, guest gating, dynamic currency, agenda tracking, and payment tracking.
5. `tests/client_dashboard_storage.spec.ts`: Tests client dashboard tabs, tattoo progress timeline, photo upload modal, language toggle, and security settings.
6. `tests/auth_gating_footer.spec.ts`: Tests login, register, forgot-password, chat auth gate, conditional footer matrix, navbar currency switcher, and mobile drawer.

**Total Automated Coverage Target**: 100% Passing Tests, 0 Regressions, 0 Skips.
