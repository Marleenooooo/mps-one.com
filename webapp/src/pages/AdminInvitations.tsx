import React, { useEffect, useState } from 'react';
import { Topbar, Breadcrumbs } from '../components/Layout/Topbar';

type Invite = { code: string; role: string; department: string; created_at: number };

export default function AdminInvitations() {
  const [invites, setInvites] = useState<Invite[]>(() => {
    try { return JSON.parse(localStorage.getItem('mpsone_invites') || '[]'); } catch { return []; }
  });
  const [role, setRole] = useState('PIC Procurement');
  const [dept, setDept] = useState('Procurement');
  const userRole = (typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_role') : null);

  useEffect(() => {
    if (userRole !== 'Admin') {
      try { window.location.replace('/procurement/workflow'); } catch {}
    }
  }, [userRole]);

  function save(next: Invite[]) {
    setInvites(next);
    try { localStorage.setItem('mpsone_invites', JSON.stringify(next)); } catch {}
  }

  function generateCode() {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const invite: Invite = { code, role, department: dept, created_at: Date.now() };
    const next = [invite, ...invites].slice(0, 50);
    save(next);
    try { navigator.clipboard.writeText(code); } catch {}
  }

  function revoke(code: string) {
    save(invites.filter(i => i.code !== code));
  }

  return (
    <div className="main" data-module="procurement">
      <Topbar>
        <Breadcrumbs items={["Admin", "Invitations"]} />
      </Topbar>
      <div className="page-header procurement" role="region" aria-label="Invitations Header">
        <h1 style={{ margin: 0 }}>Invitations</h1>
        <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
          Generate invitation codes to onboard new users to your company with a predefined department and role.
        </p>
      </div>
      <div className="card" style={{ padding: 16, marginTop: 16, borderImage: 'linear-gradient(90deg, var(--module-color), var(--module-gradient-end)) 1' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select className="input" value={role} onChange={e => setRole(e.target.value)}>
            <option>PIC Operational</option>
            <option>PIC Procurement</option>
            <option>PIC Finance</option>
          </select>
          <input className="input" placeholder="Department" value={dept} onChange={e => setDept(e.target.value)} />
          <button className="btn" onClick={generateCode}>Generate Code</button>
          <span className="status-badge" style={{ background: 'transparent', border: '1px solid var(--border)' }}>Copy happens automatically</span>
        </div>
      </div>
      <h3 style={{ marginTop: 16 }}>Active Invites</h3>
      <table className="table" style={{ width: '100%' }}>
        <thead>
          <tr><th>Code</th><th>Role</th><th>Department</th><th>Created</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {invites.map(inv => (
            <tr key={inv.code}>
              <td>{inv.code}</td>
              <td>{inv.role}</td>
              <td>{inv.department}</td>
              <td>{new Date(inv.created_at).toLocaleString()}</td>
              <td>
                <button className="btn outline" onClick={() => revoke(inv.code)}>Revoke</button>
              </td>
            </tr>
          ))}
          {!invites.length && (
            <tr><td colSpan={5} style={{ color: 'var(--text-secondary)' }}>No invitations yet. Generate a code to invite team members.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

