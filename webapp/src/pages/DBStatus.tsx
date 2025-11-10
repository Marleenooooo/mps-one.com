import { useEffect, useState } from 'react';
import { apiHealth, apiPOSummary, apiInvoiceStatus } from '../services/api';
import { Topbar } from '../components/Topbar';
import { Breadcrumbs } from '../components/Breadcrumbs';

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

  return (
    <div className="main">
      <Topbar>
        <Breadcrumbs items={["Dev", "DB Status"]} />
      </Topbar>
      <div className="card" style={{ padding: 16 }}>
        <h2>Database Connectivity</h2>
        {error && <div className="alert" style={{ color: '#FF2A50' }}>Error: {error}</div>}
        {health && (
          <div style={{ marginBottom: 12 }}>
            <div>Version: {health.version}</div>
            <div>Database: {health.db}</div>
          </div>
        )}

        <h3>PO Summary (v_po_item_delivery_totals)</h3>
        <table className="table" style={{ width: '100%', marginBottom: 16 }}>
          <thead>
            <tr><th>PO ID</th><th>Ordered</th><th>Confirmed</th></tr>
          </thead>
          <tbody>
            {po.map((r, idx) => (
              <tr key={idx}><td>{r.po_id}</td><td>{r.ordered_qty}</td><td>{r.confirmed_qty}</td></tr>
            ))}
          </tbody>
        </table>

        <h3>Invoice Status (v_invoice_status)</h3>
        <table className="table" style={{ width: '100%' }}>
          <thead>
            <tr><th>Invoice ID</th><th>PO ID</th><th>Amount</th><th>Due Date</th><th>Paid At</th></tr>
          </thead>
          <tbody>
            {inv.map((r, idx) => (
              <tr key={idx}><td>{r.invoice_id}</td><td>{r.po_id}</td><td>{r.amount}</td><td>{r.due_date}</td><td>{r.paid_at ?? '-'}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

