import React from 'react';
import { NavLink } from 'react-router-dom';
import { useI18n } from '../I18nProvider';

type Role = 'Admin' | 'PIC Operational' | 'PIC Procurement' | 'PIC Finance' | null;

function getNavItems(role: Role) {
  const supplier = [
    { to: '/supplier/admin', key: 'nav.admin_dashboard' },
    { to: '/procurement/pr', key: 'nav.purchase_requests' },
    { to: '/procurement/po/preview', key: 'nav.po_preview' },
    { to: '/procurement/quote-builder', key: 'nav.quote_builder' },
    { to: '/supply/order-tracker', key: 'nav.order_tracker' },
    { to: '/docs', key: 'nav.docs' },
    { to: '/comms', key: 'nav.comms' },
    { to: '/supplier/email', key: 'nav.email_dashboard' },
    { to: '/supplier/reporting', key: 'nav.reporting' },
  ];
  const client = [
    { to: '/client', key: 'nav.client_dashboard' },
    { to: '/client/onboarding', key: 'nav.onboarding' },
    { to: '/procurement/pr', key: 'nav.purchase_requests' },
    { to: '/procurement/po/preview', key: 'nav.po_preview' },
    { to: '/supply/order-tracker', key: 'nav.order_tracker' },
    { to: '/docs', key: 'nav.docs' },
    { to: '/comms', key: 'nav.comms' },
  ];
  return role === 'Admin' ? supplier : client;
}

export function Sidebar() {
  const { t } = useI18n();
  const role = (localStorage.getItem('mpsone_role') as Role) ?? null;
  const items = getNavItems(role);
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
            end={item.to === '/client' || item.to === '/supplier/admin'}
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
