import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { initMonitoring, trackEvent } from './services/monitoring';
import App from './App';
import { I18nProvider } from './components/I18nProvider';

// Block direct deep-link access in production, redirect to public site
try {
  const BLOCK_DIRECT = (import.meta as any).env?.VITE_BLOCK_DIRECT_URL === '1' || (import.meta as any).env?.VITE_BLOCK_DIRECT_URL === 'true';
  if (BLOCK_DIRECT) {
    const ref = document.referrer || '';
    const sameDomain = !!ref && ref.startsWith(window.location.origin);
    const path = window.location.pathname || '/';
    const whitelisted = path === '/' || path.startsWith('/help') || path.startsWith('/docs');
    if (!sameDomain && !whitelisted) {
      const target = (import.meta as any).env?.VITE_APP_URL || 'https://mps-one.com/';
      window.location.replace(target);
    }
  }
} catch {}

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
