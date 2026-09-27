# Tattoo Shop V2 - E2E Testing Infrastructure (`TEST_INFRA.md`)

## 1. Overview & Architecture

The Tattoo Shop V2 E2E Test Suite provides an independent, opaque-box, requirement-driven verification harness for both the modernized backend API (`v2/backend`) and the frontend single-page application (`v2/frontend`).

### Core Design Principles
1. **Opaque-Box Verification**: The test harness interacts with the application strictly from the outside, via standard HTTP REST endpoints (`http://localhost:8080`) and DOM/build inspection of `v2/frontend`. No internal application state, private variables, or mock bypasses are used.
2. **Progressive Testability**: The test harness is designed to execute against live running instances while gracefully supporting modular and offline structural validation during active milestone development.
3. **No Facades or Hardcoded Results**: Every test asserts dynamic contract invariants, database round-trips, and HTTP response schemas.
4. **Zero-Dependency Native Execution**: Built on Node.js modern ESM and TypeScript native execution (`--experimental-strip-types`), allowing execution without external heavy toolchains.

---

## 2. Directory Layout & Module Index

```
v2/e2e/
├── package.json                          # Package definition, scripts and devDependencies
├── tsconfig.json                         # TypeScript compiler configuration (NodeNext ESM)
├── config.ts                             # Global configuration, endpoints, sample fixtures, UUID generators
├── run_tests.ts                          # Unified executable test runner CLI
├── run_tests.js                          # Cross-platform Node wrapper
├── run_tests.ps1                         # PowerShell test runner for Windows environments
├── TEST_INFRA.md                         # Infrastructure architecture and reference guide
├── TEST_READY.md                         # Test readiness certificate and audit inventory
│
├── framework/
│   ├── test_runner.ts                    # BDD test framework (describe, it, expect, reporting, timers)
│   ├── api_client.ts                     # HTTP client with auth header injection, JSON parsing, retry logic
│   └── dom_validator.ts                  # Frontend build executor and DOM structural parser
│
├── tier1_feature_coverage/               # Tier 1: Core Functional Coverage (>=5 tests per feature)
│   ├── test_auth_endpoints.ts            # POST /login, POST /register, POST /logout
│   ├── test_mfa_endpoints.ts             # POST /enroll, POST /verify2fa
│   ├── test_user_profile_endpoints.ts    # POST /updateuser, POST /updateuserimg
│   ├── test_gallery_endpoints.ts         # GET /gettatto
│   ├── test_subscription_endpoints.ts   # POST /createproduct, POST /subscribe, GET /paypalsubscription/:id,
│   │                                     # GET /usersubscription/:id, POST /usersubscription
│   ├── test_mail_endpoints.ts            # POST /mail
│   └── test_frontend_interactions.ts     # Key UI interactions: Theme, Navigation, Filters, 3D Card, Modals
│
├── tier2_boundary_corner/                # Tier 2: Boundary & Corner Cases
│   ├── test_missing_headers.ts           # Omitted Authorization, refresh_token, Content-Type
│   ├── test_invalid_types_malformed.ts   # Corrupt JSON, invalid types, SQL/XSS injection payloads
│   ├── test_oversized_payloads.ts        # 50MB body limits, 5MB base64 images, non-base64 characters
│   ├── test_auth_boundaries.ts           # Duplicate user emails, tampered JWTs, case sensitivity
│   └── test_subscription_boundaries.ts  # Unregistered UUID lookups, invalid plan formats
│
├── tier3_cross_feature/                  # Tier 3: Cross-Feature Multi-Step Combinations
│   ├── test_client_lifecycle.ts          # Complete Client: Register -> Login -> MFA -> Profile -> Avatar -> Catalog -> Mail -> Logout
│   ├── test_artist_lifecycle.ts          # Complete Artist: Register -> DDL Sync -> PayPal Plan -> Bind Sub -> Update -> Gallery Sync
│   └── test_dual_interaction.ts          # Dual-User: Artist registers -> Client discovers in catalog -> Sends quote with photo
│
├── tier4_real_world/                     # Tier 4: Real-World Business Scenarios
│   ├── test_customer_quote_scenario.ts   # Customer quote submission with custom dimensions and reference photo
│   ├── test_artist_onboarding_scenario.ts# Artist onboarding, PayPal monetization check, and public listing
│   ├── test_security_invalidation_scenario.ts # Session revocation and token invalidation verification
│   └── test_catalog_filtering_scenario.ts# Multi-style artist directory filtering (Realista, Tradicional, etc.)
│
└── frontend_assertions/                  # Frontend Build & DOM Structural Verification
    ├── test_frontend_build.ts            # Execution of `npm run build` in v2/frontend and dist inspection
    └── test_dom_structure.ts             # Exact DOM element IDs, classes, and component hierarchy verification
```

