import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../../components/I18nProvider';
import { useModule } from '../../components/useModule';
import { Breadcrumbs } from '../../components/Layout/Topbar';
import { apiListUsers, apiFollowUser, apiUnfollowUser, apiBlockUser, apiUnblockUser, apiInviteUser, apiListRelationships, apiListBlocks, apiListInvites, apiRespondInvite, apiCancelInvite } from '../../services/api';
import { VirtualList } from '../../components/UI/VirtualList';

type User = { id: string; name: string; email: string; role: string; user_type: 'client'|'supplier'; nickname?: string; status?: string };

export default function PeopleDirectory() {
  useModule('procurement');
  const { t } = useI18n();
  const [users, setUsers] = useState<User[]>([]);
  const [meEmail, setMeEmail] = useState<string>('you@local');
  const [rel, setRel] = useState<{ following: string[]; followers: string[] }>({ following: [], followers: [] });
  const [blocks, setBlocks] = useState<{ blocked: string[]; blockedBy: string[] }>({ blocked: [], blockedBy: [] });
  const [invites, setInvites] = useState<{ sent: any[]; received: any[] }>({ sent: [], received: [] });
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement | null>(null);
  const isAdmin = (localStorage.getItem('mpsone_role') === 'Admin');

  useEffect(() => {
    const roleEmail = localStorage.getItem('mpsone_user_email');
    if (roleEmail) setMeEmail(roleEmail);
    (async () => {
      const list = await apiListUsers();
      setUsers((list.rows ?? []) as User[]);
      const rels = await apiListRelationships(roleEmail || 'you@local');
      setRel(rels);
      const blks = await apiListBlocks(roleEmail || 'you@local');
      setBlocks(blks);
      const inv = await apiListInvites(roleEmail || 'you@local');
      setInvites(inv);
    })();
  }, []);

  // Keyboard shortcut: '/' focuses search
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = (document.activeElement as HTMLElement | null)?.tagName?.toLowerCase();
        // Avoid hijacking when already in an input
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          searchRef.current?.focus();
        }
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = users.filter(u => u.email !== meEmail);
    if (!q) return base;
    return base.filter(u => (u.name?.toLowerCase().includes(q)) || (u.email?.toLowerCase().includes(q)) || (u.role?.toLowerCase().includes(q)));
  }, [users, search, meEmail]);

  async function follow(email: string) {
    await apiFollowUser(meEmail, email);
    const rels = await apiListRelationships(meEmail);
    setRel(rels);
  }
  async function unfollow(email: string) {
    await apiUnfollowUser(meEmail, email);
    const rels = await apiListRelationships(meEmail);
    setRel(rels);
  }
  async function block(email: string) {
    await apiBlockUser(meEmail, email);
    const blks = await apiListBlocks(meEmail);
    setBlocks(blks);
    const rels = await apiListRelationships(meEmail);
    setRel(rels);
  }
  async function unblock(email: string) {
    await apiUnblockUser(meEmail, email);
    const blks = await apiListBlocks(meEmail);
    setBlocks(blks);
  }
  async function invite(email: string) {
    await apiInviteUser(meEmail, email);
    const inv = await apiListInvites(meEmail);
    setInvites(inv);
  }

  function isFollowing(email: string) { return rel.following.includes(email); }
  function isBlocked(email: string) { return blocks.blocked.includes(email) || blocks.blockedBy.includes(email); }

  return (
    <div className="main" data-module="procurement">
      <div className="page-header procurement">
        <div style={{ marginTop: 4, color: 'var(--text-secondary)' }}>
          <Breadcrumbs items={["Admin", "People"]} />
        </div>
        <h1 style={{ margin: 0 }}>Admin People Directory</h1>
      </div>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ marginTop: 0 }}>Discover People</h2>
          <input
            ref={searchRef}
            className="input"
            placeholder="Search by name, email, role"
            aria-label="Search people"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 320 }}
          />
        </div>
        {filtered.length ? (
          <VirtualList
            items={filtered}
            height={480}
            itemHeight={96}
            role="list"
            renderItem={(u) => (
              <div role="listitem" className="card" style={{ padding: 12, borderLeft: `4px solid var(--border)` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{u.name}</strong>
                    <div style={{ color: 'var(--text-secondary)' }}>{u.email}</div>
                    <div style={{ marginTop: 4 }}>
                      <span className="status-badge info" title={u.role}>{u.role}</span>
                      <span className="status-badge" style={{ marginLeft: 8 }}>{u.user_type}</span>
                      {isBlocked(u.email) && <span className="status-badge warn" style={{ marginLeft: 8 }}>Blocked</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a className="btn outline" href={`/people/${encodeURIComponent(u.id)}`}>View Profile</a>
                    <button className="btn secondary" onClick={() => invite(u.email)} disabled={!isAdmin}>Invite</button>
                    {isBlocked(u.email) ? (
                      <button className="btn outline" onClick={() => unblock(u.email)} disabled={!isAdmin}>Unblock</button>
                    ) : (
                      <button className="btn warn" onClick={() => block(u.email)} disabled={!isAdmin}>Block</button>
                    )}
                    {isFollowing(u.email) ? (
                      <button className="btn outline" onClick={() => unfollow(u.email)}>Unfollow</button>
                    ) : (
                      <button className="btn primary" onClick={() => follow(u.email)}>Follow</button>
                    )}
                  </div>
                </div>
              </div>
            )}
          />
        ) : (
          <div className="card" style={{ padding: 12 }}>
            <div style={{ color: 'var(--text-secondary)' }}>No people found. Try adjusting your search.</div>
          </div>
        )}
      </div>
      <div className="card" style={{ padding: 16, marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Invitations</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <h3 style={{ marginTop: 0 }}>Sent</h3>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {invites.sent.map((i: any) => (
                <li key={i.id}>
                  To: {i.to} • {i.status}
                  {i.status === 'pending' && (
                    <button className="btn outline" onClick={() => apiCancelInvite(i.id).then(() => apiListInvites(meEmail).then(setInvites))} style={{ marginLeft: 8 }}>Cancel</button>
                  )}
                </li>
              ))}
              {!invites.sent.length && <li style={{ color: 'var(--text-secondary)' }}>No sent invites</li>}
            </ul>
          </div>
          <div>
            <h3 style={{ marginTop: 0 }}>Received</h3>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {invites.received.map((i: any) => (
                <li key={i.id}>
                  From: {i.from} • {i.status}
                  {i.status === 'pending' && (
                    <>
                      <button className="btn success" onClick={() => apiRespondInvite(i.id, 'accepted').then(() => apiListInvites(meEmail).then(setInvites))} style={{ marginLeft: 8 }}>Accept</button>
                      <button className="btn outline" onClick={() => apiRespondInvite(i.id, 'declined').then(() => apiListInvites(meEmail).then(setInvites))} style={{ marginLeft: 8 }}>Decline</button>
                    </>
                  )}
                </li>
              ))}
              {!invites.received.length && <li style={{ color: 'var(--text-secondary)' }}>No received invites</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
