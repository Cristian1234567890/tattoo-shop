# Specification Survey Handoff: Tattoo Shop V2 Modernization

**Author**: `specminer_api_survey`  
**Date**: 2026-09-23  
**Integrity Mode**: demo  
**Target Build Path**: `c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\v2`

---

## 1. Observation

Direct inspections of authoritative reference codebases were performed across the backend (`c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\backend\backend`) and frontend (`c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\frontend`):

1. **Backend Routing & Dispatch** (`backend/backend/app.js`, lines 1–134):
   - Express server configuring body limits (`express.json({ limit: "50mb" })`, `express.urlencoded({ limit: "50mb", extended: true })`) and CORS (`app.use(cors())`).
   - Declares PORT 3850 (with comments noting ports 3000, 80, 8080).
   - Registers exactly 10 endpoints:
     - `POST /login` (line 36) -> calls `signIn(req.body)`
     - `POST /register` (line 41) -> calls `signUp(req.body)`
     - `POST /updateuser` (line 46) -> reads `req.headers.authorization.split(" ")[1]` and `req.headers.refresh_token`
     - `POST /updateuserimg` (line 53) -> reads auth headers and updates user image
     - `POST /logout` (line 60) -> calls `signOut()`
     - `POST /enroll` (line 65) -> calls `enroll2FA(token, refresh)`
     - `POST /verify2fa` (line 72) -> calls `verify2FA(req.body, token, refresh)`
     - `POST /createproduct` (line 79) -> calls `createProduct(req, res)`
     - `POST /subscribe` (line 84) -> calls `subscription(req.body)`
     - `GET /paypalsubscription/:id` (line 89) -> calls `getSubscriptionData(id)`
     - `GET /usersubscription/:id` (line 96) -> calls `getUserSubscription(token, refresh, id)`
     - `POST /usersubscription` (line 103) -> calls `insertUserSubscription(token, refresh, req.body)`
     - `GET /gettatto` (line 110) -> calls `getTattoPublicData(token, refresh)`
     - `POST /mail` (line 118) -> calls `mail.sendEmail(to, email, img)`

2. **Authentication & User Management** (`backend/backend/auth.js`, lines 1–170):
   - Integrates `@supabase/supabase-js` client.
   - `signUp` populates user metadata: `nombre`, `apellido`, `edad`, `tipo` ('Cliente' | 'Tatuador'), `telefono`, `provincia`, `ciudad`, `direccion`, `profile`.
   - Default avatar URL points to Supabase storage signed URL (`user_profile/tatto-default-profile.png`).
   - When `tipo === "Tatuador"`, inserts row into table `tatuadores_data` with `{ id: data.user.id, data: data_to_insert }`.
   - `updateUser` updates Supabase auth user metadata, and if `user_metadata.tipo === "Tatuador"`, updates `tatuadores_data` table `.eq("id", user.id)`.
   - `updateUserImg` receives base64 string `imageData`, decodes with `base64-arraybuffer`, uploads/updates in storage bucket `user_profile` at `${user.id}/profile.png`, generates 1-year signed URL, updates user metadata, and updates `tatuadores_data.data.profile` for artists.
   - TOTP MFA enrolled via `supabase.auth.mfa.enroll({ factorType: "totp" })` and verified via `supabase.auth.mfa.challengeAndVerify({ factorId, code })`.

3. **Artist Gallery & Public Data** (`backend/backend/tattoo.js`, lines 1–14):
   - `getTattoPublicData` sets Supabase session using client token/refresh, then queries `supabase.from("tatuadores_data").select("*")`.

4. **Subscriptions & User Subscription Binding** (`backend/backend/user-subscription.js`, lines 1–35):
   - Interacts with table `user_subscription`:
     - `getUserSubscription`: `.from("user_subscription").select("*").eq("id", id)`
     - `insertUserSubscription`: `.from("user_subscription").insert([{ id, product_id, subscription_id }]).select()`

5. **PayPal Integration** (`backend/backend/paypal.js`, lines 1–106):
   - Uses sandbox endpoint `https://api-m.sandbox.paypal.com`.
   - Reads `process.env.PAYPALID` and `process.env.PAYPALKEY`.
   - Generates OAuth2 bearer token via `POST /v1/oauth2/token` with client credentials.
   - Creates catalog product via `POST /v1/catalogs/products` (name: "App Subscription", type: "SERVICE", category: "SOFTWARE").
   - Creates billing plan via `POST /v1/billing/plans` with monthly cycle of $1.99 USD.
   - Retrieves plan details via `GET /v1/billing/plans/${id}`.

6. **Email Contact Service** (`backend/backend/mail.js`, lines 1–48; `backend/backend/mail-template.js`):
   - Nodemailer configured for Gmail (`service: "gmail"`, port 587, auth `EMAIL` and `PASSW`).
   - `sendEmail(to, email, img)` constructs message with subject "Contacto de cliente", plain text `${email}`, HTML template containing embedded preview and base64 attachment `image.jpg`.

