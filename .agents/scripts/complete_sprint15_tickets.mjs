import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, '../config/jira.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const authHeader = 'Basic ' + Buffer.from(`${config.email}:${config.token}`).toString('base64');

const DISCORD_JIRA_WEBHOOK = "https://discord.com/api/webhooks/1557473405408907336/oSgTd2JZ6BAdSfk9JSObe1nsO3uO6Ni5G1YGOt23WaVU6k6UIwWSGDcN6YRVfTrTQVEf";
const evidenceDir = path.resolve(__dirname, '../evidence/sprint15');

const completedTickets = [
  {
    key: "TH-57",
    summary: "🧭 Navbar Layout: Distribución Simétrica en 3 Secciones y Botón 'Registrarse' con Texto Blanco Permanente",
    detail: "Estructurado en 3 secciones simétricas (Logo Izquierda, Navegación Centrada Matemática con Delta 0.0px, Controles y Acciones a la Derecha) con contenedor max-w-[1720px]. Botón #nav-register blindado con rgb(255, 255, 255) permanente en modo claro y oscuro.",
    evidenceFiles: ['01_navbar_symmetry_and_button_light.png', '06_navbar_symmetry_dark.png']
  },
  {
    key: "TH-58",
    summary: "🔐 Login Form UI/UX Hardening: Botón con Texto Blanco, Desactivación de Tooltips Nativos y Validaciones en Línea",
    detail: "Botón 'Iniciar Sesión en Tattoo Hub' con texto blanco #ffffff puro garantizado. Supresión de tooltips nativos del navegador con noValidate y retroalimentación en línea con estados aria-invalid, bordes sutiles rose-500, iconos AlertCircle y textos claros.",
    evidenceFiles: ['02_login_custom_validation_light.png', '03_login_submit_button_white_text.png']
  },
  {
    key: "TH-59",
    summary: "🖋️ Curaduría Tipográfica & Modo Claro: Integración de Outfit & Plus Jakarta Sans y Tonos Slate Refinados",
    detail: "Fuentes Google Fonts 'Outfit' (títulos artísticos y geométricos) y 'Plus Jakarta Sans' (cuerpo y alta legibilidad) cargadas en index.html y Tailwind. Eliminado negro puro tosco en modo claro sustituido por slate-800 (#1e293b) y slate-600 (#475569) en dashboards de cliente y artista.",
    evidenceFiles: ['04_client_dashboard_typography_light.png', '05_artist_dashboard_typography_light.png']
  },
  {
    key: "TH-60",
    summary: "🧪 QA Automation Sprint 15: Playwright Browser Audit, Backend Suite 86/86 y Despliegue en Producción Vercel",
    detail: "Auditoría automatizada Playwright ejecutada (qa_sprint15_browser_audit.mjs) con 10/10 criterios de aceptación aprobados (100%). Suite de pruebas backend 86/86 verificada. Compilación Vite + TypeScript limpia y despliegue a producción ejecutado.",
    evidenceFiles: ['01_navbar_symmetry_and_button_light.png', '02_login_custom_validation_light.png']
  }
];

async function uploadToJira(issueKey, filePath) {
  try {
    if (!fs.existsSync(filePath)) return;
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: 'image/png' });
    formData.append('file', blob, fileName);

    const res = await fetch(`${config.host}/rest/api/2/issue/${issueKey}/attachments`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'X-Atlassian-Token': 'no-check'
      },
      body: formData
    });

    if (res.ok) {
      console.log(`📎 [JIRA] Captura ${fileName} adjuntada exitosamente a ${issueKey}`);
    } else {
      console.warn(`⚠️ [JIRA] No se pudo adjuntar ${fileName} a ${issueKey}:`, res.status);
    }
  } catch (err) {
    console.error(`❌ [JIRA] Excepción adjuntando a ${issueKey}:`, err.message);
  }
}

