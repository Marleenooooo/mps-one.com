import React, { useEffect, useState } from 'react';
import { listUsers, listFollowers, listFollowing } from '../services/mock';

export function Network() {
  const [users] = useState(listUsers());
  const me = users[0];
  const [followers, setFollowers] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  useEffect(() => {
    try {
      setFollowers(listFollowers(me?.id || 'u1'));
      setFollowing(listFollowing(me?.id || 'u1'));
    } catch {}
  }, [me?.id]);
  function renderUser(id: string) {
    const u = users.find(x => x.id === id);
    if (!u) return null;
    return (
      <div key={u.id} className="card" style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 10 }}>
        <div className="avatar" />
        <div>
          <div style={{ fontWeight: 600 }}>{u.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{u.headline || '—'}</div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ padding: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 8 }}>My Network</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Followers ({followers.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {followers.map(renderUser)}
            </div>
          </div>
          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Following ({following.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {following.map(renderUser)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

