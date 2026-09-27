## 2026-09-23T23:45:43Z
You are worker_m3_frontend, a specialized frontend implementation worker.
Working directory: c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\worker_m3_frontend

MANDATORY: Read ORIGINAL_REQUEST.md at:
c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\ORIGINAL_REQUEST.md
and PROJECT.md at:
c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\PROJECT.md
and explorer_frontend_survey report at:
c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\explorer_frontend_survey\handoff.md
and specminer_api_survey report at:
c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\specminer_api_survey\handoff.md
and E2E test certification at:
c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\v2\e2e\TEST_READY.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your task (Milestone 3 - Frontend Modernization):
1. Rebuild the frontend from scratch as a modern React + TypeScript SPA inside:
   c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\v2\frontend
   Exclusive file ownership: `v2/frontend/*` (DO NOT touch backend or e2e directories).
2. Stack & Setup:
   - Vite + React 18/19 + TypeScript + Tailwind CSS / CSS Modules / Lucide React / React Router.
   - Copy/migrate image and icon assets from `c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\frontend\Img` into `v2/frontend/src/assets` (or public) so all 17 assets are preserved.
3. Views & Structural Fidelity (must match reference DOM & navigation flows):
   - Landing (`/`): Navbar (Logo "TooTienda", "Beneficios", "Precios", "Sobre Nosotros", "Iniciar Sesión", "Registrarse"), Hero banner ("Bienvenido a TooTienda más confiable"), Footer (founders, GitHub link), animated SVG Sun/Moon theme toggle switch.
   - Login (`/login`): Email/password form, validation, session storage, TOTP 2FA verification modal (`#mensajeEmergente`, input `#code`, button `#btn-validar`).
   - Register (`/register`): Nombre, Apellido, Edad, Email, Password, Confirm Password, role selector (`Cliente 🤩` / `Tatuador 😎`), TOTP QR code modal (`#ventanaQR`, `#qr`, `#btn-salir`), Tatuador subscription alert modal (`#mensajeEmergente`), and PayPal button container (`#paypal-button-container`).
   - User Dashboard (`/user`):
     - Left column: Tattoo style filter checkboxes (`#realista`, `#tradicional`, `#neotradicional`, `#blackwork`, `#botwork`, `#japones`, `#tribal`, `#acuarela`).
     - Center column: Search bar `🔍 Buscar tatuador` (`name="busqueda"`), dynamic artist cards container (`#card-container`).
     - Off-canvas menu drawer: Hamburger toggle (`.menu-toggle`), user avatar thumbnail (`#menu-profile-pic`), name label (`#name_tag`), profile link (`#profile-link`), theme switch (`#btn-switch`), logout action (`#logout`).
   - Artist Profile Card (`.profile-card`):
     - Glowing circular avatar (`.profile-card__img`), artist name, location subtitle ("Tatuador ubicado en: <provincia>, <ciudad>"), metrics row (Seguidores, Siguiendo, Tipo de Trabajo, Trabajos), social links (Facebook, Twitter, Instagram, Link), action buttons ("Mensaje" `.js-message-btn`, "Seguir").
     - Message overlay (`.profile-card-message`): Textarea "¿Qué quisieras hacerte?" (`#message`), drag & drop dropzone (`.dragdrop`, `.draggable`, `.droppable`), file upload (`#file-input`) with preview (`#selected-image`), send button (`#btn-message`) calling `/mail`, and close button (`.js-message-close`).
   - Client Profile (`/profile`): Avatar upload preview, personal info, disabled birthdate, Panamanian province select (12 provinces/comarcas), Ciudad, Dirección, calling `/updateuser`.
   - Artist Profile (`/tattoo` or `/artist-profile`): Avatar upload, specialization, social links, location, credentials syncing to `/updateuser` and `tatuadores_data`.
   - 3D Credit Card Simulator (`/subscription/creditcard`): 3D interactive flip card (mirroring card number, holder, expiry, CVV flip animation) and payment form.
   - Password Recovery (`/forget-password` & `/change-password`).
4. Typed API Client:
   - Configurable base URL defaulting to `http://localhost:8080`.
   - Methods matching all backend endpoints (`/login`, `/register`, `/logout`, `/enroll`, `/verify2fa`, `/updateuser`, `/updateuserimg`, `/gettatto`, `/createproduct`, `/subscribe`, `/paypalsubscription/:id`, `/usersubscription/:id`, `/usersubscription`, `/mail`).
   - Passing `Authorization: Bearer <token>` and `refresh_token: <refresh>`.
5. Verification:
   - Run `npm run build` in `v2/frontend`. It MUST succeed with 0 compilation and type errors (`tsc` passes).
   - Verify dist bundle contains index.html and assets.
6. Documentation & Handoff:
   - Update `c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\worker_m3_frontend\progress.md`
   - Write comprehensive report to `c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\.agents\worker_m3_frontend\handoff.md`
7. Message the orchestrator upon completion.
