# Original User Request

## 2026-09-23T23:31:17Z

Requested team: Full team

Refactorizar y reconstruir desde cero la aplicación "Tattoo Shop" utilizando un stack moderno (TypeScript, React para el frontend, Express/Node.js para el backend). El objetivo es utilizar el código base existente como referencia funcional para crear una versión escalable, limpia y con buenas prácticas.

Working directory: c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\v2
Integrity mode: demo

## Verification Resources
- Implementación de referencia: El código existente en `c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\frontend` y `c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\backend\backend` sirve como la referencia principal de comportamiento y lógica de negocio.
- Nuevas Credenciales de Supabase:
  - SUPABASE_URL: https://mftthukphffirdcoqprz.supabase.co
  - ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdHRodWtwaGZmaXJkY29xcHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxOTY0ODcsImV4cCI6MjEwNTc3MjQ4N30.m1Vv_bbOlYcWZMX0j5_og12eeQt3vAQIiYHos_o7vos
  - SERVICE_ROLE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdHRodWtwaGZmaXJkY29xcHJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDE5NjQ4NywiZXhwIjoyMTA1NzcyNDg3fQ.Q4VTaLcphMgsPltdtScZgoz0QKBuZprf18vjguqpadA

## Requirements

### R1. Reconstrucción del Frontend
Migrar la interfaz de usuario existente a una aplicación de página única (SPA) moderna con React y TypeScript, replicando el flujo de usuario actual y asegurando que las funcionalidades clave estén presentes.

### R2. Reconstrucción del Backend
Refactorizar la API REST utilizando TypeScript. Mantener la lógica de negocio, las rutas, y la integración con los servicios actuales (Supabase, PayPal y Nodemailer). Las claves de PayPal se configurarán posteriormente, por ahora utiliza placeholders en el `.env` (ej. `PAYPAL_KEY=pendiente`).

## Acceptance Criteria

### Frontend Verification
- [ ] La compilación del proyecto de React/TypeScript (`npm run build`) se ejecuta exitosamente sin errores de compilación ni de tipado.
- [ ] Un agente auditor independiente aprueba que el DOM/UI renderizado replica estructuralmente los componentes y la navegación clave de la aplicación original.

### Backend Verification
- [ ] Un agente auditor independiente crea y ejecuta scripts o llamadas `cURL` contra la nueva API y confirma explícitamente que el comportamiento, parámetros esperados y respuestas de los endpoints son idénticos a los definidos en el backend original.

## Follow-up — 2026-09-27T05:40:05Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: Small focused team

This is a single self-contained fix; keep it small and focused.

El objetivo es corregir el enrutamiento post-login (Google y Manual) hacia `/user` de forma dinámica para evitar saltos a `localhost` en producción, e implementar la aceptación obligatoria de los Términos y Condiciones para todos los usuarios nuevos.

Working directory: c:\Users\giova\OneDrive\Documentos\proyectos\tattoo-shop\v2
Integrity mode: development

## Requirements

### R1. Corrección de Redirecciones (Google y Manual)
El botón de "Continuar con Google" y el login manual deben redirigir al usuario correctamente a la ruta `/user` (Dashboard principal) usando el origen dinámico de la ventana (`window.location.origin`).

### R2. Aceptación Legal en Registro Manual
La página de registro (`v2/frontend/src/pages/RegisterPage.tsx`) debe incluir casillas de verificación obligatorias para los Términos y Privacidad. Estos datos deben enviarse al backend para quedar registrados.

### R3. Onboarding Interceptado para Google Auth (OAuth)
Dado que Google Auth crea la cuenta automáticamente sin preguntar detalles, la interfaz debe detectar si es el primer inicio de sesión del usuario. De ser así, debe mostrar un flujo de "Completar Perfil" obligatorio donde el usuario:
1. Elija su tipo de cuenta (Cliente o Tatuador).
2. Lea y acepte los Términos y Condiciones mediante checkboxes.

### R4. Registro en Base de Datos (Auditoría Legal y Rol)
Se debe crear un mecanismo en Supabase (una migración SQL para la tabla `public.user_profiles` vinculada a `auth.users`) que almacene:
- `id` (uuid referenciando a auth.users)
- `role` (Cliente o Tatuador)
- `legal_accepted` (boolean)
- `legal_accepted_at` (timestamp, indicando la fecha exacta de aceptación)
- `full_name` (text, obtenido de Google o registro manual)
- `avatar_url` (text, para fotos de perfil)
- `phone_number` (text)
- `is_verified` (boolean, default false)
- `onboarding_completed` (boolean, para saber si ya pasó la pantalla inicial)

## Acceptance Criteria

### Verificación de Frontend y Base de Datos
- [ ] La redirección a `window.location.origin + '/user'` se ejecuta dinámicamente, sin ir a `localhost` en Vercel.
- [ ] El flujo de Google Auth detiene a los usuarios nuevos, exigiéndoles seleccionar su rol y aceptar términos.
- [ ] Tras el registro (Google o Manual), la base de datos de Supabase refleja exitosamente el rol elegido, los metadatos y la marca de tiempo exacta de cuando el usuario aceptó los documentos legales.

