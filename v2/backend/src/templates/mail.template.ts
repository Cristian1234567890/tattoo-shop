export function renderMailTemplate(text: string, img: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Contacto de Cliente - Tattoo Hub</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b0c10;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e5e7eb;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #12131a;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    .header {
      background: linear-gradient(135deg, #090a0f, #1e1b2e);
      color: #ffffff;
      padding: 28px 24px;
      text-align: center;
      border-bottom: 1px solid rgba(244, 63, 94, 0.3);
    }
    .header .logo {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #f43f5e;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: #ffffff;
    }
    .content {
      padding: 28px 24px;
      color: #d1d5db;
    }
    .intro-text {
      font-size: 15px;
      line-height: 1.5;
      margin-bottom: 16px;
      color: #9ca3af;
    }
    .message-box {
      background: #191b24;
      border-left: 4px solid #f43f5e;
      padding: 18px;
      border-radius: 6px;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 24px;
      color: #f3f4f6;
      white-space: pre-wrap;
    }
    .image-preview {
      text-align: center;
      margin-top: 20px;
      background: #191b24;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .image-preview p {
      margin-top: 0;
      font-size: 14px;
      color: #cbd5e1;
    }
    .image-preview img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .footer {
      background: #0d0e14;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      line-height: 1.6;
    }
    .footer strong {
      color: #94a3b8;
    }
    .footer a {
      color: #f43f5e;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">⚡ TATTOO HUB</div>
      <h1>Nueva Solicitud de Consulta</h1>
    </div>
    <div class="content">
      <p class="intro-text">Hola, un cliente ha enviado un mensaje directo solicitando información o cotización a través de tu perfil en <strong>Tattoo Hub</strong>:</p>
      <div class="message-box">
        ${escapeHtml(text)}
      </div>
      ${
        img
          ? `
      <div class="image-preview">
        <p><strong>Referencia visual adjunta:</strong></p>
        <img src="${img}" alt="Referencia de tatuaje" />
      </div>`
          : ''
      }
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
</body>
</html>`;
}

function escapeHtml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
