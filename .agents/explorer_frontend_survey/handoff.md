# Frontend Survey & Modern React + TypeScript SPA Architectural Plan

**Author:** `explorer_frontend_survey`  
**Date:** 2026-09-23T23:35:00Z  
**Reference Directory:** `c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\frontend`  
**Target Migration Directory:** `c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\v2\frontend`

---

## 1. Observation

Direct examination of the reference frontend located at `c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\frontend` and related backend endpoints at `c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\backend\backend` yielded the following findings:

### 1.1 Directory & File Inventory

The `frontend` folder contains 4 subdirectories (`Pages`, `JS`, `Design`, `Img`) and 5 root configuration/documentation files:
- **Root files**:
  - `Dockerfile` (14 lines): Nginx-based static web server exposing port 8080 (`EXPOSE 8080`, `CMD ["nginx", "-g", "daemon off;"]`).
  - `.dockerignore`, `.gitignore`, `LICENSE`, `README.md`.
- **HTML Pages** (`frontend/Pages/`):
  1. `Pages/index.html` (60 lines): Landing page with navigation bar, hero card, footer with links, and theme toggle switch.
  2. `Pages/logIn.html` (59 lines): User login view with email/password form and 2FA TOTP verification modal (`#mensajeEmergente`).
  3. `Pages/register.html` (98 lines): User registration view for Cliente / Tatuador, TOTP QR setup modal (`#ventanaQR`), subscription notice modal (`#mensajeEmergente`), and PayPal button container (`#paypal-button-container`).
  4. `Pages/forgetPassword.html` (50 lines): Password recovery request view with email input.
  5. `Pages/changePassword.html` (50 lines): Password reset view with new password / confirm password inputs.
  6. `Pages/Subscription/creditcard.html` (137 lines): 3D interactive credit card preview and credit card payment form.
  7. `Pages/User Screen/user.html` (137 lines): Authenticated user dashboard with style filter checkboxes, search bar, dynamic artist cards container (`#card-container`), SVG icon definitions, and off-canvas user menu.
  8. `Pages/User Screen/tattoo.html` (119 lines): Profile management screen for tattoo artists (avatar upload, personal data, tattoo style specialization, social links, location, credentials).
  9. `Pages/User Screen/profile.html` (92 lines): Profile management screen for standard clients (avatar upload, personal data, location, credentials).
- **JavaScript Files** (`frontend/JS/`):
  1. `JS/main.js` (0 bytes): Empty script referenced by `index.html`.
  2. `JS/login.js` (112 lines): Handles login submission (`POST /login`), session storage persistence, and TOTP 2FA verification (`POST /verify2fa`).
  3. `JS/register.js` (262 lines): Handles user registration (`POST /register`), TOTP MFA enrollment (`POST /enroll`), QR modal display, PayPal product & subscription creation (`POST /createproduct`, `POST /subscribe`, `POST /usersubscription`), and PayPal SDK button rendering.
  4. `JS/creditcard.js` (66 lines): jQuery script controlling the 3D flipping card, CCV focus, and dynamic card number/holder/expiry text mirroring.
  5. `JS/user.js` (345 lines): Off-canvas menu toggle, logout handler (`POST /logout`), session-based avatar/name population, PayPal subscription status verification (`GET /usersubscription/:id` -> `GET /paypalsubscription/:subscription_id`), and dynamic artist card rendering (`GET /gettatto`) with message sending (`POST /mail`).
  6. `JS/tattoocard.js` (54 lines): Commented-out prototype logic for card interaction, drag-and-drop, and file upload (integrated directly into `user.js`).
  7. `JS/tattoo.js` (172 lines): Tatuador profile data population and submission (`POST /updateuser`) and base64 profile picture upload (`POST /updateuserimg`).
  8. `JS/profile.js` (148 lines): Cliente profile data population and submission (`POST /updateuser`) and base64 profile picture upload (`POST /updateuserimg`).
