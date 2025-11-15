import React from 'react';

export function Events() {
  const events = [
    { id: 'e1', title: 'Supplier Summit 2025', date: new Date(Date.now() + 7*24*3600_000).toISOString(), location: 'Online' },
    { id: 'e2', title: 'Procurement Best Practices', date: new Date(Date.now() + 14*24*3600_000).toISOString(), location: 'Singapore' },
  ];
  return (
    <div style={{ padding: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Events</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {events.map(ev => (
            <div key={ev.id} className="card" style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 10 }}>
              <div className="avatar" />
              <div>
                <div style={{ fontWeight: 600 }}>{ev.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(ev.date).toLocaleString()} • {ev.location}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

