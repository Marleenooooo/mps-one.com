import type { UserMode } from '../contracts/identity';

const KEY = 'mpsone_user_type';

export function getActiveMode(): UserMode {
  const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY) : null;
  if (raw === 'supplier') return 'Supplier';
  return 'Client';
}

export function setActiveMode(mode: UserMode): void {
  if (typeof localStorage === 'undefined') return;
  const val = mode === 'Supplier' ? 'supplier' : 'client';
  localStorage.setItem(KEY, val);
}

