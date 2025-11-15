import React from 'react';
import { listPosts, listUsers } from '../services/mock';

export function Bookmarks() {
  const posts = listPosts().slice(0, 5);
  const users = listUsers();
  const byId = Object.fromEntries(users.map(u => [u.id, u]));
  return (
    <div style={{ padding: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Bookmarks</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {posts.map(p => (
            <div key={p.id} className="card" style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 10 }}>
              <div className="avatar" />
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 600 }}>{byId[p.authorId]?.name || '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(p.createdAt).toLocaleString()}</div>
                </div>
                <div style={{ marginTop: 6 }}>{p.content}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

