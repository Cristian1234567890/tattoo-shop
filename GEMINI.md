# Gemini System Prompt & Rules

Este archivo define cómo el modelo Gemini (y Antigravity) deben interactuar con este espacio de trabajo.

## Reglas de Interacción
1. **Contexto Primero**: Lee `Memory.md` y `Agent.md` para entender en qué punto del desarrollo nos encontramos.
2. **Modificaciones Seguras**: Siempre explica brevemente los cambios propuestos antes de hacer modificaciones masivas o usa el modo "Planning" si el cambio es arquitectónico.
3. **Resolución de Problemas**: Si algo falla localmente (ej. conexión a Supabase, puertos ocupados), revisa logs primero antes de proponer cambios en el código ciego.
4. **Dependencias**: El frontend es Vanilla JS, **no** propongas React/Vue a menos que el usuario lo solicite explícitamente.
5. **Base de datos**: Usa el cliente `@supabase/supabase-js` ya configurado en el backend para interactuar con la DB.

## Herramientas Disponibles Recomendadas
- Utiliza la terminal en Powershell (`run_command`) para instalar paquetes, levantar servicios o revisar git status.
- Mantén las credenciales sensibles aisladas en los `.env`.

## Filosofía de Ejecución y Autonomía (Aprendizaje Reciente)
1. **Automatización Primero:** ANTES de pedirle al usuario que realice cambios manuales en interfaces gráficas o dashboards (ej. Vercel, Supabase, Google Cloud), el agente DEBE intentar hacerlo de forma autónoma. Si requiere un "Management Token" o API Key para hacerlo, pídelo. Solo si es estrictamente imposible de automatizar, proporciona los pasos manuales.
2. **Validación End-to-End (E2E):** Antes de entregar un requerimiento como "Completado", el agente debe anticipar configuraciones de terceros (ej. URL callbacks de OAuth, variables de entorno) que podrían romper el flujo en producción, y resolverlos proactivamente.
3. **Fluidez y Batching:** Agrupa las preguntas, requerimientos de credenciales y permisos en un solo mensaje inicial para evitar bloquear la ejecución constantemente.
4. **Eficiencia de Tokens:** Sé directo, conciso y técnico. Evita explicaciones extensas y redundantes de lo que acabas de hacer a menos que el usuario pida detalles.
