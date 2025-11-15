import React from 'react';
import { listUsers } from '../services/mock';

export function SupplierDirectory() {
  const users = listUsers();
  const suppliers = users;
  return (
    <div style={{ padding: 16 }}>
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Supplier Directory</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {suppliers.map(s => (
            <div key={s.id} className="card" style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 10 }}>
              <div className="avatar" />
              <div>
                <div style={{ fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.headline || '—'}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button className="btn">View Profile</button>
                  <button className="btn">Request Quote</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

