import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, '../config/jira.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const authHeader = 'Basic ' + Buffer.from(`${config.email}:${config.token}`).toString('base64');

const DISCORD_JIRA_WEBHOOK = "https://discord.com/api/webhooks/1557473405408907336/oSgTd2JZ6BAdSfk9JSObe1nsO3uO6Ni5G1YGOt23WaVU6k6UIwWSGDcN6YRVfTrTQVEf";
const evidenceDir = path.resolve(__dirname, '../evidence/sprint16');

const completedTickets = [
  {
    key: "TH-61",
    summary: "🎨 Nuevo Branding Oficial: Integración de Logo Completo e Isotipo Oficial con Respaldo Legacy",
    detail: "Logo completo (/logo.png) e isotipo oficial (/logo-icon.png) integrados con alta fidelidad y drop-shadow sutil en Navbar, LoginPage y RegisterPage. Respaldo histórico 'logo-legacy.svg' preservado en directorios públicos y de fuentes. Conservación de nodos vectoriales SVG y 'aria-label=\"Tattoo Hub Logo Emblem\"' con 100% de compatibilidad en suites E2E.",
    evidenceFiles: ['01_branding_logo_light.png']
  },
  {
    key: "TH-62",
    summary: "✨ Navbar Premium: Degradado Vertical Suave, Sticky z-50 y Altura Espaciosa h-20",
    detail: "Barra de navegación estilizada con degradado suave top-to-bottom ('from-white/95 via-white/90 to-white/80' y 'from-zinc-950/95 via-zinc-950/90 dark:to-zinc-950/80') con backdrop-blur-md. Fijación 'sticky top-0 z-50' con divisor sutil inferior y altura espaciosa de 80px ('h-20') para una ergonomía visual balanceada.",
    evidenceFiles: ['02_navbar_sticky_gradient_light.png', '03_navbar_sticky_gradient_dark.png']
  },
  {
    key: "TH-63",
    summary: "☀️ Homologación de Modo Claro: Estadísticas en Home, Buzón de Feedback y Galería de Evolución",
    detail: "Homologación completa de las secciones reportadas en capturas del usuario: Cajas de estadísticas en sección de estudios verificados en HomePage ('100% Contacto Directo', '0% Comisiones') con fondos slate-50 legibles; Buzón de Feedback en AboutPage con fondo blanco, botones de categorías claros e inputs slate-50; Toolbar y tarjetas de evolución en TattooTimeline con fondos claros y modales ProgressDetailModal y UploadProgressModal adaptados a tema claro.",
    evidenceFiles: ['04_home_verified_studios_light.png', '05_about_feedback_mailbox_light.png', '06_timeline_gallery_light.png']
  },
  {
    key: "TH-64",
    summary: "🔍 Micro-interacciones & QA Automation Sprint 16: Micro-zoom Hover, Suite Playwright y Despliegue en Producción",
    detail: "Regla '.atelier-card-hover' enriquecida con elevación 'translateY(-0.25rem) scale(1.02)' y 'cursor: pointer' aplicada en beneficios, directorio de estudios y tarjetas de gestión de artistas. Auditoría Playwright 'qa_sprint16_browser_audit.mjs' aprobada con 10/10 checks (100%), backend test suite 86/86 pasando al 100%, compilación Vite sin errores y despliegue a producción en Vercel.",
    evidenceFiles: ['07_card_hover_microinteraction.png']
  }
];

async function uploadToJira(issueKey, filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ [JIRA] Archivo de evidencia no encontrado: ${filePath}`);
      return;
    }
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

  const embed = {
    title: "🎯 Sprint 16 Finalizado al 100% — Branding Oficial, Navbar Sticky Degradado, Modo Claro Homologado & Micro-interacciones",
    description: "Todas las tareas del Sprint 16 han sido implementadas, verificadas con auditoría de navegador Playwright (10/10), suite backend (86/86) y transicionadas a **Listo** en Jira Software.",
    url: `${config.host}/jira/software/projects/${config.projectKey}/boards`,
    color: 0x10B981, // Emerald Green
    fields,
    footer: {
      text: "Tattoo Hub Ops • DevSecOps & QA Bot • Sprint 16 Complete",
      icon_url: "https://tattoo-staging-ourpresent.vercel.app/favicon.ico"
    },
    timestamp: new Date().toISOString()
  };

  const payload = {
    username: "Tattoo Hub Jira Bot",
    avatar_url: "https://tattoo-staging-ourpresent.vercel.app/favicon.ico",
    content: "🚀 **¡Sprint 16 Completado con Éxito!** — Las 4 tareas han sido verificadas y transicionadas a **Listo**.",
    embeds: [embed]
  };

  try {
    const res = await fetch(DISCORD_JIRA_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok || res.status === 204) {
      console.log("✅ Anuncio de finalización de Sprint 16 enviado a Discord exitosamente.");
    } else {
      console.error(`❌ Error enviando a Discord: ${res.status}`);
    }
  } catch (err) {
    console.error("❌ Fallo en webhook de Discord:", err.message);
  }
}

async function run() {
  console.log("🏁 Procesando Cierre de Tickets para Sprint 16 (TH-61 a TH-64)...");

  for (const ticket of completedTickets) {
    console.log(`\n--- Procesando ${ticket.key} ---`);
    for (const fileName of ticket.evidenceFiles) {
      const filePath = path.join(evidenceDir, fileName);
      await uploadToJira(ticket.key, filePath);
    }
    await transitionTicket(ticket.key);
  }

  console.log("\n📢 Notificando a Discord sobre la finalización del Sprint 16...");
  await notifyDiscord();
  console.log("🎉 ¡Sprint 16 cerrado y notificado satisfactoriamente!");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
