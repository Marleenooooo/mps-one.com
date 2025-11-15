import React from 'react';

export function DealRooms() {
  const rooms = [
    { id: 'd1', name: 'ACME ✕ Berkah — Q2 Packaging', stage: 'Negotiation', messages: 18 },
    { id: 'd2', name: 'MPS ✕ LogisticsCo — APAC Route', stage: 'Review', messages: 9 }
  ];
  return (
    <div style={{ padding: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Deal Rooms</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rooms.map(r => (
            <div key={r.id} className="card" style={{ display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: 10 }}>
              <div className="avatar" />
              <div>
                <div style={{ fontWeight: 600 }}>{r.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Stage: {r.stage} • Messages: {r.messages}</div>
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

