---
description: Estándares obligatorios para aislamiento de temas claro/oscuro, presupuesto de espacio en Navbar desktop y arquitectura multi-rol con facturación dual.
---

# Regla: Aislamiento de Temas, Presupuesto de Navbar y Multi-Rol (Sprint 11)

Esta regla define los estándares no negociables de diseño e implementación frontend para evitar regresiones visuales, rotura de contrastes en modo claro, colisiones en pantallas de laptop (1280px–1440px) y desorden en la gestión de cuentas híbridas (Tatuador y Cliente).

---

## 1. AISLAMIENTO DE FONDO Y TOKENS DE TEMA REACTIVOS

### 1.1. Prohibición Estricta de Fondos Hexadecimales Fijos
- **QUEDA TOTALMENTE PROHIBIDO** hardcodear colores de fondo oscuros como `bg-[#0B0B0E]`, `bg-[#090b10]`, `bg-zinc-950` o `bg-black` en el elemento contenedor raíz (`<div>`) de cualquier página o vista (`Page.tsx`).
- **Motivo Técnico**: Estos estilos anulan la herencia de la clase `.light` en `<html>`, provocando que la tipografía cambie a color grafito/azul oscuro mientras el lienzo permanece negro azabache, causando invisibilidad total del texto.

### 1.2. Paleta Estandarizada Reactiva (Tailwind CSS)
Toda superficie y elemento estructural DEBE usar tokens responsivos al tema:
- **Lienzo Principal**: `bg-slate-50 dark:bg-[#090d16]`
- **Tarjetas / Contenedores Elevados**: `bg-white dark:bg-[#13131A]` o `atelier-card`
- **Bordes y Divisores**: `border-slate-200 dark:border-white/10`
- **Títulos y Encabezados (`h1`-`h4`)**: `text-slate-900 dark:text-white`
- **Texto Secundario y Párrafos**: `text-slate-600 dark:text-zinc-400`
- **Footer**: `bg-slate-50 dark:bg-[#07090e]` con bordes `border-slate-200 dark:border-white/5`

### 1.3. Certificación Pre-Despliegue
Antes de desplegar cualquier pantalla a QA o Producción, se debe ejecutar la suite automatizada de Playwright (`qa_ux_revamp_and_a11y.mjs`) para garantizar 0 fallas de contraste en modo claro y 0 violaciones WCAG AA.

---

## 2. PRESUPUESTO DE ESPACIO EN NAVBAR DESKTOP (1280px – 1440px)

### 2.1. Límite de Ancho para la Sección Derecha (Max 280px)
- La sección derecha de utilidades y sesión en el Navbar nunca debe sobrepasar los **280px** en viewports de 1280px a 1440px.
- **QUEDA PROHIBIDO** desplegar 4 o más botones anchos independientes en fila (ej. `Moneda`, `Idioma`, `Tema`, `Sandbox QA`, `Mi Panel`, `Salir`), ya que esto estrangula el contenedor central a menos de 420px y recorta enlaces como *"Beneficios"* y *"Sobre Nosotros"*.

### 2.2. Menú Desplegable de Usuario Unificado (`User Account Dropdown`)
Toda la información y acciones del usuario autenticado deben agruparse en el dropdown de sesión:
1. **Trigger de Navegación**: Píldora compacta con Avatar circular (`img` con `onError` seguro), primer nombre y badge de rol activo (`Tatuador` o `Cliente`), más botón `ChevronDown`.
2. **Contenido del Dropdown**:
   - Cabecera de cuenta: Nombre completo, correo, rol activo y estado de suscripción VIP.
   - Switch de función rápida: Botón destacado para alternar entre Modo Cliente y Modo Tatuador.
   - Enlaces de panel y citas: Acceso a panel de control y agenda según el rol.
   - Facturación y planes: Enlace a gestión de precios/suscripciones.
   - Cerrar sesión: Botón `#log-out` con estilo de alerta destructiva.

---

## 3. ARQUITECTURA MULTI-ROL & DOBLE FACTURACIÓN (TH-43)

### 3.1. Switch de Rol en Caliente
- Los usuarios que sean tatuadores pueden alternar en cualquier momento a la vista de cliente para explorar otros artistas, adquirir flash o reservar citas personales.
- La función `handleSwitchRole(targetRole)` debe invocar `updateUserMetadata({ tipo: targetRole, role: targetRole })` y redirigir inmediatamente (`/artist-dashboard` o `/client-dashboard`) sin forzar re-autenticación ni destruir el token JWT.

### 3.2. Segregación de Facturación Dual en Stripe
Para usuarios con doble actividad comercial y personal, los datos de facturación deben mantenerse completamente segregados:
- **Estudio / Tatuador Pro**: Metadatos almacenados en `user_metadata.billing_artist` con Customer ID `cus_artist_xxx` y suscripción de taller profesional ($29/mes).
- **Cliente / VIP Club**: Metadatos almacenados en `user_metadata.billing_client` con Customer ID `cus_client_xxx` y membresía personal ($9.99/mes).
- Los comprobantes fiscales y recibos deben emitirse con el `client_reference_id` prefijado correspondientemente (`art_` o `cli_`).

---

## 4. DEFENSIVA DE IMÁGENES EN CATÁLOGOS Y PORTAFOLIOS
- Todo tag `<img />` en tarjetas de productos (`ShopPage`), portafolios (`ArtistsDirectoryPage`) o avatars DEBE incluir un manejador `onError`:
  ```tsx
  onError={(e) => {
    (e.target as HTMLImageElement).src = FALLBACK_STUDIO_ASSET_URL;
  }}
  ```
- No se permiten URLs rotas ni iconos grises de imagen faltante en ninguna vista pública.
