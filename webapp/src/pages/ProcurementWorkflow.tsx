import React from 'react';
import { Topbar, Breadcrumbs } from '../components/Layout/Topbar';

export default function ProcurementWorkflow() {
  const userType = (typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_user_type') : null);
  const steps = [
    {
      key: 'PR',
      title: 'Purchase Request (PR)',
      desc: 'Initiate PRs from departments. Finance/Admin approve before supplier visibility.',
      link: { href: '/procurement/pr/new', label: 'Create PR' },
      module: 'procurement',
    },
    {
      key: 'Quote',
      title: 'Quote (Supplier-owned)',
      desc: 'Suppliers prepare quotes for approved PRs. Clients review/approve; clients do not create quotes.',
      link: { href: '/procurement/quote-builder', label: 'Open Quote Builder' },
      module: 'procurement',
    },
    {
      key: 'PO',
      title: 'Purchase Order (PO)',
      desc: 'Convert accepted quotes to PO. Link to department budget and schedule.',
      link: { href: '/procurement/po/preview', label: 'Preview PO' },
      module: 'procurement',
    },
    {
      key: 'Delivery',
      title: 'Delivery & Confirmation',
      desc: 'Multi-shipment per PO; confirm quantities and record corrections where needed.',
      link: { href: '/supply/order-tracker', label: 'Open Order Tracker' },
      module: 'inventory',
    },
    {
      key: 'Invoice',
      title: 'Invoice & Payment',
      desc: 'Invoice based on confirmed deliveries. Payments follow 30-day calendar status.',
      link: { href: '/supplier/reporting', label: 'Go to Reporting' },
      module: 'finance',
    },
  ];

  return (
    <div className="main" data-module="procurement">
      <Topbar>
        <Breadcrumbs items={["Procurement", "Workflow"]} />
      </Topbar>

      <div className="page-header procurement" role="region" aria-label="Procurement Workflow Header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ margin: 0 }}>Procurement Workflow</h1>
          <div className="progress-bar" style={{ width: 220 }} aria-label="Workflow readiness">
            <div className="value" style={{ width: '60%' }}></div>
          </div>
        </div>
        <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
          PR → Quote → PO → Processing → Shipped → Delivered → Invoiced → Paid
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {steps.map((s, idx) => (
          <section key={s.key} className="card" aria-labelledby={`wf-${s.key}`}
                   style={{ padding: 16, borderImage: 'linear-gradient(90deg, var(--module-color), var(--module-gradient-end)) 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="status-badge" style={{ background: 'transparent', border: '1px solid var(--border)' }}>{idx + 1}</span>
              <h2 id={`wf-${s.key}`} style={{ margin: 0 }}>{s.title}</h2>
            </div>
            <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>{s.desc}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {(s.key === 'Quote' && userType !== 'supplier') ? (
                <span className="btn outline" aria-label="Await supplier quotes">Await supplier quotes</span>
              ) : (
                <a className="btn" href={s.link.href} aria-label={s.link.label}>{s.link.label}</a>
              )}
              <button className="btn outline tooltip" data-tip="View docs" onClick={() => {
                const file = 'docs/WORKFLOWS.md';
                window.location.assign(`/help/docs?file=${encodeURIComponent(file)}#${encodeURIComponent('lifecycle')}`);
              }}>Docs</button>
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
              Guards & Roles: Approved PRs required; Suppliers own quotes; PO from accepted quote; client can split PO across suppliers; delivery confirmation gates invoicing; Finance handles payments.
            </div>
          </section>
        ))}
      </div>

      <div className="card" style={{ padding: 16, marginTop: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Quick Actions</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a className="btn" href="/procurement/pr/new">New PR</a>
          {userType === 'supplier' && (<a className="btn" href="/procurement/quote-builder">Build Quote</a>)}
          <a className="btn" href="/procurement/po/preview">Generate PO</a>
          <a className="btn" href="/supply/order-tracker">Track Delivery</a>
          <a className="btn" href="/supplier/reporting">Invoice & Payments</a>
          {userType === 'client' && (<a className="btn outline" href="/client/suppliers">Manage Suppliers</a>)}
        </div>
        <p style={{ marginTop: 10, color: 'var(--text-secondary)' }}>
          Tip: Clients can send PRs to multiple suppliers and later split PO items across suppliers. Add suppliers before distributing PRs.
        </p>
      </div>
    </div>
  );
}
