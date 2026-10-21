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
    summary: "🧭 Navbar Layout: Distribución Simétrica en 3 Secciones y Botón 'Registrarse' con Texto Blanco Permanente",
    description: `h2. Objetivo y Alcance
En el Navbar, los enlaces de navegación estaban agrupados a la izquierda junto al logo dejando un vacío en el centro. Además, en modo claro el botón morado 'Registrarse' mostraba texto negro forzado por index.css.

h3. Requerimientos de Implementación
1. *Layout Simétrico*: Reestructurar a 3 secciones ([Logo Izquierda] --- [Navegación Centrada] --- [Selectores y Auth Derecha]) con contenedor max-w-[1720px] aprovechando armónicamente todo el viewport.
2. *Texto Blanco Invariante*: El botón #nav-register debe mantener color de texto blanco (#ffffff / rgb(255, 255, 255)) en modo claro y oscuro, eliminando cualquier override no deseado.
3. *Estilos Refinados*: Píldoras de navegación centradas con espaciado balanceado y soporte total a resoluciones de escritorio y móviles.`
  },
  {
    summary: "🔐 Login Form UI/UX Hardening: Botón con Texto Blanco, Desactivación de Tooltips Nativos y Validaciones en Línea",
    description: `h2. Objetivo y Alcance
En /login el botón 'Iniciar Sesión en Tattoo Hub' presentaba texto negro en modo claro, y al enviar el formulario vacío aparecían tooltips emergentes nativos del navegador ("Completa este campo") rompiendo la experiencia visual.

h3. Requerimientos de Implementación
1. *Botón Iniciar Sesión*: Asegurar texto blanco (#ffffff / keep-white-text) en modo claro y oscuro.
2. *noValidate en Formularios*: Añadir noValidate al <form> para suprimir tooltips nativos.
3. *Validaciones Personalizadas*: Feedback en línea debajo de cada campo con bordes sutiles (border-rose-500, ring-rose-500/20), iconos AlertCircle y mensajes contextuales acordes a la identidad visual de Tattoo Hub.`
  },
  {
    summary: "🖋️ Curaduría Tipográfica & Modo Claro: Integración de Outfit & Plus Jakarta Sans y Tonos Slate Refinados",
    description: `h2. Objetivo y Alcance
En los dashboards de cliente y artista en modo claro se utilizaba negro plano (#000000 / #0f172a forzado) que resultaba tosco e ilegible. Además, se requería una curaduría tipográfica profesional y coherente.

h3. Requerimientos de Implementación
1. *Google Fonts*: Cargar 'Outfit' (títulos) y 'Plus Jakarta Sans' (cuerpo) en index.html y configurar tailwind.config.js e index.css.
2. *Tonos Slate Refinados*: Reemplazar negros absolutos por tonos slate elegantes (text-slate-800 para titulares, text-slate-600 para descripciones y párrafos) en modo claro.
3. *Armonía Visual*: Aplicar la nueva escala armónica tanto en ArtistDashboardPage como en ClientDashboardPage y sus pestañas.`
  },
  {
    summary: "🧪 QA Automation Sprint 15: Playwright Browser Audit, Backend Suite 86/86 y Despliegue en Producción Vercel",
    description: `h2. Objetivo y Alcance
Verificar de extremo a extremo que todos los ajustes de layout, tipografía, contrastes y validaciones cumplen con los criterios de aceptación y desplegar en producción.

h3. Requerimientos de Implementación
1. *Playwright Browser Audit*: Script automatizado qa_sprint15_browser_audit.mjs validando botones blancos, Navbar en 3 secciones, validaciones en línea sin tooltips nativos y tipografías cargadas.
2. *Backend Test Suite*: 86/86 pruebas pasando al 100%.
3. *Frontend Production Build*: Compilación limpia con Vite y TypeScript sin errores.
4. *Despliegue a Producción*: Despliegue en Vercel (https://tattoo-hub.vercel.app) y sincronización con git.`
  }
];

async function createTickets() {
  console.log("🚀 Creando Tickets en Jira Software para Sprint 15 (TH-57 a TH-60)...");
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

  const sprint15KeysPath = path.resolve(__dirname, '../config/sprint15_keys.json');
  fs.writeFileSync(sprint15KeysPath, JSON.stringify({ keys: created.map(c => c.key) }, null, 2));
  console.log(`📁 Llaves guardadas en ${sprint15KeysPath}`);

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
    title: "⚡ Sprint 15 Activado — Navbar 3-Secciones, Botones Blancos, Validaciones Personalizadas & Tipografía Atelier",
    description: "Se han registrado las nuevas tareas para el rediseño simétrico del Navbar, botones con texto blanco permanente, validaciones en línea sin tooltips nativos del navegador, y fuentes Google Fonts 'Outfit' & 'Plus Jakarta Sans'.",
    url: `${config.host}/jira/software/projects/${config.projectKey}/boards`,
    color: 0x8B5CF6,
    fields,
    footer: {
      text: "Tattoo Hub Ops • DevSecOps & UI/UX Bot • Sprint 15 Active",
      icon_url: "https://tattoo-staging-ourpresent.vercel.app/favicon.ico"
    },
    timestamp: new Date().toISOString()
  };

  const payload = {
    username: "Tattoo Hub Jira Bot",
    avatar_url: "https://tattoo-staging-ourpresent.vercel.app/favicon.ico",
    content: `📢 **Sprint 15 Iniciado en Jira Software** — Se han creado ${createdTickets.length} tareas para el objetivo del proyecto.`,
    embeds: [embed]
  };

  try {
    const res = await fetch(DISCORD_JIRA_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok || res.status === 204) {
      console.log("✅ Notificación de inicio de Sprint 15 enviada a Discord exitosamente.");
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
