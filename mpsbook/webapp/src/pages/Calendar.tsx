import React from 'react';

export function Calendar() {
  const days = ['Mon','Tue','Wed','Thu','Fri'];
  const events = [
    { day: 'Tue', title: 'Supplier Summit', time: '10:00' },
    { day: 'Thu', title: 'Procurement Webinar', time: '15:00' }
  ];
  return (
    <div style={{ padding: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Calendar</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {days.map(d => (
            <div key={d} className="card" style={{ minHeight: 140 }}>
              <div style={{ fontWeight: 600 }}>{d}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {events.filter(e => e.day === d).map((e, i) => (
                  <div key={i} className="card">
                    <div style={{ fontWeight: 600 }}>{e.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{e.time}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

