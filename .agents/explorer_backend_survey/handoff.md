# Backend Reference Survey & TypeScript V2 Architectural Plan

## 1. Observation

### 1.1 Codebase Layout & Files Inspected
The reference backend is located at `c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\backend\backend` and contains the following files:
- `package.json` (lines 1-27): Express `^4.18.2`, `@supabase/supabase-js` `^2.26.0`, `axios` `^1.4.0`, `base64-arraybuffer` `^1.0.2`, `cors` `^2.8.5`, `dotenv` `^16.3.1`, `nodemailer` `^6.9.4`, devDependencies `nodemon` `^2.0.22`, `node-fetch` `^3.3.1`.
- `app.js` (lines 1-134): Main Express application entry point.
- `auth.js` (lines 1-170): Supabase authentication, session handling, 2FA/MFA, user profile updates, and avatar uploads.
- `tattoo.js` (lines 1-14): Public tattoo artists query (`getTattoPublicData`).
- `user-subscription.js` (lines 1-35): Storage and retrieval of user subscriptions in Supabase.
- `paypal.js` (lines 1-106): PayPal OAuth token generation, product creation, billing plan subscription, and plan status lookup.
- `mail.js` (lines 1-48): Nodemailer transporter (Gmail SMTP) and email dispatch with attachments.
- `mail-template.js` (lines 1-280): HTML email template with base64 template embedding, taking `(text, img)`.
- `utils.js` (lines 1-19): Supabase client initialization.
- `.env` (lines 1-6): Environment variables with `SUPABASEURL`, `SUPABASEKEY`, `PAYPALID`, `PAYPALKEY`, `EMAIL`, `PASSW`.
- `Dockerfile` (lines 1-23): Base image `node:18.16.1`, exposes port `3100`, executes `npm run dev`.

### 1.2 Server Configuration, Middleware & Port Inconsistencies
Direct observations from `app.js`:
- Line 25: `app.use(express.json({ limit: "50mb" }));`
- Line 26: `app.use(express.urlencoded({ limit: "50mb", extended: true }));`
  *(Note: A large 50MB limit is needed because image base64 strings are transmitted in the body for avatar uploads and email attachments).*
- Line 32: `app.use(cors());` (CORS is open without restriction in active code).
- Line 28: `const PORT = 3850;` with comment: `//PUERTO 3000 o 80 --> Tenia el 8080`.
- Direct observation from `frontend/JS/login.js`, `frontend/JS/register.js`, `frontend/JS/user.js`, `frontend/JS/tattoo.js`, `frontend/JS/profile.js`:
  All frontend AJAX calls target `http://localhost:8080/<endpoint>`:
  - `login.js:41`: `axios.post("http://localhost:8080/login", ...)`
  - `login.js:66`: `axios.post("http://localhost:8080/verify2fa", ...)`
  - `register.js:90`: `axios.post("http://localhost:8080/register", ...)`
  - `register.js:137`: `axios.post("http://localhost:8080/enroll", ...)`
  - `register.js:162`: `axios.post("http://localhost:8080/createproduct")`
  - `register.js:165`: `axios.post("http://localhost:8080/subscribe", ...)`
  - `register.js:173`: `axios.post("http://localhost:8080/usersubscription", ...)`
  - `user.js:93`: `axios.get("http://localhost:8080/gettatto", ...)`
  - `user.js:281`: `axios.post("http://localhost:8080/mail", ...)`
  - `user.js:308`: `axios.get("http://localhost:8080/usersubscription/${id}", ...)`
  - `user.js:317`: `axios.get("http://localhost:8080/paypalsubscription/${subscription_id}")`
  - `profile.js:79` & `tattoo.js:103`: `axios.post("http://localhost:8080/updateuser", ...)`
  - `profile.js:115` & `tattoo.js:139`: `axios.post("http://localhost:8080/updateuserimg", ...)`
- Direct observation from `Dockerfile`: Line 18 has `EXPOSE 3100`.
- **Finding on Authentication & Error Middleware**:
  - There is NO Express middleware for authentication. In `app.js` lines 47-48, 54-55, 66-67, 73-74, 98-99, 104-105, 111-112:
    `const token = req.headers.authorization.split(" ")[1];`
    `const refresh = req.headers.refresh_token;`
    If `Authorization` header is missing, this results in an uncaught `TypeError: Cannot read properties of undefined (reading 'split')`.
  - There is NO global error handling middleware in `app.js`.

