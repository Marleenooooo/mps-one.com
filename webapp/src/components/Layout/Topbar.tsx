import React from 'react';
import { useTheme } from '../ThemeProvider';
import { useI18n } from '../I18nProvider';

export function Topbar({ children }: { children?: React.ReactNode }) {
  const { theme, toggle } = useTheme();
  const { language, setLanguage, t } = useI18n();
  return (
    <header className="topbar" role="banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {children}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <QuickSearch />
        <NotificationBell count={3} />
        <select aria-label={t('topbar.language')} className="select" value={language} onChange={e => setLanguage(e.target.value as any)}>
          <option value="en">{t('topbar.lang.en')}</option>
          <option value="id">{t('topbar.lang.id')}</option>
        </select>
        <button className="btn" onClick={toggle} aria-label="Toggle dark/light">
          {theme === 'dark' ? t('topbar.dark') : t('topbar.light')}
        </button>
      </div>
    </header>
  );
}

export function Breadcrumbs({ items }: { items: string[] }) {
  const { t } = useI18n();
  function translateItem(item: string) {
    // If item looks like a translation key (contains '.' and no spaces), translate it.
    if (item.includes('.') && !item.includes(' ')) {
      const translated = t(item);
      // Guard: if translation returns the key itself, fallback to the original item
      return translated !== item ? translated : item;
    }
    // Otherwise, treat the item as an already-translated label
    return item;
  }
  return (
    <nav aria-label="Breadcrumb" style={{ color: 'var(--text-secondary)' }}>
      {items.map((item, idx) => (
        <span key={item}>
          <span aria-current={idx === items.length - 1 ? 'page' : undefined}>{translateItem(item)}</span>
          {idx < items.length - 1 && <span style={{ margin: '0 8px' }}>/</span>}
        </span>
      ))}
    </nav>
  );
}

function QuickSearch() {
  const { t } = useI18n();
  return (
    <div className="tooltip" data-tip="Quick search (Ctrl+/)">
      <input className="input" placeholder={t('topbar.quick_search')} aria-label="Quick search" />
    </div>
  );
}

function NotificationBell({ count }: { count: number }) {
  const { t } = useI18n();
  return (
    <button className="btn ghost tooltip" data-tip={t('topbar.notifications')} aria-label={t('topbar.notifications')}>
      🔔
      {count > 0 && (
        <span aria-label={`${count} ${t('topbar.unread')}`} style={{
          background: 'var(--accent)', color: '#fff', borderRadius: 999, fontSize: 12,
          padding: '2px 6px', marginLeft: 6
        }}>{count}</span>
      )}
    </button>
  );
}