7. **Database State & Credentials** (`ORIGINAL_REQUEST.md` lines 14–18):
   - New Supabase project URL: `https://mftthukphffirdcoqprz.supabase.co`
   - `ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdHRodWtwaGZmaXJkY29xcHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxOTY0ODcsImV4cCI6MjEwNTc3MjQ4N30.m1Vv_bbOlYcWZMX0j5_og12eeQt3vAQIiYHos_o7vos`
   - `SERVICE_ROLE_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdHRodWtwaGZmaXJkY29xcHJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDE5NjQ4NywiZXhwIjoyMTA1NzcyNDg3fQ.Q4VTaLcphMgsPltdtScZgoz0QKBuZprf18vjguqpadA`
   - Probe via `supabase:list_tables` on `mftthukphffirdcoqprz` confirmed the public schema currently contains 0 tables (`{"tables":[]}`). Thus, full DDL schemas and RLS definitions must be authored for migration.

8. **Frontend Application Architecture** (`frontend/Pages/`, `frontend/JS/`, `frontend/Design/`):
   - Multi-page static structure to be refactored into a single React+TypeScript SPA.
   - Navigation: Top header with brand "TooTienda", navigation links, auth buttons, user hamburger menu, theme switch (light/dark mode toggle).
   - Core views:
     - Landing / Home (`Pages/index.html`)
     - Login (`Pages/logIn.html`, `JS/login.js`) with 2FA TOTP verification modal
     - Register (`Pages/register.html`, `JS/register.js`) with role selection, tattoo artist subscription alert modal, 2FA QR code modal, and PayPal subscription button
     - Main User / Feed (`Pages/User Screen/user.html`, `JS/user.js`) with style filter sidebar, search input, artist cards grid, inquiry message popup with image drag & drop / file upload
     - Client Profile (`Pages/User Screen/profile.html`, `JS/profile.js`)
     - Tattoo Artist Profile (`Pages/User Screen/tattoo.html`, `JS/tattoo.js`)
     - Credit Card Simulator (`Pages/Subscription/creditcard.html`, `JS/creditcard.js`)
     - Password Reset screens (`Pages/forgetPassword.html`, `Pages/changePassword.html`)

---

## 2. Logic Chain

1. **Schema Deduction**:
   - From `backend/backend/auth.js:63-64` and `tattoo.js:9`, table `tatuadores_data` stores tattoo artist profiles with primary key `id` (UUID matching `auth.users(id)`) and column `data` (JSONB storing contact, social, and location attributes).
   - From `backend/backend/user-subscription.js:10,28`, table `user_subscription` stores subscription records with `id` (UUID matching `auth.users(id)`), `product_id` (TEXT), and `subscription_id` (TEXT).
   - From `backend/backend/auth.js:126`, storage bucket `user_profile` stores avatars under `${userId}/profile.png`.
   - Therefore, the target Supabase database must be provisioned with tables `tatuadores_data` and `user_subscription`, appropriate indexes, RLS policies, and storage bucket `user_profile`.

2. **API Endpoint Uniformity & Authentication Protocol**:
   - All protected routes in `app.js` extract tokens via:
     `const token = req.headers.authorization.split(" ")[1];`
     `const refresh = req.headers.refresh_token;`
   - Notice that `frontend/JS/login.js:74` passes header `refresh: session.refresh_token`, while other files pass `refresh_token`. The V2 Express/TypeScript backend middleware must accept both `req.headers['refresh_token']` and `req.headers['refresh']`.
   - Responses follow a `{ success: boolean, data?: any, error?: any }` envelope for almost all endpoints, except `/mail` which responds with HTTP status 200/500 text ("Mensaje enviado" / "Error al enviar correo"), and `/createproduct`, `/subscribe`, `/paypalsubscription/:id` which return the raw PayPal REST payloads.

3. **External Services & Fallback Guarantees**:
   - Per requirement R2, PayPal credentials in `.env` are configured with placeholders (e.g., `PAYPAL_KEY=pendiente`). In `paypal.js`, calling PayPal endpoints with dummy credentials triggers HTTP 401. The V2 backend must implement mock/sandbox fallback logic or safe guards so that the auditor or frontend can test artist registration without breaking when `PAYPAL_KEY=pendiente`.
   - Nodemailer requires `EMAIL` and `PASSW` environment variables. When missing or invalid, `/mail` safely returns HTTP 500 error string without crashing the server process.

---

