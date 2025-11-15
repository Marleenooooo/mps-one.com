import React from 'react';

export function Partnerships() {
  const items = [
    { id: 'p1', name: 'ACME ✕ Berkah', status: 'Active' },
    { id: 'p2', name: 'MPS ✕ LogisticsCo', status: 'In Review' }
  ];
  return (
    <div style={{ padding: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Partnerships</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(p => (
            <div key={p.id} className="card" style={{ display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: 10 }}>
              <div className="avatar" />
              <div>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.status}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button className="btn">Open</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

