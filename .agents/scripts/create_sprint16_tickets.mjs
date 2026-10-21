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
    summary: "🎨 Nuevo Branding Oficial: Integración de Logo Completo e Isotipo Oficial con Respaldo Legacy",
    description: `h2. Objetivo y Alcance
Actualizar la identidad corporativa de Tattoo Hub con los nuevos activos visuales en alta definición proporcionados por el usuario (Logo Completo e Isotipo con calavera y máquina rotativa dorada), respaldando los activos anteriores en el repositorio.

h3. Requerimientos de Implementación
1. *Respaldo de Activos Anteriores*: Copia de seguridad del logo anterior como 'logo-legacy.svg' en 'public/assets/', 'public/' y 'src/assets/'.
2. *Instalación de Nuevos Activos*: Despliegue de 'logo.png' (logo completo) e 'logo-icon.png' (isotipo emblemático) en directorios públicos y de compilación.
3. *Integración en Componentes*: Incorporar el nuevo isotipo en 'Logo.tsx' (con soporte drop-shadow e interacción hover), 'LoginPage.tsx' y 'RegisterPage.tsx'.
4. *Compatibilidad de Testing*: Mantener la definición vectorial SVG accesible con 'aria-label="Tattoo Hub Logo Emblem"' para garantizar 100% de compatibilidad con suites E2E.`
  },
  {
    summary: "✨ Navbar Premium: Degradado Vertical Suave, Sticky z-50 y Altura Espaciosa h-20",
    description: `h2. Objetivo y Alcance
Mejorar la barra de navegación principal para otorgarle mayor presencia, elegancia y funcionalidad sticky durante el scroll.

h3. Requerimientos de Implementación
1. *Degradado Vertical Suave*: Aplicar gradiente top-to-bottom ('from-white/95 via-white/90 to-white/80' en modo claro y 'from-zinc-950/95 via-zinc-950/90 dark:to-zinc-950/80' en modo oscuro) con backdrop-blur-md.
2. *Comportamiento Sticky*: Fijar la barra en la parte superior ('sticky top-0 z-50') con borde divisor sutil inferior ('border-slate-200/60' / 'border-zinc-800/60').
3. *Altura Espaciosa*: Incrementar la altura del contenedor interior a 80px ('h-20') permitiendo respiración visual del isotipo y los enlaces.`
  },
  {
    summary: "☀️ Homologación de Modo Claro: Estadísticas en Home, Buzón de Feedback y Galería de Evolución",
    description: `h2. Objetivo y Alcance
Homologar todas las secciones que aún mostraban fondos o textos oscuros forzados en modo claro según las capturas reportadas por el usuario.

h3. Requerimientos de Implementación
1. *Captura 3 - Estadísticas en HomePage*: Convertir cajas '100% Contacto Directo' y '0% Comisiones' a fondos claros ('bg-slate-50 border-slate-200') con textos legibles en slate-900.
2. *Captura 4 - Buzón de Feedback en AboutPage*: Homologar contenedor principal a fondo blanco ('bg-white border-slate-200'), botones de categorías claros ('bg-slate-100'), e inputs/textareas con fondos slate-50 legibles.
3. *Captura 5 - Galería de Evolución en TattooTimeline*: Toolbar de filtros homologada a 'bg-slate-100/90', botones con alto contraste, y tarjetas de fases de curación adaptadas a fondos blancos ('bg-white border-slate-200').
4. *Modales de Avance*: Homologar ProgressDetailModal y UploadProgressModal para soporte de temas claro y oscuro impecables.`
  },
  {
    summary: "🔍 Micro-interacciones & QA Automation Sprint 16: Micro-zoom Hover, Suite Playwright y Despliegue en Producción",
    description: `h2. Objetivo y Alcance
Implementar micro-interacciones interactivas en tarjetas de catálogo y dashboards (hover:scale-[1.02] y cursor pointer), verificar la solución mediante Playwright y suites de pruebas, y desplegar en producción.

h3. Requerimientos de Implementación
1. *Micro-interacciones Hover*: Configurar regla global '.atelier-card-hover' con elevación y 'scale(1.02)' con cursor pointer, aplicado a beneficios, estudios y paneles de artista.
2. *Auditoría Automatizada Playwright*: Script 'qa_sprint16_browser_audit.mjs' validando logo nuevo, navbar sticky con degradado de 80px, secciones homologadas en modo claro y micro-interacciones hover.
3. *Validación de Suites*: Verificar backend test suite 86/86 pasando al 100% y compilar frontend de manera limpia.
4. *Despliegue a Producción*: Despliegue en Vercel (https://tattoo-hub.vercel.app) y registro de evidencias.`
  }
];

async function createTickets() {
  console.log("🚀 Creando Tickets en Jira Software para Sprint 16 (TH-61 a TH-64)...");
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

  const sprint16KeysPath = path.resolve(__dirname, '../config/sprint16_keys.json');
  fs.writeFileSync(sprint16KeysPath, JSON.stringify({ keys: created.map(c => c.key) }, null, 2));
  console.log(`📁 Llaves guardadas en ${sprint16KeysPath}`);

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
    title: "⚡ Sprint 16 Activado — Nuevo Logo Oficial, Navbar Sticky Degradado, Homologación Modo Claro & Micro-interacciones",
    description: "Se han registrado las nuevas tareas para el nuevo branding oficial y respaldo legacy, Navbar con degradado vertical espacioso h-20, homologación completa de modo claro (Feedback, Galería, Estadísticas) y micro-interacciones hover.",
    url: `${config.host}/jira/software/projects/${config.projectKey}/boards`,
    color: 0x8B5CF6,
    fields,
    footer: {
      text: "Tattoo Hub Ops • DevSecOps & UI/UX Bot • Sprint 16 Active",
      icon_url: "https://tattoo-staging-ourpresent.vercel.app/favicon.ico"
    },
    timestamp: new Date().toISOString()
  };

  const payload = {
    username: "Tattoo Hub Jira Bot",
    avatar_url: "https://tattoo-staging-ourpresent.vercel.app/favicon.ico",
    content: `📢 **Sprint 16 Iniciado en Jira Software** — Se han creado ${createdTickets.length} tareas para el objetivo del proyecto.`,
    embeds: [embed]
  };

  try {
    const res = await fetch(DISCORD_JIRA_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok || res.status === 204) {
      console.log("✅ Notificación de inicio de Sprint 16 enviada a Discord exitosamente.");
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
