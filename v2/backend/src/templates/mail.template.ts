/**
 * Tattoo Hub - Modern Email Templates Suite
 * Responsive, dark/light compatible, typography-rich HTML transactional emails.
 */

function escapeHtml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const BASE_STYLES = `
  body {
    margin: 0;
    padding: 0;
    background-color: #0b0c10;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #e5e7eb;
    -webkit-font-smoothing: antialiased;
  }
  .wrapper {
    width: 100%;
    background-color: #0b0c10;
    padding: 30px 15px;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background: #13141c;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  }
  .header {
    background: linear-gradient(135deg, #090a0f 0%, #1e1b2e 50%, #2a1b3d 100%);
    color: #ffffff;
    padding: 36px 28px;
    text-align: center;
    border-bottom: 1px solid rgba(244, 63, 94, 0.3);
  }
  .header .badge {
    display: inline-block;
    padding: 4px 14px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #f43f5e;
    background: rgba(244, 63, 94, 0.15);
    border: 1px solid rgba(244, 63, 94, 0.35);
    border-radius: 999px;
    margin-bottom: 12px;
  }
  .header h1 {
    margin: 0;
    font-size: 26px;
    font-weight: 900;
    letter-spacing: -0.5px;
    color: #ffffff;
  }
  .content {
    padding: 36px 28px;
    color: #d1d5db;
    font-size: 15px;
    line-height: 1.6;
  }
  .highlight-card {
    background: #1a1c27;
    border-left: 4px solid #f43f5e;
    padding: 20px;
    border-radius: 12px;
    margin: 24px 0;
    color: #f3f4f6;
  }
  .btn-primary {
    display: inline-block;
    padding: 14px 32px;
    background: linear-gradient(135deg, #e65100 0%, #ff7a29 100%);
    color: #ffffff !important;
    font-weight: 800;
    font-size: 14px;
    text-decoration: none;
    border-radius: 12px;
    text-align: center;
    margin: 20px 0;
    box-shadow: 0 10px 20px rgba(230, 81, 0, 0.35);
  }
  .feature-grid {
    display: table;
    width: 100%;
    margin: 24px 0;
  }
  .feature-item {
    display: table-row;
  }
  .feature-icon {
    display: table-cell;
    width: 36px;
    font-size: 18px;
    vertical-align: top;
    padding-bottom: 14px;
  }
  .feature-text {
    display: table-cell;
    vertical-align: top;
    padding-bottom: 14px;
    font-size: 14px;
    color: #cbd5e1;
  }
  .footer {
    background: #0d0e14;
    padding: 28px 24px;
    text-align: center;
    font-size: 12px;
    color: #64748b;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    line-height: 1.6;
  }
  .footer a {
    color: #f43f5e;
    text-decoration: underline;
  }
`;

/**
 * 1. Welcome & User Confirmation Email
 */
