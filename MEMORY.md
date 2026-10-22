# System Memory - Tattoo Shop & Tattoo Hub

Este archivo contiene el contexto general del proyecto y la estructura para que los agentes mantengan su memoria persistente durante el desarrollo de la aplicación Tattoo Shop / Tattoo Hub.

## Descripción General del Proyecto
**Tattoo Hub** es una plataforma moderna para la comunidad de arte corporal, tatuadores independientes y estudios, dividida en dos componentes clave en `v2/`:
- **Frontend (`v2/frontend`)**: Single Page Application construida con React 18, TypeScript, Vite, Tailwind CSS y Lucide Icons.
- **Backend (`v2/backend`)**: API REST empresarial en Node.js, Express y TypeScript (`tsx`), protegida con Helmet, rate limiting y CORS.
- **Base de Datos / Autenticación**: Supabase Cloud (`@supabase/supabase-js`, schemas `public` y `qa`), Supabase Auth con MFA TOTP y envío nativo de correos de recuperación.
- **Verificación SMS / Telefonía**: Servicio Vonage SMS con códigos criptográficos de 6 dígitos (E.164, cooldown 60s, expiración 10 min, max 5 intentos).
- **Procesamiento de Pagos**: Stripe (`stripe-node`) y suscripciones comerciales con período de prueba y gracia.

## Módulos y Características Clave (v2)
1. **Verificación de Teléfono con Vonage SMS (6 dígitos OTP):**
   - Endpoints en `/api/phone` (`/send-otp`, `/verify-otp`, `/change-request`, `/change-confirm`).
   - Modal interactivo `PhoneVerificationModal` con selector homologado `CustomSelect` de prefijos internacionales de todos los países.
   - Componente accesible `OtpVerificationInput` para captura fluida de 6 dígitos.
2. **Seguridad de Cuenta, Resets de Contraseña & 2FA:**
   - Envío nativo de correos Supabase para reseteo de contraseña (`supabase.auth.resetPasswordForEmail`).
   - Gestión y cambio de correo electrónico mediante token de confirmación en `ClientSecuritySettingsSection`.
   - Autenticación multifactor 2FA / TOTP con generación de código QR en SVG y desafío de verificación mediante `TwoFactorAuthModal`.
3. **Persistencia Permanente del Avatar de Usuario:**
   - Módulo centralizado `v2/frontend/src/utils/avatar.ts` que previene sobreescrituras accidentales por imágenes genéricas (`/assets/GB Tattoo.jpg`, `tatto-default-profile.png`).
   - Prioriza permanentemente el avatar de Google OAuth (`picture`) y uploads directos de usuario.
4. **Portafolio Interactivo y Personalizable de Tatuadores:**
   - Galería `ArtistPortfolioGallery` con pestañas de filtrado (Todos, Tatuajes Realizados, Flashes Disponibles, Bocetos), estilos y modal Lightbox HD interactivo.
   - Modal `PortfolioCustomizerModal` con 5 acentos temáticos (violet, gold, neon, crimson, emerald), 3 layouts (masonry, editorial, grid), 4 micro-animaciones (glow, tilt, zoom, shimmer) y presets de banners.
5. **Plantillas de Correo Electrónico Modernas & Cumplimiento Legal:**
   - Templates HTML responsivos para bienvenida, confirmación de reserva, consultas directas e invitaciones de referidos en `mail.template.ts`.
   - Cumplimiento estricto CAN-SPAM con dirección física y canales de privacidad.
6. **Sistema de Referidos y Embajadores:**
   - Generación de código único y enlace por usuario, botón de compartir en WhatsApp y desglose de recompensas escalonadas (5%, 10%, 15% VIP).
   - Accesible tanto para clientes como para tatuadores en sus paneles respectivos.
7. **Saneamiento de Paneles, Mayoría de Edad (18+) y Reorganización de Seguridad:**
   - Pestaña dedicada y única para Suscripciones, eliminando la duplicidad en Configuración.
   - Centralización de credenciales, cambio de correo y 2FA en la pestaña de Seguridad.
   - Fecha de nacimiento visible pero bloqueada con candado en perfil de cliente y artista por normativa sanitaria legal.
   - Corrección de mojibake UTF-8 en banderas de idioma (`🇪🇸` y `🇺🇸`) y botones de referidos con alto contraste (`.keep-white-text !text-white`).
8. **Galería de Evolución en Vivo Multi-Tatuaje (`TattooLiveEvolutionSection`):**
   - Selector interactivo entre los distintos tatuajes en proceso del cliente.
   - Tarjeta del tatuador que da seguimiento con contacto directo en WhatsApp.
   - Indicador de visualización ('Visto por el artista') en tiempo real.
   - Feedback médico-artístico y recomendaciones clínicas para cada etapa.
   - Kit interactivo de productos indispensables por fase (jabón neutro, ungüento pantenol, film curativo, bloqueador solar).

## Estado de Pruebas y Construcción
- **Backend Tests**: 125 pruebas automatizadas (125/125 passing, 100% green).
- **Frontend Build**: Compilación limpia con Vite + TypeScript (`npm --prefix v2/frontend run build`).
- **Backend Build**: Compilación limpia con TypeScript (`npm --prefix v2/backend run build`).
