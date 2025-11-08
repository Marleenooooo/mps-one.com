import React from 'react';
import { NavLink } from 'react-router-dom';

const items = [
  { to: '/admin', label: 'Admin Dashboard' },
  { to: '/client', label: 'Client Dashboard' },
  { to: '/onboarding', label: 'Corporate Onboarding' },
  { to: '/procurement/quote-builder', label: 'Quote Builder' },
  { to: '/supply/order-tracker', label: 'Order Tracker' },
  { to: '/docs', label: 'Document Manager' },
  { to: '/comms', label: 'Communication Hub' },
  { to: '/reporting', label: 'Reporting' },
];

export function Sidebar() {
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
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: 16, marginTop: 'auto', fontSize: 12, color: 'var(--text-secondary)' }}>
        © {new Date().getFullYear()} MPSOne
      </div>
    </aside>
  );
}