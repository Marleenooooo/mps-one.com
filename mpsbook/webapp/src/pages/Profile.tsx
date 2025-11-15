import React, { useEffect, useState } from 'react';
import { listUsers, listFollowers, listFollowing, isFollowing, followUser, unfollowUser } from '../services/mock';
import type { TrustBadge, VendorTrustSignal } from '@thebridge/contracts/trustGraph';
import { BridgeClient, getClaims } from '@thebridge/sdk';

export function Profile() {
  const users = listUsers();
  const me = users[0];
  const [trust, setTrust] = useState<VendorTrustSignal[]>([]);
  const [followers, setFollowers] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const claims = getClaims();
        if (claims?.companyId) {
          const bc = new BridgeClient('http://localhost:3001');
          const signals = await bc.getVendorTrust(claims.companyId, '');
          setTrust(signals);
        }
      } catch {}
      try {
        setFollowers(listFollowers(me.id));
        setFollowing(listFollowing(me.id));
      } catch {}
    })();
  }, []);
  const badges: TrustBadge[] = [
    ...(me.badges || []).map(b => ({ key: b.key, label: b.label })),
    ...((trust[0]?.badges || []).map(b => ({ key: b.key, label: b.label })) || []),
  ];
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
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <div className="btn">Followers: {followers.length}</div>
            <div className="btn">Following: {following.length}</div>
          </div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 700 }}>About</div>
        <p>Professional social profile connected to procurement context via trust signals.</p>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>People</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {users.slice(1,4).map(u => (
            <div key={u.id} className="card" style={{ display: 'grid', gridTemplateColumns: '48px 1fr 100px', gap: 10 }}>
              <div className="avatar" />
              <div>
                <div style={{ fontWeight: 600 }}>{u.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{u.headline || '—'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <button className="btn" onClick={() => (isFollowing(me.id, u.id) ? unfollowUser(me.id, u.id) : followUser(me.id, u.id))}>{isFollowing(me.id, u.id) ? 'Unfollow' : 'Follow'}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