- **Styles & SCSS Files** (`frontend/Design/`):
  - `Design/style.scss` & `style.css` (309 lines): Global typography (`Roboto`), base reset, navbar styles, footer, dark/light theme switch with sun/moon SVG animations, and background image panning animation (`@keyframes slidein 100s infinite alternate`).
  - `Design/main.scss` & `main.css`: Landing card container and hero banner styling.
  - `Design/login.css` & `register.css`: Centered card containers, inputs, buttons, and popups (`#mensajeEmergente`, `#ventanaQR`).
  - `Design/creditcard.scss` & `creditcard.css`: 3D flip card card styling with CSS transforms (`perspective: 1000px`, `transform-style: preserve-3d`), chip, and form styling.
  - `Design/changepassword.css` & `forgetpassword.css`: Centered form styling.
  - `Design/Users/user.scss` & `user.css`: Dashboard 2-column layout (sidebar filter + main area), off-canvas sliding menu (`.menu.open`), and theme switch.
  - `Design/Users/tattoocard.scss` & `tattoocard.css` (484 lines): Detailed artist profile card component (`.profile-card`), avatar ring shadow, social media gradient buttons, stats row, action buttons ("Mensaje", "Seguir"), active state blur filter (`filter: blur(6px)`), message modal overlay, drag & drop dropzone, and file upload preview.
  - `Design/Users/profile.scss` & `profile.css`: User profile edit form layout, 2-column sidebar layout, upload preview.
- **Assets** (`frontend/Img/`):
  - 17 files:
    - Backgrounds: `1251.jpg`, `1403.jpg`, `1571.jpg`, `back.jpg`, `background.jpg`.
    - Logos & Icons: `Tattoo Machine Rotary.png`, `Tattoo Machine Rotary White.png`, `Back To Black.png`, `Back To White.png`, `Facebook White.png`, `Instagram White.png`, `Twitter White.png`, `Link White.png`, `GitHub Black.png`, `GitHub White.png`.
    - Profile images: `GB Tattoo.jpg`, `GB.jpeg`.

---

### 1.2 UI Views, DOM Hierarchy & Component Structure

#### View 1: Landing Page (`index.html`)
- **Navigation Bar (`<nav class="menu">`)**:
  - Left (`.start`): Logo image (`Tattoo Machine Rotary.png`) + Title text `"TooTienda"`.
  - Center (`.center`): Links `"Beneficios"`, `"Precios"`, `"Sobre Nosotros"`.
  - Right (`.end`): Buttons `"Iniciar Sesión"` (link to `logIn.html`), `"Registrarse"` (link to `register.html`).
- **Main Hero Area (`<main>` -> `#main` -> `#card` -> `#img-main`)**:
  - Background banner with heading: `"Bienvenido a TooTienda más confiable"`.
- **Footer (`<footer>` -> `#footer`)**:
  - GitHub link with icon (`GitHub White.png` linking to repository).
  - Copyright & Founders block: Giovanni Buglione (Frontend), Cristian Castillo (Backend), Luis Lopez (Backend).
  - Theme Switch (`#btn-switch`): Checkbox toggle with embedded animated SVG Sun & Moon icons.

#### View 2: Authentication - Login (`logIn.html`)
- **Navbar**: Consistent header with navigation links and logo.
- **Session Container (`.container` -> `.session`)**:
  - Title: `"Bienvenido"`.
  - Inputs: Email (`type="email"`, id `"email"`), Password (`type="password"`, id `"password"`).
  - Submit Button: `"Iniciar Sesión"` (`#btn-submit`).
  - Helper links (`.pages`): `"¿No tienes cuenta? Registrarse"` and `"¿Olvidaste tú contraseña?"`.
- **2FA Modal (`#mensajeEmergente`)**:
  - Hidden by default (`display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%)`).
  - Elements: Code input (`#code`), Button `"Validar"` (`#btn-validar`).

#### View 3: Authentication - Register (`register.html`)
- **Navbar**: Consistent header.
- **Registration Form Container (`#createUserForm`)**:
  - Fields:
    - Nombre (`name="nombre"`)
    - Apellido (`name="apellido"`)
    - Edad (`type="date"`, `name="edad"`)
    - Correo Electrónico (`type="email"`, `name="email"`)
    - Contraseña (`type="password"`, `name="password"`)
    - Confirmar Contraseña (`type="password"`)
    - Role selector (`<select name="tipo" id="options">`): Options: `Cliente 🤩` or `Tatuador 😎`.
  - Submit button: `"Registrar"` (`#btn-submit`).
  - Switch to Login link: `"¿Ya estás registrado? Iniciar Sesión"`.
