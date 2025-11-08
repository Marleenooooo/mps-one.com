import React, { useMemo, useState } from 'react';

function ProgressBar({ value }: { value: number }) {
  return (
    <div aria-label={`Progress ${value}%`} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, height: 10 }}>
      <div style={{ width: `${value}%`, height: '100%', background: 'var(--accent)', borderRadius: 8 }}></div>
    </div>
  );
}

export default function ClientDashboard() {
  const [company] = useState('Kalimantan Mining Group');
  const [budgetUsed] = useState(62);

  const orders = useMemo(() => (
    [
      { id: 'PR-443', status: 'PO Issued', progress: 35 },
      { id: 'PO-9821', status: 'Shipped', progress: 70 },
      { id: 'INV-124', status: 'Unpaid', progress: 90 },
    ]
  ), []);

  return (
    <div className="main" role="main">
      <h1>Welcome, {company}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div className="card" style={{ padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Order Tracking</h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {orders.map(o => (
              <li key={o.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{o.id}</div>
                    <div className="status-badge info">{o.status}</div>
                  </div>
                  <div style={{ width: 240 }}>
                    <ProgressBar value={o.progress} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Quick PR</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Create a purchase request with a few clicks.</p>
          <button className="btn primary" onClick={() => alert('PR creation flow')}>Create PR</button>
          <div style={{ marginTop: 24 }}>
            <h3 style={{ margin: 0 }}>Budget Utilization</h3>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{budgetUsed}%</div>
            <ProgressBar value={budgetUsed} />
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16 }} className="card">
        <div style={{ padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Documents</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[1,2,3,4,5,6,7,8].map(n => (
              <div key={n} className="card" style={{ padding: 12, textAlign: 'center' }}>
                <div aria-label="Document thumbnail" className="skeleton" style={{ height: 80, borderRadius: 8 }}></div>
                <div style={{ marginTop: 8 }}>Document {n}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}