---

## 3. Systematic 4-Tier Test Architecture

### Tier 1: Feature Coverage (79 Tests)
Covers all 14 REST API endpoints with a minimum of 5 rigorous test cases each, plus key frontend user interactions:
- **Endpoint 1 (`POST /login`)**: 6 tests (Valid credentials, artist role verification, wrong password, non-existent email, missing password, empty payload).
- **Endpoint 2 (`POST /register`)**: 6 tests (Client registration, artist registration with DDL sync, duplicate email, missing email, short password, unicode characters).
- **Endpoint 3 (`POST /enroll`)**: 5 tests (TOTP factor generation, QR code format, missing auth rejection, invalid token, alternate refresh header).
- **Endpoint 4 (`POST /verify2fa`)**: 6 tests (Invalid TOTP code rejection, missing factorId, missing code, non-digit code, unauthenticated request, code length validation).
- **Endpoint 5 (`POST /updateuser`)**: 6 tests (Client profile update, artist portfolio/social update, missing header crash resistance, invalid token rejection, alternate refresh header, partial update preservation).
- **Endpoint 6 (`POST /updateuserimg`)**: 6 tests (1x1 PNG upload, data URI prefix handling, consecutive overwrite without conflict, unauthenticated rejection, empty image rejection, artist gallery sync).
- **Endpoint 7 (`GET /gettatto`)**: 6 tests (Array retrieval, entry data schema, newly registered artist presence, unauthenticated public access, response envelope, signed URL verification).
- **Endpoint 8 (`POST /createproduct`)**: 5 tests (Product creation, fallback mode when `PAYPAL_KEY=pendiente`, SERVICE/SOFTWARE categories, consecutive calls, default name).
- **Endpoint 9 (`POST /subscribe`)**: 5 tests (Plan creation with ACTIVE status, fallback mode, custom plan name, product_id linkage, empty payload handling).
- **Endpoint 10 (`GET /paypalsubscription/:id`)**: 5 tests (Active status retrieval, fallback mode, arbitrary plan ID, response schema, 200 OK guarantee).
- **Endpoint 11 (`GET /usersubscription/:id`)**: 5 tests (Registered user query, unregistered user empty array `[]`, arbitrary UUID, alternate refresh header, envelope compliance).
- **Endpoint 12 (`POST /usersubscription`)**: 5 tests (Subscription binding storage, round-trip verification, unauthenticated rejection, missing subscription ID, update existing binding).
- **Endpoint 13 (`POST /logout`)**: 5 tests (Authenticated session invalidation, alternate refresh header, missing header safety, malformed token safety, double logout).
- **Endpoint 14 (`POST /mail`)**: 6 tests (Valid payload delivery, SMTP credential fallback safety, empty recipient rejection, missing image handling, data URI prefix handling, Content-Type compliance).
- **Frontend User Interactions**: 6 tests (Theme toggle with Sun/Moon SVGs, navigation routes, style filter checkboxes, 3D flip credit card, inquiry message drawer, artist subscription modal).

### Tier 2: Boundary & Corner Cases (25 Tests)
- Missing Headers (7 tests): Ensures missing `Authorization` or `refresh_token` returns clean HTTP errors and never triggers unhandled `TypeError` crashes.
- Corrupt & Malformed Payloads (6 tests): Validates JSON syntax error handling, wrong data types, whitespace-only fields, SQL injection payloads (`' OR '1'='1'`), DDL injection resistance (`DROP TABLE`), and XSS sanitization.
- Oversized Payloads (3 tests): Validates 50MB body limit, ~500KB images, corrupted non-base64 bytes, and large message text.
- Authentication Boundaries (5 tests): Duplicate email registration rejection, tampered JWT signature rejection, case-insensitive email matching, non-existent logins, rapid sequential logins.
- Subscription Boundaries (4 tests): Non-existent user UUID returns empty array, malformed plan format, orphan subscription insert rejection, client role subscription checking.