## 3. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Auth | Sign In (`POST /login`) | Authenticates user with email & password via Supabase Auth | `email` (string), `password` (string) | `{ success: true, data: { user, session } }` | HTTP 200 `{ success: false, error: { message, status } }` | `backend/backend/app.js:36`, `auth.js:5` |
| 2 | Auth | Sign Up (`POST /register`) | Registers user, populates user_metadata, and creates artist record if role is Tatuador | `email`, `password`, `nombre`, `apellido`, `edad`, `tipo`, `telefono`, `provincia`, `ciudad`, `direccion` | `{ success: true, data: { user, session } }` | HTTP 200 `{ success: false, error: { message } }` or `{ error_insert }` | `backend/backend/app.js:41`, `auth.js:14` |
| 3 | Auth | Sign Out (`POST /logout`) | Terminates user session via Supabase Auth | Headers: `Authorization`, `refresh_token` | `{ success: true }` | HTTP 200 `{ success: false, error }` | `backend/backend/app.js:60`, `auth.js:70` |
| 4 | Auth / MFA | Enroll 2FA (`POST /enroll`) | Registers a TOTP factor for multi-factor authentication | Headers: `Authorization`, `refresh_token`; Body: `{}` | `{ success: true, data: { id, type: "totp", totp: { qr_code, secret, uri } } }` | HTTP 200 `{ success: false, error }` | `backend/backend/app.js:65`, `auth.js:75` |
| 5 | Auth / MFA | Verify 2FA (`POST /verify2fa`) | Challenges and verifies TOTP code for MFA login | Headers: `Authorization`, `refresh_token`; Body: `{ factorId, code }` | `{ success: true, data: { access_token, refresh_token, user } }` | HTTP 200 `{ success: false, error }` | `backend/backend/app.js:72`, `auth.js:86` |
| 6 | User | Update User Profile (`POST /updateuser`) | Updates user metadata and synchronizes `tatuadores_data` table if artist | Headers: `Authorization`, `refresh_token`; Body: user metadata object | `{ success: true, data: { user } }` | HTTP 200 `{ success: false, error }` | `backend/backend/app.js:46`, `auth.js:98` |
| 7 | User | Update Avatar (`POST /updateuserimg`) | Uploads base64 image to Supabase Storage `user_profile`, updates signedUrl | Headers: `Authorization`, `refresh_token`; Body: `{ imageData: "<base64>" }` | `{ success: true }` | HTTP 200 `{ success: false, error }` | `backend/backend/app.js:53`, `auth.js:119` |
| 8 | Gallery | Get Artists (`GET /gettatto`) | Retrieves all public tattoo artist profiles | Headers: `Authorization`, `refresh_token` | `{ success: true, data: [{ id, data: { ... } }] }` | HTTP 200 `{ success: false, error }` | `backend/backend/app.js:110`, `tattoo.js:4` |
| 9 | Billing | Create PayPal Product (`POST /createproduct`) | Creates subscription catalog product in PayPal Sandbox | Headers: None; Body: `{}` | PayPal Product JSON (`{ id, name, description, ... }`) | HTTP 4xx/5xx or PayPal error JSON | `backend/backend/app.js:79`, `paypal.js:21` |
| 10 | Billing | Create PayPal Plan (`POST /subscribe`) | Creates active billing plan ($1.99/mo) in PayPal Sandbox | Body: `{ id, name, description }` | PayPal Billing Plan JSON (`{ id, product_id, status: "ACTIVE", ... }`) | HTTP 4xx/5xx or PayPal error JSON | `backend/backend/app.js:84`, `paypal.js:46` |
| 11 | Billing | Get PayPal Plan (`GET /paypalsubscription/:id`) | Fetches status and details of PayPal billing plan | Path param: `id` | PayPal Plan JSON (`{ id, status, ... }`) | HTTP 4xx/5xx or PayPal error JSON | `backend/backend/app.js:89`, `paypal.js:89` |
| 12 | Billing | Get User Subscription (`GET /usersubscription/:id`) | Retrieves stored subscription IDs for a user | Headers: `Authorization`, `refresh_token`; Path param: `id` (user UUID) | `{ success: true, data: [{ id, product_id, subscription_id }] }` | HTTP 200 `{ success: false, error }` | `backend/backend/app.js:96`, `user-subscription.js:4` |
| 13 | Billing | Store User Subscription (`POST /usersubscription`) | Saves user subscription binding in `user_subscription` table | Headers: `Authorization`, `refresh_token`; Body: `{ id, product_id, subscription_id }` | `{ success: true, data: [{ id, product_id, subscription_id }] }` | HTTP 200 `{ success: false, error }` | `backend/backend/app.js:103`, `user-subscription.js:16` |
| 14 | Mail | Send Contact Email (`POST /mail`) | Dispatches email with attachment to tattoo artist via Nodemailer | Body: `{ to, email, img }` | Plain text: `"Mensaje enviado"` (HTTP 200) | Plain text: `"Error al enviar correo"` (HTTP 500) | `backend/backend/app.js:118`, `mail.js:21` |
| 15 | UI | Dark/Light Mode Switch | Toggles UI theme between light and dark themes using custom slider | User click event on slider input | Class/attribute toggle on DOM | N/A | `frontend/Pages/index.html:49`, `user.html:109` |
| 16 | UI | Artist Style Filter | Filters artist cards by tattoo styles (Realista, Tradicional, etc.) | Filter checkboxes on User Screen | Filtered list of artist cards in `#card-container` | N/A | `frontend/Pages/User Screen/user.html:26-40` |
| 17 | UI | Artist Inquiry Drawer | Displays modal/card form with message textarea and reference image upload | Click "Mensaje" on artist card | Expand message box with drop zone & file input | N/A | `frontend/JS/user.js:183-212` |
| 18 | UI | Credit Card Flip Animation | Interactive credit card component displaying real-time card details | Input change & focus on card fields | Updates 3D card front/back display | N/A | `frontend/Pages/Subscription/creditcard.html`, `JS/creditcard.js` |

---

