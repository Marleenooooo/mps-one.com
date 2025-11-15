import React from 'react';

export function Notifications() {
  const items = [
    { id: 'n1', text: 'Alex Chen liked your post', ts: Date.now() - 3600_000 },
    { id: 'n2', text: 'New connection suggestion: Nadia Rahma', ts: Date.now() - 7200_000 },
  ];
  return (
    <div style={{ padding: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Notifications</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(n => (
            <div key={n.id} className="card" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>{n.text}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(n.ts).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