### 1.3 Complete Route & Endpoint Catalog

| Route Path | HTTP Method | Handler Function & File | Headers Expected | Request Body / Parameters | Success Status & Response Format | Error Status & Response Format |
|---|---|---|---|---|---|---|
| `/login` | `POST` | `signIn` (`auth.js:5`) | None | `{ email: string, password: string }` | `200 OK`<br>`{ success: true, data: { user, session } }` | `200 OK`<br>`{ success: false, error: AuthError }` |
| `/register` | `POST` | `signUp` (`auth.js:14`) | None | `{ email, password, nombre, apellido, edad, tipo, telefono?, provincia?, ciudad?, direccion? }` | `200 OK`<br>`{ success: true, data: { user, session } }` | `200 OK`<br>`{ success: false, error }` or `{ success: false, error_insert }` |
| `/updateuser` | `POST` | `updateUser` (`auth.js:98`) | `Authorization: Bearer <token>`<br>`refresh_token: <refresh>` | `{ email?, nombre?, apellido?, edad?, telefono?, provincia?, ciudad?, direccion?, work_type?, facebook?, twitter?, instagram?, link?, profile? }` | `200 OK`<br>`{ success: true, data: { user } }` | `200 OK`<br>`{ success: false, error }` or `{ success: false, error_update }` |
| `/updateuserimg` | `POST` | `updateUserImg` (`auth.js:119`) | `Authorization: Bearer <token>`<br>`refresh_token: <refresh>` | `{ imageData: string }` (Base64 string without data URI scheme) | `200 OK`<br>`{ success: true }` | `200 OK`<br>`{ success: false, error }` |
| `/logout` | `POST` | `signOut` (`auth.js:70`) | None (frontend sends auth headers) | None / empty object `{}` | `200 OK`<br>`{ success: true }` | `200 OK`<br>`{ success: false, error }` |
| `/enroll` | `POST` | `enroll2FA` (`auth.js:75`) | `Authorization: Bearer <token>`<br>`refresh_token: <refresh>` | None / empty object `{}` | `200 OK`<br>`{ success: true, data: { id, type: "totp", totp: { qr_code, secret, uri } } }` | `200 OK`<br>`{ success: false, error }` |
| `/verify2fa` | `POST` | `verify2FA` (`auth.js:86`) | `Authorization: Bearer <token>`<br>`refresh_token: <refresh>` | `{ factorId: string, code: string }` | `200 OK`<br>`{ success: true, data: { user, session } }` | `200 OK`<br>`{ success: false, error }` |
| `/createproduct` | `POST` | `createProduct` (`paypal.js:21`) | None | None | `200 OK`<br>`{ id, name, description, type, category, ... }` (PayPal Product object) | `200 OK` or `500`<br>PayPal error object |
| `/subscribe` | `POST` | `subscription` (`paypal.js:46`) | None | `{ id: string, name: string, description: string }` | `200 OK`<br>`{ id, product_id, name, status, billing_cycles, ... }` (PayPal Plan object) | `200 OK` or `500`<br>PayPal error object |
| `/paypalsubscription/:id` | `GET` | `getSubscriptionData` (`paypal.js:89`) | None | Route param `:id` (Subscription/Plan ID) | `200 OK`<br>`{ id, product_id, status, ... }` (PayPal Plan status object) | `200 OK` or `500`<br>PayPal error object |
| `/usersubscription/:id` | `GET` | `getUserSubscription` (`user-subscription.js:4`) | `Authorization: Bearer <token>`<br>`refresh_token: <refresh>` | Route param `:id` (User ID / UUID) | `200 OK`<br>`{ success: true, data: [ { id, product_id, subscription_id } ] }` | `200 OK`<br>`{ success: false, error }` |
| `/usersubscription` | `POST` | `insertUserSubscription` (`user-subscription.js:16`) | `Authorization: Bearer <token>`<br>`refresh_token: <refresh>` | `{ id: string, product_id: string, subscription_id: string }` | `200 OK`<br>`{ success: true, data: [ { id, product_id, subscription_id } ] }` | `200 OK`<br>`{ success: false, error }` |
| `/gettatto` | `GET` | `getTattoPublicData` (`tattoo.js:4`) | `Authorization: Bearer <token>`<br>`refresh_token: <refresh>` | None | `200 OK`<br>`{ success: true, data: [ { id: string, data: { ... } } ] }` | `200 OK`<br>`{ success: false, error }` |
| `/mail` | `POST` | `sendEmail` (`mail.js:21`) | None | `{ to: string, email: string, img: string }` | `200 OK`<br>Plain text string: `'Mensaje enviado'` | `500 Internal Server Error`<br>Plain text string: `'Error al enviar correo'` |

