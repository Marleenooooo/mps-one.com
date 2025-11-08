import React, { useMemo, useState } from 'react';
import { useModule } from '../components/useModule';

const statuses = ['PR', 'Quote', 'PO', 'Processing', 'Shipped', 'Delivered', 'Invoiced', 'Paid'] as const;

export default function OrderTracker() {
  useModule('inventory');
  const [current, setCurrent] = useState<typeof statuses[number]>('Processing');
  const eta = useMemo(() => new Date(Date.now() + 1000 * 60 * 60 * 24 * 4), []); // 4 days

  return (
    <div className="main">
      <div className="page-header inventory">
        <h1 style={{ margin: 0 }}>Order Tracker</h1>
      </div>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {statuses.map(s => (
            <div key={s} className="tooltip" data-tip={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: 999, background: s === current ? 'var(--accent)' : 'var(--border)' }}></div>
              <span style={{ color: s === current ? 'var(--accent)' : 'var(--text-secondary)' }}>{s}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16 }}>
          Estimated delivery: <strong>{eta.toLocaleDateString()}</strong> ({Math.ceil((eta.getTime() - Date.now()) / (1000*60*60*24))} days)
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <div className="card" style={{ padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Shipping Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <div style={{ color: 'var(--text-secondary)' }}>Courier</div>
              <div>PT Nusantara Logistics</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)' }}>Tracking No</div>
              <div>NL-2024-9821</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Delivery Proof</h2>
          <div onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); alert(`${e.dataTransfer.files.length} file(s) attached`); }}
               style={{ border: '2px dashed var(--border)', borderRadius: 12, padding: 24, textAlign: 'center' }}>
            Drag & drop files here or <button className="btn">Upload</button>
          </div>
        </div>
      </div>
    </div>
  );
}