- **Modals / Popups**:
  - `#mensajeEmergente`: Subscription notice for Tatuador ("Para está opción requieres de una suscripción. Suscríbete por tan solo 1.99$/mes. ¿Deseas continuar? [Continuar] [No]").
  - `#ventanaQR`: Modal displaying TOTP authenticator QR code (`<img id="qr">`) with exit button (`#btn-salir`).
  - `#tipoPago`: Modal for payment methods.
  - `#paypal-button-container`: Container for rendering PayPal Subscription SDK buttons.

#### View 4: User Dashboard (`user.html`)
- **Left Column (`.column1`)**:
  - Logo and brand heading.
  - Divider `<hr>`.
  - Filter section header: `"Filtros"`.
  - Checkboxes for Tattoo Styles:
    - Realista (`#realista`)
    - Tradicional (`#tradicional`)
    - Neotradicional (`#neotradicional`)
    - Blackwork (`#blackwork`)
    - Dotwork (`#botwork` [sic])
    - Japonés (`#japones`)
    - Tribal (`#tribal`)
    - Acuarela (`#acuarela`)
- **Center Column (`.column2`)**:
  - Search input: `🔍 Buscar tatuador` (`name="busqueda"`).
  - Dynamic artist card container (`#card-container`).
  - Hidden SVG symbol definitions: `#icon-facebook`, `#icon-instagram`, `#icon-twitter`, `#icon-link`.
- **Artist Profile Card (`.profile-card`) [Rendered dynamically by `user.js`]**:
  - Avatar image in circular glowing border (`.profile-card__img`).
  - Artist Name (`.profile-card__name`).
  - Location subtitle: `"Tatuador ubicado en: <provincia>, <ciudad>"`.
  - Metrics row (`.profile-card-inf`):
    - Followers (`1598 Seguidores`)
    - Following (`65 Siguiendo`)
    - Work Type (`work_type Tipo de Trabajo`)
    - Completed Works (`85 Trabajos`)
  - Social Links (`.profile-card-social`): Circular gradient buttons for Facebook, Twitter, Instagram, Link.
  - Action Buttons (`.profile-card-ctr`):
    - `"Mensaje"` button (`.js-message-btn`) - triggers flip/modal overlay.
    - `"Seguir"` button (`.button--orange`).
  - Message Form Overlay (`.profile-card-message`):
    - Textarea: `"¿Qué quisieras hacerte?"` (`#message`).
    - Drag & Drop zone (`.dragdrop`): `.draggable` ("Ingresa un ejemplo de tatuaje ⤵️") + `.droppable` ("Suelta aquí").
    - File upload (`<input type="file" id="file-input">`) with preview container (`#selected-image`).
    - Actions: `"Enviar"` (`#btn-message`) and `"Cancelar"` (`.js-message-close`).
- **Off-Canvas Navigation Drawer (`.right` -> `.menu`)**:
  - Toggle button: `☰` (`.menu-toggle`) fixed at top-right.
  - User avatar thumbnail (`#menu-profile-pic`).
  - User name label (`#name_tag`).
  - Link to Profile: `#profile-link` (dynamically routes to `profile.html` for Cliente or `tattoo.html` for Tatuador).
  - Dark/Light mode slider switch (`#btn-switch`).
  - Logout action link: `"Cerrar Sesión"` (`#logout`).

#### View 5: Profile Management (`tattoo.html` & `profile.html`)
- **Layout**: 2 columns (Left column with back link to `user.html` and section menu; Right column with form `#profileForm`).
- **Fields in `profile.html` (Cliente)**:
  - Avatar upload (`#file-input`) with preview (`#selected-image`).
  - Personal: Nombre (`#name`), Apellido (`#last-name`), Teléfono (`#phone`).
  - Edad: Date picker (`#date`, disabled).
  - Dirección: Provincia dropdown (`#province`, 12 Panamanian provinces/comarcas), Ciudad (`#city`), Dirección (`#direction`).
  - Credenciales: Email (`#email`), Contraseña (`#password`), Nueva Contraseña (`#new-password`).
  - Submit: Button `"Actualizar"` (`#submit`).
- **Additional fields in `tattoo.html` (Tatuador)**:
  - Specialization: Tipo de Trabajo (`#work-type` select: realista, tradicional, neotradicional, blackwork, japones, tribal, acuarela).
  - Social Links: Facebook (`#facebook`), Twitter (`#twitter`), Instagram (`#instagram`), Link (`#link`).