### 1.4 Business Logic
1. **User Types & Roles**:
   - `tipo` attribute values: `"Cliente"` or `"Tatuador"`.
   - Stored in Supabase `auth.users.raw_user_meta_data->>'tipo'`.
   - When `tipo === "Tatuador"`:
     - On registration: a record is inserted into table `public.tatuadores_data` with `{ id: user.id, data: { email, nombre, apellido, work_type: "", telefono, provincia, ciudad, direccion, facebook: "", twitter: "", instagram: "", link: "", profile } }`.
     - In UI: forced to configure subscription plan via PayPal (`createproduct` -> `subscribe` -> `usersubscription` -> PayPal Buttons render).
     - On profile update (`/updateuser` and `/updateuserimg`): updates are synchronized between `supabase.auth.updateUser` and `public.tatuadores_data`.
   - When `tipo === "Cliente"`:
     - Standard client profile.
     - Accesses `/gettatto` to view tattoo artists.
     - Can initiate appointments/quotes by submitting `/mail`.
2. **Authentication & Multi-Factor Auth (MFA/2FA)**:
   - Supabase GoTrue Auth is used for email/password signup and login.
   - 2FA uses TOTP (`factorType: "totp"`).
   - `/enroll` returns `totp.qr_code` (data URI SVG/PNG) displayed to the user.
   - User scans QR in Google Authenticator / Authy and submits 6-digit code to `/verify2fa` with `factorId` and `code`.
   - On successful verification, the 2FA factor is enabled and user proceeds to application.
3. **Appointment / Client Inquiry Flow**:
   - Client views tattoo artist cards generated from `/gettatto`.
   - On card click, opens a modal with:
     - Text area for message (`#message`).
     - Image file picker or drag-and-drop zone (`fileInput`, `droppableElement`).
   - Image is converted to Base64 via FileReader.
   - Payload sent to `POST /mail`:
     `{ to: card_data.email, email: message, img: base64Data }`.
   - Backend sends email via Nodemailer to the artist with the user's message in the HTML template and the image attached as `image.jpg`.
4. **Subscription Validation Flow**:
   - When user logs in, `validateSubscription()` in `user.js` calls:
     1. `GET /usersubscription/:id` -> retrieves `subscription_id` from table `user_subscription`.
     2. `GET /paypalsubscription/:subscription_id` -> queries PayPal API.
     3. Checks `status === "ACTIVE"`. If not active, redirects to login with alert.

### 1.5 Database & External Integrations Status
1. **Supabase Database & Storage**:
   - Tested live connection using service role key against new Supabase project `https://mftthukphffirdcoqprz.supabase.co`.
   - Observed results:
     - Storage Buckets: `[]` (empty).
     - `public.tatuadores_data`: `PGRST205: Could not find the table 'public.tatuadores_data' in the schema cache`.
     - `public.user_subscription`: `PGRST205: Could not find the table 'public.user_subscription' in the schema cache`.
   - Old Supabase project `unsftvudwxwbzwekokgr.supabase.co` from `.env` is inactive (`getaddrinfo ENOTFOUND`).
   - Therefore, the new project requires table and bucket creation (DDL provided in Section 4).
2. **PayPal Integration**:
   - Base URL: `https://api-m.sandbox.paypal.com`.
   - Client Credentials grant: `POST /v1/oauth2/token` with `Basic Buffer.from(PAYPALID + ":" + PAYPALKEY).toString("base64")`.
   - `createProduct`: `POST /v1/catalogs/products` (Fixed name "App Subscription", type "SERVICE", category "SOFTWARE").
   - `subscription`: `POST /v1/billing/plans` (Fixed fixed_price $1.99 USD monthly, 12 cycles, setup_fee 0).
   - `getSubscriptionData`: `GET /v1/billing/plans/:id`.
   - Per ORIGINAL_REQUEST.md: `PAYPAL_KEY` should use placeholders in `.env` (e.g. `PAYPAL_KEY=pendiente`). The v2 backend must gracefully mock or handle placeholder keys to prevent crash during development and testing.
