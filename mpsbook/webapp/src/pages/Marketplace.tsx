import React from 'react';
import { listUsers } from '../services/mock';

export function Marketplace() {
  const users = listUsers();
  const suppliers = users.slice(0, 6);
  const categories = ['Logistics', 'Packaging', 'Raw Materials', 'IT Services', 'Facilities', 'Consulting'];
  return (
    <div style={{ padding: 16 }}>
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Marketplace</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
          {categories.map(c => (
            <div key={c} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 600 }}>{c}</div>
              <button className="btn" style={{ marginTop: 8 }}>Browse</button>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Featured Suppliers</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {suppliers.map(s => (
              <div key={s.id} className="card" style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 10 }}>
                <div className="avatar" />
                <div>
                  <div style={{ fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.headline || '—'}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button className="btn">View</button>
                    <button className="btn">Contact</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Quick Actions</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
            <button className="btn primary">Broadcast RFQ</button>
            <button className="btn">Open Deal Room</button>
            <button className="btn">Compare Quotes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

