import React, { useMemo, useState } from 'react';

export type Column<T> = {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
};

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  pageSize = 5,
}: {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
}) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = q
      ? data.filter(d => Object.values(d).some(v => String(v).toLowerCase().includes(q)))
      : data;
    if (sortKey) {
      rows = rows.slice().sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (av === bv) return 0;
        const r = av > bv ? 1 : -1;
        return sortDir === 'asc' ? r : -r;
      });
    }
    return rows;
  }, [data, query, sortKey, sortDir]);

  const paged = useMemo(() => {
    const start = page * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  function toggleSort(key: keyof T) {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else setSortKey(key);
  }

  function toggleRow(id: string | number) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAll()
  {
    const ids = paged.map(r => r.id);
    const allSelected = ids.every(id => selected.has(id));
    setSelected(prev => {
      const next = new Set(prev);
      ids.forEach(id => allSelected ? next.delete(id) : next.add(id));
      return next;
    });
  }

  return (
    <div className="card" role="table" aria-label="Data table" style={{ overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 8, padding: 12, borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
        <input className="input" placeholder="Filter..." value={query} onChange={e => setQuery(e.target.value)} />
        <button className="btn" onClick={() => alert('Export CSV')}>Export CSV</button>
        <button className="btn" onClick={() => alert('Export PDF')}>Export PDF</button>
        {selected.size > 0 && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn warn" onClick={() => alert(`Bulk action on ${selected.size} rows`)}>Bulk Action</button>
          </div>
        )}
      </div>
      <div role="rowgroup">
        <div role="row" style={{ display: 'grid', gridTemplateColumns: `48px repeat(${columns.length}, 1fr)`, gap: 0, borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div role="columnheader" style={{ padding: 12 }}>
            <input aria-label="Select all" type="checkbox" onChange={toggleAll} checked={paged.every(r => selected.has(r.id)) && paged.length > 0} />
          </div>
          {columns.map(col => (
            <button key={String(col.key)} role="columnheader" className="btn ghost" onClick={() => toggleSort(col.key)} style={{ justifyContent: 'flex-start', borderRadius: 0 }}>
              {col.header}
              {sortKey === col.key && (sortDir === 'asc' ? ' ▲' : ' ▼')}
            </button>
          ))}
        </div>
        {paged.map(row => (
          <div key={String(row.id)} role="row" style={{ display: 'grid', gridTemplateColumns: `48px repeat(${columns.length}, 1fr)`, gap: 0, borderBottom: '1px solid var(--border)' }}>
            <div role="cell" style={{ padding: 12 }}>
              <input aria-label={`Select row ${row.id}`} type="checkbox" checked={selected.has(row.id)} onChange={() => toggleRow(row.id)} />
            </div>
            {columns.map(col => (
              <div key={String(col.key)} role="cell" style={{ padding: 12 }}>
                {col.render ? col.render(row[col.key], row) : String(row[col.key])}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, padding: 12, justifyContent: 'flex-end' }}>
        <button className="btn" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Prev</button>
        <div aria-live="polite" style={{ alignSelf: 'center' }}>Page {page + 1} / {Math.max(1, Math.ceil(filtered.length / pageSize))}</div>
        <button className="btn" onClick={() => setPage(p => (p + 1 < Math.ceil(filtered.length / pageSize)) ? p + 1 : p)} disabled={page + 1 >= Math.ceil(filtered.length / pageSize)}>Next</button>
      </div>
    </div>
  );
}