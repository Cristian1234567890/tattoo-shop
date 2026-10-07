# SPRINT BACKLOG / DIAGNÓSTICO OPERATIVO

## METADATOS DEL PROYECTO
- **Proyecto:** [Nombre de la Aplicación]
- **Estado:** [Nuevo / En Ejecución / Refactor / Diagnóstico]
- **Stack Técnico:** [Ej. Next.js, Supabase, Cloudflare R2, Better Auth]

---

## TABLERO DE TAREAS

| ID | Módulo / Tarea | Agente | Prioridad | Estado | Criterio de Aceptación (DoD) | ¿Bloqueado por Consulta? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Migración de tokens a cookies HttpOnly | `@Security-Compliance-Agent` | P0 | To-Do | Tokens inaccesibles vía script; sesión validada en middleware server-side. | No |
| **LEG-01** | Gate de edad en registro (<13 años) | `@Security-Compliance-Agent` | P0 | To-Do | Validación bloqueante de fecha de nacimiento; cumple con norma COPPA. | Sí *(definir si se admite flujo con consentimiento de tutores)* |
| **FIN-01** | Techos de gasto y alertas cloud | `@DevOps-FinOps-Agent` | P0 | To-Do | Hard limits y alertas al 50%/80%/100% configurados en Vercel/Supabase/OpenAI. | Sí *(confirmar presupuesto mensual límite)* |
| **DB-01** | Paginación cursor e índices en tablas | `@DB-Performance-Agent` | P1 | To-Do | Endpoints de listas limitados a 20 items; queries analizadas con `EXPLAIN`. | No |
| **QA-01** | Suite E2E de flujos críticos de compra | `@QA-Reliability-Agent` | P1 | To-Do | Test de Playwright automatizado validando flujo: Carrito -> Pago -> Factura. | No |
| **QA-02** | Pruebas de integración de componentes UI | `@QA-Reliability-Agent` | P1 | To-Do | Tests verificando que la acción del botón sincroniza el estado del backend. | No |
| **OPS-01** | Pipeline CI/CD en GitHub Actions | `@DevOps-FinOps-Agent` | P1 | To-Do | PRs bloqueados si fallan tests, linter, compilación o type-checking. | No |
| **A11Y-01**| Navegación de formularios por teclado | `@Frontend-UX-Agent` | P2 | To-Do | Todos los inputs y botones son accesibles mediante Tab y cumplen WCAG AA. | No |

---

## REGISTRO DE DECISIONES Y CONSULTAS PENDIENTES
> Antes de marcar tareas como "In Progress", documenta aquí las respuestas del usuario a las dudas planteadas en la columna "¿Bloqueado por Consulta?".