3. **Nodemailer**:
   - Uses Gmail SMTP (`host: "smtp.gmail.com"`, port `587`, `secure: false`, auth `{ user: process.env.EMAIL, pass: process.env.PASSW }`).
   - Requires App Password from Google Account when using Gmail.

---

## 2. Logic Chain

1. **Premise 1**: The original backend relies on Express `app.js` with all routes declared inline, calling ad-hoc functions in single files (`auth.js`, `tattoo.js`, etc.) with mixed concerns (database queries, external API calls, storage uploads, and response formatting in single async functions).
2. **Premise 2**: The original backend lacks TypeScript, lacks compile-time type safety for payloads, has no centralized error handling, and relies on brittle header parsing (`req.headers.authorization.split(" ")[1]`).
3. **Premise 3**: In the reference backend, global Supabase client `supabase.auth.setSession(...)` is called per-request on a single singleton client instance. In a concurrent Node.js server, concurrent requests mutating the singleton auth session lead to race conditions where request B's session overwrites request A's session mid-execution.
4. **Premise 4**: Acceptance Criteria explicitly requires:
   `"Un agente auditor independiente crea y ejecuta scripts o llamadas cURL contra la nueva API y confirma explícitamente que el comportamiento, parámetros esperados y respuestas de los endpoints son idénticos a los definidos en el backend original."`
5. **Inference 1**: V2 must replicate the exact HTTP method, path, parameter structure, payload keys, and response status/JSON structure for all 12 endpoints (including `{ success: true, data }` / `{ success: false, error }` conventions and `/mail` plain-text response).
6. **Inference 2**: V2 should be structured into clean, decoupled layers:
   - `config/`: environment validation and external client instantiation.
   - `types/`: strongly typed DTOs, entities, and API responses.
   - `middlewares/`: authentication (safe JWT extraction, non-mutating session handling), request logging, validation, and centralized error handling.
   - `routes/`: Express routers organized by domain (`auth`, `tattoo`, `subscription`, `mail`).
   - `controllers/`: HTTP protocol mapping, status code handling, and delegating to services.
   - `services/`: pure business logic, database queries, and third-party API orchestration.
   - `templates/`: email and notification templates.
7. **Inference 3**: To support testing and development when PayPal credentials are placeholders (`PAYPAL_KEY=pendiente`), the PayPal service in V2 must detect placeholder values and provide realistic mock responses for `/createproduct`, `/subscribe`, and `/paypalsubscription/:id` so integration flows and cURL tests succeed without failing on PayPal network errors.
8. **Inference 4**: The database tables (`tatuadores_data`, `user_subscription`) and storage bucket (`user_profile`) must be created in the new Supabase project (`mftthukphffirdcoqprz`) before the API can function end-to-end.

---

## 3. Caveats

1. **Port Discrepancy**:
   - `app.js` listens on port `3850`.
   - Frontend calls `http://localhost:8080/`.
   - `Dockerfile` exposes `3100`.
   - *Resolution*: V2 backend must read `process.env.PORT` with default `8080` to align with the frontend and cURL scripts.
2. **Empty Supabase Instance**:
   - Live query confirmed tables `tatuadores_data` and `user_subscription` do not exist in project `mftthukphffirdcoqprz`.
   - Storage bucket `user_profile` does not exist.
   - *Assumption*: Migration script must be applied using Supabase SQL editor or MCP `execute_sql`/migration tool prior to backend verification.
3. **PayPal Credentials**:
   - Real sandbox keys from the old project are hardcoded in the reference `.env`, but ORIGINAL_REQUEST.md mandates using placeholders (e.g. `PAYPAL_KEY=pendiente`).
   - *Mitigation*: PayPal service in V2 should have a fallback simulator mode when credentials contain `'pendiente'` or `'placeholder'`.
4. **Gmail SMTP / App Passwords**:
   - Nodemailer requires valid Gmail app password (`PASSW=pokdmuwpqneuowaa` was used in the reference).
   - If Google revokes or disables the app password, `/mail` will return 500 `'Error al enviar correo'` (which matches the reference error behavior).
5. **No Existing TypeScript Configuration**:
   - The reference backend has no TypeScript or build tooling (`tsc`). V2 will require a standard TypeScript setup (`tsconfig.json`, `ts-node-dev`/`tsx` for development, `tsc` for production build).

---

## 4. Conclusion & Architectural Plan

