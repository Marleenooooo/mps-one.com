import React from 'react';
import { listPosts, listUsers } from '../services/mock';

export function Dashboard() {
  const users = listUsers();
  const posts = listPosts();
  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>People</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{users.length}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Posts</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{posts.length}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Groups</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>3</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Events</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>2</div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 700 }}>Activity</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          {posts.slice(0,5).map(p => (
            <div key={p.id} className="card" style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 10 }}>
              <div className="avatar" />
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(p.createdAt).toLocaleString()}</div>
                <div style={{ marginTop: 6 }}>{p.content}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

