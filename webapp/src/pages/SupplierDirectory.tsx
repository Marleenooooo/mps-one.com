import React, { useEffect, useState } from 'react';
import { Breadcrumbs } from '../components/Layout/Topbar';

type Supplier = { id: string; name: string; code?: string; domain?: string; email?: string; contact?: string; status?: 'connected' | 'pending' };

export default function SupplierDirectory() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try { return JSON.parse(localStorage.getItem('mpsone_suppliers') || '[]'); } catch { return []; }
  });
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const userType = (typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_user_type') : null);
  const role = (typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_role') : null);
  const isAdmin = role === 'Admin';

  useEffect(() => {
    if (userType !== 'client') {
      // Soft guard: redirect non-clients back to workflow
      try { window.location.replace('/procurement/workflow'); } catch {}
    }
  }, [userType]);

  function save(next: Supplier[]) {
    setSuppliers(next);
    try { localStorage.setItem('mpsone_suppliers', JSON.stringify(next)); } catch {}
  }

  function addSupplier(e: React.FormEvent) {
    e.preventDefault();
    const id = (code || domain || name).trim();
    if (!id) return;
    const s: Supplier = {
      id,
      name: name.trim() || code.trim() || domain.trim(),
      code: code.trim() || undefined,
      domain: domain.trim() || undefined,
      email: email.trim() || undefined,
      contact: contact.trim() || undefined,
      status: 'pending'
    };
    const next = [s, ...suppliers.filter(x => x.id !== id)].slice(0, 24);
    save(next);
    setName(''); setCode(''); setDomain(''); setEmail(''); setContact('');
  }

  function removeSupplier(id: string) {
    const next = suppliers.filter(s => s.id !== id);
    save(next);
  }

  return (
    <div className="main" data-module="procurement">
      {/* Use global Topbar from App; only render page header here */}
      <div className="page-crumbs" aria-label="Breadcrumbs" style={{ marginBottom: 8 }}>
        <Breadcrumbs items={["Procurement", "Suppliers"]} />
      </div>

      <div className="page-header procurement" role="region" aria-label="Supplier Directory Header">
        <h1 style={{ margin: 0 }}>Supplier Directory</h1>
        <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
          Add suppliers (existing accounts) so you can send approved PRs to multiple suppliers and select the best quotes.
        </p>
      </div>

      <div className="card" style={{ padding: 16, marginTop: 16, borderImage: 'linear-gradient(90deg, var(--module-color), var(--module-gradient-end)) 1' }}>
        {!isAdmin && (
          <div className="status-badge" aria-live="polite" style={{ marginBottom: 8 }}>View-only: Only Admins can add suppliers.</div>
        )}
        <form onSubmit={addSupplier} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input className="input" placeholder="Supplier name" value={name} onChange={e => setName(e.target.value)} />
          <input className="input" placeholder="Supplier code (optional)" value={code} onChange={e => setCode(e.target.value)} />
          <input className="input" placeholder="Domain (e.g. supplier.com)" value={domain} onChange={e => setDomain(e.target.value)} />
          <input className="input" placeholder="Contact email (optional)" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="input" placeholder="PIC Contact (optional)" value={contact} onChange={e => setContact(e.target.value)} />
          <button className="btn" type="submit" disabled={!isAdmin}>Add Supplier</button>
          <a className="btn outline" href="/procurement/pr" aria-label="Go to PRs">Go to PRs</a>
        </form>
        <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
          Add by code or domain; connection requests will appear as pending until the supplier accepts (friend-like model).
        </p>
      </div>

      <h3 style={{ marginTop: 16 }}>Your Suppliers</h3>
      <table className="table" style={{ width: '100%' }}>
        <thead>
          <tr><th>Name</th><th>Code</th><th>Domain</th><th>Contact</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {suppliers.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.code || '-'}</td>
              <td>{s.domain || '-'}</td>
              <td>{s.email || s.contact || '-'}</td>
              <td>
                <span className={`status-badge ${s.status === 'connected' ? 'success' : 'info'}`}>{s.status || 'pending'}</span>
              </td>
              <td>
                <button className="btn outline" onClick={() => removeSupplier(s.id)}>Remove</button>
              </td>
            </tr>
          ))}
          {!suppliers.length && (
            <tr><td colSpan={6} style={{ color: 'var(--text-secondary)' }}>No suppliers yet. Add suppliers to distribute PRs.</td></tr>
          )}
        </tbody>
      </table>

      <div className="card" style={{ padding: 16, marginTop: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Discover Suppliers</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['MBERKAH@','SAMARINDA_SUP@','PT_KALTIM@'].map(s => (
            <button key={s} className="btn outline" disabled={!isAdmin} onClick={() => {
              const next = { id: s, name: s.replace('@',''), code: s, status: 'pending' } as Supplier;
              save([next, ...suppliers.filter(x => x.id !== s)].slice(0, 24));
            }}>Add {s}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
