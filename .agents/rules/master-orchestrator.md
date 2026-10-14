---
description: Estándar estricto del Orquestador Principal de Ingeniería gobernado por 5 dominios de auditoría y documentación mandatoria en Jira.
---

# Regla: Master Orchestrator & 5 Dominios de Auditoría de Ingeniería

Esta regla define el protocolo estricto de orquestación técnica para el proyecto Tattoo Hub.

---

## 1. PRINCIPIO DE GOBERNANZA TÉCNICA
Queda estrictamente prohibido cerrar tareas o generar cambios estructurales en el repositorio sin la revisión o validación en los 5 dominios de calidad:

1. **@Security_Legal_Agent**:
   - Cumplimiento estricto de consentimiento de mayoría de edad (18+), protección de datos de clientes, segregación de llaves públicas/privadas y aislamiento de tokens de sesión.
2. **@DB_Performance_Agent**:
   - Optimización de consultas, prevención de anti-patrones N+1 en Supabase/PostgreSQL, indexación adecuada y preservación de aislamiento para no saturar la base de datos de producción con logs auxiliares (los cuales residen en Firebase/Firestore).
3. **@QA_Reliability_Agent**:
   - Pruebas E2E automatizadas con Playwright, verificación de aserciones de viewport en desktop y móvil, y validación de regresión visual antes de cualquier despliegue.
4. **@Frontend_A11y_Agent**:
   - Cumplimiento de WCAG AA, tokens Stitch, contraste óptimo en modo claro y modo oscuro, atributos ARIA, navegación por teclado y eliminación de elementos visuales deformes.
5. **@DevOps_FinOps_Agent**:
   - Monitoreo de telemetría y excepciones en tiempo real (Sentry), canalización de webhooks a Discord, despliegues controlados a Vercel con asignación de alias y control de cuotas/costos.

---

## 2. DELEGACIÓN Y DOCUMENTACIÓN EN JIRA SOFTWARE
- Toda iniciativa, refactorización o corrección debe registrarse como issue/tarea en el proyecto `TH` de **Jira Software** con su descripción técnica, criterios de aceptación y estado.
- Para conservar la ventana de contexto y el presupuesto de tokens del modelo, el detalle extenso y los logs de ejecución deben delegarse a Jira y notificarse mediante embeds en Discord, manteniendo el contexto de trabajo ligero y enfocado.

---

## 3. MODELOS LIGEROS PARA AGENTES DE INVESTIGACIÓN
- Al invocar subagentes operativos o de inspección mediante `invoke_subagent`, se debe preferir el nivel de modelo `flash` o `flash_lite` para tareas de exploración de código, navegación web o auditorías de enlaces, reservando recursos de cómputo para tareas de orquestación profunda.
