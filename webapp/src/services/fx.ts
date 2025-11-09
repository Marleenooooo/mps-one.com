type Rates = Record<string, number>;

const LS_KEY_PREFIX = 'mpsone_fx_';
const TTL_MS = 24 * 60 * 60 * 1000; // 24h

export async function getRates(base: string, symbols: string[] = []): Promise<Rates> {
  const key = `${LS_KEY_PREFIX}${base}`;
  try {
    const cachedRaw = localStorage.getItem(key);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw) as { data: Rates; ts: number };
      if (Date.now() - cached.ts < TTL_MS) return cached.data;
    }
  } catch {}

  const url = new URL('https://api.exchangerate.host/latest');
  url.searchParams.set('base', base);
  if (symbols.length) url.searchParams.set('symbols', symbols.join(','));
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('fx failed');
    const j = await res.json();
    const data: Rates = j?.rates || {};
    try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch {}
    return data;
  } catch {
    return {};
  }
}

export function convert(amount: number, from: string, to: string, rates: Rates): number {
  if (from === to) return amount;
  const baseRate = rates[from] || 1;
  const targetRate = rates[to] || 1;
  // Normalize via base currency map
  return (amount / baseRate) * targetRate;
}

