import React from 'react';

export function EventDetail() {
  const event = { id: 'e1', title: 'Supplier Summit 2025', date: new Date(Date.now() + 7*24*3600_000).toISOString(), location: 'Online' };
  return (
    <div style={{ padding: 16 }}>
      <div className="card" style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 10 }}>
        <div className="avatar" />
        <div>
          <div style={{ fontWeight: 700 }}>{event.title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(event.date).toLocaleString()} • {event.location}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="btn">RSVP</button>
            <button className="btn">Share</button>
          </div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 700 }}>About</div>
        <p>Event details and agenda placeholder.</p>
      </div>
    </div>
  );
}

