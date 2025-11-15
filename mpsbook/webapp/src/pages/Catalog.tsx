import React from 'react';

export function Catalog() {
  const items = [
    { id: 'c1', name: 'Corrugated Boxes', price: 1.2, moq: 1000 },
    { id: 'c2', name: 'Shrink Wrap', price: 0.15, moq: 5000 },
    { id: 'c3', name: 'Pallets', price: 12, moq: 100 }
  ];
  return (
    <div style={{ padding: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Catalog</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {items.map(i => (
            <div key={i.id} className="card">
              <div style={{ fontWeight: 600 }}>{i.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Price: {i.price} • MOQ: {i.moq}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn">Request Quote</button>
                <button className="btn">Contact Supplier</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

