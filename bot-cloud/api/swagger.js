import { authenticateRequest } from './_lib/security.js';

export default async function handler(req, res) {
  // Proteger acceso: NO exponer Swagger sin autenticación
  const auth = await authenticateRequest(req);
  if (auth.error) {
    // Si la petición proviene de un navegador, redirigir al login
    const acceptHeader = req.headers['accept'] || '';
    if (acceptHeader.includes('text/html')) {
      res.writeHead(302, { Location: '/?unauthorized=true' });
      return res.end();
    }
    return res.status(401).json({ error: 'Acceso no autorizado: Debe iniciar sesión para ver Swagger UI' });
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Tattoo Hub Ops — Swagger API & Agentes</title>
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
      display: none !important;
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
      font-size: 16px;
      color: #f59e0b;
      font-family: monospace;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .banner .badge {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 6px;
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .banner a {
      color: #a78bfa;
      text-decoration: none;
      font-size: 13px;
      margin-left: 12px;
      border: 1px solid #1e2230;
      padding: 6px 12px;
      border-radius: 8px;
      background: #090a0f;
      transition: all 0.2s;
    }
    .banner a:hover {
      background: #1e2230;
      color: #fff;
    }
  </style>
</head>
<body>
  <div class="banner">
    <h1>
      <span>TATTOO HUB OPS • SWAGGER API EXPLORER</span>
      <span class="badge">Sesión Autenticada (${auth.user.username} - ${auth.user.role})</span>
    </h1>
    <div>
      <a href="/" target="_self">🔙 Volver al Dashboard</a>
    </div>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');
      const token = tokenFromUrl || localStorage.getItem('tattoo_ops_auth');
      const apiKey = localStorage.getItem('tattoo_ops_apikey');
      const username = localStorage.getItem('tattoo_ops_username');

      SwaggerUIBundle({
        url: "/api/openapi" + (token ? "?token=" + encodeURIComponent(token) : ""),
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout",
        requestInterceptor: (req) => {
          if (token && !req.headers['Authorization']) {
            req.headers['Authorization'] = 'Bearer ' + token;
          }
          if (apiKey && !req.headers['X-API-Key']) {
            req.headers['X-API-Key'] = apiKey;
          }
          if (username && !req.headers['X-Username']) {
            req.headers['X-Username'] = username;
          }
          return req;
        }
      });
    };
  </script>
</body>
</html>`;

  return res.status(200).send(html);
}
