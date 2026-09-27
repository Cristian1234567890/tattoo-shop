# System Memory

Este archivo contiene el contexto general del proyecto y la estructura para que los agentes mantengan su memoria persistente durante el desarrollo de la aplicación Tattoo Shop.

## Descripción General del Proyecto
**Tattoo Shop** es una aplicación web dividida en dos componentes principales:
- **Frontend**: Una SPA construida con HTML, CSS, y Vanilla JS (ubicada en `/frontend`). Lista para ser servida estáticamente, incluye un `Dockerfile` usando Nginx.
- **Backend**: Una API REST en Node.js (Express) (ubicada en `/backend/backend`). Gestiona rutas de autenticación, correos (Nodemailer), integración de pagos (PayPal) y consultas de tatuajes.
- **Base de Datos / Backend as a Service**: Supabase. La configuración apunta a un proyecto alojado en Supabase (`unsftvudwxwbzwekokgr.supabase.co`).

## Estado Actual
- El código base existe y está dividido en frontend y backend.
- Existen archivos de configuración para contenedores (`Dockerfile` en frontend, `compose-dev.yaml` para entornos dev).
- Se está iniciando la configuración local para levantar ambos servicios y continuar el desarrollo de forma estructurada.

## Estructura de Directorios Clave
- `frontend/`: Archivos estáticos (`/Pages`, `/JS`, `/Img`, `/Design`) y `Dockerfile`.
- `backend/backend/`: Servidor Express (`app.js`), controladores de rutas (`auth.js`, `paypal.js`, `mail.js`, `tattoo.js`), y su respectivo `package.json` y `Dockerfile`.
- `supabase/`: Carpeta para la configuración local de Supabase (actualmente vacía, pero se puede inicializar con CLI si es necesario).

## Dependencias Críticas
- **Backend**: Express, CORS, dotenv, @supabase/supabase-js, axios, nodemailer.
- **Frontend**: Nginx (si se usa Docker) o Live Server.
