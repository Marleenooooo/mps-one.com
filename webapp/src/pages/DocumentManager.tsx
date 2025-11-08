import React, { useState } from 'react';
import { useModule } from '../components/useModule';

type Doc = { id: number; name: string; version: number; canAccess: boolean };

export default function DocumentManager() {
  useModule('finance');
  const [docs, setDocs] = useState<Doc[]>([
    { id: 1, name: 'Quote-Q-1209.pdf', version: 3, canAccess: true },
    { id: 2, name: 'PO-9821.pdf', version: 1, canAccess: true },
    { id: 3, name: 'Invoice-INV-124.pdf', version: 2, canAccess: false },
  ]);

  function toggleAccess(id: number) {
    setDocs(d => d.map(x => x.id === id ? { ...x, canAccess: !x.canAccess } : x));
  }

  function bulkDownload() {
    alert(`Downloading ${docs.length} files`);
  }

  return (
    <div className="main">
      <div className="page-header finance">
        <h1 style={{ margin: 0 }}>Document Manager</h1>
      </div>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Documents</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={bulkDownload}>Bulk Download</button>
            <button className="btn">Upload</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 }}>
          {docs.map(d => (
            <div key={d.id} className="card" style={{ padding: 12 }}>
              <div aria-label="Thumbnail" className="skeleton" style={{ height: 100, borderRadius: 8 }}></div>
              <div style={{ marginTop: 8, fontWeight: 600 }}>{d.name}</div>
              <div style={{ color: 'var(--text-secondary)' }}>v{d.version}</div>
              <label className="btn" style={{ justifyContent: 'space-between', marginTop: 8 }}>
                Access
                <input type="checkbox" checked={d.canAccess} onChange={() => toggleAccess(d.id)} />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}