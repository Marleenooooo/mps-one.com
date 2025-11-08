import React from 'react';
import { useTheme } from '../ThemeProvider';

export function Topbar({ children }: { children?: React.ReactNode }) {
  const { theme, toggle } = useTheme();
  return (
    <header className="topbar" role="banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {children}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <QuickSearch />
        <NotificationBell count={3} />
        <button className="btn" onClick={toggle} aria-label="Toggle theme">
          {theme === 'dark' ? 'Light' : 'Dark'} Mode
        </button>
      </div>
    </header>
  );
}

export function Breadcrumbs({ items }: { items: string[] }) {
  return (
    <nav aria-label="Breadcrumb" style={{ color: 'var(--text-secondary)' }}>
      {items.map((item, idx) => (
        <span key={item}>
          <span aria-current={idx === items.length - 1 ? 'page' : undefined}>{item}</span>
          {idx < items.length - 1 && <span style={{ margin: '0 8px' }}>/</span>}
        </span>
      ))}
    </nav>
  );
}

function QuickSearch() {
  return (
    <div className="tooltip" data-tip="Quick search (Ctrl+/)">
      <input className="input" placeholder="Search PRs, POs, quotes..." aria-label="Quick search" />
    </div>
  );
}

function NotificationBell({ count }: { count: number }) {
  return (
    <button className="btn ghost tooltip" data-tip="Notifications" aria-label="Notifications">
      🔔
      {count > 0 && (
        <span aria-label={`${count} unread`} style={{
          background: 'var(--accent)', color: '#fff', borderRadius: 999, fontSize: 12,
          padding: '2px 6px', marginLeft: 6
        }}>{count}</span>
      )}
    </button>
  );
}