import React from 'react';
import { NavLink } from 'react-router-dom';
import { useI18n } from '../I18nProvider';

type Role = 'Admin' | 'PIC Operational' | 'PIC Procurement' | 'PIC Finance' | null;
type UserType = 'client' | 'supplier' | null;

function getNavItems(role: Role, userType: UserType) {
  const supplier = [
    { to: '/supplier/admin', key: 'nav.admin_dashboard' },
    { to: '/supplier/clients', key: 'nav.clients' },
    { to: '/procurement/workflow', key: 'nav.workflow' },
    { to: '/procurement/pr', key: 'nav.purchase_requests' },
    { to: '/procurement/po/preview', key: 'nav.po_preview' },
    { to: '/procurement/quote-builder', key: 'nav.quote_builder' },
    { to: '/supply/order-tracker', key: 'nav.order_tracker' },
    { to: '/docs', key: 'nav.docs' },
    { to: '/comms', key: 'nav.comms' },
    { to: '/supplier/email', key: 'nav.email_dashboard' },
    { to: '/supplier/reporting', key: 'nav.reporting' },
    { to: '/help', key: 'nav.help' },
  ];
  const client = [
    { to: '/client', key: 'nav.client_dashboard' },
    { to: '/client/onboarding', key: 'nav.onboarding' },
    { to: '/client/suppliers', key: 'nav.suppliers' },
    { to: '/procurement/workflow', key: 'nav.workflow' },
    { to: '/procurement/pr', key: 'nav.purchase_requests' },
    { to: '/procurement/po/preview', key: 'nav.po_preview' },
    { to: '/supply/order-tracker', key: 'nav.order_tracker' },
    { to: '/docs', key: 'nav.docs' },
    { to: '/comms', key: 'nav.comms' },
    { to: '/help', key: 'nav.help' },
  ];
  // Build menus by user type
  if (role === 'Admin') {
    if (userType === 'supplier') {
      const supplierAdmin = [...supplier];
      supplierAdmin.splice(1, 0, { to: '/admin/invitations', key: 'nav.invitations' });
      return supplierAdmin;
    }
    // Client Admin: full client menu, including onboarding
    return client;
  }
  // Non-admin: show respective side, but hide client onboarding
  if (userType === 'supplier') return supplier;
  return client.filter(item => item.to !== '/client/onboarding');
}

export function Sidebar() {
  const { t } = useI18n();
  const role = (localStorage.getItem('mpsone_role') as Role) ?? null;
  const userType = (localStorage.getItem('mpsone_user_type') as UserType) ?? null;
  const items = getNavItems(role, userType);
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
