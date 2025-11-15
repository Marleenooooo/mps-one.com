import type { Claims, UserMode } from '../contracts/identity';

const TOKEN_KEY = 'mps_token';
const CLAIMS_KEY = 'mps_claims';

export function setToken(token: string) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
}

export function setClaims(claims: Claims) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(CLAIMS_KEY, JSON.stringify(claims));
  const modeVal = claims.mode === 'Supplier' ? 'supplier' : 'client';
  localStorage.setItem('mpsone_user_type', modeVal);
  localStorage.setItem('mpsone_role', claims.role);
  localStorage.setItem('mpsone_user_id', claims.userId);
}

export function getClaims(): Claims | null {
  if (typeof localStorage === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(CLAIMS_KEY) || 'null'); } catch { return null; }
}

export function setMode(mode: UserMode) {
  if (typeof localStorage === 'undefined') return;
  const val = mode === 'Supplier' ? 'supplier' : 'client';
  localStorage.setItem('mpsone_user_type', val);
}