#### View 6: Credit Card View (`creditcard.html`)
- Animated 3D credit card flip box with Visa SVG logo, chip, dynamically synced card number, card holder, expiration date (month/year), and CCV on back side.
- 4x4 input fields for card number with auto-tabbing, expiration dropdowns, CCV with flip-on-focus effect.

---

### 1.3 Client-Side State, Events & Validation Logic

1. **Session State**:
   - Stored in browser `sessionStorage` under key `"user"`.
   - Payload structure:
     ```json
     {
       "user": {
         "id": "uuid",
         "email": "user@example.com",
         "user_metadata": {
           "nombre": "Giovanni",
           "apellido": "Buglione",
           "edad": "1998-05-12",
           "tipo": "Cliente" | "Tatuador",
           "telefono": "123456",
           "provincia": "Panamá",
           "ciudad": "Ciudad de Panamá",
           "direccion": "Calle 50",
           "profile": "https://...signedUrl...",
           "work_type": "realista",
           "facebook": "",
           "twitter": "",
           "instagram": "",
           "link": ""
         },
         "factors": [{ "id": "factor-uuid" }]
       },
       "session": {
         "access_token": "jwt...",
         "refresh_token": "token..."
       }
     }
     ```
2. **Event Handlers & Interactivity**:
   - `login.js`:
     - `handleClickLogin`: Reads email and password, executes `POST /login`. If successful, sets `sessionStorage.user` and shows 2FA code popup.
     - `handleValidate2FA`: Reads 6-digit code, executes `POST /verify2fa` with factorId and auth headers. If verified, updates session, shows Swal success alert, and navigates to `user.html`.
   - `register.js`:
     - Role Check on submit: If `tipo === "Tatuador"`, halts submission and displays modal `#mensajeEmergente` warning that a $1.99/month subscription is required.
     - Form submit: Sends registration payload to `POST /register`, then calls `POST /enroll` to generate TOTP secret and displays QR code modal (`#ventanaQR`).
     - QR exit (`#btn-salir`): If Cliente, navigates directly to `user.html`. If Tatuador, creates PayPal product (`POST /createproduct`), billing plan (`POST /subscribe`), links subscription to user (`POST /usersubscription`), and renders PayPal button via PayPal SDK `paypal.Buttons()`.
   - `user.js`:
     - Off-canvas sidebar open/close on hamburger click or document click outside.
     - Logout: Calls `POST /logout`, resets `sessionStorage.user = {}`, redirects to `index.html`.
     - `DOMContentLoaded`:
       - Subscription check: Queries `GET /usersubscription/:id` and validates status with `GET /paypalsubscription/:subscription_id`. If status is not `"ACTIVE"`, alerts user and kicks them back to `logIn.html`.
       - Renders cards via `GET /gettatto`.
       - Card Message Flip: On clicking `.js-message-btn`, adds class `.active` to `.profile-card`, triggering CSS transition and modal overlay.
       - Drag & Drop: Native HTML5 drag events (`dragstart`, `dragover`, `drop`) on `.droppable`.
       - Message Send: Extracts message text and base64-encoded image, calls `POST /mail` with recipient artist email.
   - `tattoo.js` & `profile.js`:
     - Auto-populates all inputs from `sessionStorage` user metadata.
     - Image file picker reads image as data URL via `FileReader` and previews in `#selected-image`.
     - Form submit calls `POST /updateuser` and `POST /updateuserimg` (sending image as base64 string).

---

### 1.4 API Contract Mapping

All calls from the frontend to the backend use JSON payloads and require `Authorization: Bearer <access_token>` and `refresh_token` (or `refresh`) headers for authenticated endpoints:

