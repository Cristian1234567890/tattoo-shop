export function renderMailTemplate(text: string, img: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Contacto de Cliente - TooTienda</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f4f7;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #333333;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .header {
      background: linear-gradient(135deg, #1f1f1f, #3a3a3a);
      color: #ffffff;
      padding: 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
      letter-spacing: 0.5px;
    }
    .content {
      padding: 28px 24px;
    }
    .message-box {
      background: #f9f9fb;
      border-left: 4px solid #e11d48;
      padding: 16px;
      border-radius: 4px;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 24px;
      white-space: pre-wrap;
    }
    .image-preview {
      text-align: center;
      margin-top: 20px;
    }
    .image-preview img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }
    .footer {
      background: #fafafa;
      padding: 16px;
      text-align: center;
      font-size: 12px;
      color: #888888;
      border-top: 1px solid #eeeeee;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Un cliente te quiere contactar</h1>
    </div>
    <div class="content">
      <p>Hola, has recibido una nueva solicitud de cotización o diseño a través de <strong>TooTienda</strong>:</p>
      <div class="message-box">
        ${escapeHtml(text)}
      </div>
      ${
        img
          ? `
      <div class="image-preview">
        <p><strong>Diseño de referencia adjunto:</strong></p>
        <img src="${img}" alt="Referencia de tatuaje" />
      </div>`
          : ''
      }
    </div>
    <div class="footer">
      <p>TooTienda - Plataforma para artistas y amantes del tatuaje</p>
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
