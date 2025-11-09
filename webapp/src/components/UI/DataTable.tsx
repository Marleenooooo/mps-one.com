import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../I18nProvider';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  const { t } = useI18n();
  const tableRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        setPage(p => Math.max(0, p - 1));
      } else if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        setPage(p => (p + 1 < Math.ceil(filtered.length / pageSize)) ? p + 1 : p);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [filtered.length, pageSize]);

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

  async function exportPDF() {
    if (!tableRef.current) return;
    const canvas = await html2canvas(tableRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const imgWidth = canvas.width * ratio;
    const imgHeight = canvas.height * ratio;
    const x = (pageWidth - imgWidth) / 2;
    const y = 24;
    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    pdf.save('table_export.pdf');
  }

  return (
    <div ref={tableRef} className="card" role="table" aria-label="Data table" style={{ overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 8, padding: 12, borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
        <input className="input" placeholder={t('datatable.filter')} value={query} onChange={e => setQuery(e.target.value)} />
        <button className="btn" onClick={() => exportCSV(filtered, columns)} aria-label={t('datatable.export_csv')}>{t('datatable.export_csv')}</button>
        <button className="btn" onClick={exportPDF} aria-label={t('datatable.export_pdf')} aria-keyshortcuts="Alt+P">{t('datatable.export_pdf')}</button>
        {selected.size > 0 && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn warn" onClick={() => alert(`Bulk action on ${selected.size} rows`)}>{t('datatable.bulk_action')}</button>
          </div>
        )}
      </div>
      <div role="rowgroup">
        <div role="row" style={{ display: 'grid', gridTemplateColumns: `48px repeat(${columns.length}, 1fr)`, gap: 0, borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div role="columnheader" style={{ padding: 12 }}>
            <input aria-label={t('datatable.select_all')} type="checkbox" onChange={toggleAll} checked={paged.every(r => selected.has(r.id)) && paged.length > 0} />
          </div>
          {columns.map(col => (
            <button
              key={String(col.key)}
              role="columnheader"
              className="btn ghost"
              onClick={() => toggleSort(col.key)}
              style={{ justifyContent: 'flex-start', borderRadius: 0 }}
              aria-sort={sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
              aria-keyshortcuts="Enter Space"
            >
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
        <button className="btn" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>{t('datatable.prev')}</button>
        <div aria-live="polite" style={{ alignSelf: 'center' }}>{t('datatable.page')} {page + 1} / {Math.max(1, Math.ceil(filtered.length / pageSize))}</div>
        <button className="btn" onClick={() => setPage(p => (p + 1 < Math.ceil(filtered.length / pageSize)) ? p + 1 : p)} disabled={page + 1 >= Math.ceil(filtered.length / pageSize)}>{t('datatable.next')}</button>
      </div>
    </div>
  );
}

function exportCSV<T extends { id: string | number }>(rows: T[], columns: { key: keyof T; header: string }[]) {
  if (!rows.length) return;
  const headers = columns.map(c => c.header);
  const escape = (val: unknown) => '"' + String(val ?? '').replace(/"/g, '""') + '"';
  const body = rows.map(r => columns.map(c => escape(r[c.key])).join(',')).join('\n');
  const csv = headers.join(',') + '\n' + body;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'table_export.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
