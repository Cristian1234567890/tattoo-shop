import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.resolve(__dirname, '../config/jira.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const authHeader = 'Basic ' + Buffer.from(`${config.email}:${config.token}`).toString('base64');

const DISCORD_JIRA_WEBHOOK = "https://discord.com/api/webhooks/1557473405408907336/oSgTd2JZ6BAdSfk9JSObe1nsO3uO6Ni5G1YGOt23WaVU6k6UIwWSGDcN6YRVfTrTQVEf";

const newTickets = [
  {
    summary: "📱 Verificación Telefónica Vonage SMS (OTP 6 Dígitos) y Flujo de Cambio de Número con Prefijos Internacionales",
    description: "Integración completa de Vonage SMS API para validación de números reales con códigos criptográficos de 6 dígitos. Rate limiting con cooldown de 60s, expiración a 10 min y máximo 5 intentos. Modal interactivo PhoneVerificationModal con selector homologado CustomSelect de prefijos internacionales de todos los países y componente OtpVerificationInput.",
  },
  {
    summary: "🔐 Autenticación Robusta 2FA / TOTP con Código QR SVG, Cambio de Correo Electrónico y Persistencia de Avatar",
    description: "Habilitación de autenticación multifactor (2FA) mediante TOTP para clientes y artistas con generación de códigos QR en SVG. Flujo seguro de actualización y confirmación de correo electrónico en perfil. Módulo avatar.ts para resguardar permanentemente la foto de Google OAuth y uploads de usuario, evitando sobreescrituras por avatares genéricos.",
  },
  {
    summary: "🎨 Portafolio Interactivo y Personalizador Visual de Perfil para Tatuadores (Temas, Layouts y Micro-animaciones)",
    description: "Galería de portafolio para artistas dividida en trabajos realizados, flashes disponibles y bocetos con visor Lightbox HD y zoom. Modal interactivo PortfolioCustomizerModal con 5 temas cromáticos, 3 disposiciones de cuadrícula (masonry, editorial, grid) y 4 efectos de micro-animación en tarjetas.",
  },
  {
    summary: "👥 Sistema de Invitación de Referidos y Embajadores con Beneficios Escalonados y Compartir en WhatsApp",
    description: "Módulo de recomendación y referidos con generación automática de código único, enlace de registro directo, botón para compartir rápidamente en WhatsApp y desbloqueo progresivo de beneficios escalonados (5% a 15% VIP).",
  },
  {
    summary: "✉️ Plantillas Transaccionales Modernas de Correo Electrónico y Cumplimiento Legal CAN-SPAM",
    description: "Templates HTML responsivos para bienvenida a la plataforma, confirmación de citas de tatuaje, cotizaciones e invitaciones a amigos. Estética dark/light de alta legibilidad y cláusulas de cumplimiento legal CAN-SPAM con dirección y canal de cancelación de suscripción.",
  },
  {
    summary: "🎂 Validación Legal de Mayoría de Edad (18+) en Registro con Cálculo Automático y Beneficios de Cumpleaños",
    description: "Captura obligatoria de fecha de nacimiento en el formulario de registro con cálculo en tiempo real de la edad del usuario. Bloqueo estricto a menores de 18 años por normativa sanitaria y cláusula informativa de beneficios y descuentos exclusivos en el mes de cumpleaños.",
  },
  {
    summary: "🌐 Erradicación Global de Mojibake UTF-8 y Homologación de Paletas y Tipografías Dinámicas en Perfil de Tatuador",
    description: "Saneamiento y corrección de caracteres especiales, tildes y símbolos con codificación corrupta en frontend. Adaptación automática de colores y fuentes en el perfil del artista según el tema seleccionado sin pérdida de contraste en modo claro u oscuro.",
  },
  {
    summary: "🚪 Prevención de Fuga de Sesión con Recarga Total al Cerrar Sesión, Pre-validación de Credenciales y Reenvío de Correo",
    description: "Implementación de recarga total del navegador (window.location.href = '/') al hacer logout para purgar estados en memoria. Pre-validación inmediata de correo y teléfono existentes en registro para evitar fallos silenciosos, y botón de reenvío de correo con temporizador en la pantalla de verificación.",
  },
  {
    summary: "📱 Optimización Responsiva en Pantalla Móvil: Exploración de Mapa, Pines sin Colisión y Catálogo de Artistas/Estudios",
    description: "Reestructuración y maquetación responsive en vista móvil para el mapa interactivo y catálogo de estudios/artistas. Navegación fluida por pestañas flotantes inferiores, prevención de colisiones de marcadores y soporte para safe-area-inset.",
  },
  {
    summary: "🏷️ Flujo Interactivo de Cupones con Requerimiento de Registro Previo, Retorno Automático y Validación en Pantalla",
    description: "Control de acceso en canje de cupones: si el visitante no está autenticado, es redirigido al registro preservando la URL de destino (/precios?coupon=...). Tras autenticarse, retorna automáticamente y el cupón es evaluado en pantalla con confirmación visual de validez y porcentaje de descuento.",
  },
  {
    summary: "⚙️ Saneamiento de Paneles: Eliminación de Suscripciones Duplicadas, Reubicación de Seguridad y Fecha de Nacimiento Bloqueada (18+)",
    description: "Depuración de la duplicidad de Facturación y Suscripciones en la pestaña de Configuración de clientes y artistas, manteniéndola exclusivamente en su pestaña dedicada. Traslado de Seguridad, Cambio de Correo y 2FA a la pestaña de Seguridad. Inclusión de la fecha de nacimiento en el perfil, visible pero bloqueada para preservar la verificación legal de mayoría de edad.",
  },
  {
    summary: "🐉 Galería de Evolución Multi-Tatuaje con Tatuador Asignado, Visto en Tiempo Real, Feedback Clínico y Kit de Productos de Cuidado",
    description: "Ampliación de la Galería de Evolución en Vivo para soportar múltiples tatuajes por cliente con pestañas selectoras. Visualización del tatuador responsable de dar seguimiento con avatar y datos de contacto, indicador en tiempo real de 'Visto por el artista' con marca de tiempo, tarjeta de feedback/recomendaciones clínicas y checklist interactivo del kit de productos indispensables para cada fase de curación.",
  }
];

async function createAndTransitionTicket(t) {
  console.log(`\n⏳ Creando ticket: ${t.summary.slice(0, 50)}...`);
  
  // 1. Create Issue
  const res = await fetch(`${config.host}/rest/api/2/issue`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      fields: {
        project: { key: config.projectKey },
        summary: t.summary,
        description: t.description,
        issuetype: { name: 'Tarea' }
      }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Error creating ${t.summary}: ${errText}`);
  }

  const issueData = await res.json();
  const issueKey = issueData.key;
  console.log(`✅ Issue Creado: ${issueKey}`);

  // 2. Fetch Transitions
  const transRes = await fetch(`${config.host}/rest/api/2/issue/${issueKey}/transitions`, {
    headers: { 'Authorization': authHeader, 'Accept': 'application/json' }
  });
  if (!transRes.ok) throw new Error(`Failed to fetch transitions for ${issueKey}`);
  const transData = await transRes.json();

  const targetTransition = transData.transitions.find(tr => 
    tr.name.toLowerCase().includes('listo') || 
    tr.name.toLowerCase().includes('finaliz') || 
    tr.name.toLowerCase().includes('done')
  );

  if (targetTransition) {
    const moveRes = await fetch(`${config.host}/rest/api/2/issue/${issueKey}/transitions`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ transition: { id: targetTransition.id } })
    });
    if (moveRes.ok) {
      console.log(`🎯 Transicionado a '${targetTransition.name}' (${issueKey})`);
    } else {
      console.warn(`⚠️ No se pudo transicionar ${issueKey}: ${await moveRes.text()}`);
    }
  }

  return { key: issueKey, summary: t.summary, url: `${config.host}/browse/${issueKey}` };
}

async function run() {
  console.log(`🚀 Iniciando sincronización de tickets no registrados en Jira (Proyecto TH)...`);
  const created = [];

  for (const t of newTickets) {
    try {
      const result = await createAndTransitionTicket(t);
      created.push(result);
    } catch (e) {
      console.error(`❌ Error en ticket:`, e.message);
    }
  }

  console.log(`\n🎉 Total tickets procesados: ${created.length}/${newTickets.length}`);
  
  // Discord Webhook Notification
  if (created.length > 0) {
    const discordPayload = {
      content: `🎯 **Sincronización Total de Backlog en Jira (Sprint 20 & Features Recientes)**\nSe han registrado y completado exitosamente **${created.length} nuevos tickets** en Jira Project \`${config.projectKey}\`:`,
      embeds: created.map(c => ({
        title: `${c.key}: ${c.summary}`,
        url: c.url,
        color: 0x10b981, // Emerald green
        fields: [
          { name: "Estado", value: "✅ Finalizada / Listo", inline: true },
          { name: "Proyecto", value: "Tattoo Hub (TH)", inline: true }
        ],
        footer: { text: "Tattoo Hub Jira Automation Bot" }
      }))
    };

    try {
      const dRes = await fetch(DISCORD_JIRA_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordPayload)
      });
      if (dRes.ok) {
        console.log(`📢 Notificación enviada exitosamente a Discord (${created.length} tickets)`);
      } else {
        console.warn(`⚠️ Error al notificar Discord: ${dRes.statusText}`);
      }
    } catch (dErr) {
      console.error(`⚠️ Discord webhook error:`, dErr.message);
    }
  }
}

run().catch(console.error);
