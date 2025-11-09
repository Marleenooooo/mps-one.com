type GeoInfo = { country?: string; city?: string; timezone?: string };

const LS_KEY = 'mpsone_geo';
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function getGeoInfo(): Promise<GeoInfo> {
  try {
    const cachedRaw = localStorage.getItem(LS_KEY);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw) as { data: GeoInfo; ts: number };
      if (Date.now() - cached.ts < TTL_MS) {
        return cached.data;
      }
    }
  } catch {}

  // Graceful timeout and fallback
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 2500);
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error('geo failed');
    const j = await res.json();
    const data: GeoInfo = {
      country: j?.country || j?.country_code,
      city: j?.city,
      timezone: j?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ data, ts: Date.now() }));
    } catch {}
    return data;
  } catch {
    clearTimeout(t);
    // Fallback to local timezone only
    return { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone };
  }
}

