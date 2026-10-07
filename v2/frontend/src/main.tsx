import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App';
import './styles/globals.css';

Sentry.init({
  dsn: (import.meta as any).env?.VITE_SENTRY_DSN || 'https://placeholder@o0.ingest.sentry.io/0',
  integrations: [
    Sentry.browserTracingIntegration(),
  ],
  tracesSampleRate: 1.0,
  environment: (import.meta as any).env?.MODE || 'staging',
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
