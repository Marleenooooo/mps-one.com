import { useEffect, useState } from 'react';
import { apiHealth, apiPOSummary, apiInvoiceStatus } from '../services/api';
import { Topbar, Breadcrumbs } from '../components/Layout/Topbar';

export default function DBStatus() {
  const [health, setHealth] = useState<any>(null);
  const [po, setPo] = useState<any[]>([]);
  const [inv, setInv] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const h = await apiHealth();
        setHealth(h);
        const p = await apiPOSummary();
        setPo(p.rows ?? []);
        const i = await apiInvoiceStatus();
        setInv(i.rows ?? []);
      } catch (err: any) {
        setError(String(err?.message || err));
      }
    })();
  }, []);

  const healthy = !!health && !error;
  return (
    <div className="main" data-module="procurement">
      <Topbar>
        <Breadcrumbs items={["Dev", "DB Status"]} />
      </Topbar>

      <div className="page-header procurement" role="region" aria-label="DB Status Header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ margin: 0 }}>Database Connectivity</h1>
            <span className={`status-badge ${healthy ? 'success' : 'warn'}`} aria-live="polite">
              {healthy ? 'Healthy' : 'Check backend/API'}
            </span>
          </div>
          <div className="progress-bar" style={{ width: 200 }} aria-label="Data readiness">
            <div className="value" style={{ width: `${Math.min(100, (po.length ? 40 : 20) + (inv.length ? 40 : 20))}%` }}></div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 16, marginTop: 16, borderImage: 'linear-gradient(90deg, var(--module-color), var(--module-gradient-end)) 1' }}>
        {error && (
          <div role="alert" className="status-badge warn" style={{ marginBottom: 12 }}>
            Error: {error}
          </div>
        )}
        {health && (
          <div style={{ marginBottom: 12, display: 'flex', gap: 16 }}>
            <div><strong>Version:</strong> {health.version}</div>
            <div><strong>Database:</strong> {health.db}</div>
          </div>
        )}

        <h3 style={{ marginTop: 0 }}>PO Summary (v_po_item_delivery_totals)</h3>
        <table className="table" style={{ width: '100%', marginBottom: 16 }}>
          <thead>
            <tr><th>PO ID</th><th>Ordered</th><th>Confirmed</th></tr>
          </thead>
          <tbody>
            {po.map((r, idx) => (
              <tr key={idx}><td>{r.po_id}</td><td>{r.ordered_qty}</td><td>{r.confirmed_qty}</td></tr>
            ))}
            {!po.length && (<tr><td colSpan={3} style={{ color: 'var(--text-secondary)' }}>No rows</td></tr>)}
          </tbody>
        </table>

        <h3>Invoice Status (v_invoice_status)</h3>
        <table className="table" style={{ width: '100%' }}>
          <thead>
            <tr><th>Invoice ID</th><th>PO ID</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Paid At</th></tr>
          </thead>
          <tbody>
            {inv.map((r, idx) => (
              <tr key={idx}><td>{r.invoice_id}</td><td>{r.po_id}</td><td>{r.amount}</td><td>{r.due_date}</td><td>{r.derived_status ?? '-'}</td><td>{r.paid_at ?? '-'}</td></tr>
            ))}
            {!inv.length && (<tr><td colSpan={6} style={{ color: 'var(--text-secondary)' }}>No rows</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
