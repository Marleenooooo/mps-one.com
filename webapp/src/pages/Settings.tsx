import React, { useEffect, useState } from 'react';
import { useTheme } from '../components/ThemeProvider';
import { useI18n } from '../components/I18nProvider';
import { getUserPreferences, updateUserPreferences } from '../services/preferences';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();

  const [notifyInApp, setNotifyInApp] = useState<boolean>(() => localStorage.getItem('mpsone_notify_inapp') === 'true');
  const [notifyEmail, setNotifyEmail] = useState<boolean>(() => localStorage.getItem('mpsone_notify_email') === 'true');
  const [defaultMode, setDefaultMode] = useState<'client'|'supplier'>(() => {
    const v = localStorage.getItem('mpsone_default_mode');
    return (v === 'supplier' || v === 'client') ? v : 'client';
  });

  useEffect(() => {
    localStorage.setItem('mpsone_notify_inapp', String(notifyInApp));
    updateUserPreferences({ notify_inapp: notifyInApp });
  }, [notifyInApp]);
  useEffect(() => {
    localStorage.setItem('mpsone_notify_email', String(notifyEmail));
    updateUserPreferences({ notify_email: notifyEmail });
  }, [notifyEmail]);
  useEffect(() => {
    // Persist default mode selection
    try { localStorage.setItem('mpsone_default_mode', defaultMode); } catch {}
    updateUserPreferences({ default_mode: defaultMode });
  }, [defaultMode]);

  useEffect(() => {
    // Load initial preferences from backend if available
    (async () => {
      const row = await getUserPreferences();
      if (row) {
        if (row.theme && row.theme !== theme) setTheme(row.theme);
        if (row.language && row.language !== language) setLanguage(row.language as any);
        setNotifyInApp(!!row.notify_inapp);
        setNotifyEmail(!!row.notify_email);
        if (row.default_mode === 'client' || row.default_mode === 'supplier') {
          setDefaultMode(row.default_mode);
          try { localStorage.setItem('mpsone_default_mode', row.default_mode); } catch {}
        }
        try {
          localStorage.setItem('mpsone_notify_inapp', String(!!row.notify_inapp));
          localStorage.setItem('mpsone_notify_email', String(!!row.notify_email));
        } catch {}
      }
    })();
  }, []);

  return (
    <div className="main">
      <div className="page" aria-labelledby="settings-title">
        <h1 id="settings-title" className="page-title">{t('settings.title') || 'Settings'}</h1>

        <div className="card accent-border" style={{ padding: 16 }}>
          <div style={{ display: 'grid', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{t('topbar.theme') || 'Theme'}</span>
              <select className="select" value={theme} onChange={async e => { const v = e.target.value as any; setTheme(v); await updateUserPreferences({ theme: v }); }} aria-label={t('topbar.theme') || 'Theme'}>
                <option value="light">{t('topbar.light') || 'Light'}</option>
                <option value="dark">{t('topbar.dark') || 'Dark'}</option>
                <option value="system">System</option>
              </select>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{t('topbar.language') || 'Language'}</span>
              <select className="select" value={language} onChange={async e => { const v = e.target.value as any; setLanguage(v); await updateUserPreferences({ language: v }); }} aria-label={t('topbar.language') || 'Language'}>
                <option value="en">{t('topbar.lang.en') || 'English'}</option>
                <option value="id">{t('topbar.lang.id') || 'Bahasa Indonesia'}</option>
              </select>
            </label>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{t('topbar.notifications') || 'Notifications'}</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={notifyInApp} onChange={e => setNotifyInApp(e.target.checked)} />
                <span>In‑app notifications</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={notifyEmail} onChange={e => setNotifyEmail(e.target.checked)} />
                <span>Email notifications</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <a href="/notifications" className="btn outline">{t('topbar.notifications') || 'Notifications'}</a>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{t('settings.default_mode') || 'Default Mode'}</span>
              <select className="select" value={defaultMode} onChange={e => setDefaultMode(e.target.value as 'client'|'supplier')} aria-label={t('settings.default_mode') || 'Default Mode'}>
                <option value="client">{t('mode.buying') || 'Buying'}</option>
                <option value="supplier">{t('mode.selling') || 'Selling'}</option>
              </select>
            </label>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t('settings.default_mode_desc') || 'Choose your default operating mode for sign-in and redirects'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
