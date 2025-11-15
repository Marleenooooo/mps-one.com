import React from 'react';

export function Invitations() {
  const invites = [
    { id: 'i1', name: 'Nadia Rahma', role: 'Supplier Relations', ts: Date.now() - 7200_000 },
    { id: 'i2', name: 'Alex Chen', role: 'Procurement Lead', ts: Date.now() - 3600_000 },
  ];
  return (
    <div style={{ padding: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Invitations</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {invites.map(i => (
            <div key={i.id} className="card" style={{ display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: 10 }}>
              <div className="avatar" />
              <div>
                <div style={{ fontWeight: 600 }}>{i.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{i.role}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button className="btn">Accept</button>
                <button className="btn">Ignore</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

