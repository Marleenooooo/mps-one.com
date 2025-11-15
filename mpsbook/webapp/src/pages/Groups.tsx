import React from 'react';

export function Groups() {
  const groups = [
    { id: 'g1', name: 'Procurement Leaders', members: 1200 },
    { id: 'g2', name: 'Supplier Relations', members: 870 },
    { id: 'g3', name: 'Logistics & Operations', members: 540 },
  ];
  return (
    <div style={{ padding: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Groups</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {groups.map(g => (
            <div key={g.id} className="card" style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 10 }}>
              <div className="avatar" />
              <div>
                <div style={{ fontWeight: 600 }}>{g.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{g.members} members</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

