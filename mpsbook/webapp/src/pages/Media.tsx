import React from 'react';

export function Media() {
  const items = Array.from({ length: 12 }).map((_, i) => ({ id: `m${i+1}` }));
  return (
    <div style={{ padding: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Media</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {items.map(it => (
            <div key={it.id} className="card" style={{ height: 120, background: 'linear-gradient(135deg,#1f2937,#111827)', border: '1px solid var(--border)' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

