export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Tattoo Hub Ops — Swagger UI & API Explorer</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23f59e0b'><path d='M12 2L2 7l10 5 10-5-10-5z'/></svg>" />
  <style>
    body {
      margin: 0;
      background: #090a0f;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .topbar {
      background: #12141c !important;
      border-bottom: 1px solid #1e2230;
      padding: 10px 0;
    }
    .swagger-ui {
      filter: invert(88%) hue-rotate(180deg);
    }
    .swagger-ui .info h2, .swagger-ui .info p, .swagger-ui .opblock-tag {
      color: #000 !important;
    }
    .banner {
      background: #12141c;
      border-bottom: 1px solid #1e2230;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .banner h1 {
      margin: 0;
      font-size: 18px;
      color: #f59e0b;
      font-family: monospace;
    }
    .banner a {
      color: #8b5cf6;
      text-decoration: none;
      font-size: 13px;
      margin-left: 16px;
      border: 1px solid #1e2230;
      padding: 6px 12px;
      border-radius: 8px;
      background: #090a0f;
    }
    .banner a:hover {
      background: #1e2230;
    }
  </style>
</head>
<body>
  <div class="banner">
    <h1>TATTOO HUB OPS • SWAGGER API & POSTMAN DOCS</h1>
    <div>
      <a href="/api/openapi.json" target="_blank">📥 Descargar openapi.json para Postman</a>
      <a href="/">🔙 Volver al Dashboard</a>
    </div>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: "/openapi.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>`;

  return res.status(200).send(html);
}
