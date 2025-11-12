import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { initMonitoring, trackEvent } from './services/monitoring';
import App from './App';
import { I18nProvider } from './components/I18nProvider';

// Initialize lightweight monitoring before app mounts
initMonitoring();
try {
  // One-time boot event for dev verification of analytics collector
  trackEvent('app_boot', { version: (import.meta as any).env?.APP_VERSION || 'dev' });
} catch {}
const rootElement = document.getElementById('app-root')!;
createRoot(rootElement).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>
);
