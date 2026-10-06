# Tattoo Hub — Estado para retomar (2026-10-05)

## Contexto
Rediseño del frontend (`v2/frontend`, React/Vite/TS/Tailwind) basado en el proyecto Stitch **Premium Tattoo Hub Redesign** (`projects/986799955938082969`). Backend Express + Supabase (`v2/backend`). Pagos: PayPal Payouts (sin Stripe). Tienda Fase 1: solo retiro en estudio.

- Stitch MCP configurado en `.agents/mcp_config.json`.
- Regla persistida: `.agents/rules/stitch_implementation.md` (usar siempre el HTML exacto de Stitch vía MCP `get_screen`, nunca aproximar desde capturas).
- Preview Vercel anterior (aproximación manual, NO aprobada por el usuario): https://tattoo-j9icsldv7-ourpresent.vercel.app

## Requisitos del usuario (R1–R7 + extras)
1. Pantallas Stitch "Página" integradas pixel-perfect.
2. Animaciones atractivas (Framer Motion/Tailwind).
3. Selector País/Moneda en Navbar; invitados ven mapa/artistas de su país pero deben registrarse para actuar (gating).
4. Consistencia: un solo `<Navbar />` y `<Footer />` globales (aprobado por el usuario). Footer oculto en: Mapa (`/hub`), Perfil, Login, Registro, Dashboards, Chat.
5. Cero precios hardcodeados: todo formateado por moneda/país.
6. Backend y DBA involucrados.
7. QA con Playwright: checklist de calidad + informe de auditoría final.
8. Copy neutral y cotidiano (Escritor Senior); eliminar lo que no aporte valor.
9. Estudio → N artistas: tarjetas y mapa muestran cuántos hay y a quién contactar.
10. Estamos trabajando sobre bocetos; ante discrepancias entre pantallas, consultar al usuario primero.

## Equipo Teamwork en curso
- Subagente teamwork_preview: `59fb5abc-5fdc-450a-872d-7656978368f9` (Sentinel)
- Orquestador: `orchestrator_6` (`65a37871-e23f-40a7-89d4-3b8466a05a63`)
- Archivos de estado: `.agents/teamwork/` (`ORIGINAL_REQUEST.md`, `PROJECT.md`, `sentinel/BRIEFING.md`, `sentinel/handoff.md`)
- Prompt: `prompt_draft.md` en carpeta de artefactos.

## Hitos
| Hito | Estado |
|---|---|
| M11 Backend/DBA (migración `11_country_currency_filters.sql`, `/currencies`, filtros `/gettatto`) | ✅ Aprobado |
| M12 Frontend (CurrencyContext, selector Navbar, useGuestGate, `?redirect=`, Footer condicional) | ✅ Aprobado tras remediación |
| M13 Pantallas Stitch (Benefits, Pricing, ArtistsDirectory), jerarquía Estudio→Artistas, PageTransition | ✅ Implementado por worker; **pendiente votación de Gate** |
| M14 Playwright E2E + Quality Checklist + Informe de Auditoría Final | ⏳ Pendiente |

## Pendiente al retomar
1. Verificar el estado del Gate M13 (leer `.agents/teamwork/sentinel/BRIEFING.md`); si el subagente no responde, reinvocar teamwork_preview apuntando a `.agents/teamwork/`.
2. Ejecutar M14: instalar Playwright, checklist de calidad, E2E por pantalla/botón, informe final auditado.
3. Hacer `npm run build` en `v2/frontend` y desplegar preview: `vercel --yes --token $env:VERCEL_TOKEN` (desde `v2/frontend`); mostrar al usuario para validar visualmente.
4. Pantallas faltantes inferidas del diseño Stitch (el usuario lo pidió tras implementar todo).
5. Conectar UI de Agenda y Pagos (`AgendaTracking.tsx`, `PaymentTracking.tsx`) a endpoints de `hub.service.ts` (hoy con datos mock).
6. Completar frontend de la Tienda (pestaña "Tienda" del artista y vista cliente).
7. Pendiente de `/learn`: ya guardada la regla de Stitch.

## Notas técnicas
- Scripts Node en `v2/backend/scripts/` deben usar `path.resolve(__dirname, '../.env')` con `override: true`.
- Archivos temporales en la raíz del repo creados por mí (se pueden borrar): `restore.js`, `restore2.js`, `fix2.js`, `test.js`, `recovered*.jsonl`.
- Pantallas Stitch (IDs): Landing `3682a342…`, Mapa `5f09a09d…`, Artistas `95f7f3a6…`, Planes `05660c0f…`, Beneficios `89b8e23a…`, Registro `f61fb572…`/`c2e52b4a…`/`b3e7e45a…`, Login `4c9e9cf8…`.