| Endpoint | Method | Source File & Line | Request Headers | Request Body | Response Format | Purpose |
|---|---|---|---|---|---|---|
| `http://localhost:8080/login` | `POST` | `login.js:41` | None | `{ email, password }` | `{ success: boolean, data: { user, session } }` | Authenticate user with Supabase Auth |
| `http://localhost:8080/verify2fa` | `POST` | `login.js:65` | `Authorization: Bearer <token>`, `refresh: <refresh_token>` | `{ factorId, code }` | `{ success: boolean, data: session }` | Verify TOTP MFA 6-digit code |
| `http://localhost:8080/register` | `POST` | `register.js:90` | None | `{ email, password, nombre, apellido, edad, tipo }` | `{ success: boolean, data: { user, session } }` | Register new user + insert initial metadata/artist row |
| `http://localhost:8080/enroll` | `POST` | `register.js:136` | `Authorization: Bearer <token>`, `refresh_token: <refresh_token>` | `{}` | `{ success: boolean, data: { totp: { qr_code } } }` | Enroll TOTP MFA factor and generate QR code |
| `http://localhost:8080/createproduct` | `POST` | `register.js:161` | None | `{}` | `{ id, name, description }` | Create PayPal catalog product |
| `http://localhost:8080/subscribe` | `POST` | `register.js:164` | None | `{ id, name, description }` | `{ id: plan_id, product_id }` | Create PayPal billing plan ($1.99/mo) |
| `http://localhost:8080/usersubscription` | `POST` | `register.js:172` | `Authorization: Bearer <token>`, `refresh_token: <refresh_token>` | `{ id: user.id, product_id, subscription_id }` | `{ success: boolean, data }` | Link user to PayPal subscription record in Supabase |
| `http://localhost:8080/usersubscription/:id` | `GET` | `register.js:200`, `user.js:308` | `Authorization: Bearer <token>`, `refresh_token: <refresh_token>` | None | `{ success: boolean, data: [{ subscription_id, ... }] }` | Retrieve user's PayPal subscription reference |
| `http://localhost:8080/paypalsubscription/:id` | `GET` | `user.js:317` | None | None | `{ status: "ACTIVE" \| ... }` | Verify live PayPal subscription status |
| `http://localhost:8080/gettatto` | `GET` | `user.js:93` | `Authorization: Bearer <token>`, `refresh_token: <refresh_token>` | None | `{ success: boolean, data: [{ id, data: { ... } }] }` | Fetch public tattoo artists catalog |
| `http://localhost:8080/updateuser` | `POST` | `tattoo.js:103`, `profile.js:78` | `Authorization: Bearer <token>`, `refresh_token: <refresh_token>` | `{ email, nombre, apellido, edad, telefono, provincia, ciudad, direccion, [work_type, facebook, twitter, instagram, link] }` | `{ success: boolean, data }` | Update user metadata & `tatuadores_data` table |
| `http://localhost:8080/updateuserimg` | `POST` | `tattoo.js:138`, `profile.js:114` | `Authorization: Bearer <token>`, `refresh_token: <refresh_token>` | `{ imageData: <base64> }` | `{ success: boolean }` | Upload avatar to Supabase Storage bucket `user_profile` |
| `http://localhost:8080/logout` | `POST` | `user.js:56` | `Authorization: Bearer <token>`, `refresh_token: <refresh_token>` | `{}` | `{ success: boolean }` | Sign out from Supabase Auth |
| `http://localhost:8080/mail` | `POST` | `user.js:280` | `Authorization: Bearer <token>`, `refresh_token: <refresh_token>` | `{ to: card_data.email, email: message, img: base64 }` | Text: `"Mensaje enviado"` (Status 200) | Send email to tattoo artist with attachment |

---

## 2. Logic Chain

1. **Legacy Architecture Analysis**:
   - The reference frontend is built with traditional multi-page HTML documents (`MPA`), plain Vanilla JS modules using IIFE patterns (`(() => { const App = { ... }; App.init(); })()`), and scattered SCSS files compiled into CSS.
   - Page navigation relies on browser redirects (`window.location.href`), leading to full-page reloads and loss of memory state.
   - Authentication tokens are manually serialized and read from `sessionStorage`, leading to fragile state synchronization and lack of proactive token refresh handling.
   - Inconsistencies in API header naming exist in the reference code: `login.js` uses `refresh: session.refresh_token` (line 74), while `register.js` uses `refresh_token: session.refresh_token` (line 142). The backend controller (`app.js` line 48, 67, 99) reads `req.headers.refresh_token` and in line 48 `req.headers.refresh_token`, but `login.js` sent `refresh`. In a refactored TypeScript client, an API interceptor must standardize this.

