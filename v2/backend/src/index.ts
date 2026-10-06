import { app } from './app';
import { env } from './config/env';

const server = app.listen(env.PORT, () => {
  console.log(`[Tattoo Shop V2 API] Server running on http://localhost:${env.PORT}`);
  console.log(`[Tattoo Shop V2 API] Environment: ${env.NODE_ENV}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('[Tattoo Shop V2 API] SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('[Tattoo Shop V2 API] HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('[Tattoo Shop V2 API] SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('[Tattoo Shop V2 API] HTTP server closed');
  });
});

export { app };
export { default as currencyRoutes } from './routes/currency.routes';
export default server;
