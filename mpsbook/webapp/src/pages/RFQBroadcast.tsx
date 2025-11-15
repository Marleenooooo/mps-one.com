import React from 'react';

export function RFQBroadcast() {
  const categories = ['Logistics', 'Packaging', 'Raw Materials', 'IT Services'];
  return (
    <div style={{ padding: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 8 }}>RFQ Broadcast</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {categories.map(c => (
            <div key={c} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 600 }}>{c}</div>
              <button className="btn primary" style={{ marginTop: 8 }}>Broadcast</button>
            </div>
          ))}
        </div>
        <div className="card" style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 600 }}>Recent Broadcasts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card">Broadcast #{i + 1}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

