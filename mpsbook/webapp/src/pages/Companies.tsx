import React from 'react';
import { listUsers } from '../services/mock';

export function Companies() {
  const users = listUsers();
  const companies = Array.from(new Set(users.map(u => (u.headline || '').split('@')[1]).filter(Boolean)));
  return (
    <div style={{ padding: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Companies</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {companies.length === 0 && (
            <div style={{ color: 'var(--text-secondary)' }}>No companies detected from user profiles</div>
          )}
          {companies.map(c => (
            <div key={c} className="card" style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 10 }}>
              <div className="avatar" />
              <div>
                <div style={{ fontWeight: 600 }}>{c}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Enterprise profile placeholder</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

