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
    summary: "🗺️ Hub & Map: Sincronización Total a Modo Claro (Tiles Voyager / OSM Light & Drawer)",
    description: `h2. Objetivo y Alcance
En la vista /hub el mapa de Leaflet permanecía forzado en modo oscuro debido a la clase CSS 'dark-map-tiles' con filtro invert() que no reaccionaba al tema claro. Además, el panel lateral flotante (drawer) y los popups de estudios conservaban cajas duras en bg-zinc-950 con textos oscuros sobre fondo claro.

h3. Requerimientos de Implementación
1. *Capa de Mapa Reactiva*: Detectar isDark desde ThemeContext y alternar dinámicamente entre tiles CartoDB Voyager / OSM Light en modo claro y OSM Dark Inverted en modo oscuro.
2. *Drawer Lateral*: Homologar fondos a bg-white/90 con bordes border-slate-200/90, textos text-slate-900 y tarjetas de artistas legibles en modo claro.
3. *Popups y Marcadores*: Adaptar fondos de popups de estudios a paletas claras con contraste WCAG AA.`
  },
  {
    summary: "🔍 Filtros & Búsqueda: Catálogo Completo de Estilos y Autocompletado Predictivo",
    description: `h2. Objetivo y Alcance
Los filtros actuales en /hub estaban restringidos a solo 5 estilos. Se debe desplegar el catálogo integral de estilos de arte corporal con barra táctil y proveer un menú predictivo de sugerencias en tiempo real mientras el usuario escribe en el buscador.

h3. Requerimientos de Implementación
1. *Catálogo de Estilos*: Añadir Realismo, Tradicional, Blackwork, Minimalista, Neotradicional, Fineline, Geométrico, Acuarela, Lettering, Japonés / Irezumi, Puntillismo, Surrealismo, Anime / Manga, Tribal e Ignorant.
2. *Autocompletado Predictivo*: Menú flotante categorizado por tipo:
   - 🏢 Estudios coincidentes
   - 🎨 Artistas coincidentes
   - 🖋️ Estilos coincidentes
3. Al seleccionar una sugerencia, enfocar y filtrar automáticamente la vista.`
  },
  {
    summary: "🌐 I18n & Navbar: Estabilidad Sin Layout Shift, Retiro de 'Sobre Nosotros' y Traducción Dinámica",
    description: `h2. Objetivo y Alcance
El Navbar sufría desplazamientos horizontales al cambiar de idioma debido a anchos dinámicos variables, 'Sobre Nosotros' ocupaba espacio innecesario en la barra superior en lugar del footer, y las vistas clave (/hub, modales, banners) no consumían useLanguage() permaneciendo en español aún con inglés seleccionado.

h3. Requerimientos de Implementación
1. *Optimización Navbar*: Retirar 'Sobre Nosotros' de la navegación superior desktop. Asignar anchos fijos mínimos (w-14) a los selectores para evitar saltos de layout.
2. *Consumo Global de useLanguage*: Integrar diccionario de traducciones completo en ArtistsHubPage, ClientDashboardPage y GeolocationContext para reflejar el idioma de inmediato.`
  },
  {
    summary: "🪟 Modales & Alertas: Centralización Óptima de Banners (GPS & Toast) y Paywall VIP Claro",
    description: `h2. Objetivo y Alcance
El aviso de geolocalización y los modales VIP flotaban en esquinas desconectadas del foco visual del usuario o presentaban contenedores oscuros con texto azul marino ilegible.

h3. Requerimientos de Implementación
1. *Centralización Visual*: Centrar el banner de GPS (sm:left-1/2 sm:-translate-x-1/2) y adaptar sus superficies a bg-white/95 con textos contrastados en modo claro.
2. *Paywall VIP*: Homologar el modal de suscripción VIP en ClientDashboardPage a modo claro con superficies blancas, degradados dorados suaves y textos nítidos.`
  }
];

async function createTickets() {
  console.log("🚀 Creando Tickets en Jira Software para Sprint 13...");
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
    title: "⚡ Sprint 13 Activado — Map Light Mode, Search Predictivo & I18n Navbar Fix",
    description: "Se han registrado las nuevas tareas correctivas para subsanar sincronización de modo claro en Mapa, autocompletado inteligente, estabilidad del Navbar y centralización de modales.",
    url: `${config.host}/jira/software/projects/${config.projectKey}/boards`,
    color: 0x8B5CF6, // Violet
    fields,
    footer: {
      text: "Tattoo Hub Ops • Sprint 13 Backlog",
      icon_url: "https://tattoo-staging-ourpresent.vercel.app/favicon.ico"
    },
    timestamp: new Date().toISOString()
  };

  const payload = {
    username: "Tattoo Hub Jira Bot",
    avatar_url: "https://tattoo-staging-ourpresent.vercel.app/favicon.ico",
    content: `📢 **Sprint 13 Iniciado:** Se crearon **${createdTickets.length} tareas** en Jira Software para atender el feedback de diseño, mapa y experiencia de usuario.`,
    embeds: [embed]
  };

  try {
    const res = await fetch(DISCORD_JIRA_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    console.log(`📡 [Discord] Notificación enviada. Status HTTP: ${res.status}`);
  } catch (err) {
    console.error("❌ [Discord] Error enviando webhook:", err.message);
  }
}

async function main() {
  const created = await createTickets();
  await notifyDiscord(created);
}

main().catch(console.error);
