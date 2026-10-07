# MATRIZ DE REVISIÓN Y AUDITORÍA UNIVERSAL

## 1. SEGURIDAD Y GESTIÓN DE IDENTIDAD
- [ ] **Almacenamiento de Sesiones:** Prohibido guardar tokens (JWT, access/refresh tokens) en `localStorage` o `sessionStorage`. Obligatorio uso de Cookies `HttpOnly; Secure; SameSite=Lax/Strict`.
- [ ] **Autorización Server-Side:** La verificación de roles (RBAC) y propiedad de recursos se valida estrictamente en endpoints y middlewares del servidor. No confiar en flags del cliente (`isAdmin = true`).
- [ ] **2FA y Verificación:** Obligatoriedad de verificación de correo electrónico vía proveedor transaccional antes de activar cuentas. Soporte para 2FA en cuentas con permisos elevados.
- [ ] **Protección Anti-Abuso:** Rate limiting configurado por IP y por identificador en `/login`, `/register`, `/forgot-password` y endpoints que consuman APIs de LLMs.

## 2. BASES DE DATOS, ORM Y ESCALABILIDAD
- [ ] **ORM Tipado:** Esquemas definidos en código (Drizzle, Prisma) para garantizar tipado estricto y parametrización automática contra SQL Injection.
- [ ] **Prevención N+1:** Prohibido consultar entidades hijas dentro de bucles en backend. Uso de `JOIN`, `include` o agregaciones en una sola consulta.
- [ ] **Paginación Obligatoria:** Ningún endpoint debe devolver tablas enteras. Implementar paginación cursor o `limit/offset` (máximo predeterminado: 20-50 elementos).
- [ ] **Indexación Relacional:** Índices B-Tree creados en todas las columnas utilizadas para filtros (`WHERE`), ordenamiento (`ORDER BY`) y claves foráneas.
- [ ] **Migraciones Seguras:** Migraciones versionadas en código con script de vuelta atrás (`rollback`). Jamás ejecutar migraciones destructivas en producción sin respaldo previo.

## 3. CUMPLIMIENTO LEGAL Y NORMATIVO
- [ ] **Protección de Menores (COPPA):** Formulario de registro con verificación de fecha de nacimiento / edad. Bloqueo o flujo parental estricto para menores de 13 años.
- [ ] **Session Replay & Privacidad (CIPA / GDPR):** Herramientas como PostHog, Hotjar o Clarity deben tener enmascaramiento estricto de inputs de texto (contraseñas, datos bancarios) y exigir consentimiento explícito previo antes de inicializar la grabación.
- [ ] **Políticas Obligatorias:** Páginas accesibles en el footer para `/privacy-policy`, `/terms-and-conditions`, `/cookies` y política de cancelaciones/reembolsos.
- [ ] **Comunicaciones Comerciales (CAN-SPAM):** Todo email transaccional/marketing debe incluir dirección física postal válida de la empresa y enlace funcional de desuscripción en un solo clic.
- [ ] **Suscripciones y Checkout:** Exposición transparente de términos de cobro recurrente, importe exacto y fecha de renovación inmediatamente al lado del botón de confirmación de pago.

## 4. PIRÁMIDE DE TESTING Y AUTOMATIZACIÓN (CI/CD)
- [ ] **Pruebas de Componentes / Unitarias:** Tests rápidos y aislados para validar renderizado, props y funciones lógicas puras.
- [ ] **Pruebas de Integración:** Validación de interacción entre múltiples componentes (ej. pulsar botón 'comprar' -> cálculo de total -> actualización del carrito).
- [ ] **Pruebas End-to-End (E2E):** Tests de flujo completo desde la perspectiva del usuario (Onboarding -> Registro -> Checkout -> Notificación/Recibo).
- [ ] **Pruebas de Regresión:** Ante cualquier bug reportado, escribir un test que reproduzca el fallo antes de aplicar la corrección.
- [ ] **Pipeline de CI/CD (GitHub Actions):** Bloqueo de PRs si fallan: Linting, Type-checking (`tsc --noEmit`), Suites de pruebas (Unit + E2E) y Build de producción.

## 5. OBSERVABILIDAD, COSTES Y CLOUD
- [ ] **Trazabilidad de Errores:** SDK de monitoreo en tiempo real configurado (Sentry / Axiom) con contexto de usuario, versión del release y stack trace.
- [ ] **Hard Limits y Alertas:** Límites duros de facturación y alertas al 50%, 80% y 100% configurados en proveedores (Vercel, Supabase, Cloudflare, OpenAI, Anthropic).
- [ ] **Optimización de Egress:** Almacenamiento de archivos y assets pesados en servicios con cero coste de transferencia de salida (ej. Cloudflare R2 frente a AWS S3).