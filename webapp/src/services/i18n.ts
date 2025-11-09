export type Language = 'en' | 'id';

const LS_KEY = 'mpsone_lang';

export function getPreferredLanguage(geoCountry?: string): Language {
  const saved = localStorage.getItem(LS_KEY) as Language | null;
  if (saved === 'en' || saved === 'id') return saved;

  // Prefer Indonesia by IP country if available
  if (geoCountry && geoCountry.toUpperCase() === 'ID') return 'id';

  const nav = (navigator.language || 'en').toLowerCase();
  return nav.startsWith('id') ? 'id' : 'en';
}

export function setPreferredLanguage(lang: Language) {
  localStorage.setItem(LS_KEY, lang);
}

export function toggleLanguage(current: Language): Language {
  const next = current === 'id' ? 'en' : 'id';
  setPreferredLanguage(next);
  return next;
}

