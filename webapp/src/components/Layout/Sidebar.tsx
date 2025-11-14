import React from 'react';
import { NavLink } from 'react-router-dom';
import { useI18n } from '../I18nProvider';
import * as pillarStorage from '../../services/pillarStorage';

type Role = 'Admin' | 'PIC Operational' | 'PIC Procurement' | 'PIC Finance' | null;
type UserType = 'client' | 'supplier' | null;

function getNavItems(role: Role, userType: UserType) {
  const supplier = [
    { to: '/supplier/admin', key: 'nav.admin_dashboard' },
    { to: '/supplier/clients', key: 'nav.clients' },
    // Supplier mode: hide client-only procurement items (workflow, PR list, PO preview)
    { to: '/procurement/quote-builder', key: 'nav.quote_builder' },
    { to: '/supply/order-tracker', key: 'nav.order_tracker' },
    { to: '/inventory/delivery-notes', key: 'nav.delivery_notes' },
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
    { to: '/inventory/delivery-notes', key: 'nav.delivery_notes' },
    { to: '/docs', key: 'nav.docs' },
    { to: '/comms', key: 'nav.comms' },
    { to: '/help', key: 'nav.help' },
  ];
  // Build menus by user type
  if (role === 'Admin') {
    if (userType === 'supplier') {
      const supplierAdmin = [...supplier];
      supplierAdmin.splice(1, 0, { to: '/admin/invitations', key: 'nav.invitations' });
      supplierAdmin.splice(2, 0, { to: '/admin/people', key: 'nav.people' });
      supplierAdmin.splice(3, 0, { to: '/admin/approval-workflows', key: 'nav.approval_workflows' });
      supplierAdmin.splice(4, 0, { to: '/admin/departmental-budgets', key: 'nav.departmental_budgets' });
      supplierAdmin.splice(5, 0, { to: '/admin/supplier-onboarding', key: 'nav.supplier_onboarding' });
      supplierAdmin.splice(6, 0, { to: '/admin/contracts', key: 'nav.contracts' });
      supplierAdmin.splice(7, 0, { to: '/admin/invoice-matching', key: 'nav.invoice_matching' });
      supplierAdmin.splice(8, 0, { to: '/admin/payments', key: 'nav.payments' });
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
  const currentModule = (typeof document !== 'undefined' ? (document.documentElement.getAttribute('data-module') as ('procurement' | 'finance' | 'inventory' | 'reports' | null)) : null) || 'procurement';
  function isInContext(path: string): boolean {
    if (path.startsWith('/help') || path.startsWith('/docs')) return true;
    switch (currentModule) {
      case 'inventory':
        return path.startsWith('/inventory/') || path.startsWith('/supply/order-tracker');
      case 'finance':
      case 'reports':
        return path.startsWith('/supplier/reporting');
      case 'procurement':
      default:
        return path.startsWith('/procurement/') || path.startsWith('/client') || path.startsWith('/supplier');
    }
  }
  const canBuildQuote = (() => {
    try {
      if (userType !== 'supplier') return false;
      const supplierId = localStorage.getItem('mpsone_user_id');
      if (!supplierId) return false;
      const map = JSON.parse(pillarStorage.getItem('mpsone_pr_sent') || '{}');
      const prIds = Object.keys(map || {});
      for (const prId of prIds) {
        const list = Array.isArray(map[prId]) ? map[prId] : [];
        if (list.some((x: any) => String(x.supplierId) === String(supplierId))) return true;
      }
      return false;
    } catch { return false; }
  })();
  return (
    <aside className="sidebar" role="navigation" aria-label="Primary">
      <div className="pad-16 border-b">
        <div style={{ fontWeight: 700 }}>MPSOne</div>
        <div className="text-secondary" style={{ fontSize: 12 }}>Procurement Suite</div>
      </div>
      <nav className="pad-8 stack-8">
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/client' || item.to === '/supplier/admin'}
            className={({ isActive }) => {
              const base = `btn ghost` + (isActive ? ' active' : '');
              if (item.to === '/procurement/quote-builder' && !canBuildQuote) return base + ' disabled';
              const contextual = isInContext(item.to) ? '' : ' out-of-context';
              return base + contextual;
            }}
            aria-label={t(item.key)}
            aria-disabled={item.to === '/procurement/quote-builder' && !canBuildQuote ? true : undefined}
            title={item.to === '/procurement/quote-builder' && !canBuildQuote ? (t('gating.quote_builder_disabled') || 'Approve PRs and send to suppliers to build quotes') : undefined}
          >
            {t(item.key)}
          </NavLink>
        ))}
      </nav>
      <div className="pad-16 text-secondary" style={{ marginTop: 'auto', fontSize: 12 }}>
        © {new Date().getFullYear()} MPSOne
      </div>
    </aside>
  );
}