2. **UI & User Experience Shortcomings to Address in Modern SPA**:
   - Direct DOM manipulation via `document.getElementById` and string interpolation (`innerHTML = '<div class="wrapper">...'`) in `user.js` is prone to XSS and memory leaks.
   - Filter checkboxes in `user.html` (lines 26-40: `realista`, `tradicional`, etc.) and the search input (`name="busqueda"`) have HTML markup but **lack active event listener implementations** in the legacy `user.js`. In the refactored SPA, this should be a fully reactive, instantaneous client-side filter and search pipeline.
   - The credit card component (`creditcard.html` + `creditcard.js`) relies on jQuery (`$('...')`). In modern React, this can be implemented cleanly with React state and pure CSS 3D transforms.
   - Modals in the legacy app (`#mensajeEmergente`, `#ventanaQR`) use basic `position: fixed` and `display: none / block` inline styling without focus traps, accessible ARIA attributes, or backdrop dismissal animations.
   - Alert notifications rely on `Swal.fire` (SweetAlert2), which blocks user flow; a modern toast notifications system (e.g. Sonner or Radix Toast) combined with accessible Dialogs provides a superior UX.

3. **Rebuilding Plan Derivation**:
   - Since `ORIGINAL_REQUEST.md` specifies building the new version in `v2/frontend` with React + TypeScript, Vite is the ideal modern build tool (high performance, native ES modules, zero config TypeScript support).
   - React Router v6/v7 will provide client-side routing, route protection (`ProtectedRoute`), and persistent layouts without full-page reloads.
   - A modern styling system (Tailwind CSS + Tailwind Animate + CSS variables) can replicate and enhance the dark tattoo aesthetic, animated panning background, neon glows, and gradient buttons while providing high maintainability and responsive design.

---

## 3. Caveats

1. **Empty / Incomplete Features in Legacy Codebase**:
   - `frontend/JS/main.js` is completely empty (0 bytes). The landing page navigation links (`Beneficios`, `Precios`, `Sobre Nosotros`) currently point to empty anchors (`href=""`).
   - The search bar (`busqueda`) and style filters (`#realista`, `#tradicional`, etc.) in `user.html` are defined in HTML, but `user.js` does not attach filter listeners to them; it merely displays all artists returned by `GET /gettatto`.
   - `forgetPassword.html` and `changePassword.html` have forms in HTML, but lack dedicated JS files in `frontend/JS`. They will need proper hook-up with Supabase password reset methods in v2.
   - The PayPal SDK integration in `register.html` uses sandbox test client IDs (`AX-_teHERX93...`). Per `ORIGINAL_REQUEST.md`, PayPal credentials will be configured with environment variables in `.env`.
2. **Backend Port Divergence**:
   - The frontend JavaScript code calls `http://localhost:8080`, whereas `backend/backend/app.js` sets `PORT = 3850` (or 8080 depending on comment in line 27). The refactored frontend must use a Vite environment variable (`VITE_API_BASE_URL`) to allow seamless switching.

---

## 4. Conclusion & Modern SPA Architectural Plan for `v2/frontend`

### 4.1 Recommended Technology Stack

| Layer | Tool / Library | Rationale |
|---|---|---|
| **Build & Bundler** | **Vite + TypeScript** | Instant HMR, strict type safety, fast production builds with Rollup. |
| **UI Framework** | **React 18 / 19** | Component-driven architecture, declarative state, seamless hooks. |
| **Routing** | **React Router v6 / v7** | Nested routes, layout sharing, client-side route guards, seamless URL navigation. |
| **Styling & Icons** | **Tailwind CSS + Lucide React** | Utility-first styling, preserves dark tattoo theme, responsive design, fast prototyping. |
| **Component Primitives** | **Radix UI / shadcn/ui patterns** | Accessible dialogs, dropdowns, switches, tabs, and focus management. |
| **Server State & Caching** | **TanStack Query (React Query v5)** | Declarative data fetching, caching, loading states, mutation rollbacks. |
| **Form Management** | **React Hook Form + Zod** | Strongly-typed form validation with schema parsing for auth, profile, and messaging. |
| **Payments** | **@paypal/react-paypal-js** | Official React PayPal SDK component for subscription creation and buttons. |
| **Notifications** | **Sonner** | Modern, accessible toast notifications to replace SweetAlert2. |

---

### 4.2 Proposed Project Directory Layout (`v2/frontend`)

