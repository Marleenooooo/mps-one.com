/**
 * Pillar-scoped localStorage helpers.
 * Writes to both namespaced and legacy keys to maintain backward compatibility.
 * Reads prefer namespaced, then fall back to legacy.
 */
export function currentPillar(): string {
  try {
    const el = document.documentElement;
    const p = el.getAttribute('data-pillar');
    if (p) return p;
    const path = window.location?.pathname || '/';
    if (path.startsWith('/procurement')) return 'procurement';
    if (path.startsWith('/comms') || path.startsWith('/people') || path.startsWith('/admin/people')) return 'social';
    return 'other';
  } catch { return 'other'; }
}

function nsKey(key: string): string {
  const pillar = currentPillar();
  return `${pillar}:${key}`;
}

export function getItem(key: string): string | null {
  try {
    const namespaced = localStorage.getItem(nsKey(key));
    if (namespaced !== null && namespaced !== undefined) return namespaced;
    return localStorage.getItem(key);
  } catch { return null; }
}

export function setItem(key: string, value: string): void {
  try {
    localStorage.setItem(nsKey(key), value);
    // Dual-write for backward compatibility
    localStorage.setItem(key, value);
  } catch {}
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(nsKey(key));
    localStorage.removeItem(key);
  } catch {}
}

