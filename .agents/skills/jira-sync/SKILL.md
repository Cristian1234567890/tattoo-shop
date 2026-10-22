---
name: jira-sync
description: Reglas, directrices y automatización para registrar y sincronizar obligatoriamente todas las tareas, características y correcciones completadas en Jira (Tattoo Hub) y notificar al canal de Discord.
---

# Skill: Jira Synchronization & Backlog Audit

Esta skill establece la regla mandataria de que **TODO cambio, característica, corrección de bugs o sprint completado en Tattoo Hub debe quedar formalmente registrado en Jira** en el proyecto `TH` (`https://tattoo-hub.atlassian.net`) y transicionado a estado `Listo` / `Finalizada`.

## Configuración y Credenciales
- **Archivo de configuración**: `.agents/config/jira.json`
- **Host**: `https://tattoo-hub.atlassian.net`
- **Proyecto**: `TH`
- **Herramienta modular**: `.agents/tools/jira.mjs`
- **Webhook de Discord**: Canal de auditoría y commits de Tattoo Hub (`.agents/scripts/discord_notifier.mjs`).

## Protocolo Obligatorio del Agente
1. **Auditoría Previa**: Antes de dar por finalizada una sesión o requerimiento del usuario, verificar el listado de tickets en Jira utilizando `listIssues()` de `.agents/tools/jira.mjs`.
2. **Creación de Tickets Faltantes**: Cualquier funcionalidad, refactorización o bugfix implementado que no tenga ticket en Jira debe ser creado inmediatamente mediante `createIssue(summary, description, 'Tarea')`.
3. **Transición a Finalizada**: Cada ticket completado debe transicionarse a `Listo` / `Finalizada` utilizando `transitionIssue(key, 'Listo')`.
4. **Notificación en Discord**: Publicar el resumen del ticket completado con su enlace directo a Jira en el canal de Discord.
5. **No dejar deuda técnica en el backlog**: Si el usuario solicita nuevas tareas, verificar qué tickets previos quedaron pendientes de registro y subirlos todos en lote.

## Ejemplo de Uso en Node.js
```javascript
import { createIssue, transitionIssue, listIssues } from '../tools/jira.mjs';

// 1. Crear issue
const issue = await createIssue(
  '🛡️ Saneamiento de Perfil y Galería de Evolución Multi-Tatuaje',
  'Descripción técnica detallada de los cambios implementados...',
  'Tarea'
);

// 2. Transicionar a Listo
await transitionIssue(issue.key, 'Listo');
```