```
v2/frontend/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── public/
│   └── favicon.ico
└── src/
    ├── assets/
    │   ├── images/              # Ported images (1403.jpg, backgrounds, rotary machine)
    │   └── icons/
    ├── components/
    │   ├── ui/                  # Reusable UI primitives
    │   │   ├── Button.tsx
    │   │   ├── Input.tsx
    │   │   ├── Select.tsx
    │   │   ├── Dialog.tsx       # Modals (TOTP QR, Subscription warning, Message overlay)
    │   │   ├── ThemeSwitch.tsx  # Animated Sun/Moon theme toggle
    │   │   ├── Avatar.tsx
    │   │   └── Card.tsx
    │   ├── layout/
    │   │   ├── Navbar.tsx       # Public & App navigation
    │   │   ├── Footer.tsx       # Team attribution & repository link
    │   │   ├── Sidebar.tsx      # Filter drawer & Off-canvas user menu
    │   │   └── AppLayout.tsx    # Authenticated dashboard wrapper
    │   ├── auth/
    │   │   ├── LoginForm.tsx
    │   │   ├── RegisterForm.tsx
    │   │   ├── TwoFactorModal.tsx
    │   │   └── ForgotPasswordForm.tsx
    │   ├── dashboard/
    │   │   ├── ArtistCard.tsx   # Interactive artist card with flip overlay
    │   │   ├── ArtistFilter.tsx # Real-time style filter checkboxes
    │   │   ├── SearchBar.tsx    # Live artist search input
    │   │   └── MessageModal.tsx # Drag-and-drop reference image + email inquiry form
    │   ├── payment/
    │   │   ├── InteractiveCard.tsx # Pure React 3D credit card visualizer
    │   │   └── PayPalSubscription.tsx
    │   └── profile/
    │       └── ProfileEditor.tsx # Unified role-aware profile update form
    ├── context/
    │   ├── AuthContext.tsx      # Auth session, user metadata, login/logout functions
    │   └── ThemeContext.tsx     # Light/Dark mode state
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useTattooArtists.ts
    │   ├── useSubscription.ts
    │   └── useDebounce.ts
    ├── services/
    │   ├── api.ts               # Axios instance with auth interceptors
    │   ├── auth.service.ts
    │   ├── tattoo.service.ts
    │   ├── payment.service.ts
    │   └── mail.service.ts
    ├── types/
    │   ├── auth.types.ts
    │   ├── tattoo.types.ts
    │   ├── payment.types.ts
    │   └── user.types.ts
    ├── pages/
    │   ├── LandingPage.tsx      # /
    │   ├── LoginPage.tsx        # /login
    │   ├── RegisterPage.tsx     # /register
    │   ├── ForgotPasswordPage.tsx # /forgot-password
    │   ├── ResetPasswordPage.tsx  # /reset-password
    │   ├── DashboardPage.tsx    # /dashboard
    │   ├── ProfilePage.tsx      # /profile (dynamic for Cliente / Tatuador)
    │   ├── SubscriptionPage.tsx # /subscription
    │   └── NotFoundPage.tsx
    ├── routes/
    │   ├── AppRoutes.tsx
    │   └── ProtectedRoute.tsx
    └── styles/
        └── globals.css          # Custom background panning animation & utility classes
```

---

### 4.3 Component & Feature Migration Matrix

