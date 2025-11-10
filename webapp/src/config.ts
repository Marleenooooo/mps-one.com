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

// Known departments (client-side only, used for suggestions)
export const DEPARTMENTS: string[] = [
  'Mining Ops',
  'Maintenance',
  'Logistics',
  'Procurement',
  'Finance',
  'Operations',
  'HR',
  'IT',
];

// Virtualization overscan defaults
export const OVERSCAN_DEFAULTS = {
  documents: (typeof window !== 'undefined' && window.innerWidth < 768) ? 4 : 3,
  prList: 8,
};

// Indonesian department labels (for localized suggestions)
export const DEPARTMENTS_ID: string[] = [
  'Operasi Tambang',
  'Pemeliharaan',
  'Logistik',
  'Pengadaan',
  'Keuangan',
  'Operasional',
  'SDM',
  'TI',
];

export type OverscanPrefs = Partial<typeof OVERSCAN_DEFAULTS>;
const OVERSCAN_KEY = 'mpsone_pref_overscan';
const PERF_KEY = 'mpsone_pref_perf';

// High Performance mode: boosts overscan and increases debounce to reduce jank
export function getHighPerformance(): boolean {
  try {
    const raw = localStorage.getItem(PERF_KEY);
    return raw === '1';
  } catch {
    return false;
  }
}

export function setHighPerformance(on: boolean): boolean {
  try {
    localStorage.setItem(PERF_KEY, on ? '1' : '0');
    return on;
  } catch {
    return on;
  }
}

// Compute effective overscan with High Performance boost
export function computeOverscan(area: keyof typeof OVERSCAN_DEFAULTS): number {
  const prefs = getOverscanPrefs();
  const base = (prefs[area] ?? OVERSCAN_DEFAULTS[area]) as number;
  if (!getHighPerformance()) return base;
  const boost = area === 'prList' ? Math.max(base, 16) : Math.max(base, 6);
  return boost;
}

// Debounce duration for heavy UI updates
export function getDebounceMs(): number {
  return getHighPerformance() ? 260 : 140;
}

export function getOverscanPrefs(): OverscanPrefs {
  try {
    const raw = localStorage.getItem(OVERSCAN_KEY);
    const parsed = raw ? JSON.parse(raw) as OverscanPrefs : {};
    return parsed;
  } catch {
    return {};
  }
}

export function setOverscanPrefs(patch: OverscanPrefs): OverscanPrefs {
  try {
    const current = getOverscanPrefs();
    const next = { ...current, ...patch };
    localStorage.setItem(OVERSCAN_KEY, JSON.stringify(next));
    return next;
  } catch {
    return patch;
  }
}
