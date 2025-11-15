import React from 'react';
import { listUsers } from '../services/mock';

export function Discover() {
  const users = listUsers();
  const suggestions = users.slice(0, 6);
  const groups = [
    { id: 'g1', name: 'Procurement Leaders', members: 1200 },
    { id: 'g2', name: 'Supplier Relations', members: 870 },
  ];
  const companies = Array.from(new Set(users.map(u => (u.headline || '').split('@')[1]).filter(Boolean))).slice(0, 6);
  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 8 }}>People You May Know</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {suggestions.map(u => (
              <div key={u.id} className="card" style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 10 }}>
                <div className="avatar" />
                <div>
                  <div style={{ fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{u.headline || '—'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Trending Groups</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Companies</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
          {companies.map(c => (
            <div key={c} className="card" style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 10 }}>
              <div className="avatar" />
              <div>
                <div style={{ fontWeight: 600 }}>{c}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Discover profiles and posts</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

