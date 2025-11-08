import React from 'react';
import { NavLink } from 'react-router-dom';
import { useI18n } from '../I18nProvider';

const items = [
  { to: '/admin', key: 'nav.admin_dashboard' },
  // Point Client Dashboard to root so it highlights when on home
  { to: '/', key: 'nav.client_dashboard' },
  { to: '/onboarding', key: 'nav.onboarding' },
  { to: '/procurement/quote-builder', key: 'nav.quote_builder' },
  { to: '/supply/order-tracker', key: 'nav.order_tracker' },
  { to: '/docs', key: 'nav.docs' },
  { to: '/comms', key: 'nav.comms' },
  { to: '/reporting', key: 'nav.reporting' },
];

export function Sidebar() {
  const { t } = useI18n();
  return (
    <aside className="sidebar" role="navigation" aria-label="Primary">
      <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontWeight: 700 }}>MPSOne</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Procurement Suite</div>
      </div>
      <nav>
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `btn ghost` + (isActive ? ' active' : '')}
            style={{ display: 'block', margin: 8 }}
          >
            {t(item.key)}
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: 16, marginTop: 'auto', fontSize: 12, color: 'var(--text-secondary)' }}>
        © {new Date().getFullYear()} MPSOne
      </div>
    </aside>
  );
}