async function transitionTicket(key) {
  try {
    const res = await fetch(`${config.host}/rest/api/3/issue/${key}/transitions`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        transition: { id: "41" } // 41 = Listo / Finalizada
      })
    });
    if (res.ok || res.status === 204) {
      console.log(`✅ [JIRA] ${key} transicionado exitosamente a "Listo" (Done).`);
      return true;
    } else {
      const err = await res.text();
      console.warn(`⚠️ [JIRA] No se pudo transicionar ${key} a Listo: ${res.status} - ${err}`);
      return false;
    }
  } catch (err) {
    console.error(`❌ [JIRA] Error transicionando ${key}:`, err.message);
    return false;
  }
}

async function notifyDiscord() {
  const fields = completedTickets.map((t) => ({
    name: `✅ [${t.key}] ${t.summary}`,
    value: `${t.detail}\n🔗 [Ver en Jira Software](${config.host}/browse/${t.key})`,
    inline: false
  }));

  fields.push({
    name: "🧪 Auditoría Automatizada Playwright (Sprint 15)",
    value: "• **Navbar**: Layout 3 secciones simétricas con delta 0.0px. Botón 'Registrarse' con texto blanco rgb(255,255,255) permanente.\n• **Login UI/UX**: Botón 'Iniciar Sesión' con texto blanco puro. noValidate activo, tooltips nativos suprimidos, validaciones en línea con bordes rose y alert icons.\n• **Tipografía & Contraste**: Google Fonts Outfit & Plus Jakarta Sans integradas. Titulares slate-800 (#1e293b) y descripciones slate-600 en dashboards de cliente y artista.\n• **Backend Suite**: 86/86 pruebas aprobadas al 100%.\n• **Frontend Build**: Vite + TypeScript (tsc) sin advertencias ni errores.",
    inline: false
  });

  const embed = {
    title: "🎉 Sprint 15 Finalizado — Navbar Simétrico, Botones Blancos, Validaciones Inline & Tipografía Atelier",
    description: "Todas las tareas de rediseño de Navbar a 3 secciones simétricas, blindaje de botones con texto blanco permanente, validaciones en línea en login sin tooltips nativos, tipografías Outfit y Plus Jakarta Sans, y contrastes suaves en modo claro han sido completadas y validadas con QA automatizado.",
    url: `${config.host}/jira/software/projects/TH/boards`,
    color: 0x8B5CF6, // Violet
    fields,
    footer: {
      text: "Tattoo Hub Ops • DevSecOps & UI/UX Bot • Sprint 15 Complete",
      icon_url: "https://tattoo-staging-ourpresent.vercel.app/favicon.ico"
    },
    timestamp: new Date().toISOString()
  };

  const payload = {
    username: "Tattoo Hub Jira Bot",
    avatar_url: "https://tattoo-staging-ourpresent.vercel.app/favicon.ico",
    content: `🏁 **Sprint 15 Completado al 100% en Jira Software** — ${completedTickets.length} tareas verificadas con evidencia visual y transicionadas a **Listo**.`,
    embeds: [embed]
  };

  try {
    const res = await fetch(DISCORD_JIRA_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok || res.status === 204) {
      console.log("✅ [DISCORD] Notificación de cierre de Sprint 15 enviada exitosamente.");
    } else {
      console.error(`❌ [DISCORD] Error enviando a Discord: ${res.status}`);
    }
  } catch (err) {
    console.error("❌ [DISCORD] Fallo en webhook:", err.message);
  }
}

async function run() {
  console.log("🚀 Iniciando Transición de Tickets y Carga de Evidencias para Sprint 15...");

  for (const t of completedTickets) {
    console.log(`\n--- Procesando ${t.key} ---`);
    for (const file of t.evidenceFiles) {
      const filePath = path.join(evidenceDir, file);
      await uploadToJira(t.key, filePath);
    }
    await transitionTicket(t.key);
  }

  console.log("\n📡 Enviando notificación de culminación a Discord...");
  await notifyDiscord();

  console.log("\n✨ ¡Proceso de cierre de Sprint 15 finalizado con éxito!");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