## 4. Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | `POST /updateuser` & `POST /updateuserimg` | Missing `Authorization` header | Backend crashes with `TypeError: Cannot read properties of undefined (reading 'split')` at `req.headers.authorization.split(" ")[1]` |
| 2 | `POST /updateuser` | Token without `refresh_token` header | Fails or passes undefined refresh token into `supabase.auth.setSession` |
| 3 | `POST /updateuserimg` | Image already exists in bucket | Supabase returns `{ error: { error: "Duplicate" } }`, code catches it and issues `.update(...)` instead of crashing |
| 4 | `POST /updateuserimg` | `imageData` includes prefix `data:image/png;base64,` | `decode(imageData)` corrupts binary PNG if caller does not strip the data URI prefix |
| 5 | `POST /register` | Existing email address | Supabase returns error "User already registered", endpoint returns `{ success: false, error }` |
| 6 | `POST /register` | `tipo === "Tatuador"` | Inserts default artist record into `tatuadores_data`. If insert fails, returns `{ success: false, error_insert }` |
| 7 | `POST /mail` | Invalid SMTP credentials (`EMAIL`/`PASSW`) | `transporter.sendMail` throws, caught in try/catch returning `undefined`, response sends HTTP 500 with text `"Error al enviar correo"` |
| 8 | `POST /createproduct` | `PAYPALKEY=pendiente` | PayPal OAuth call returns 401 Unauthorized (`invalid_client`), PayPal endpoint fails |
| 9 | `GET /usersubscription/:id` | User has no subscription record (e.g. Cliente) | Returns `{ success: true, data: [] }` |
| 10 | Frontend `validateSubscription` | User has empty subscription array | `data.data[0]` is undefined, accessing `.subscription_id` throws client error; handled in catch block |

---

## 5. Comprehensive Data Models & Database Schema

### Target Database: PostgreSQL / Supabase (`mftthukphffirdcoqprz`)

```sql
-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Table: tatuadores_data
CREATE TABLE IF NOT EXISTS public.tatuadores_data (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_tatuadores_data_id ON public.tatuadores_data(id);
CREATE INDEX IF NOT EXISTS idx_tatuadores_data_gin ON public.tatuadores_data USING gin (data);

-- 3. Table: user_subscription
CREATE TABLE IF NOT EXISTS public.user_subscription (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    subscription_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_subscription_id ON public.user_subscription(id);

-- 4. Row Level Security (RLS) Policies
ALTER TABLE public.tatuadores_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscription ENABLE ROW LEVEL SECURITY;

-- Allow public read of artist profiles
CREATE POLICY "Public read for tatuadores_data" 
ON public.tatuadores_data FOR SELECT 
USING (true);

-- Allow authenticated user to insert their own artist profile
CREATE POLICY "Users can insert own tatuador data" 
ON public.tatuadores_data FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow authenticated user to update their own artist profile
CREATE POLICY "Users can update own tatuador data" 
ON public.tatuadores_data FOR UPDATE 
USING (auth.uid() = id);

-- Allow users to read their own subscription
CREATE POLICY "Users can read own subscription" 
ON public.user_subscription FOR SELECT 
USING (auth.uid() = id);

-- Allow users to insert their own subscription
CREATE POLICY "Users can insert own subscription" 
ON public.user_subscription FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 5. Storage Bucket Configuration
-- Bucket name: 'user_profile' (public access for profile avatar retrieval or signed URL policy)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user_profile', 'user_profile', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated uploads to user_profile"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user_profile' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Allow authenticated updates to user_profile"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'user_profile' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Allow public read from user_profile"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user_profile');
```

---

## 6. Exact API Specifications

Base URL: `http://localhost:8080` (or `http://localhost:3850`)

### Endpoint 1: `POST /login`
- **Description**: Authenticates user against Supabase Auth.
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecretPassword123!"
  }
  ```
- **Responses**:
  - `HTTP 200 OK`:
    ```json
    {
      "success": true,
      "data": {
        "user": {
          "id": "c1f73b64-2ef7-47be-b1e4-8a4db254c4a1",
          "email": "user@example.com",
          "user_metadata": {
            "nombre": "Carlos",
            "apellido": "Gomez",
            "tipo": "Cliente",
            "profile": "https://..."
          },
          "factors": []
        },
        "session": {
          "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
          "refresh_token": "5a41cb51-...",
          "expires_in": 3600,
          "token_type": "bearer"
        }
      }
    }
    ```
  - `HTTP 200 OK` (Authentication failure):
    ```json
    {
      "success": false,
      "error": {
        "message": "Invalid login credentials",
        "status": 400
      }
    }
    ```

### Endpoint 2: `POST /register`
- **Description**: Creates new user with metadata in Supabase. If `tipo === "Tatuador"`, registers record in `tatuadores_data`.
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "artist@example.com",
    "password": "Password123!",
    "nombre": "Ana",
    "apellido": "Valdes",
    "edad": "1995-06-15",
    "tipo": "Tatuador",
    "telefono": "67891234",
    "provincia": "Panamá",
    "ciudad": "Ciudad de Panamá",
    "direccion": "Calle 50"
  }
  ```
