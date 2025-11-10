import React, { useEffect, useState } from 'react';
import { Topbar, Breadcrumbs } from '../components/Layout/Topbar';

type Client = { id: string; name: string; domain?: string; email?: string; contact?: string; status?: 'connected' | 'pending' };

export default function ClientDirectory() {
  const [clients, setClients] = useState<Client[]>(() => {
    try { return JSON.parse(localStorage.getItem('mpsone_clients') || '[]'); } catch { return []; }
  });
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const userType = (typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_user_type') : null);
  const role = (typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_role') : null);
  const isAdmin = role === 'Admin';

  useEffect(() => {
    if (userType !== 'supplier') {
      try { window.location.replace('/procurement/workflow'); } catch {}
    }
  }, [userType]);

  function save(next: Client[]) {
    setClients(next);
    try { localStorage.setItem('mpsone_clients', JSON.stringify(next)); } catch {}
  }

  function addClient(e: React.FormEvent) {
    e.preventDefault();
    const id = (domain || name).trim();
    if (!id) return;
    const c: Client = { id, name: name.trim() || domain.trim(), domain: domain.trim() || undefined, email: email.trim() || undefined, contact: contact.trim() || undefined, status: 'pending' };
    const next = [c, ...clients.filter(x => x.id !== id)].slice(0, 24);
    save(next);
    setName(''); setDomain(''); setEmail(''); setContact('');
  }

  function removeClient(id: string) {
    const next = clients.filter(c => c.id !== id);
    save(next);
  }

  return (
    <div className="main" data-module="procurement">
      <Topbar>
        <Breadcrumbs items={["Supplier", "Clients"]} />
      </Topbar>

      <div className="page-header procurement" role="region" aria-label="Client Directory Header">
        <h1 style={{ margin: 0 }}>Client Directory</h1>
        <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
          Manage client connections. Only Admins can add clients.
        </p>
      </div>

      <div className="card" style={{ padding: 16, marginTop: 16, borderImage: 'linear-gradient(90deg, var(--module-color), var(--module-gradient-end)) 1' }}>
        {!isAdmin && (
          <div className="status-badge" aria-live="polite" style={{ marginBottom: 8 }}>View-only: Only Admins can add clients.</div>
        )}
        <form onSubmit={addClient} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input className="input" placeholder="Client name" value={name} onChange={e => setName(e.target.value)} />
          <input className="input" placeholder="Domain (e.g. client.com)" value={domain} onChange={e => setDomain(e.target.value)} />
          <input className="input" placeholder="Contact email (optional)" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="input" placeholder="PIC Contact (optional)" value={contact} onChange={e => setContact(e.target.value)} />
          <button className="btn" type="submit" disabled={!isAdmin}>Add Client</button>
        </form>
      </div>

      <h3 style={{ marginTop: 16 }}>Your Clients</h3>
      <table className="table" style={{ width: '100%' }}>
        <thead>
          <tr><th>Name</th><th>Domain</th><th>Contact</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.domain || '-'}</td>
              <td>{c.email || c.contact || '-'}</td>
              <td>
                <span className={`status-badge ${c.status === 'connected' ? 'success' : 'info'}`}>{c.status || 'pending'}</span>
              </td>
              <td>
                <button className="btn outline" onClick={() => removeClient(c.id)}>Remove</button>
              </td>
            </tr>
          ))}
          {!clients.length && (
            <tr><td colSpan={5} style={{ color: 'var(--text-secondary)' }}>No clients yet. Add clients to receive PR distribution and quotes.</td></tr>
          )}
        </tbody>
      </table>

      <div className="card" style={{ padding: 16, marginTop: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Discover Clients</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['MPSONE_CLIENT@','KALTIM_MINING@','PT_MINING_CORP@'].map(c => (
            <button key={c} className="btn outline" disabled={!isAdmin} onClick={() => {
              const next = { id: c, name: c.replace('@',''), status: 'pending' } as Client;
              save([next, ...clients.filter(x => x.id !== c)].slice(0, 24));
            }}>Add {c}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
