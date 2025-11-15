import React from 'react';

export function Opportunities() {
  const ops = [
    { id: 'o1', title: 'Packaging Supplier for Q2', value: 50000, location: 'Jakarta' },
    { id: 'o2', title: 'Logistics Partner APAC', value: 150000, location: 'Singapore' },
    { id: 'o3', title: 'Consulting: Procurement Optimization', value: 80000, location: 'Remote' }
  ];
  return (
    <div style={{ padding: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Business Opportunities</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {ops.map(o => (
            <div key={o.id} className="card">
              <div style={{ fontWeight: 600 }}>{o.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{o.location} • {o.value.toLocaleString()}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn">Express Interest</button>
                <button className="btn">Share</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

