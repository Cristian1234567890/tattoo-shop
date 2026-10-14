---
description: Estándar obligatorio para el envío de notificaciones y reportes a canales de Discord usando Rich Embeds.
---

# Regla: Notificaciones Elegantes en Discord (Rich Embeds)

Cuando tengas que reportar el estado de una tarea, un despliegue, un error o enviar cualquier mensaje a los webhooks de Discord usando el script `.agents/scripts/discord_notifier.mjs`, DEBES cumplir estas directrices estrictas de formato.

## 1. PROHIBICIÓN DE TEXTO PLANO
Nunca envíes strings de texto plano a Discord si se trata de un reporte de tareas, informe de despliegue, alerta de servidor o auditoría. El texto plano solo debe usarse para saludos muy breves o pruebas de conexión de una sola línea.

## 2. USO OBLIGATORIO DE EMBEDS (Formato JSON)
Debes generar un archivo `.json` temporal con la estructura nativa de "Discord Embeds" y pasarlo como argumento al script. El script detectará el archivo JSON y lo procesará adecuadamente.

## 3. LEGIBILIDAD Y SALTOS DE LÍNEA
Discord renderiza los Embeds de forma diferente al IDE:
- No agrupes textos extensos en un solo párrafo.
- Usa saltos de línea explícitos (`\n`) para separar conceptos dentro de la propiedad `"value"` de los `fields`.
- Separa la información lógica en diferentes bloques dentro del array `"fields"`.

## 4. ESTRUCTURA JSON REQUERIDA
El payload JSON debe tener esta estructura (puedes añadir más campos si lo necesitas):

```json
{
  "embeds": [
    {
      "title": "✅ [Título Elegante / Estado de la Tarea]",
      "color": 3066993,
      "description": "Breve descripción general de la tarea completada o alerta.",
      "fields": [
        {
          "name": "📌 Sección 1 (Ej. Backend)",
          "value": "Detalle de la sección 1.\nUsa saltos de línea y viñetas Markdown dentro del value."
        },
        {
          "name": "⚠️ Alertas / Errores",
          "value": "Si hay problemas, documéntalos en su propio field."
        }
      ],
      "footer": {
        "text": "Antigravity Project Manager"
      },
      "timestamp": "2026-10-07T12:00:00Z"
    }
  ]
}
```

## 5. CÓDIGO DE COLORES OBLIGATORIO (Decimal)
El color de la tarjeta (`"color"`) DEBE reflejar exactamente la naturaleza del mensaje o el estado del ticket en Jira:

### A. Estados de Tareas en Jira (Canal `jira` y Tableros)
- 🔵 **Azul (`3447003`):** Tarea en **Backlog**.
- 🟡 **Amarillo (`15844367`):** Tarea en **Desarrollo / En curso**.
- 🟠 **Naranja (`15105570`):** Tarea **Con impedimentos / Bloqueos / Preguntas al PO**.
- 🟣 **Violeta (`10181046`):** Tarea en **Pruebas / QA / Review**.
- 🔷 **Celeste (`1752220`):** Tarea en **Despliegue / Staging**.
- 🟢 **Verde (`3066993`):** Tarea **Completada / Listo**.

### B. Alertas de Servidor y Notificaciones Generales
- 🟢 **Verde (`3066993`):** Informativo / Tarea completada.
- 🟠 **Naranja (`15105570`):** Preguntas que requieren respuesta del PO.
- 🔴 **Rojo (`15158332`):** Errores críticos / Build fallido / Bugs.

## 6. ALERTAS CON @everyone
Cada notificación relevante, reporte de despliegue o actualización de Jira debe disparar mención `@everyone` para que el Product Owner reciba las alertas inmediatamente en su dispositivo móvil.

## 7. MÉTODO DE EJECUCIÓN
Crea el archivo temporal (ej. `temp_embed.json`), escribe el JSON ahí, y ejecuta:
```bash
node .agents/scripts/discord_notifier.mjs [canal_destino] temp_embed.json
```
Canales disponibles: `notifications`, `quota`, `plan`, `taskStatus`, `alertas_agentes`, `despliegue_desarrollo`, `despliegue_productivo`.

## 7. ENLACES OBLIGATORIOS EN REPORTES DE DESPLIEGUE
En los canales `despliegue_desarrollo` y `despliegue_productivo`, es **OBLIGATORIO** incluir una sección destacada con los enlaces activos a la aplicación:
- **URL Principal de Pruebas / Producción** (ej. URL de Vercel).
- **Dominios Alternativos** o enlaces de inspección si aplican.
- El enlace debe ser clicable para que el Product Owner pueda probar desde su móvil o navegador de inmediato.
