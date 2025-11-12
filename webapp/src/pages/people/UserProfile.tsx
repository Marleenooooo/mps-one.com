import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useI18n } from '../../components/I18nProvider';
import { useModule } from '../../components/useModule';
import { Topbar, Breadcrumbs } from '../../components/Layout/Topbar';
import { apiListUsers, apiListRelationships, apiListBlocks, apiFollowUser, apiUnfollowUser, apiBlockUser, apiUnblockUser } from '../../services/api';

type User = { id: string; name: string; email: string; role: string; user_type: 'client'|'supplier'; nickname?: string; status?: string };

export default function UserProfile() {
  useModule('procurement');
  const { t } = useI18n();
  const { userId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [meEmail, setMeEmail] = useState<string>('you@local');
  const [rel, setRel] = useState<{ following: string[]; followers: string[] }>({ following: [], followers: [] });
  const [blocks, setBlocks] = useState<{ blocked: string[]; blockedBy: string[] }>({ blocked: [], blockedBy: [] });

  useEffect(() => {
    const roleEmail = localStorage.getItem('mpsone_user_email');
    if (roleEmail) setMeEmail(roleEmail);
    (async () => {
      const list = await apiListUsers();
      const target = (list.rows ?? []).find((u: any) => String(u.id) === String(userId)) || null;
      setUser(target);
      const rels = await apiListRelationships(roleEmail || 'you@local');
      setRel(rels);
      const blks = await apiListBlocks(roleEmail || 'you@local');
      setBlocks(blks);
    })();
  }, [userId]);

  const isFollowing = useMemo(() => (user ? rel.following.includes(user.email) : false), [rel, user]);
  const isBlocked = useMemo(() => (user ? (blocks.blocked.includes(user.email) || blocks.blockedBy.includes(user.email)) : false), [blocks, user]);
  const isAdmin = (localStorage.getItem('mpsone_role') === 'Admin');

  async function follow() {
    if (!user) return;
    await apiFollowUser(meEmail, user.email);
    const rels = await apiListRelationships(meEmail);
    setRel(rels);
  }
  async function unfollow() {
    if (!user) return;
    await apiUnfollowUser(meEmail, user.email);
    const rels = await apiListRelationships(meEmail);
    setRel(rels);
  }
  async function block() {
    if (!user) return;
    await apiBlockUser(meEmail, user.email);
    const blks = await apiListBlocks(meEmail);
    setBlocks(blks);
    const rels = await apiListRelationships(meEmail);
    setRel(rels);
  }
  async function unblock() {
    if (!user) return;
    await apiUnblockUser(meEmail, user.email);
    const blks = await apiListBlocks(meEmail);
    setBlocks(blks);
  }

  if (!user) {
    return (
      <div className="main" data-module="procurement">
        <Topbar>
          <Breadcrumbs items={["People", "Profile"]} />
        </Topbar>
        <div className="page-header procurement">
          <h1 style={{ margin: 0 }}>User Profile</h1>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="skeleton" style={{ height: 100, borderRadius: 8 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="main" data-module="procurement">
      <Topbar>
        <Breadcrumbs items={["People", user.name]} />
      </Topbar>
      <div className="page-header procurement">
        <h1 style={{ margin: 0 }}>{user.name}</h1>
      </div>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{user.email}</div>
            <div style={{ marginTop: 4 }}>
              <span className="status-badge info" title={user.role}>{user.role}</span>
              <span className="status-badge" style={{ marginLeft: 8 }}>{user.user_type}</span>
              {user.nickname && <span className="status-badge" style={{ marginLeft: 8 }}>@{user.nickname}</span>}
              {isBlocked && <span className="status-badge warn" style={{ marginLeft: 8 }}>Blocked</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {isBlocked ? (
              <button className="btn outline" onClick={unblock} disabled={!isAdmin}>Unblock</button>
            ) : (
              <button className="btn warn" onClick={block} disabled={!isAdmin}>Block</button>
            )}
            {isFollowing ? (
              <button className="btn outline" onClick={unfollow}>Unfollow</button>
            ) : (
              <button className="btn primary" onClick={follow}>Follow</button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <div className="card" style={{ padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Followers</h3>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {rel.followers.filter(e => e !== user.email).map(e => (
                <li key={e}>{e}</li>
              ))}
              {!rel.followers.length && <li style={{ color: 'var(--text-secondary)' }}>No followers yet</li>}
            </ul>
          </div>
          <div className="card" style={{ padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>Following</h3>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {rel.following.filter(e => e !== user.email).map(e => (
                <li key={e}>{e}</li>
              ))}
              {!rel.following.length && <li style={{ color: 'var(--text-secondary)' }}>Not following anyone</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
