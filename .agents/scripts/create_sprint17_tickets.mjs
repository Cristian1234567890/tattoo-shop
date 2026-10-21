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
    summary: "🗺️ Arquitectura de Estudios & Mapa Interactivo OSM: Multiestudio, Código de Colaborador, Transferencia, Calificaciones (1-5★) y Drawer Retráctil",
    description: `h2. Objetivo y Alcance
Modernizar la gestión de estudios y la experiencia cartográfica en Tattoo Hub con soporte multi-estudio (1:N), generación de código único para vinculación de colaboradores, transferencia de propiedad, eliminación segura de estudios (los artistas quedan independientes sin borrado de cuenta), sistema de reseñas con estrellas (1 a 5) y filtros por rating. Integrar mapa interactivo OpenStreetMap (OSM) con transición suave entre modos claro/oscuro sin recargar tiles ni perder zoom/búsqueda, ocultando visualmente la atribución de Leaflet/OSM cumpliendo estrictamente con la legalidad en el DOM. Además, implementar el estado inicial retraído del drawer con barra de búsqueda y filtros, expandiéndose solo ante la selección de un pin con botón de cierre.

h3. Requerimientos de Implementación
1. *Multiestudio & Colaboración*: Soporte para que artistas creen múltiples estudios (1:N), vinculen colaboradores mediante código de estudio único (ej. OBS-9X42), transfieran propiedad o eliminen estudios sin afectar las cuentas de sus artistas.
2. *Reseñas & Rating*: Sistema de puntuación de 1 a 5 estrellas con comentarios, cálculo dinámico de promedios y filtrado por rating (Todas, 4.5+ ★, 4.8+ ★).
3. *Mapa OSM Optimizado*: Filtro CSS dinámico para modo claro/oscuro sin destruir el mapa ni perder estado; ocultamiento visual de la atribución preservándola en el DOM.
4. *Drawer Interactivo*: Estado inicial retraído con sugerencia de selección de pin y filtros rápidos; expansión con detalles, residentes, horarios y botón de cierre.`
  },
  {
    summary: "💎 Homologación de Tarifas & Navbar Consolidado: Facturación Anual/Mensual ($3.99 vs $4.99) y Preferencias Globales",
    description: `h2. Objetivo y Alcance
Homologar el modelo de precios entre la página de inicio (/) y la página de precios (/precios), añadiendo selector de facturación (Anual con 20% de descuento a $3.99/mes vs Mensual a $4.99/mes, junto con el plan Explorador gratuito $0). Consolidar en el Navbar el selector compacto de país, moneda, idioma y cambio de tema en modo invitado (#country-currency-selector-btn), preservando los IDs de prueba e integrando estas opciones dentro del dropdown de cuenta de usuario (#user-account-dropdown) cuando la sesión está iniciada.

h3. Requerimientos de Implementación
1. *Homologación de Precios*: Sincronizar HomePage y PricingPage con toggle de facturación Anual ($3.99/mes con 20% de descuento) vs Mensual ($4.99/mes) y Plan Explorador ($0).
2. *Navbar Modo Invitado*: Botón compacto #country-currency-selector-btn con menú #country-currency-dropdown-menu que integra selector de país/moneda, idioma y toggle de tema.
3. *Navbar Modo Autenticado*: Integración de moneda, idioma y tema dentro de #user-account-dropdown para clientes y tatuadores.`
  },
  {
    summary: "🎨 Flujo 'Quiero ser Tatuador', Tienda Marketplace y Widget Flotante de Chat con Retención de 30 Días",
    description: `h2. Objetivo y Alcance
Permitir la conversión fluida de usuarios clientes a artistas a través de la opción 'Quiero ser Tatuador' (#btn-become-artist) en el menú de cuenta, desplegando un modal de 3 pasos (formulario de perfil artístico, pasarela de membresía con canje de cupones, y tour interactivo de onboarding). Rediseñar la tienda (/tienda) al estilo Facebook Marketplace con tarjetas destacadas de producto, vendedor, ubicación y contacto directo vía WhatsApp y chat interno. Implementar widget flotante de mensajería (fixed bottom-6 right-6) exclusivo para usuarios autenticados, con soporte de adjuntos de imagen y aviso de retención de 30 días.

h3. Requerimientos de Implementación
1. *Flujo 'Quiero ser Tatuador'*: Modal guiado en 3 pasos: (1) Formulario de datos profesionales de artista, (2) Pasarela de membresía con aplicación de cupones de descuento, y (3) Onboarding interactivo al Hub de Artistas.
2. *Tienda Marketplace*: Catálogo con diseño moderno tipo marketplace, tarjetas con precios prominentes, detalles del vendedor, ubicación y botones de contacto directo a WhatsApp y chat interno.
3. *Widget de Chat Flotante*: Botón flotante accesible en la esquina inferior derecha con gestión de conversaciones, carga de imágenes y aviso de retención de 30 días.`
  },
  {
    summary: "🎫 Sistema de Cupones Promocionales, Prevención de Bucle de Login & QA Automation Sprint 17",
    description: `h2. Objetivo y Alcance
Crear el sistema de validación y redención de cupones de descuento (TATTOO10, PROMO20, VIP50, TATTOOHUB) utilizables en checkout de membresía y reservas de productos en la tienda. Corregir bucles de redirección y re-renderizado doble en LoginPage / App. Asegurar la suite backend con 101/101 pruebas aprobadas (100%), suite de auditoría de navegador Playwright (qa_sprint17_browser_audit.mjs) con 37/37 validaciones exitosas (100%), captura de evidencias gráficas y despliegue continuo en producción en Vercel.

h3. Requerimientos de Implementación
1. *Cupones de Descuento*: Validación de códigos promocionales en backend y frontend para checkout de suscripciones y tienda.
2. *Estabilidad de Login*: Eliminación de dobles pantallas, parpadeos y bucles de redirección en LoginPage y ProtectedRoute.
3. *Pruebas Automatizadas*: Suite backend integral con 101/101 pruebas unitarias y de integración pasando al 100%. Auditoría de navegador Playwright con 37/37 checks aprobados.
4. *DevOps & Despliegue*: Capturas de evidencia en .agents/evidence/sprint17, commit Git semántico y despliegue en producción en Vercel.`
  }
];

