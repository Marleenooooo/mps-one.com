export const APP_URL = import.meta.env.VITE_APP_URL as string | undefined;
export const IS_PROD = typeof APP_URL === 'string' && APP_URL.startsWith('https://');
export const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? '/api';

// Example: place for future environment-driven config (APIs, email, logistics)
export const APP_CONFIG = {
  appUrl: APP_URL ?? 'http://localhost:5173',
  apiBase: API_BASE,
  // apiBase: import.meta.env.VITE_API_BASE ?? 'https://api.mps-one.com',
  // emailService: import.meta.env.VITE_EMAIL_SERVICE ?? 'gmail',
};