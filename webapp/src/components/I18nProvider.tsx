import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Language = 'en' | 'id';

type I18nContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    // General
    'general.home': 'Home',

    // Navigation
    'nav.admin_dashboard': 'Admin Dashboard',
    'nav.client_dashboard': 'Client Dashboard',
    'nav.onboarding': 'Corporate Onboarding',
    'nav.quote_builder': 'Quote Builder',
    'nav.order_tracker': 'Order Tracker',
    'nav.docs': 'Document Manager',
    'nav.comms': 'Communication Hub',
    'nav.reporting': 'Reporting',

    // Topbar
    'topbar.light': 'Light',
    'topbar.dark': 'Dark',
    'topbar.neon': 'Neon',
    'topbar.mode': 'Mode',
    'topbar.theme': 'Theme',
    'topbar.quick_search': 'Search PRs, POs, quotes...',
    'topbar.notifications': 'Notifications',
    'topbar.unread': 'unread',
    'topbar.language': 'Language',
    'topbar.lang.en': 'English',
    'topbar.lang.id': 'Bahasa Indonesia',
  },
  id: {
    // General
    'general.home': 'Beranda',

    // Navigation
    'nav.admin_dashboard': 'Dasbor Admin',
    'nav.client_dashboard': 'Dasbor Klien',
    'nav.onboarding': 'Onboarding Perusahaan',
    'nav.quote_builder': 'Pembuat Penawaran',
    'nav.order_tracker': 'Pelacak Pesanan',
    'nav.docs': 'Manajer Dokumen',
    'nav.comms': 'Pusat Komunikasi',
    'nav.reporting': 'Laporan',

    // Topbar
    'topbar.light': 'Terang',
    'topbar.dark': 'Gelap',
    'topbar.neon': 'Neon',
    'topbar.mode': 'Mode',
    'topbar.theme': 'Tema',
    'topbar.quick_search': 'Cari PR, PO, penawaran...',
    'topbar.notifications': 'Notifikasi',
    'topbar.unread': 'belum dibaca',
    'topbar.language': 'Bahasa',
    'topbar.lang.en': 'English',
    'topbar.lang.id': 'Bahasa Indonesia',
  },
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function detectDefaultLanguage(): Language {
  const stored = localStorage.getItem('lang') as Language | null;
  if (stored === 'en' || stored === 'id') return stored;
  const nav = navigator?.language?.toLowerCase() ?? 'en';
  if (nav.startsWith('id')) return 'id';
  return 'en';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(detectDefaultLanguage());

  useEffect(() => {
    localStorage.setItem('lang', language);
  }, [language]);

  const t = useMemo(() => {
    return (key: string) => {
      const table = translations[language];
      return table[key] ?? translations.en[key] ?? key;
    };
  }, [language]);

  const value: I18nContextValue = { language, setLanguage, t };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}