| Reference File | Legacy Feature | Proposed React + TS Component | Improvements in v2 |
|---|---|---|---|
| `Pages/index.html` | Landing page, hero, switch, footer | `pages/LandingPage.tsx`, `components/layout/Navbar.tsx`, `components/layout/Footer.tsx`, `components/ui/ThemeSwitch.tsx` | Single Page App navigation without page reloads; responsive navbar with mobile drawer; animated theme switch. |
| `Pages/logIn.html`, `JS/login.js` | Login form & `#mensajeEmergente` for 2FA | `pages/LoginPage.tsx`, `components/auth/LoginForm.tsx`, `components/auth/TwoFactorModal.tsx` | Zod validation for email/password; accessible modal dialog with autofocus on 6-digit TOTP input; error toasts via Sonner. |
| `Pages/register.html`, `JS/register.js` | Registration, role selection, TOTP QR modal, PayPal button | `pages/RegisterPage.tsx`, `components/auth/RegisterForm.tsx`, `components/payment/PayPalSubscription.tsx` | Dynamic form branching (Client vs Artist); integrated TOTP enrollment modal; type-safe PayPal subscription integration. |
| `Pages/Subscription/creditcard.html`, `JS/creditcard.js` | 3D interactive credit card flip form | `components/payment/InteractiveCard.tsx`, `pages/SubscriptionPage.tsx` | Pure React component using CSS transforms (no jQuery dependency); automatic focus transition between 4-digit card chunks. |
| `Pages/User Screen/user.html`, `JS/user.js` | Dashboard, style filters, search, dynamic artist cards, email contact modal | `pages/DashboardPage.tsx`, `components/dashboard/ArtistCard.tsx`, `components/dashboard/ArtistFilter.tsx`, `components/dashboard/MessageModal.tsx` | Active real-time filtering by style & search keyword; TanStack Query data caching; drag & drop preview using React dropzone; clean modal overlay. |
| `Pages/User Screen/tattoo.html`, `Pages/User Screen/profile.html`, `JS/tattoo.js`, `JS/profile.js` | Artist / Client profile editors, avatar upload | `pages/ProfilePage.tsx`, `components/profile/ProfileEditor.tsx` | Single unified, role-aware profile component; automatic preview with image compression before base64 upload; province dropdown enum typing. |
| `Design/style.scss` | Dark/Light mode switch, background slidein animation | `components/ui/ThemeSwitch.tsx`, `context/ThemeContext.tsx`, `styles/globals.css` | Persistent theme in `localStorage` or class `dark` on `<html>`; CSS keyframes for background animation retained. |

---

### 4.4 Type Definitions Plan

To ensure strict type safety across the frontend, the following TypeScript interfaces will be defined in `src/types/`:

```typescript
// src/types/user.types.ts
export type UserRole = "Cliente" | "Tatuador";

export type TattooStyle =
  | "realista"
  | "tradicional"
  | "neotradicional"
  | "blackwork"
  | "dotwork"
  | "japones"
  | "tribal"
  | "acuarela";

export interface UserMetadata {
  nombre: string;
  apellido: string;
  edad: string;
  tipo: UserRole;
  telefono?: string;
  provincia?: string;
  ciudad?: string;
  direccion?: string;
  profile?: string;
  work_type?: TattooStyle | string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  link?: string;
}

export interface User {
  id: string;
  email: string;
  user_metadata: UserMetadata;
  factors?: Array<{ id: string; factor_type: string }>;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
}

export interface TattooArtistCard {
  id: string;
  data: {
    email: string;
    nombre: string;
    apellido: string;
    work_type: string;
    telefono?: string;
    provincia: string;
    ciudad: string;
    direccion?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    link?: string;
    profile: string;
    followersCount?: number;
    followingCount?: number;
    worksCount?: number;
  };
}
```

---

## 5. Verification Method

To verify the findings of this survey independently:

1. **File Inventory Verification**:
   - Inspect all HTML files under `c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\frontend\Pages`:
     - `index.html`, `logIn.html`, `register.html`, `forgetPassword.html`, `changePassword.html`, `Subscription/creditcard.html`, `User Screen/user.html`, `User Screen/tattoo.html`, `User Screen/profile.html`.
   - Inspect all JavaScript files under `c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\frontend\JS`:
     - `login.js`, `register.js`, `creditcard.js`, `user.js`, `tattoocard.js`, `tattoo.js`, `profile.js`.
2. **API Endpoint Verification**:
   - Verify matching routes in `c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\backend\backend\app.js`:
     - Lines 36-129 confirm: `/login`, `/register`, `/updateuser`, `/updateuserimg`, `/logout`, `/enroll`, `/verify2fa`, `/createproduct`, `/subscribe`, `/paypalsubscription/:id`, `/usersubscription/:id`, `/usersubscription`, `/gettatto`, `/mail`.
3. **Acceptance Criteria Alignment**:
   - Check that the proposed modern SPA architecture matches all requirements in `ORIGINAL_REQUEST.md`:
     - Vite + React + TypeScript in `v2/frontend`.
     - Strict type checking with `npm run build` readiness.
     - Preserves all core business logic: TOTP MFA authentication, PayPal subscription flow, artist discovery catalog, client-to-artist contact mailer, and role-based profiles.
