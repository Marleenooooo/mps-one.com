import React from 'react';

export function Offers() {
  const offers = [
    { id: 'of1', title: '10% off Packaging for new clients', validUntil: new Date(Date.now() + 10*24*3600_000).toISOString() },
    { id: 'of2', title: 'Preferred Logistics discount on Q2 routes', validUntil: new Date(Date.now() + 20*24*3600_000).toISOString() }
  ];
  return (
    <div style={{ padding: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Supplier Offers</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {offers.map(o => (
            <div key={o.id} className="card">
              <div style={{ fontWeight: 600 }}>{o.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Valid until {new Date(o.validUntil).toLocaleDateString()}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn">View</button>
                <button className="btn">Contact</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

