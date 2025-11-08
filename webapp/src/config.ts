export const APP_URL = import.meta.env.VITE_APP_URL as string | undefined;
export const IS_PROD = typeof APP_URL === 'string' && APP_URL.startsWith('https://');

// Example: place for future environment-driven config (APIs, email, logistics)
export const APP_CONFIG = {
  appUrl: APP_URL ?? 'http://localhost:5173',
  // apiBase: import.meta.env.VITE_API_BASE ?? 'https://api.mps-one.com',
  // emailService: import.meta.env.VITE_EMAIL_SERVICE ?? 'gmail',
};