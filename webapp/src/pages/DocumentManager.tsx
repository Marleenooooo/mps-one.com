import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useModule } from '../components/useModule';
import { useI18n } from '../components/I18nProvider';

type DocType = 'PR' | 'Quote' | 'PO' | 'DeliveryNote' | 'Invoice' | 'Payment';
type Doc = { id: number; name: string; version: number; type: DocType; refId?: string; canAccess: boolean; versions?: { v: number; when: string }[] };

export default function DocumentManager({ overscan = 3 }: { overscan?: number }) {
  useModule('finance');
  const { t } = useI18n();
  const [mounting, setMounting] = useState(true);
  const [docs, setDocs] = useState<Doc[]>([
    { id: 1, name: 'Quote-Q-1209.pdf', version: 3, type: 'Quote', refId: 'PR-444', canAccess: true, versions: [{ v: 1, when: '2025-07-20' }, { v: 2, when: '2025-08-02' }, { v: 3, when: '2025-08-15' }] },
    { id: 2, name: 'PO-9821.pdf', version: 1, type: 'PO', refId: 'PR-444', canAccess: true, versions: [{ v: 1, when: '2025-08-18' }] },
    { id: 3, name: 'Invoice-INV-124.pdf', version: 2, type: 'Invoice', refId: 'PO-9821', canAccess: false, versions: [{ v: 1, when: '2025-08-01' }, { v: 2, when: '2025-08-20' }] },
  ]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [bulkTotal, setBulkTotal] = useState<number>(0);
  const [bulkDone, setBulkDone] = useState<number>(0);
  const bulkDownloadBtnRef = useRef<HTMLButtonElement | null>(null);
  const bulkDeleteBtnRef = useRef<HTMLButtonElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const height = 420; // viewport height for virtualization
  const rowHeight = 220; // approximate card height + gap
  const columns = 3;
const overscanRows = overscan;
  const totalRows = Math.ceil(docs.length / columns);
  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscanRows);
  const visibleRowCount = Math.ceil(height / rowHeight) + overscanRows * 2;
  const endRow = Math.min(totalRows, startRow + visibleRowCount);
  const startIndex = startRow * columns;
  const endIndex = Math.min(docs.length, endRow * columns);
  const visibleDocs = useMemo(() => docs.slice(startIndex, endIndex), [docs, startIndex, endIndex]);

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop((e.target as HTMLDivElement).scrollTop);
  }, []);

  useEffect(() => { const tm = setTimeout(() => setMounting(false), 400); return () => clearTimeout(tm); }, []);

  const role = (typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_role') : null);
  const userType = (typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_user_type') : null);

  const canToggle = useCallback((d: Doc): boolean => {
    if (role === 'Admin') return true;
    if (role === 'PIC Finance') return d.type === 'Invoice' || d.type === 'Payment';
    if (role === 'PIC Procurement') return d.type === 'PR' || d.type === 'PO' || d.type === 'Quote';
    if (role === 'PIC Operational') return d.type === 'PR' || d.type === 'DeliveryNote';
    // Suppliers can toggle only their Quotes
    if (userType === 'supplier') return d.type === 'Quote';
    return false;
  }, [role, userType]);

  const toggleAccess = useCallback((id: number) => {
    setDocs(d => d.map(x => x.id === id ? { ...x, canAccess: !x.canAccess } : x));
  }, []);

  const toggleExpanded = useCallback((id: number) => {
    setExpanded(e => ({ ...e, [id]: !e[id] }));
  }, []);

  const toggleSelect = useCallback((id: number) => {
    setSelected(s => ({ ...s, [id]: !s[id] }));
  }, []);

  function bulkDownload() {
    const ids = Object.entries(selected).filter(([_, v]) => v).map(([k]) => Number(k));
    const count = ids.length || docs.length;
    setBanner(t('docs.downloading').replace('{n}', String(count)));
    const targets = (ids.length ? docs.filter(d => ids.includes(d.id)) : docs);
    setBulkTotal(targets.length);
    setBulkDone(0);
    let completed = 0;
    targets.forEach((d, i) => {
      setTimeout(() => {
        downloadDoc(d);
        completed += 1;
        setBulkDone(completed);
        if (completed === targets.length) {
          setBanner(t('docs.download_complete'));
          setTimeout(() => { setBulkTotal(0); setBulkDone(0); }, 500);
          setTimeout(() => setBanner(null), 1500);
          bulkDownloadBtnRef.current?.focus();
        }
      }, i * 150);
    });
  }

  function bulkDelete() {
    const ids = Object.entries(selected).filter(([_, v]) => v).map(([k]) => Number(k));
    if (!ids.length) return alert('No documents selected');
    setDocs(d => d.filter(x => !ids.includes(x.id)));
    setSelected({});
    setBanner(t('docs.deleted').replace('{n}', String(ids.length)));
    setTimeout(() => setBanner(null), 1200);
    bulkDeleteBtnRef.current?.focus();
  }
  const downloadDoc = useCallback((d: Doc) => {
    const blob = new Blob([`Dummy content for ${d.name} (v${d.version})`], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = d.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, []);

  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);

  return (
    <div className="main">
      <div className="page-header finance" style={{ borderImage: 'linear-gradient(90deg, var(--module-color), var(--module-gradient-end)) 1' }}>
        <h1 style={{ margin: 0 }}>{t('docs.title')}</h1>
      </div>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>{t('docs.list')}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button ref={bulkDownloadBtnRef} className="btn" aria-label={t('docs.bulk_download')} onClick={bulkDownload}>{t('docs.bulk_download')}</button>
            <button ref={bulkDeleteBtnRef} className="btn" aria-label={t('docs.delete_selected')} onClick={bulkDelete}>{t('docs.delete_selected')}</button>
            <button className="btn">{t('action.upload')}</button>
            <button className="btn" onClick={() => exportDocsCSV(docs)}>{t('action.export_csv') || 'Export CSV'}</button>
          </div>
        </div>
        <div aria-live="polite" style={{ minHeight: 24, marginTop: 8, color: 'var(--text-secondary)' }}>
          {banner ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span>{banner}</span>
              {bulkTotal > 0 && (
                <div className="progress-bar" aria-label="Bulk download progress" style={{ width: 240 }}>
                  <div className="value" style={{ width: `${Math.round((bulkDone / bulkTotal) * 100)}%`, background: 'linear-gradient(90deg, var(--module-color) 0%, var(--module-gradient-end) 100%)' }}></div>
                </div>
              )}
            </div>
          ) : (
            t('docs.selected').replace('{n}', String(selectedCount))
          )}
        </div>
        <div ref={scrollRef} onScroll={onScroll} style={{ marginTop: 12, height, overflowY: 'auto' }}>
          {mounting ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card" style={{ padding: 12 }}>
                <div className="skeleton" style={{ height: 16, borderRadius: 6, width: '80%', marginBottom: 8 }}></div>
                <div className="skeleton" style={{ height: 100, borderRadius: 8 }}></div>
                <div className="skeleton" style={{ height: 12, borderRadius: 6, width: '60%', marginTop: 8 }}></div>
              </div>
            ))
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 12 }}>
              <div style={{ gridColumn: `1 / span ${columns}`, height: startRow * rowHeight }} />
              {visibleDocs.map(d => (
                <DocCard
                  key={d.id}
                  d={d}
                  selected={!!selected[d.id]}
                  expanded={!!expanded[d.id]}
                  t={t}
                  canToggle={canToggle}
                  onToggleSelect={toggleSelect}
                  onToggleAccess={toggleAccess}
                  onDownload={downloadDoc}
                  onToggleExpanded={toggleExpanded}
                />
              ))}
              <div style={{ gridColumn: `1 / span ${columns}`, height: Math.max(0, (totalRows - endRow)) * rowHeight }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const DocCard = React.memo(function DocCard({ d, selected, expanded, t, canToggle, onToggleSelect, onToggleAccess, onDownload, onToggleExpanded }:
  { d: Doc; selected: boolean; expanded: boolean; t: any; canToggle: (d: Doc) => boolean; onToggleSelect: (id: number) => void; onToggleAccess: (id: number) => void; onDownload: (d: Doc) => void; onToggleExpanded: (id: number) => void }) {
  return (
    <div className="card" style={{ padding: 12, transition: 'all 0.2s ease' }}
         onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 10px var(--module-color), 0 0 20px var(--module-color)')}
         onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="checkbox" checked={!!selected} onChange={() => onToggleSelect(d.id)} aria-label={`Select ${d.name}`} />
        <span style={{ fontWeight: 600 }}>{d.name}</span>
      </label>
      <div aria-label={t('docs.thumbnail')} style={{ height: 100, borderRadius: 8, position: 'relative', background: 'linear-gradient(135deg, var(--surface2), var(--surface))' }}>
        <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.1)', padding: '4px 8px', borderRadius: 6, fontSize: 12 }}>
          {d.name.split('.').pop()?.toUpperCase()}
        </div>
        <div style={{ position: 'absolute', bottom: 8, left: 8, fontSize: 12, color: 'var(--text-secondary)' }}>{t('docs.version').replace('{n}', String(d.version))}</div>
      </div>
      <div style={{ marginTop: 6 }}>
        <span className={`status-badge ${d.canAccess ? 'success' : ''}`}>{t('docs.access')}: {d.canAccess ? 'Allowed' : 'Denied'}</span>
      </div>
      <div style={{ color: 'var(--text-secondary)' }}>{t('docs.version').replace('{n}', String(d.version))}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{d.type}{d.refId ? ` · ${d.refId}` : ''}</span>
        <label className="btn" style={{ justifyContent: 'space-between' }}>
          {t('docs.access')}
          <input type="checkbox" checked={d.canAccess} onChange={() => onToggleAccess(d.id)} disabled={!canToggle(d)} />
        </label>
      </div>
      {!canToggle(d) && (
        <div className="status-badge" style={{ marginTop: 8 }}>View-only: Access changes restricted for your role</div>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button className="btn" onClick={() => onDownload(d)}>{t('docs.download')}</button>
        <button className="btn" onClick={() => onToggleExpanded(d.id)}>{expanded ? t('docs.hide_history') : t('docs.show_history')}</button>
      </div>
      {expanded && (
        <div className="card" style={{ padding: 8, marginTop: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('docs.version_history')}</div>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {(d.versions ?? ([] as { v: number; when: string }[])).map((v: { v: number; when: string }) => (
              <li key={v.v}>
                {t('docs.version').replace('{n}', String(v.v))}
                <span style={{ marginLeft: 8, color: 'var(--text-secondary)' }}>{v.when}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

function exportDocsCSV(docs: { id: number; name: string; version: number; canAccess: boolean }[]) {
  const headers = ['ID','Name','Version','Access'];
  const escape = (val: string) => '"' + String(val).replace(/"/g, '""') + '"';
  const body = docs.map(d => [d.id, d.name, d.version, d.canAccess ? 'Allowed' : 'Denied'].map(v => escape(String(v))).join(',')).join('\n');
  const csv = headers.join(',') + '\n' + body;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'documents.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
