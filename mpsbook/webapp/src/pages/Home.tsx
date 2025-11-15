import React, { useEffect, useState } from 'react';
import { listPosts, listUsers } from '../services/mock';
import { Composer } from '../components/Composer';
import { PostCard } from '../components/PostCard';

export function Home() {
  const [posts, setPosts] = useState(listPosts());
  const [users] = useState(listUsers());
  function refresh() { setPosts(listPosts()); }
  useEffect(() => { refresh(); }, []);
  const byId = Object.fromEntries(users.map(u => [u.id, u]));
  const meId = users[0]?.id || 'u1';

  return (
    <div style={{ padding: 16 }}>
      <div className="layout" role="main" aria-label="Home 3-column layout">
        <div className="column">
          <div className="sidebar-section">
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Shortcuts</div>
            <div className="nav-item">Home</div>
            <div className="nav-item">Profile</div>
            <div className="nav-item">Messages</div>
            <div className="nav-item">Notifications</div>
          </div>
          <div className="sidebar-section">
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Suggested People</div>
            {users.slice(0,3).map(u => (
              <div key={u.id} className="nav-item">
                <div className="avatar" />
                <div>
                  <div style={{ fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{u.headline || '—'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="column" style={{ padding: 12 }}>
          <Composer authorId={meId} onPosted={refresh} />
          <div className="feed" aria-label="Feed">
            {posts.map(p => (
              <PostCard key={p.id} post={p} author={byId[p.authorId]} />
            ))}
          </div>
        </div>
        <div className="column" style={{ padding: 12 }}>
          <div className="card">
            <div style={{ fontWeight: 700 }}>Trending</div>
            <ul>
              <li>Lead‑time optimization</li>
              <li>RFQ best practices</li>
              <li>Supplier trust signals</li>
            </ul>
          </div>
          <div className="card" style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 700 }}>Shortcuts</div>
            <ul>
              <li>Find suppliers</li>
              <li>Broadcast RFQ</li>
              <li>Company pages</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

