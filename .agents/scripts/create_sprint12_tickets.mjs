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
    summary: "🎨 UI/UX: Eliminación Integral de Cajas Oscuras en Dashboard, Hero y Banners en Modo Claro",
    description: `h2. Objetivo y Alcance
Múltiples pantallas todavía conservan cajas internas con fondos oscuros duros (bg-gray-800, bg-zinc-900, bg-black, bg-[#13131A]) en modo claro, generando tarjetas negras ilegibles sobre fondo blanco con texto de bajísimo contraste. Se debe realizar la homologación total a superficies claras elevadas.

h3. Secciones Afectadas Identificadas
1. *Client Dashboard - Tab Overview*: Cajas de 'Acciones Rápidas' (Explorar Artistas, Mis Citas, Catálogo de Estilos) y el bloque 'Seguimiento de Tatuajes & Curación' con sus 3 fases.
2. *Client Dashboard - Tab Citas*: Tarjetas de citas en 'Agenda del Atelier' (bg-[#1A1A24]/80, notas técnicas en bg-black/40).
3. *Home Page - Hero & Roadmap*: El degradado superior (bg-radial con to-[#0B0B0E]), el botón 'Formar un Estudio o Perfil' y las 4 tarjetas de la Hoja de Ruta.
4. *Home Page - Cultura de Taller*: La banda horizontal previa al footer con bg-gradient-to-b from-[#0B0B0E] to-zinc-950.`
  },
  {
    summary: "🖋️ Design System: Fondo Tatuado Vectorial Dinámico con Tinta Adaptativa (SVG Pattern Light/Dark)",
    description: `h2. Objetivo y Alcance
La interfaz requiere mayor identidad y dinamismo visual. Se debe implementar un fondo temático con motivos de arte corporal / tatuaje (delineado fino de dagas, líneas sagradas geométricas, botánica neo-tradicional) que responda de forma fluida y automática al modo de visualización.

h3. Especificaciones del Componente
1. *Modo Claro (Canvas Pergamino)*: Trazos sutiles estilo tinta líquida grafito/sepia con opacidad del 4% al 6% (rgba(71, 85, 105, 0.05)) para dar textura artesanal sin fatigar la lectura.
2. *Modo Oscuro (Atelier Obsidiana)*: Trazos bioluminiscentes con acentos violeta/ámbar tenues con opacidad del 8% al 12% (rgba(139, 92, 246, 0.10)).
3. Componente reutilizable TattooPatternBackground con renderizado SVG ligero vectorizado (0 penalización de performance LCP).`
  },
  {
    summary: "🔮 UI/UX: Difuminación Armónica (Glassmorphism & Radial Mesh Glow) en Secciones Densas",
    description: `h2. Objetivo y Alcance
En secciones con alta densidad de cuadrículas o cajitas consecutivas (Acciones Rápidas, Cuidados de Curación, Calendarios, Catálogo Flash), el diseño debe cobrar vida mediante efectos de difuminación (glassmorphism multicapa, halos radiales etéreos y gradientes difuminados en los bordes).

h3. Requerimientos de Diseño
1. *Glassmorphism Suave*: Aplicar backdrop-blur-xl con fondos translúcidos bg-white/70 (modo claro) y bg-zinc-900/60 (modo oscuro), acompañados de bordes cristalinos sutiles border-slate-200/80 y border-white/10.
2. *Ambient Glow Orbs*: Incorporar halos esféricos difuminados de baja saturación (violet-500/10, amber-500/10, fuchsia-500/10) detrás de los grupos densos de tarjetas para añadir profundidad tridimensional sin sobrecargar el DOM.
3. *Micro-interacciones*: Efectos hover con elevación suave (-translate-y-1) y aumento del brillo perimetral.`
  },
  {
    summary: "🪟 Modales & Badges: Homologación de Contraste y Superficies Claras en Modal QA y Paywalls",
    description: `h2. Objetivo y Alcance
El modal de 'Protocolo de Segregación y Blindaje QA' y los modales de Paywall VIP presentan actualmente un contenedor blanco con cajas internas en negro azabache (bg-zinc-950, bg-zinc-900/80) que generan incoherencia visual y textos de difícil lectura.

h3. Requerimientos de Corrección
1. Adaptar el modal de QaEnvironmentBanner para que en modo claro utilice tarjetas interiores con bg-slate-100/80, bordes border-slate-200 y textos text-slate-800 con badges informativos legibles.
2. Homologar el modal de Paywall VIP y el modal de Avance de Cicatrización con clases dinámicas para garantizar experiencia uniforme en ambos temas.`
  }
];

async function createTickets() {
  console.log("🚀 Creando Tickets en Jira Software para Sprint 12 (Bocetos, Fondo Tatuado & Difuminación)...");
  const created = [];

  for (const t of tickets) {
    const payload = {
      fields: {
        project: { key: config.projectKey },
        summary: t.summary,
        description: t.description,
        issuetype: { name: "Task" }
      }
    };

    try {
      const res = await fetch(`${config.host}/rest/api/2/issue`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.text();
        console.error(`❌ Error creando ${t.summary}:`, err);
        continue;
      }

      const data = await res.json();
      console.log(`✅ Creado: ${data.key} - ${t.summary}`);
      created.push({ key: data.key, summary: t.summary, desc: t.description });
    } catch (e) {
      console.error(`Excepción creando ticket:`, e);
    }
  }

  // Notificar a Discord
  if (created.length > 0) {
    console.log("\n📢 Transmitiendo resumen a Discord Webhook...");
    const discordPayload = {
      embeds: [
        {
          title: "🎯 Sprint 12 Planificado: Bocetos de Fondo Tatuado, Difuminación & Homologación Claro",
          color: 0x9333ea, // Violeta elegante
          description: "Se han registrado las nuevas tareas en Jira Software para la renovación estética y resolución de cajas oscuras residuales tras la auditoría visual con capturas del usuario.",
          fields: created.map(c => ({
            name: `📌 ${c.key}: ${c.summary}`,
            value: `Tarea registrada en el backlog de Sprint 12. Pendiente de aprobación del boceto de diseño frente a Figma.`
          })),
          footer: {
            text: "Tattoo Hub Orchestrator • Sprint 12 Backlog & Design Blueprint",
            icon_url: "https://tattoo-staging-ourpresent.vercel.app/favicon.ico"
          },
          timestamp: new Date().toISOString()
        }
      ]
    };

    try {
      const dRes = await fetch(DISCORD_JIRA_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordPayload)
      });
      console.log(`📡 Notificación de Discord enviada. Status: ${dRes.status}`);
    } catch (err) {
      console.error("Error enviando a Discord:", err);
    }
  }
}

createTickets();