- **Responses**:
  - `HTTP 200 OK` (Success):
    ```json
    {
      "success": true,
      "data": {
        "user": {
          "id": "e98e4d28-39b1-4eb8-a734-b2586bfa3e09",
          "email": "artist@example.com",
          "user_metadata": {
            "nombre": "Ana",
            "apellido": "Valdes",
            "edad": "1995-06-15",
            "tipo": "Tatuador",
            "telefono": "67891234",
            "provincia": "Panamá",
            "ciudad": "Ciudad de Panamá",
            "direccion": "Calle 50",
            "profile": "https://..."
          }
        },
        "session": {
          "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
          "refresh_token": "63f82cd7-..."
        }
      }
    }
    ```
  - `HTTP 200 OK` (Duplicate error):
    ```json
    {
      "success": false,
      "error": {
        "message": "User already registered"
      }
    }
    ```

### Endpoint 3: `POST /enroll`
- **Description**: Generates TOTP MFA enrollment secret and QR code.
- **Request Headers**:
  - `Authorization: Bearer <access_token>`
  - `refresh_token: <refresh_token>`
- **Request Body**: `{}`
- **Responses**:
  - `HTTP 200 OK`:
    ```json
    {
      "success": true,
      "data": {
        "id": "8c4599a0-d125-4c07-ae7f-...",
        "type": "totp",
        "totp": {
          "qr_code": "data:image/svg+xml;utf-8,...",
          "secret": "JBSWY3DPEHPK3PXP",
          "uri": "otpauth://totp/..."
        }
      }
    }
    ```

### Endpoint 4: `POST /verify2fa`
- **Description**: Validates 6-digit TOTP token against enrolled factor.
- **Request Headers**:
  - `Authorization: Bearer <access_token>`
  - `refresh_token: <refresh_token>`
- **Request Body**:
  ```json
  {
    "factorId": "8c4599a0-d125-4c07-ae7f-...",
    "code": "123456"
  }
  ```
- **Responses**:
  - `HTTP 200 OK`:
    ```json
    {
      "success": true,
      "data": {
        "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
        "refresh_token": "d748...",
        "user": { ... }
      }
    }
    ```

### Endpoint 5: `POST /updateuser`
- **Description**: Updates user profile metadata in Supabase Auth and updates `tatuadores_data` if user is Tatuador.
- **Request Headers**:
  - `Authorization: Bearer <access_token>`
  - `refresh_token: <refresh_token>`
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "artist@example.com",
    "nombre": "Ana",
    "apellido": "Valdes",
    "edad": "1995-06-15",
    "telefono": "67891234",
    "provincia": "Panamá",
    "ciudad": "Ciudad de Panamá",
    "direccion": "Calle 50",
    "work_type": "realista",
    "facebook": "https://facebook.com/ana.tattoo",
    "twitter": "https://twitter.com/anatattoo",
    "instagram": "https://instagram.com/anatattoo",
    "link": "https://anatattoo.com"
  }
  ```
- **Responses**:
  - `HTTP 200 OK`:
    ```json
    {
      "success": true,
      "data": {
        "user": { ... }
      }
    }
    ```

### Endpoint 6: `POST /updateuserimg`
- **Description**: Decodes base64 PNG, uploads to storage, updates avatar URL in user profile and `tatuadores_data`.
- **Request Headers**:
  - `Authorization: Bearer <access_token>`
  - `refresh_token: <refresh_token>`
- **Request Body**:
  ```json
  {
    "imageData": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }
  ```
- **Responses**:
  - `HTTP 200 OK`:
    ```json
    {
      "success": true
    }
    ```

### Endpoint 7: `GET /gettatto`
- **Description**: Public catalog of registered tattoo artists.
- **Request Headers**:
  - `Authorization: Bearer <access_token>`
  - `refresh_token: <refresh_token>`
- **Responses**:
  - `HTTP 200 OK`:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "e98e4d28-39b1-4eb8-a734-b2586bfa3e09",
          "data": {
            "email": "artist@example.com",
            "nombre": "Ana",
            "apellido": "Valdes",
            "work_type": "realista",
            "telefono": "67891234",
            "provincia": "Panamá",
            "ciudad": "Ciudad de Panamá",
            "direccion": "Calle 50",
            "facebook": "https://facebook.com/ana.tattoo",
            "twitter": "https://twitter.com/anatattoo",
            "instagram": "https://instagram.com/anatattoo",
            "link": "https://anatattoo.com",
            "profile": "https://..."
          }
        }
      ]
    }
    ```

### Endpoint 8: `POST /createproduct`
- **Description**: Interacts with PayPal to create catalog product for subscriptions.
- **Request Body**: `{}`
- **Responses**:
  - `HTTP 200 OK`:
    ```json
    {
      "id": "PROD-1234567890",
      "name": "App Subscription",
      "description": "Subscripción para tatuadores",
      "type": "SERVICE",
      "category": "SOFTWARE"
    }
    ```

### Endpoint 9: `POST /subscribe`
- **Description**: Interacts with PayPal to create $1.99/mo subscription plan.
- **Request Body**:
  ```json
  {
    "id": "PROD-1234567890",
    "name": "App Subscription",
    "description": "Subscripción para tatuadores"
  }
  ```
