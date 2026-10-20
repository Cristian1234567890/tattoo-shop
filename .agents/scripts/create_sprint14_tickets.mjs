import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, '../config/jira.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const authHeader = 'Basic ' + Buffer.from(`${config.email}:${config.token}`).toString('base64');

const DISCORD_JIRA_WEBHOOK = "https://discord.com/api/webhooks/1557473405408907336/oSgTd2JZ6BAdSfk9JSObe1nsO3uO6Ni5G1YGOt23WaVU6k6UIwWSGDcN6YRVfTrTQVEf";

const tickets = [
  {
    summary: "🗺️ Hub & Map: Reemplazo a Tiles Canónicos OSM Sin Marcas de Agua CartoDB y Pulido Claro",
    description: `h2. Objetivo y Alcance
En /hub los tiles CartoDB Voyager arrojaban marcas de agua de advertencia 'API KEY REQUIRED carto.com/basemaps/apikey'. Además, el panel lateral y los popups de estudios presentaban inconsistencias en modo claro.

h3. Requerimientos de Implementación
1. *Tiles Canónicos*: Migrar la capa TileLayer a OpenStreetMap canónico (https://tile.openstreetmap.org/{z}/{x}/{y}.png).
2. *Estilos Reactivos*: Clase .light-map-tiles con filtro natural en modo claro e inversión controlada en modo oscuro.
3. *Exención de Enrutamiento*: Incluir /hub en exemptPaths dentro de App.tsx para evitar redirecciones al onboarding.
4. *Drawer & Popups*: Homologar botones y píldoras de residentes a paletas claras con contraste WCAG AA.`
  },
  {
    summary: "🎨 SVG Watermark & Avatar OAuth: Atenuación TattooPatternBackground y Resiliencia en Foto de Perfil",
    description: `h2. Objetivo y Alcance
El patrón de fondo SVG en TattooPatternBackground generaba trazos oscuros con opacidad excesiva compitiendo con los formularios, y el avatar del Navbar mostraba un círculo negro al fallar peticiones directas de OAuth/Google.

h3. Requerimientos de Implementación
1. *TattooPatternBackground*: Atenuar opacidad a 10-12% (opacity-[0.11]) con trazos slate suaves (#94a3b8 / #cbd5e1).
2. *Navbar Avatar*: Soporte para referrerPolicy="no-referrer" para evitar bloqueos HTTP 403 de Google CDN.
3. *Fallback Visual*: Manejo reactivo de estado avatarError con icono de usuario nítido en modo claro y oscuro.`
  },
  {
    summary: "🌓 Multi-Screen Light Mode Audit: Erradicación de Cajas Negras y Blindaje de Contraste WCAG AA",
    description: `h2. Objetivo y Alcance
Múltiples pantallas del atelier (/artistas, /login, /register, /client-dashboard, /artist-dashboard, /precios, /beneficios, /tienda) presentaban textos text-white sobre fondos claros o cajas oscuras duras bg-[#13131A] que invalidaban el tema claro.

h3. Requerimientos de Implementación
1. *Directorio de Artistas*: Contraste alto en selector de residentes, tarifas por hora y botones WhatsApp / Enviar Boceto.
2. *Formularios de Autenticación*: Sustituir clases text-white y cajas duras por slate-900 / white dinámicos.
3. *Tienda y Catálogo*: Eliminar overrides forzados bg-[#13131A] para que .atelier-card opere nativamente en modo claro.
4. *Reglas Globales*: Reforzar index.css para garantizar texto oscuro en h1-h4 y labels en html.light.`
  },
  {
    summary: "🧪 QA Automation & CD: Verificación End-to-End Playwright, Suite Backend (86/86) y Despliegue Vercel",
    description: `h2. Objetivo y Alcance
Asegurar que ningún fallo visual o funcional subsista en el proyecto antes de promover cambios a producción.

h3. Requerimientos de Implementación
1. *Playwright Visual Audit*: Script automatizado qa_sprint14_browser_audit.mjs auditando las 9 pantallas críticas.
2. *Suite de Pruebas Backend*: 86/86 pruebas unitarias y de integración pasando con 0 errores.
3. *Compilación Frontend*: tsc && vite build limpio sin errores de tipado o bundling.
4. *Despliegue y Git Sync*: Despliegue a Vercel Producción y sincronización entre staging y desarrollo.`
  }
];

async function createTickets() {
  console.log("🚀 Creando Tickets en Jira Software para Sprint 14...");
  const created = [];

  for (const t of tickets) {
    const payload = {
      fields: {
        project: { key: config.projectKey },
        summary: t.summary,
        description: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: t.description }]
            }
          ]
        },
        issuetype: { name: "Task" }
      }
    };

    try {
      const res = await fetch(`${config.host}/rest/api/3/issue`, {
        method: "POST",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.text();
        console.error(`❌ Error creando ticket "${t.summary}":`, err);
        continue;
      }

      const data = await res.json();
      console.log(`✅ Ticket Creado: ${data.key} - ${t.summary}`);
      created.push({ key: data.key, summary: t.summary, desc: t.description });
    } catch (err) {
      console.error(`❌ Fallo en fetch para "${t.summary}":`, err.message);
    }
  }

  // Guardar llaves creadas
  const sprint14KeysPath = path.resolve(__dirname, '../config/sprint14_keys.json');
  fs.writeFileSync(sprint14KeysPath, JSON.stringify({ keys: created.map(c => c.key) }, null, 2));
  console.log(`📁 Llaves guardadas en ${sprint14KeysPath}`);

  return created;
}

async function notifyDiscord(createdTickets) {
  if (createdTickets.length === 0) return;

  const fields = createdTickets.map((t) => ({
    name: `📌 [${t.key}] ${t.summary}`,
    value: `🔗 [Abrir en Jira Software](${config.host}/browse/${t.key})`,
    inline: false
  }));

  const embed = {
    title: "⚡ Sprint 14 Activado — OSM Map Tiles, Tattoo Watermark, Avatar OAuth & Full Light Mode",
    description: "Se han registrado las nuevas tareas para el reemplazo canónico de tiles OSM, delicada filigrana de fondo al 11%, resiliencia de avatares Google en el Navbar y auditoría multi-pantalla en modo claro.",
    url: `${config.host}/jira/software/projects/${config.projectKey}/boards`,
    color: 0x8B5CF6, // Violet
    fields,
    footer: {
      text: "Tattoo Hub Ops • DevSecOps & UI/UX Bot • Sprint 14 Active",
      icon_url: "https://tattoo-staging-ourpresent.vercel.app/favicon.ico"
    },
    timestamp: new Date().toISOString()
  };

  const payload = {
    username: "Tattoo Hub Jira Bot",
    avatar_url: "https://tattoo-staging-ourpresent.vercel.app/favicon.ico",
    content: `📢 **Sprint 14 Iniciado en Jira Software** — Se han creado ${createdTickets.length} tareas para estabilización visual completa.`,
    embeds: [embed]
  };

  try {
    const res = await fetch(DISCORD_JIRA_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok || res.status === 204) {
      console.log("✅ Notificación de inicio de Sprint 14 enviada a Discord exitosamente.");
    } else {
      console.error(`❌ Error enviando a Discord: ${res.status}`);
    }
  } catch (err) {
    console.error("❌ Fallo en webhook de Discord:", err.message);
  }
}

async function run() {
  const created = await createTickets();
  await notifyDiscord(created);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
