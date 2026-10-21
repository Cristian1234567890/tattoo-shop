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
    summary: "🎨 Corrección Integral de Contraste en Modo Claro & Homologación de Paleta Institucional (GuestGateModal, PricingPage, CustomSelect, ShopPage)",
    description: `h2. Objetivo y Alcance
Resolver inconsistencias de legibilidad y contraste en modo claro reportadas por los usuarios (fondos oscuros con tipografía negra/ilegible). Homologar botones y modales bajo la paleta institucional (gradientes violeta/índigo, bordes sutiles y textos con alto contraste WCAG AAA).

h3. Requerimientos de Implementación
1. *GuestGateModal*: Reemplazar cajas duras oscuras por fondos dinámicos blanco/zinc-950 con resaltados en violeta suave y botones legibles en modo claro.
2. *PricingPage*: Reemplazar botones planos negros (bg-slate-900) por estilos adaptativos claros para 'Empezar Gratis' y gradiente violeta para VIP.
3. *CustomSelect*: Eliminar fondos hardcodeados oscuros (#121217) y garantizar fondos blancos/slate-800 con bordes definidos en modo claro.
4. *ShopPage*: Sustituir acentos ámbar por gradiente institucional violeta a índigo en 'Apartar para Retiro' y modales de confirmación.`
  },
  {
    summary: "🚀 Rediseño de Experiencia 'Quiero ser Tatuador': Pantalla Completa Dedicada (/unete-como-tatuador) y Desacople de Modal en Navbar",
    description: `h2. Objetivo y Alcance
Desacoplar el formulario de 'Quiero ser Tatuador / Abrir Estudio' del Navbar, eliminando el modal inline incrustado. Crear una página completa (/unete-como-tatuador / BecomeArtistPage.tsx) con stepper de 4 etapas: perfil profesional y estilos, selección de membresía con canje de cupones, pasarela de afiliación de tarjeta con 30 días gratis y confirmación exitosa con enlace directo al panel de artista.

h3. Requerimientos de Implementación
1. *Página Dedicada*: Crear BecomeArtistPage.tsx y registrar ruta /unete-como-tatuador con alias /become-artist en App.tsx.
2. *Exención en OnboardingGate*: Añadir /unete-como-tatuador a rutas exentas para permitir registro fluido a clientes existentes.
3. *Navbar Refactor*: Reemplazar el trigger de modal por enlaces de navegación directa en menús desktop y móvil. Desmontar BecomeArtistModal del Navbar.`
  },
  {
    summary: "💳 Pasarela Nativa de Afiliación de Tarjeta (Legacy Card Vault): Algoritmo de Luhn, Detección de Franquicia, Enmascaramiento y Débito Recurrente",
    description: `h2. Objetivo y Alcance
Construir una pasarela directa de afiliación de tarjeta de crédito/débito dentro de la aplicación sin redirección externa a Stripe (simulación de bóveda legacy de tarjetas). Validar números de tarjeta mediante algoritmo de Luhn, formatear dinámicamente en grupos 4-4-4-4, detectar franquicia (Visa, Mastercard, Amex, Discover) y requerir consentimiento explícito mediante casilla de verificación antes de afiliar.

h3. Requerimientos de Implementación
1. *Validación y Detección*: Implementar algoritmo de Luhn y detección de franquicias en backend (subscription.service.ts) y frontend (InteractiveCard.tsx).
2. *Consentimiento Explícito*: Checkbox obligatorio autorizando el débito de suscripción luego del período de gracia.
3. *Endpoints Backend*: POST /subscription/affiliate-card guardando datos enmascarados (**** **** **** 1234) y activando período de 30 días.`
  },
  {
    summary: "🛡️ Flujo de Cancelación y Reactivación de Suscripción con Resguardo de 30 Días y Modo Lectura Permanente para Datos Históricos",
    description: `h2. Objetivo y Alcance
Implementar el ciclo completo de cancelación y reactivación de suscripciones para clientes VIP y tatuadores profesionales. Garantizar que tras cancelar, los beneficios se preserven durante los 30 días completos desde el pago (current_period_end). Al vencer, el usuario desciende al rol gratuito pero conserva acceso en modo lectura permanente a todo su historial (citas, tatuajes, fotos de cicatrización y portafolio).

h3. Requerimientos de Implementación
1. *Preservación de 30 Días*: Endpoints POST /subscription/cancel y POST /subscription/reactivate en backend que manejan current_period_end y cancel_at_period_end sin degradación inmediata.
2. *Resguardo Histórico*: Protección de datos garantizando que no se purgue ninguna cita, obra o avance fotográfico.
3. *Componente UI*: SubscriptionBillingSection.tsx integrado en panel de cliente (/client-dashboard) y panel de artista (/artist-dashboard) con modal de confirmación y reactivación en 1-clic.`
  }
];

async function createTickets() {
  console.log("🚀 Creando Tickets en Jira Software para Sprint 18 (TH-69 a TH-72)...");
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

  const sprint18KeysPath = path.resolve(__dirname, '../config/sprint18_keys.json');
  fs.writeFileSync(sprint18KeysPath, JSON.stringify({ keys: created.map(c => c.key) }, null, 2));
  console.log(`📁 Llaves guardadas en ${sprint18KeysPath}`);

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
    title: "⚡ Sprint 18 Activado — Contraste Modo Claro, /unete-como-tatuador, Pasarela Nativa & Ciclo de Suscripción",
    description: "Se han registrado las nuevas tareas para homologación visual en modo claro, experiencia dedicada de alta de artistas, pasarela legacy por afiliación de tarjeta con algoritmo de Luhn, y cancelación de suscripciones con resguardo de 30 días y modo lectura histórico.",
    url: `${config.host}/jira/software/projects/${config.projectKey}/boards`,
    color: 0x8B5CF6, // Violet
    fields,
    footer: {
      text: "Tattoo Hub Ops • DevSecOps & QA Bot • Sprint 18 Active",
      icon_url: "https://tattoo-staging-ourpresent.vercel.app/favicon.ico"
    },
    timestamp: new Date().toISOString()
  };

  const payload = {
    username: "Tattoo Hub Jira Bot",
    avatar_url: "https://tattoo-staging-ourpresent.vercel.app/favicon.ico",
    content: `📢 **Sprint 18 Iniciado en Jira Software** — Se han creado ${createdTickets.length} tareas para el objetivo del proyecto.`,
    embeds: [embed]
  };

  try {
    const res = await fetch(DISCORD_JIRA_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok || res.status === 204) {
      console.log("✅ Notificación de inicio de Sprint 18 enviada a Discord exitosamente.");
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
