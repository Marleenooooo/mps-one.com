import React from 'react';
import { listMessages, listUsers } from '../services/mock';

export function Messages() {
  const users = listUsers();
  const meId = users[0]?.id || 'u1';
  const msgs = listMessages(meId);
  const byId = Object.fromEntries(users.map(u => [u.id, u]));
  return (
    <div style={{ padding: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Messages</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {msgs.map(m => (
            <div key={m.id} className="card" style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 10 }}>
              <div className="avatar" />
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 600 }}>{byId[m.fromId]?.name || '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(m.createdAt).toLocaleString()}</div>
                </div>
                <div>{m.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

