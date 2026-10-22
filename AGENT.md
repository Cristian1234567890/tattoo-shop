# Agent Tasks & Guidelines - Tattoo Hub

## Directrices del Agente
- **Prioridad**: Mantener el código modular y robusto, seguir las directrices de Clean Code y OWASP, sin exponer credenciales sensibles en commits.
- **Automatización Primero**: Proactividad para resolver configuraciones antes de pedir acciones manuales al usuario.
- **Validación E2E**: Ejecutar suite completa de tests de backend y compilación de frontend antes de marcar tareas como completadas.
- **Consistencia de Diseño**: Uso coherente de paletas oscuras/claras, homologación de componentes (`CustomSelect`, `OtpVerificationInput`, modales) y soporte accesible WCAG 2.2.

## Roadmap & Registro de Tareas

### Completado Recientemente (v2.0)
- [x] **Integración Vonage SMS:**
  - Configuración de API Key y Secret en backend.
  - Generación criptográfica de OTP de 6 dígitos con expiración de 10 minutos y rate limiting.
  - Flujo de verificación y cambio de número telefónico con selector de prefijos internacionales homologado.
  - Suite de pruebas unitarias y de seguridad en `vonage.test.ts`.
- [x] **Flujo de Seguridad, Reseteo de Contraseña & 2FA:**
  - Envío nativo de correos de recuperación mediante Supabase.
  - Flujo de cambio de correo electrónico con confirmación en perfil.
  - Autenticación multifactor 2FA con TOTP y código QR interactivo (`TwoFactorAuthModal`).
  - Pestaña de seguridad integrada en panels de cliente y tatuador.
- [x] **Persistencia de Foto de Perfil (Avatar Fix):**
  - Corrección de regresión para fotos de perfil de Google OAuth y personalizadas (`avatar.ts`).
  - Prevenir sobrescritura por imágenes genéricas por defecto.
- [x] **Portafolio Interactivo y Personalización de Perfil de Tatuador:**
  - Visualización completa de piezas, flashes y bocetos con lightbox HD.
  - Personalizador de diseño visual (acentos cromáticos, disposición de cuadrícula/editorial, animaciones de tarjeta y banners).
- [x] **Sistema de Referidos:**
  - Generación de código único, enlace directo y botón para compartir vía WhatsApp.
  - Beneficios escalonados (5% a 15% VIP).
- [x] **Plantillas de Correo Electrónico:**
  - Rediseño de templates transaccionales con estética vibrante, soporte dark/light y cumplimiento CAN-SPAM.
- [x] **Depuración de Registros Huérfanos & Modo Claro/Oscuro:**
  - Limpieza de datos huérfanos y corrección de contrastes en mapa y componentes clave.
- [x] **Skill de Sincronización Mandatoria con Jira & Backlog Sync (TH-77 a TH-88):**
  - Creación de `.agents/skills/jira-sync/SKILL.md` con directrices de sincronización obligatoria en Atlassian Jira (`TH`).
  - Carga y transición en lote de 12 tickets completados a estado 'Listo' con notificación a Discord.
- [x] **Saneamiento de Paneles & Eliminación de Suscripciones Duplicadas:**
  - Eliminación de la tarjeta duplicada de Suscripciones en `configuracion` y `general`, manteniéndola exclusivamente en su pestaña dedicada.
- [x] **Reubicación de Seguridad y Credenciales:**
  - Traslado de cambio de correo, verificación Vonage SMS y 2FA desde `Configuración` hacia la pestaña de `Seguridad`.
- [x] **Fecha de Nacimiento Bloqueada con Verificación de Mayoría de Edad (18+):**
  - Renderizado explícito en el formulario de configuración de cliente y perfil de artista, bloqueada con candado por normativa sanitaria legal y cálculo para promociones de cumpleaños.
- [x] **Corrección de Banderas de Idioma & Contraste en Referidos:**
  - Corrección de mojibake UTF-8 en selector de idiomas (`🇪🇸` y `🇺🇸`).
  - Homologación de contraste con `.keep-white-text !text-white` en botones de 'Copiar Enlace' y 'WhatsApp' del programa de referidos.
- [x] **Galería de Evolución en Vivo Multi-Tatuaje (`TattooLiveEvolutionSection`):**
  - Selector interactivo de tatuajes en seguimiento para el cliente.
  - Visualización del tatuador asignado con avatar, estudio y contacto WhatsApp directo.
  - Indicador dinámico de 'Visto por el artista' con timestamp.
  - Tarjeta de retroalimentación médica/artística y recomendaciones de cuidado.
  - Checklist interactivo de productos necesarios por fase de cicatrización (jabón neutro, ungüento pantenol, film curativo, bloqueador solar).
- [x] **Depuración de Badge Estático 'Protegida (Cifrado)':**
  - Eliminación del indicador estático sin regla de negocio de `ClientHeroHeader.tsx`, rebalanceando las métricas en cuadrícula de 2 columnas.

### Próximos Pasos
- [ ] Monitoreo de entregabilidad SMS en producción con números de prueba reales.
- [ ] Incorporación de métricas de conversión para el programa de referidos.
