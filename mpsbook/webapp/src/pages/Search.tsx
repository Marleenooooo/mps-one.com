import React, { useMemo, useState } from 'react';
import { listUsers, listPosts } from '../services/mock';

export function Search() {
  const [q, setQ] = useState('');
  const users = listUsers();
  const posts = listPosts();
  const userResults = useMemo(() => users.filter(u => (u.name + (u.headline || '')).toLowerCase().includes(q.toLowerCase())), [users, q]);
  const postResults = useMemo(() => posts.filter(p => p.content.toLowerCase().includes(q.toLowerCase())), [posts, q]);
  return (
    <div style={{ padding: 16 }}>
      <div className="card" style={{ marginBottom: 12 }}>
        <input className="input" placeholder="Search people and posts" value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 8 }}>People</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {userResults.map(u => (
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
      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Posts</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {postResults.map(p => (
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