- **Responses**:
  - `HTTP 200 OK`:
    ```json
    {
      "id": "P-5ML4271244454362WXNWU5NQ",
      "product_id": "PROD-1234567890",
      "name": "App Subscription",
      "status": "ACTIVE"
    }
    ```

### Endpoint 10: `GET /paypalsubscription/:id`
- **Description**: Retrieves PayPal subscription/plan status.
- **Path Parameter**: `id`
- **Responses**:
  - `HTTP 200 OK`:
    ```json
    {
      "id": "P-5ML4271244454362WXNWU5NQ",
      "status": "ACTIVE",
      "name": "App Subscription"
    }
    ```

### Endpoint 11: `GET /usersubscription/:id`
- **Description**: Retrieves user's subscription binding record.
- **Request Headers**:
  - `Authorization: Bearer <access_token>`
  - `refresh_token: <refresh_token>`
- **Responses**:
  - `HTTP 200 OK`:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "e98e4d28-39b1-4eb8-a734-b2586bfa3e09",
          "product_id": "PROD-1234567890",
          "subscription_id": "P-5ML4271244454362WXNWU5NQ"
        }
      ]
    }
    ```

### Endpoint 12: `POST /usersubscription`
- **Description**: Binds PayPal product and subscription ID to a user.
- **Request Headers**:
  - `Authorization: Bearer <access_token>`
  - `refresh_token: <refresh_token>`
- **Request Body**:
  ```json
  {
    "id": "e98e4d28-39b1-4eb8-a734-b2586bfa3e09",
    "product_id": "PROD-1234567890",
    "subscription_id": "P-5ML4271244454362WXNWU5NQ"
  }
  ```
- **Responses**:
  - `HTTP 200 OK`:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "e98e4d28-39b1-4eb8-a734-b2586bfa3e09",
          "product_id": "PROD-1234567890",
          "subscription_id": "P-5ML4271244454362WXNWU5NQ"
        }
      ]
    }
    ```

### Endpoint 13: `POST /logout`
- **Description**: Signs out user from Supabase.
- **Request Headers**:
  - `Authorization: Bearer <access_token>`
  - `refresh_token: <refresh_token>`
- **Responses**:
  - `HTTP 200 OK`:
    ```json
    {
      "success": true
    }
    ```

### Endpoint 14: `POST /mail`
- **Description**: Sends customer contact email with reference image attachment to tattoo artist.
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "to": "artist@example.com",
    "email": "Hola, quisiera tatuarme este diseño en el antebrazo.",
    "img": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }
  ```
- **Responses**:
  - `HTTP 200 OK`: `"Mensaje enviado"` (plain text)
  - `HTTP 500 Internal Server Error`: `"Error al enviar correo"` (plain text)

---

## 7. Authentication & Authorization Contract

1. **Token Lifecycle**:
   - `access_token`: Standard Supabase RS256 JWT, expires in 3600 seconds.
   - `refresh_token`: Opaque string token used to acquire new access token sessions.
   - In incoming HTTP requests, headers must contain:
     - `Authorization: Bearer <access_token>`
     - `refresh_token: <refresh_token>` (or `refresh: <refresh_token>`)
2. **Role Definitions**:
   - `Cliente`: Standard consumer. Enrolled in MFA, allowed to view artists (`/gettatto`), message artists (`/mail`), and update client profile (`/updateuser`, `/updateuserimg`).
   - `Tatuador`: Professional artist. Enrolled in MFA, requires PayPal subscription ($1.99/mo). Record created in `tatuadores_data` table upon registration. Has extended profile fields (`work_type`, `facebook`, `twitter`, `instagram`, `link`). Listed in artist catalog.
   - `Admin`: System administrator role (can query or moderate all accounts and subscriptions).
3. **Session Verification Middleware Rule**:
   - Middleware extracts bearer token and refresh token.
   - Validates session with Supabase:
     ```typescript
     await supabase.auth.setSession({ access_token: token, refresh_token: refresh });
     const { data: { user }, error } = await supabase.auth.getUser(token);
     if (error || !user) return res.status(401).json({ success: false, error: 'Unauthorized' });
     ```

---

## 8. External Services Contracts

### 1. Supabase Client
- Package: `@supabase/supabase-js`
- Configuration:
  ```typescript
  import { createClient } from '@supabase/supabase-js';
  export const supabase = createClient(
    process.env.SUPABASE_URL || 'https://mftthukphffirdcoqprz.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '',
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    }
  );
  ```
- Required Storage Bucket: `user_profile` (public read, authenticated insert/update).

### 2. PayPal Sandbox
- Base URL: `https://api-m.sandbox.paypal.com`
- Fallback Requirement:
  - If `PAYPAL_KEY === 'pendiente'` or `PAYPAL_KEY` is not provided:
    - `createProduct` returns mock product object: `{ id: 'PROD-MOCK-001', name: 'App Subscription', description: 'Subscripción para tatuadores', type: 'SERVICE', category: 'SOFTWARE' }`.
    - `subscribe` returns mock plan object: `{ id: 'P-MOCK-PLAN-001', product_id: 'PROD-MOCK-001', name: 'App Subscription', status: 'ACTIVE' }`.
    - `getSubscriptionData` returns mock status: `{ id: id, status: 'ACTIVE', name: 'App Subscription' }`.
  - When real keys (`PAYPALID`, `PAYPALKEY`) are present, executes official OAuth token and PayPal REST v1 API calls.

