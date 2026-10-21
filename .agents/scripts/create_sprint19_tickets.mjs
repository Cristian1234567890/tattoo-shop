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
    summary: "💳 Unificación de Input de Tarjeta (16 Dígitos Dinámicos) y Flujo Interactivo de Verificación Bancaria Multi-Etapa",
    description: `h2. Objetivo y Alcance
Unificar los 4 campos fragmentados de tarjeta en un único input inteligente de 16 dígitos con espaciado dinámico automático 4-4-4-4 y ancho adaptable que garantice cero desbordamiento horizontal en pantallas móviles y desktop. Implementar un flujo modal interactivo de verificación bancaria con animación de barra de progreso y 3 fases secuenciales (Conectando con red Visa/Mastercard -> Validando algoritmo y fondos -> Tarjeta verificada y bóveda encriptada activada).

h3. Requerimientos de Implementación
1. *Input Unificado*: Reemplazar inputs cuádruples por input único (#card-number, data-testid="input-card-number") formateado a 16 dígitos con espaciado en grupos de 4.
2. *Estilos Anti-Overflow*: Ajustar .credit-card-box y .number con clamp tipográfico responsive y min-w-0 w-full en contenedores.
3. *Verificación Bancaria Multi-Etapa*: Modal interactivo con barra de progreso (#banking-progress-bar) y 3 etapas claras de validación antes del éxito final.
4. *Opciones de Pago*: Si el usuario posee tarjeta guardada (cardLast4), permitir cobro en 1-clic o conmutar a formulario para afiliar una tarjeta diferente.`
  },
  {
    summary: "🛡️ Lógica de Visibilidad de Roles en Navbar (Exclusión de 'Quiero ser Tatuador' para Tatuadores) y Cobro de Tarjeta Guardada",
    description: `h2. Objetivo y Alcance
Refactorizar la lógica condicional del Navbar para garantizar que los usuarios con rol de artista/tatuador ('tatuador' tanto en user.role como en metadata.role o metadata.tipo) nunca visualicen la opción 'Quiero ser Tatuador / Abrir Estudio', mostrando en su lugar el conmutador de modo ('Cambiar a Modo Tatuador' o 'Cambiar a Modo Cliente'). Brindar soporte para cobro directo a tarjeta guardada en pasarela de membresía.

h3. Requerimientos de Implementación
1. *Lógica Navbar*: Evaluar role, user_metadata.role y user_metadata.tipo === 'tatuador'.
2. *Exclusión de Enlace*: Ocultar permanentemente 'Quiero ser Tatuador / Abrir Estudio' en menús desktop y móvil para cuentas de artista.
3. *Modo Switcher*: Renderizar conmutador de contexto artista/cliente con navegación bidireccional limpia.
4. *Cobro 1-Clic*: Opción principal para cargar a tarjeta guardada si existe card_last4 en la cuenta.`
  },
  {
    summary: "📑 Pestaña Dedicada de Primer Nivel de Suscripciones en Paneles de Cliente y Artista con Tarjeta 'Sin Letras Chiquitas'",
    description: `h2. Objetivo y Alcance
Crear una pestaña de primer nivel ('suscripciones') en ClientDashboardPage (?tab=suscripciones) y ArtistDashboardPage (?tab=suscripciones) que exponga los detalles del plan activo (o gratuito), días restantes del ciclo de facturación, fecha de próximo cobro, método de pago enmascarado con botón de cambio, acciones de renovación y cancelación con período de gracia de 30 días, y la tarjeta destacada de transparencia 'Sin Letras Chiquitas'.

h3. Requerimientos de Implementación
1. *Pestaña en Dashboards*: Integrar tab 'suscripciones' en ClientTabsNav, ClientDashboardPage y ArtistDashboardPage con sincronización en URL.
2. *Componente SubscriptionBillingSection*: Métricas de ciclo de 30 días, días restantes y próxima facturación.
3. *Tarjeta 'Sin Letras Chiquitas'*: Sección destacada (#sin-letras-chiquitas) con las 4 garantías de transparencia (sin cláusulas ocultas, 30 días garantizados tras cancelar, modo lectura permanente y sin penalizaciones).
4. *Modales de Gestión*: Modal de confirmación de cancelación y cambio seguro de tarjeta.`
  },
  {
    summary: "🎨 Homologación Integral de Contraste en Modo Claro en Pestañas de Configuración y Seguridad (Notificaciones, Presets, Sesiones y Danger Zone)",
    description: `h2. Objetivo y Alcance
Resolver inconsistencias de contraste en modo claro en los paneles de Configuración y Seguridad del cliente y artista. Homologar las 7 tarjetas de notificaciones, botones de presets de avatar, prefijo telefónico internacional, tarjetas de sesiones activas (iPhone 15 Pro, MacBook Pro M2), opciones de privacidad y contenedor de Zona de Riesgo (Danger Zone) con paleta clara institucional de alto contraste.

h3. Requerimientos de Implementación
1. *ConfiguracionTab*: Tarjetas de notificación sobre superficies claras (bg-slate-50 border-slate-200), botones de avatar en superficies slate claras y selector telefónico +507 nítido.
2. *SeguridadTab*: Sesiones activas y dispositivos en contenedores de alto contraste accesibles.
3. *Danger Zone*: Fondo rose-50/70 con borde rose-200 y tipografía rose-800 accesible en modo claro, adaptándose fluidamente en modo oscuro.
4. *Alias de Componentes*: Compatibilidad retroactiva garantizada para exportaciones ConfiguracionTab y SeguridadTab.`
  }
];

async function createTickets() {
  console.log("🚀 Creando Tickets en Jira Software para Sprint 19 (TH-73 a TH-76)...");
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

  const sprint19KeysPath = path.resolve(__dirname, '../config/sprint19_keys.json');
  fs.writeFileSync(sprint19KeysPath, JSON.stringify({ keys: created.map(c => c.key) }, null, 2));
  console.log(`📁 Llaves guardadas en ${sprint19KeysPath}`);

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
    title: "⚡ Sprint 19 Activado — Tarjeta 16 Dígitos & Verificación Bancaria, Navbar Roles, Tab Suscripciones & Contraste Modo Claro",
    description: "Se han registrado las nuevas tareas para unificación de input de tarjeta y flujo interactivo bancario en 3 fases, visibilidad de roles en Navbar, pestaña de primer nivel de Suscripciones en dashboards con tarjeta 'Sin Letras Chiquitas', y homologación integral de modo claro en Configuración y Seguridad.",
    url: `${config.host}/jira/software/projects/${config.projectKey}/boards`,
    color: 0x8B5CF6, // Violet
    fields,
    footer: {
      text: "Tattoo Hub Ops • DevSecOps & QA Bot • Sprint 19 Active",
      icon_url: "https://tattoo-staging-ourpresent.vercel.app/favicon.ico"
    },
    timestamp: new Date().toISOString()
  };

  const payload = {
    username: "Tattoo Hub Jira Bot",
    avatar_url: "https://tattoo-staging-ourpresent.vercel.app/favicon.ico",
    content: `📢 **Sprint 19 Iniciado en Jira Software** — Se han creado ${createdTickets.length} tareas (TH-73 a TH-76).`,
    embeds: [embed]
  };

  try {
    const res = await fetch(DISCORD_JIRA_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok || res.status === 204) {
      console.log("✅ Notificación de inicio de Sprint 19 enviada a Discord exitosamente.");
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
