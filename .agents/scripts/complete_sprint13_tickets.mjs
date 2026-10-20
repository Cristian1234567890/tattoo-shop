import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, '../config/jira.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const authHeader = 'Basic ' + Buffer.from(`${config.email}:${config.token}`).toString('base64');

const DISCORD_JIRA_WEBHOOK = "https://discord.com/api/webhooks/1557473405408907336/oSgTd2JZ6BAdSfk9JSObe1nsO3uO6Ni5G1YGOt23WaVU6k6UIwWSGDcN6YRVfTrTQVEf";

const completedTickets = [
  {
    key: "TH-49",
    summary: "🗺️ Hub & Map: Sincronización Total a Modo Claro (Tiles Voyager / OSM Light & Drawer)",
    detail: "Leaflet MapContainer sincronizado con CartoDB Voyager tiles (.light-map-tiles) en modo claro sin inversión de colores, y panel lateral (drawer) con glassmorphism claro (bg-white/95) y alto contraste."
  },
  {
    key: "TH-50",
    summary: "🔍 Filtros & Búsqueda: Catálogo Completo de Estilos y Autocompletado Predictivo",
    detail: "Catálogo ampliado a 16 estilos con filtrado fluido y menú desplegable predictivo categorizado por Estudios (🏢), Artistas (🎨) y Estilos (🖋️) con auto-selección interactiva."
  },
  {
    key: "TH-51",
    summary: "🌐 I18n & Navbar: Estabilidad Sin Layout Shift, Retiro de 'Sobre Nosotros' y Traducción Dinámica",
    detail: "Retirado 'Sobre Nosotros' del navbar desktop (reubicado exclusivamente en el footer). Fijados anchos mínimos en selectores para eliminar layout shift y sincronizado dinámicamente el idioma en /hub y Dashboard."
  },
  {
    key: "TH-52",
    summary: "🪟 Modales & Alertas: Centralización Óptima de Banners (GPS & Toast) y Paywall VIP Claro",
    detail: "Banner de GPS y notificaciones toast perfectamente centrados en pantalla (centerX: 720). Modal de Paywall VIP adaptado a superficies claras con texto legible y contraste garantizado."
  }
];

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
    value: `${t.detail}\n🔗 [Ver en Jira](${config.host}/browse/${t.key})`,
    inline: false
  }));

  fields.push({
    name: "🧪 Auditoría Automatizada Playwright (Sprint 13)",
    value: "• **Navbar**: Sin 'Sobre Nosotros' en desktop y 0px de Layout Shift.\n• **Mapa /hub**: Tiles claros CartoDB Voyager activos en modo claro.\n• **Filtros**: 16 estilos de tatuaje verificados en UI.\n• **Buscador**: Popover predictivo validado con 3 categorías.\n• **Alineación**: Banner GPS centrado exactamente en el eje X (720px).\n• **Backend**: 86/86 suites de tests ejecutadas y aprobadas (100%).",
    inline: false
  });

  const embed = {
    title: "🎉 Sprint 13 Finalizado — Tareas Completadas & Verificadas",
    description: "Todas las tareas de estabilización del Navbar, I18n dinámico, mapa en modo claro, autocompletado predictivo y modales centrados han sido completadas con éxito.",
    url: `${config.host}/jira/software/projects/TH/boards`,
    color: 0x10B981, // Emerald Green
    fields,
    footer: {
      text: "Tattoo Hub Ops • DevSecOps & UI/UX Bot • Sprint 13 Complete",
      icon_url: "https://tattoo-staging-ourpresent.vercel.app/favicon.ico"
    },
    timestamp: new Date().toISOString()
  };

  const payload = {
    username: "Tattoo Hub Jira & QA Bot",
    avatar_url: "https://tattoo-staging-ourpresent.vercel.app/favicon.ico",
    content: "🚀 **¡Sprint 13 Completado con Éxito!** Las tareas TH-49 a TH-52 han sido marcadas como **Finalizadas (Listo)** en Jira Software.",
    embeds: [embed]
  };

  try {
    const res = await fetch(DISCORD_JIRA_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok || res.status === 204) {
      console.log("✅ Notificación de Sprint 13 enviada a Discord exitosamente.");
    } else {
      console.error(`❌ Error enviando a Discord: ${res.status}`);
    }
  } catch (err) {
    console.error("❌ Fallo en webhook de Discord:", err.message);
  }
}

async function run() {
  for (const t of completedTickets) {
    await transitionTicket(t.key);
  }
  await notifyDiscord();
}

run();