async function createTickets() {
  console.log("🚀 Creando Tickets en Jira Software para Sprint 17 (TH-65 a TH-68)...");
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

  const sprint17KeysPath = path.resolve(__dirname, '../config/sprint17_keys.json');
  fs.writeFileSync(sprint17KeysPath, JSON.stringify({ keys: created.map(c => c.key) }, null, 2));
  console.log(`📁 Llaves guardadas en ${sprint17KeysPath}`);

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
    title: "⚡ Sprint 17 Activado — Arquitectura de Estudios, OSM Map, Marketplace, Cupones & Chat Flotante",
    description: "Se han registrado las nuevas tareas para soporte multi-estudio y código de colaborador, mapa OSM interactivo sin recargas, homologación de precios y navbar consolidado, flujo 'Quiero ser Tatuador', tienda Marketplace, cupones promocionales y widget de chat flotante.",
    url: `${config.host}/jira/software/projects/${config.projectKey}/boards`,
    color: 0x6366F1, // Indigo
    fields,
    footer: {
      text: "Tattoo Hub Ops • DevSecOps & QA Bot • Sprint 17 Active",
      icon_url: "https://tattoo-staging-ourpresent.vercel.app/favicon.ico"
    },
    timestamp: new Date().toISOString()
  };

  const payload = {
    username: "Tattoo Hub Jira Bot",
    avatar_url: "https://tattoo-staging-ourpresent.vercel.app/favicon.ico",
    content: `📢 **Sprint 17 Iniciado en Jira Software** — Se han creado ${createdTickets.length} tareas para el objetivo del proyecto.`,
    embeds: [embed]
  };

  try {
    const res = await fetch(DISCORD_JIRA_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok || res.status === 204) {
      console.log("✅ Notificación de inicio de Sprint 17 enviada a Discord exitosamente.");
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
