import React from 'react';
import { listUsers, isFollowing, followUser, unfollowUser } from '../services/mock';

export function People() {
  const users = listUsers();
  const meId = users[0]?.id || 'u1';
  function toggleFollow(targetId: string) {
    if (isFollowing(meId, targetId)) {
      unfollowUser(meId, targetId);
    } else {
      followUser(meId, targetId);
    }
  }
  return (
    <div style={{ padding: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 8 }}>People Directory</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {users.map(u => (
            <div key={u.id} className="card" style={{ display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: 10 }}>
              <div className="avatar" />
              <div>
                <div style={{ fontWeight: 600 }}>{u.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{u.headline || '—'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button className="btn" onClick={() => toggleFollow(u.id)}>{isFollowing(meId, u.id) ? 'Unfollow' : 'Follow'}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

