# Original User Request

## Initial Request — 2026-09-23T23:31:17Z

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