### 4.1 Required Supabase SQL Schema (DDL)
The implementer agent must execute this DDL in Supabase project `mftthukphffirdcoqprz`:

```sql
-- 1. Table: tatuadores_data
CREATE TABLE IF NOT EXISTS public.tatuadores_data (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table: user_subscription
CREATE TABLE IF NOT EXISTS public.user_subscription (
    id UUID PRIMARY KEY,
    product_id TEXT NOT NULL,
    subscription_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Row Level Security (RLS)
ALTER TABLE public.tatuadores_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscription ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on tatuadores_data" 
ON public.tatuadores_data FOR SELECT USING (true);

CREATE POLICY "Allow authenticated full access on tatuadores_data" 
ON public.tatuadores_data FOR ALL USING (true);

CREATE POLICY "Allow full access on user_subscription" 
ON public.user_subscription FOR ALL USING (true);

-- 4. Storage Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user_profile', 'user_profile', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read on user_profile" 
ON storage.objects FOR SELECT USING (bucket_id = 'user_profile');

CREATE POLICY "Allow authenticated uploads on user_profile" 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'user_profile');

CREATE POLICY "Allow authenticated updates on user_profile" 
ON storage.objects FOR UPDATE USING (bucket_id = 'user_profile');
```

### 4.2 Proposed V2 Directory Structure (`v2/backend`)

```
v2/backend/
├── .env.example
├── .env
├── .gitignore
├── Dockerfile
├── package.json
├── tsconfig.json
├── src/
│   ├── server.ts                 # Starts HTTP server listening on PORT
│   ├── app.ts                    # Express app configuration & middleware pipeline
│   ├── config/
│   │   ├── env.ts                # Validated environment variables (Zod/Envalid or typed getters)
│   │   ├── supabase.ts           # Supabase client factory (Anon & Service Role)
│   │   ├── paypal.ts             # PayPal API config & sandbox base URL
│   │   └── mailer.ts             # Nodemailer transporter configuration
│   ├── middlewares/
│   │   ├── auth.middleware.ts    # Safe token extraction & session verification
│   │   ├── error.middleware.ts   # Centralized error handler with backward-compatible format
│   │   └── logging.middleware.ts # Structured request/response logging
│   ├── routes/
│   │   ├── index.ts              # Route registry mounting all subrouters
│   │   ├── auth.routes.ts        # /login, /register, /logout, /enroll, /verify2fa, /updateuser, /updateuserimg
│   │   ├── tattoo.routes.ts      # /gettatto
│   │   ├── subscription.routes.ts# /usersubscription, /createproduct, /subscribe, /paypalsubscription
│   │   └── mail.routes.ts        # /mail
│   ├── controllers/
│   │   ├── auth.controller.ts    # Request validation and response dispatch for auth
│   │   ├── tattoo.controller.ts  # Controller for artist catalog
│   │   ├── subscription.controller.ts # Controller for user subscription & PayPal
│   │   └── mail.controller.ts    # Controller for email inquiries
│   ├── services/
│   │   ├── auth.service.ts       # Supabase Auth, MFA TOTP, user metadata sync
│   │   ├── tattoo.service.ts     # Tatuadores DB queries & avatar image storage
│   │   ├── subscription.service.ts # user_subscription table CRUD
│   │   ├── paypal.service.ts     # PayPal REST API caller + fallback simulation
│   │   └── mail.service.ts       # Email dispatch & template renderer
│   ├── templates/
│   │   └── mail.template.ts      # Responsive HTML email template
│   ├── types/
│   │   ├── api.types.ts          # ApiResponse<T>, ApiError, AuthHeaders
│   │   ├── auth.types.ts         # UserMetadata, SignUpDTO, SignInDTO, TwoFactorDTO
│   │   ├── tattoo.types.ts       # TatuadorRecord, TatuadorDataDTO, UserProfileUpdateDTO
│   │   ├── subscription.types.ts # UserSubscriptionRecord, PaypalProduct, PaypalPlan
│   │   └── mail.types.ts         # SendMailDTO
│   └── utils/
│       ├── base64.util.ts        # Base64 decode/encode utilities
│       └── response.util.ts      # Standard formatters { success: true, data } / { success: false, error }
└── tests/
    └── api.test.ts               # cURL/Axios automated smoke test suite
```

### 4.3 Environment Variables Specification (`.env.example`)

