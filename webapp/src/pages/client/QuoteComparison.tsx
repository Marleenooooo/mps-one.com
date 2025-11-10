import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Topbar, Breadcrumbs } from '../../components/Layout/Topbar';
import { formatIDR } from '../../components/utils/format';

type QuoteVersion = { version: number; total: number; taxPct: number; discountPct: number; validUntil: string; status?: 'accepted' | 'pending' };

export default function QuoteComparison() {
  const { prId } = useParams();
  const navigate = useNavigate();
  const userType = (typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_user_type') : null);
  const [quotes, setQuotes] = useState<Record<string, QuoteVersion[]>>(() => {
    try { return JSON.parse(localStorage.getItem(`mpsone_quotes_${prId}`) || '{}'); } catch { return {}; }
  });

  useEffect(() => {
    if (userType !== 'client') {
      try { navigate('/procurement/workflow', { replace: true }); } catch {}
      return;
    }
    // Seed quotes if none exist based on sent_to suppliers
    try {
      const map = JSON.parse(localStorage.getItem('mpsone_pr_sent') || '{}');
      const sent = map[String(prId)] || [];
      let changed = false;
      const next: Record<string, QuoteVersion[]> = { ...quotes };
      sent.forEach((s: any, idx: number) => {
        if (!next[s.supplierId]) {
          const base = 1000000 + idx * 250000;
          next[s.supplierId] = [
            { version: 1, total: base, taxPct: 11, discountPct: 0, validUntil: new Date(Date.now() + 7*24*3600*1000).toISOString(), status: 'pending' },
            { version: 2, total: base * 0.98, taxPct: 11, discountPct: 2, validUntil: new Date(Date.now() + 10*24*3600*1000).toISOString(), status: 'pending' },
          ];
          changed = true;
        }
      });
      if (changed) {
        setQuotes(next);
        localStorage.setItem(`mpsone_quotes_${prId}`, JSON.stringify(next));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prId]);

  function acceptQuote(supplierId: string, version: number) {
    const next = { ...quotes };
    const list = (next[supplierId] || []).map(q => ({ ...q, status: q.version === version ? 'accepted' : q.status }));
    next[supplierId] = list;
    setQuotes(next);
    try {
      localStorage.setItem(`mpsone_quotes_${prId}`, JSON.stringify(next));
      const acceptedMap = JSON.parse(localStorage.getItem('mpsone_quote_accepted') || '{}');
      acceptedMap[String(prId)] = { supplierId, version };
      localStorage.setItem('mpsone_quote_accepted', JSON.stringify(acceptedMap));
      alert(`Accepted v${version} from ${supplierId}. You can now convert to PO.`);
    } catch {}
  }

  const supplierIds = useMemo(() => Object.keys(quotes), [quotes]);

  return (
    <div className="main" data-module="procurement">
      <Topbar>
        <Breadcrumbs items={["Client", "Quote Comparison"]} />
      </Topbar>
      <div className="page-header procurement" role="region" aria-label="Quote Comparison Header">
        <h1 style={{ margin: 0 }}>Quote Comparison</h1>
        <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
          Compare quotes per supplier for PR <strong>{prId}</strong>, review versions, totals, tax/discount, validity, and accept.
        </p>
      </div>
      {supplierIds.length === 0 && (
        <div className="card" style={{ padding: 16, marginTop: 16 }}>
          <div>No quotes yet. Use "Send PR to suppliers" from PR List, then check back.</div>
        </div>
      )}
      {supplierIds.map((sid) => (
        <div key={sid} className="card" style={{ padding: 16, marginTop: 16, borderImage: 'linear-gradient(90deg, var(--module-color), var(--module-gradient-end)) 1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>Supplier: {sid}</h3>
            <a className="btn outline" href="/client/suppliers">Manage Suppliers</a>
          </div>
          <table className="table" style={{ width: '100%', marginTop: 8 }}>
            <thead>
              <tr><th>Version</th><th>Total</th><th>Tax</th><th>Discount</th><th>Valid Until</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {(quotes[sid] || []).map(q => (
                <tr key={q.version}>
                  <td>v{q.version}</td>
                  <td>{formatIDR(q.total, 'ID')}</td>
                  <td>{q.taxPct}%</td>
                  <td>{q.discountPct}%</td>
                  <td>{new Date(q.validUntil).toLocaleDateString()}</td>
                  <td><span className={`status-badge ${q.status === 'accepted' ? 'success' : 'info'}`}>{q.status || 'pending'}</span></td>
                  <td>
                    {q.status === 'accepted' ? (
                      <a className="btn" href="/procurement/po/preview">Convert to PO</a>
                    ) : (
                      <button className="btn" onClick={() => acceptQuote(sid, q.version)}>Accept</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