### Tier 3: Cross-Feature Combinations (3 Complete Scenarios)
- `TC-XFEAT-01` (Customer Lifecycle): Register -> Login -> Enroll MFA -> Verify MFA -> Update Profile -> Upload Avatar -> Query Catalog -> Send Mail -> Logout.
- `TC-XFEAT-02` (Artist Lifecycle): Register Artist -> Verify DDL -> Create PayPal Product & Plan -> Link User Subscription -> Verify Status -> Update Style & Social -> Upload Avatar -> Confirm Public Catalog Listing.
- `TC-XFEAT-03` (Dual Interaction): Artist registers & sets style -> Customer registers, queries catalog, discovers artist -> Sends inquiry email with reference sketch -> Artist profile updates.

### Tier 4: Real-World Scenarios (4 End-to-End Workflows)
- `TC-SCEN-01`: Complete Customer Quote Workflow with custom dimensions and contact sync.
- `TC-SCEN-02`: Complete Artist Onboarding & Subscription Check (gating, monetization, and public directory).
- `TC-SCEN-03`: Security & Session Invalidation Protocol (verifying revoked session tokens cannot be reused).
- `TC-SCEN-04`: Multi-Style Artist Catalog & Search Filtering (validates categorization across Realista, Tradicional, etc.).

### Frontend Build & DOM Structural Assertions (9 Tests)
- `TC-DOM-BUILD-01`: Verifies `npm run build` compiles `v2/frontend` into `dist/` with valid `index.html` and bundled JS assets.
- `TC-DOM-NAVBAR` through `TC-DOM-CREDITCARD`: Verifies exact element IDs, CSS classes, form inputs, and component structures across all views.

**Total Test Cases**: 124 systematically cataloged tests.

---

## 4. Execution Commands & Configuration

### Prerequisites
- Node.js v20+ or v24+
- (Optional) `npm install` in `v2/e2e` for TypeScript types and TSX support.

### Running Tests
Execute from `v2/e2e` directory:

```bash
# 1. Run default test suite
npm test

# 2. List full test inventory (124 tests)
npm run test:list

# 3. Run specific tiers
npm run test:tier1
npm run test:tier2
npm run test:tier3
npm run test:tier4

# 4. Run DOM & build verification only
npm run test:dom
npm run test:build

# 5. Output structured machine-readable JSON
npm run test:json

# 6. Typecheck test suite
npm run typecheck
```

### CLI Arguments
The runner accepts CLI options:
- `--url <backend_url>`: Override API target (default: `http://localhost:8080`).
- `--tier <tier_name>`: Filter by tier name (e.g. `--tier 1`, `--tier 2`).
- `--dom-only`: Execute only frontend and DOM structural tests.
- `--build-only`: Execute only `npm run build` verification in `v2/frontend`.
- `--force-all`: Force execution of all network tests regardless of server ping.
- `--list`: Display full catalog of all 124 tests without executing network calls.
- `--json`: Export structured report to `results.json`.
- `--verbose`: Enable detailed stack traces and debugging information.

---

## 5. Mocking, Sandbox, and Fallback Strategy

1. **PayPal Sandbox**:
   - In production or sandbox with live keys, uses official PayPal REST v1 endpoints.
   - When `PAYPAL_KEY=pendiente` (or unset), backend services return compliant mock responses (`PROD-MOCK-001`, `P-MOCK-PLAN-001`, status `ACTIVE`), ensuring registration flows complete without external payment network dependency.
2. **Nodemailer SMTP**:
   - When Gmail credentials (`EMAIL`, `PASSW`) are configured, dispatches real email with attachment.
   - When credentials are not provided, returns HTTP 500 `"Error al enviar correo"` gracefully without crashing the Node process or emitting unhandled promise rejections.
3. **Supabase Database**:
   - Direct connection via `@supabase/supabase-js` targeting Supabase instance `mftthukphffirdcoqprz`.
   - Uses unique timestamp-based test accounts to prevent state collisions.