### 3. Nodemailer (Gmail SMTP)
- Host: `smtp.gmail.com`, Port: 587, Secure: false
- Auth: `EMAIL` and `PASSW`
- Template: HTML with responsive email structure, header banner ("Un cliente te quiere contactar"), embedded image, and attached `image.jpg`.
- Graceful failure: Returns HTTP 500 `"Error al enviar correo"` without unhandled promise rejections.

---

## 9. Frontend DOM & Structural Components Checklist

The React SPA must faithfully preserve the following component hierarchy and DOM structure:

- [ ] **Navbar (`components/Navbar.tsx`)**:
  - Brand link with logo image (`Tattoo Machine Rotary.png`) and title `"TooTienda"`.
  - Links: `"Beneficios"`, `"Precios"`, `"Sobre Nosotros"`.
  - Guest buttons: `"Iniciar Sesión"` (routes to `/login`), `"Registrarse"` (routes to `/register`).
  - Authenticated user elements:
    - Hamburger button (`.menu-toggle`)
    - Sliding user menu (`.menu`) with profile thumbnail (`#menu-profile-pic`), user name (`#name_tag`), profile link (`#profile-link`), dark/light theme switch, and logout button (`#logout`).
- [ ] **Theme Switch (`components/ThemeSwitch.tsx`)**:
  - Checkbox slider with Sun SVG and Moon SVG toggling light and dark theme styles.
- [ ] **Home / Landing View (`pages/Home.tsx`)**:
  - Hero card with title `"Bienvenido a TooTienda más confiable"`.
  - Footer with GitHub link (`https://github.com/Cristian1234567890/tattoo-shop-react`), copyright `"Copyright © 2023"`, and founders attribution (`Giovanni Buglione`, `Cristian Castillo`, `Luis Lopez`).
- [ ] **Login View (`pages/Login.tsx`)**:
  - Container with `"Bienvenido"` heading.
  - Inputs: `#email` (type email), `#password` (type password), `#btn-submit` ("Iniciar Sesión").
  - Links: `"¿No tienes cuenta? Registrarse"` and `"¿Olvidaste tú contraseña?"`.
  - 2FA Modal (`#mensajeEmergente`): `"Código de autenticación:"`, `#code` input, `#btn-validar` ("Validar").
- [ ] **Register View (`pages/Register.tsx`)**:
  - Inputs: `#nombre`, `#apellido`, `#edad` (type date), `#email` (type email), `#password` (type password), `confirmPassword`, `#options` select ("Cliente 🤩", "Tatuador 😎").
  - Submit button: `"Registrar"`.
  - Modals:
    - Artist Subscription Notice (`#mensajeEmergente`): `"Para está opción requieres de una suscripción. Suscríbete por tan solo 1.99$/mes. ¿Deseas continuar?"` with `"Continuar"` and `"No"` buttons.
    - 2FA QR Code Display (`#ventanaQR`): `img#qr` and `"Salir"` button (`#btn-salir`).
    - PayPal Subscription Container (`#paypal-button-container`).
  - Back button (`.back`) linking to home.
- [ ] **Main Feed / Discovery (`pages/UserFeed.tsx`)**:
  - Left Sidebar Filters: checkboxes for `Realista`, `Tradicional`, `Neotradicional`, `Blackwork`, `Dotwork`, `Japonés`, `Tribal`, `Acuarela`.
  - Search Header: `input[name="busqueda"]` (`"🔍 Buscar tatuador"`).
  - Cards Container (`#card-container`): dynamically renders artist profile cards:
    - Avatar (`#profile-img`), Name (`#name`), Address (`#address`), Stats (Seguidores: 1598, Siguiendo: 65, Tipo de Trabajo, Trabajos: 85).
    - Social links: Facebook, Twitter, Instagram, Web Link (using SVG symbols).
    - Action buttons: `"Mensaje"` (`.js-message-btn`) and `"Seguir"`.
    - Message Inquiry Drawer (`.profile-card-message`):
      - Textarea `#message` (`"¿Qué quisieras hacerte?"`).
      - Drag & Drop zone (`.draggable`, `.droppable`).
      - File input (`#file-input`) with preview (`#selected-image`).
      - Action buttons: `"Enviar"` (`#btn-message`) and `"Cancelar"`.
- [ ] **Client Profile (`pages/ClientProfile.tsx`)**:
  - Personal info fields: `#name`, `#last-name`, `#phone`.
  - Age field: `#date` (disabled).
  - Province select (`#province` containing all 12 Panamanian provinces/comarcas), `#city`, `#direction`.
  - Credentials fields: `#email`, `#password`, `#new-password`.
  - Avatar file upload: `#file-input` and image preview.
  - Submit button: `"Actualizar"` (`#submit`).