export function renderWelcomeUserTemplate(
  name: string,
  role: string = 'Cliente',
  exploreUrl: string = 'https://tattoo-staging-ourpresent.vercel.app/hub'
): string {
  const safeName = escapeHtml(name || 'Amante del Arte');
  const isArtist = role.toLowerCase() === 'tatuador';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>¡Bienvenido a Tattoo Hub!</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="badge">TATTOO HUB OFICIAL</div>
        <h1>¡Bienvenido al Ecosistema!</h1>
      </div>
      <div class="content">
        <p>Hola <strong>${safeName}</strong>,</p>
        <p>
          Tu cuenta en <strong>Tattoo Hub</strong> ha sido creada y verificada con éxito.
          ${
            isArtist
              ? 'Ahora cuentas con tu estudio digital profesional, portafolio personalizable y herramientas de cotización directa.'
              : 'Ya puedes explorar artistas certificados, reservar flashes de autor y agendar sesiones seguras con total tranquilidad.'
          }
        </p>

        <div class="highlight-card">
          <p style="margin: 0; font-weight: bold; color: #f43f5e; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">
            Tu Seguridad es Nuestra Prioridad
          </p>
          <p style="margin: 6px 0 0 0; font-size: 14px; color: #cbd5e1;">
            Todos los tatuadores y clientes de la plataforma cuentan con verificación de identidad y número móvil validado vía SMS.
          </p>
        </div>

        <div class="feature-grid">
          <div class="feature-item">
            <div class="feature-icon">📍</div>
            <div class="feature-text"><strong>Hub Geográfico Interactivo:</strong> Ubica estudios y artistas cercanos en el mapa satelital.</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">✨</div>
            <div class="feature-text"><strong>Flashes Exclusivos:</strong> Reserva diseños listos para tatuar con seña protegida.</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🎁</div>
            <div class="feature-text"><strong>Programa de Referidos:</strong> Invita a tus amigos y acumula hasta 15% de descuento en tus citas.</div>
          </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${exploreUrl}" class="btn-primary">
            ${isArtist ? 'Configurar Mi Portafolio' : 'Explorar Artistas & Flashes'} →
          </a>
        </div>

        <p style="font-size: 13px; color: #9ca3af; text-align: center;">
          ¿Tienes preguntas? Nuestro equipo de soporte está disponible las 24/7 en <a href="mailto:soporte@tattoohub.art" style="color: #f43f5e;">soporte@tattoohub.art</a>.
        </p>
      </div>

      <div class="footer">
        <p>
          <strong>Tattoo Hub Inc.</strong> • Calle 50, PH Plaza Global, Piso 12, Ciudad de Panamá, República de Panamá<br/>
          Has recibido este correo porque te has registrado en Tattoo Hub.<br/>
          Para gestionar tus preferencias o soporte contáctanos en <a href="mailto:privacy@tattoohub.art">privacy@tattoohub.art</a>.<br/>
          © 2026 Tattoo Hub Inc. Todos los derechos reservados. Cumplimiento legal CAN-SPAM.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * 2. Customer Inquiry Email (Forwarding message to artist)
 */
export function renderMailTemplate(text: string, img: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Contacto de Cliente - Tattoo Hub</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="badge">⚡ TATTOO HUB</div>
        <h1>Nueva Consulta de Cliente</h1>
      </div>
      <div class="content">
        <p>Hola, un cliente ha enviado una consulta directa a través de tu perfil en <strong>Tattoo Hub</strong>:</p>
        
        <div class="highlight-card">
          ${escapeHtml(text)}
        </div>

        ${
          img
            ? `
        <div style="text-align: center; margin: 24px 0; background: #191b24; padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">
          <p style="margin-top: 0; font-size: 13px; font-weight: bold; color: #cbd5e1;">Referencia visual adjunta por el cliente:</p>
          <img src="${img}" alt="Referencia de tatuaje" style="max-width: 100%; max-height: 400px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);" />
        </div>`
            : ''
        }

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://tattoo-staging-ourpresent.vercel.app/chat" class="btn-primary">
            Responder en el Chat de Tattoo Hub →
          </a>
        </div>
      </div>
      <div class="footer">
        <p>
          <strong>Tattoo Hub Inc.</strong> • Calle 50, PH Plaza Global, Piso 12, Ciudad de Panamá, República de Panamá<br/>
          Has recibido este correo transaccional porque un cliente contactó a tu perfil profesional verificado.<br/>
          Para gestionar tus alertas o suspender tu visibilidad pública, accede a <a href="https://tattoo-staging-ourpresent.vercel.app">Mi Panel</a> o contacta a <a href="mailto:privacy@tattoohub.art">privacy@tattoohub.art</a>.<br/>
          © 2026 Tattoo Hub Inc. Todos los derechos reservados. Cumplimiento legal CAN-SPAM.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * 3. Appointment Confirmation Receipt
 */
export function renderAppointmentReceiptTemplate(data: {
  clientName: string;
  artistName: string;
  studioName: string;
  date: string;
  time: string;
  deposit: string;
  address: string;
}): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirmación de Cita - Tattoo Hub</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="badge">RESERVA CONFIRMADA</div>
        <h1>¡Tu Cita está Agendada!</h1>
      </div>
      <div class="content">
        <p>Hola <strong>${escapeHtml(data.clientName)}</strong>,</p>
        <p>Tu sesión de tatuaje ha sido confirmada por <strong>${escapeHtml(data.artistName)}</strong>.</p>

        <div class="highlight-card" style="border-left-color: #10b981;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #9ca3af;">Estudio:</td>
              <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #ffffff;">${escapeHtml(data.studioName)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #9ca3af;">Fecha & Hora:</td>
              <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #ffffff;">${escapeHtml(data.date)} a las ${escapeHtml(data.time)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #9ca3af;">Dirección:</td>
              <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #ffffff;">${escapeHtml(data.address)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #9ca3af;">Seña Pagada:</td>
              <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #10b981;">${escapeHtml(data.deposit)}</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 13px; color: #9ca3af;">
          <strong>Recomendaciones previas:</strong> Descansa bien la noche anterior, mantente hidratado, come antes de la cita y evita el consumo de alcohol las 24 horas previas a la sesión.
        </p>

        <div style="text-align: center; margin: 25px 0;">
          <a href="https://tattoo-staging-ourpresent.vercel.app/client-dashboard?tab=seguimiento" class="btn-primary">
            Ver Cita en Mi Panel →
          </a>
        </div>
      </div>
      <div class="footer">
        <p>
          <strong>Tattoo Hub Inc.</strong> • Calle 50, PH Plaza Global, Piso 12, Ciudad de Panamá, República de Panamá<br/>
          Tu sesión está asegurada por nuestra política de protección al cliente.<br/>
          Para dudas o modificaciones escribe a <a href="mailto:privacy@tattoohub.art">privacy@tattoohub.art</a>.<br/>
          © 2026 Tattoo Hub Inc. Todos los derechos reservados. Cumplimiento legal CAN-SPAM.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * 4. Referral Invitation Email
 */
export function renderReferralInvitationTemplate(
  inviterName: string,
  inviteUrl: string,
  code: string
): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invitación Exclusiva - Tattoo Hub</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="badge">⚡ TATTOO HUB</div>
        <h1>¡Tienes un Beneficio Exclusivo!</h1>
      </div>
      <div class="content">
        <p>Hola,</p>
        <p>Tu amigo <strong>${escapeHtml(inviterName)}</strong> te ha invitado a unirte a <strong>Tattoo Hub</strong>, la comunidad premier de arte corporal y tatuajes de autor.</p>

        <div class="highlight-card" style="border-left-color: #eab308; text-align: center;">
          <p style="margin: 0; font-size: 13px; font-weight: bold; color: #eab308; text-transform: uppercase;">Tu Código de Recompensa</p>
          <p style="margin: 8px 0; font-size: 24px; font-weight: 900; font-family: monospace; letter-spacing: 2px; color: #ffffff;">${escapeHtml(code)}</p>
          <p style="margin: 0; font-size: 13px; color: #cbd5e1;">Obtén 5% de descuento en tu primer flash o seña de tatuaje.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteUrl}" class="btn-primary">
            Reclamar Beneficio & Explorar →
          </a>
        </div>
      </div>
      <div class="footer">
        <p>
          <strong>Tattoo Hub Inc.</strong> • Calle 50, PH Plaza Global, Piso 12, Ciudad de Panamá, República de Panamá<br/>
          Has recibido esta invitación de parte de un usuario de Tattoo Hub.<br/>
          Si no deseas recibir más invitaciones, infórmanos en <a href="mailto:privacy@tattoohub.art">privacy@tattoohub.art</a>.<br/>
          © 2026 Tattoo Hub Inc. Todos los derechos reservados. Cumplimiento legal CAN-SPAM.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
