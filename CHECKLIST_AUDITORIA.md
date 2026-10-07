# Checklist de Auditoría del Proyecto

## 1. Rendimiento y Optimización (Performance)
- [ ] Imágenes optimizadas (compresión, WebP, Sharp).
- [ ] Lazy loading implementado en rutas y componentes pesados.
- [ ] Bundles Minificados y sin librerías fantasma.

## 2. DevOps e Infraestructura
- [ ] Estrategia de Ramas (Staging vs Producción).
- [ ] Monitoreo de Errores (Sentry o similar).
- [ ] Analíticas y Mapas de Calor (Hotjar/Clarity) cargados asíncronamente.
- [ ] Variables de entorno seguras.

## 3. Calidad y Testing (QA)
- [ ] Suite de pruebas E2E (Playwright) completa.
- [ ] Tests Unitarios de Backend pasando al 100%.

## 4. UI/UX y Flujos
- [ ] Homologación de mapas interactivos.
- [ ] Flujos de usuario cerrados (no dead-ends post registro).
- [ ] Feedback visual para cargas y errores.