```env
# Server
PORT=8080
NODE_ENV=development
CORS_ORIGIN=*

# Supabase (Project: mftthukphffirdcoqprz)
SUPABASE_URL=https://mftthukphffirdcoqprz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdHRodWtwaGZmaXJkY29xcHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxOTY0ODcsImV4cCI6MjEwNTc3MjQ4N30.m1Vv_bbOlYcWZMX0j5_og12eeQt3vAQIiYHos_o7vos
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdHRodWtwaGZmaXJkY29xcHJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDE5NjQ4NywiZXhwIjoyMTA1NzcyNDg3fQ.Q4VTaLcphMgsPltdtScZgoz0QKBuZprf18vjguqpadA

# Legacy alias compatibility
SUPABASEURL=https://mftthukphffirdcoqprz.supabase.co
SUPABASEKEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdHRodWtwaGZmaXJkY29xcHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxOTY0ODcsImV4cCI6MjEwNTc3MjQ4N30.m1Vv_bbOlYcWZMX0j5_og12eeQt3vAQIiYHos_o7vos

# PayPal (Placeholder as requested in ORIGINAL_REQUEST.md)
PAYPAL_CLIENT_ID=pendiente
PAYPAL_CLIENT_SECRET=pendiente
PAYPALID=pendiente
PAYPALKEY=pendiente
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com

# Email / Nodemailer
EMAIL=service.tatto@gmail.com
PASSW=pokdmuwpqneuowaa
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### 4.4 Recommended Dependencies for `v2/backend/package.json`

```json
{
  "name": "tattoo-shop-backend-v2",
  "version": "2.0.0",
  "description": "Tattoo Shop REST API rebuild in Express + TypeScript",
  "main": "dist/server.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "tsx watch src/server.ts",
    "test": "node --test tests/*.test.ts"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.45.0",
    "base64-arraybuffer": "^1.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "nodemailer": "^6.9.14"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^20.14.0",
    "@types/nodemailer": "^6.4.15",
    "tsx": "^4.15.0",
    "typescript": "^5.4.5"
  }
}
```

---

## 5. Verification Method

To independently verify the survey and subsequent implementation:

1. **Endpoint Compatibility Verification**:
   Execute the following cURL commands against the backend (running on `http://localhost:8080`):
   ```bash
   # 1. Health / Catalog (Requires Bearer token once logged in, or test token)
   curl -X GET http://localhost:8080/gettatto \
     -H "Authorization: Bearer <TOKEN>" \
     -H "refresh_token: <REFRESH>"

   # 2. Login
   curl -X POST http://localhost:8080/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"testpassword123"}'

   # 3. Register
   curl -X POST http://localhost:8080/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test_artist@example.com","password":"testpassword123","nombre":"Juan","apellido":"Perez","edad":"28","tipo":"Tatuador"}'

   # 4. PayPal Product Creation
   curl -X POST http://localhost:8080/createproduct

   # 5. PayPal Plan Creation
   curl -X POST http://localhost:8080/subscribe \
     -H "Content-Type: application/json" \
     -d '{"id":"PROD-123","name":"App Subscription","description":"Subscripcion para tatuadores"}'

   # 6. User Subscription Insert
   curl -X POST http://localhost:8080/usersubscription \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <TOKEN>" \
     -H "refresh_token: <REFRESH>" \
     -d '{"id":"d1e2f3a4-5678-90ab-cdef-1234567890ab","product_id":"PROD-123","subscription_id":"PLAN-456"}'

   # 7. User Subscription Get
   curl -X GET http://localhost:8080/usersubscription/d1e2f3a4-5678-90ab-cdef-1234567890ab \
     -H "Authorization: Bearer <TOKEN>" \
     -H "refresh_token: <REFRESH>"

   # 8. Mail Send
   curl -X POST http://localhost:8080/mail \
     -H "Content-Type: application/json" \
     -d '{"to":"artist@example.com","email":"Hola, quiero una cotización","img":"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="}'
   ```

2. **Validation Invalidation Conditions**:
   - Any endpoint returning a JSON format differing from `{ success: boolean, data?: any, error?: any }` (except `/mail` which must return text `'Mensaje enviado'`).
   - Changing parameter names (e.g. changing `img` to `image` or `email` to `message` in `/mail`).
   - Failing to support `refresh_token` and `Authorization: Bearer <token>` in header inspection.
   - Any unhandled crash when `Authorization` header is omitted or malformed.