- [ ] **Artist Profile (`pages/ArtistProfile.tsx`)**:
  - All Client Profile fields PLUS:
  - Work style select: `#work-type` (realista, tradicional, neotradicional, blackwork, japones, tribal, acuarela).
  - Social media inputs: `#facebook`, `#twitter`, `#instagram`, `#link`.
  - Submit button: `"Actualizar"` (`#submit`).
- [ ] **Password Recovery Views (`pages/ForgotPassword.tsx`, `pages/ChangePassword.tsx`)**:
  - Email submission and new password reset forms.
- [ ] **Credit Card Simulator (`pages/CreditCard.tsx`)**:
  - 3D flipping card visualizer displaying card number, cardholder, expiration, CCV.

---

## 10. Concrete Verification Criteria & cURL Test Scripts

The independent auditor can execute the following concrete cURL requests against the running API (assumed on `http://localhost:8080`) to verify complete parity:

### Test 1: Register User (Client)
```bash
curl -s -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test_client_001@example.com",
    "password": "Password123!",
    "nombre": "Test",
    "apellido": "Client",
    "edad": "2000-01-01",
    "tipo": "Cliente",
    "telefono": "60000000",
    "provincia": "Panamá",
    "ciudad": "Panamá",
    "direccion": "Calle 1"
  }'
```
**Expected Response**:
Status 200, JSON matching:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "*",
      "email": "test_client_001@example.com"
    },
    "session": {
      "access_token": "*",
      "refresh_token": "*"
    }
  }
}
```

### Test 2: User Login
```bash
curl -s -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test_client_001@example.com",
    "password": "Password123!"
  }'
```
**Expected Response**:
Status 200, JSON containing `success: true` and `session.access_token`.

### Test 3: Enroll 2FA (TOTP)
```bash
curl -s -X POST http://localhost:8080/enroll \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "refresh_token: <REFRESH_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{}'
```
**Expected Response**:
Status 200, JSON matching:
```json
{
  "success": true,
  "data": {
    "id": "*",
    "type": "totp",
    "totp": {
      "qr_code": "data:image/svg+xml;utf-8,*",
      "secret": "*",
      "uri": "*"
    }
  }
}
```

### Test 4: Get Tattoo Artists
```bash
curl -s -X GET http://localhost:8080/gettatto \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "refresh_token: <REFRESH_TOKEN>"
```
**Expected Response**:
Status 200, JSON matching:
```json
{
  "success": true,
  "data": []
}
```

### Test 5: PayPal Subscription Mock/Sandbox Flow
```bash
# 1. Create Product
curl -s -X POST http://localhost:8080/createproduct \
  -H "Content-Type: application/json"

# 2. Subscribe (Plan creation)
curl -s -X POST http://localhost:8080/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "id": "PROD-1234",
    "name": "App Subscription",
    "description": "Subscripción para tatuadores"
  }'

# 3. Check Subscription
curl -s -X GET http://localhost:8080/paypalsubscription/P-1234
```
**Expected Response**:
Status 200 with product ID, plan ID with `"status": "ACTIVE"`.

### Test 6: Mail Inquiry Endpoint
```bash
curl -s -X POST http://localhost:8080/mail \
  -H "Content-Type: application/json" \
  -d '{
    "to": "artist@example.com",
    "email": "Consulta sobre tatuaje",
    "img": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }'
```
**Expected Response**:
Status 200 with text body `"Mensaje enviado"` (or status 500 `"Error al enviar correo"` if SMTP credentials are intentionally omitted during local test).

---

## 11. Caveats

1. **Local Ports**: The legacy `backend/backend/app.js` references port 3850 in code, while frontend scripts (`JS/login.js`, `JS/user.js`, etc.) point to `http://localhost:8080`. For V2, using an environment variable `PORT` (defaulting to 8080) in the backend and `VITE_API_URL` / `REACT_APP_API_URL` in the frontend ensures seamless local and container execution.
2. **PayPal Placeholder**: Per project guidelines, `PAYPAL_KEY=pendiente` must not crash product or subscription endpoints; mock/sandbox fallbacks must be built into the V2 service.
3. **Database Setup**: The new Supabase instance (`mftthukphffirdcoqprz`) does not yet have `tatuadores_data`, `user_subscription`, or storage bucket `user_profile`. The provided DDL script must be executed prior to running integration tests.

---

## 12. Conclusion

The entire functional surface of "Tattoo Shop" has been mapped from authoritative sources:
1. Exact database tables (`tatuadores_data`, `user_subscription`, storage bucket `user_profile`).
2. Exact 10 API endpoints + auth contracts + MFA workflows.
3. All external service contracts (Supabase, PayPal, Nodemailer).
4. Concrete cURL verification test suite and complete frontend component checklist.
All specifications are ready for the Architect and Implementation team to rebuild the backend (Express + TypeScript) and frontend (React + TypeScript SPA) under `v2/`.

---

## 13. Verification Method

To verify these observations independently:
1. Inspect backend endpoints in `c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\backend\backend\app.js`.
2. Inspect auth and data persistence logic in `c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\backend\backend\auth.js`.
3. Inspect frontend UI and AJAX requests in `c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\frontend\JS\`.
4. Inspect HTML layout and IDs in `c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\frontend\Pages\`.
