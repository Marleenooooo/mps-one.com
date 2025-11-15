import React from 'react';
import { listUsers } from '../services/mock';
import type { TrustBadge } from '../../../thebridge/contracts/trustGraph';

export function Profile() {
  const users = listUsers();
  const me = users[0];
  const badges: TrustBadge[] = (me.badges || []).map(b => ({ key: b.key, label: b.label }));
  return (
    <div style={{ padding: 16 }}>
      <div className="card" style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 16 }}>
        <div className="avatar" style={{ width: 100, height: 100 }} />
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{me.name}</div>
          <div style={{ color: 'var(--text-secondary)' }}>{me.headline}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {badges.map(b => (
              <span key={b.key} className="btn" style={{ fontSize: 12 }}>{b.label || b.key}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 700 }}>About</div>
        <p>Professional social profile connected to procurement context via trust signals.</p>
      </div>
    </div>
  );
}

