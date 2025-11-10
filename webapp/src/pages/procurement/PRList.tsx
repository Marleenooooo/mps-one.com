import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useModule } from '../../components/useModule';
import { DataTable } from '../../components/UI/DataTable';
import { computeOverscan } from '../../config';
import { useI18n } from '../../components/I18nProvider';
import { uniqueId } from '../../components/utils/uniqueId';

type PRRow = { id: string; title: string; department: string; status: 'Draft' | 'Submitted' | 'Approved' | 'PO'; createdAt: string; actions?: string };

export default function PRList() {
  useModule('procurement');
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [rows, setRows] = useState<PRRow[]>(() => {
    const now = new Date().toISOString();
    return [
      { id: 'PR-443', title: 'Hydraulic Hoses', department: 'Mining Ops', status: 'PO', createdAt: now, actions: '' },
      { id: 'PR-444', title: 'Excavator Bucket', department: 'Maintenance', status: 'Approved', createdAt: now, actions: '' },
      { id: 'PR-445', title: 'Safety Helmets', department: 'Logistics', status: 'Submitted', createdAt: now, actions: '' },
    ];
  });

  const insertedDraftRef = useRef(false);
  useEffect(() => {
    if (insertedDraftRef.current) return; // Guard against React StrictMode double-invoke
    insertedDraftRef.current = true;
    try {
      const draft = localStorage.getItem('mpsone_pr_draft');
      if (draft) {
        const d = JSON.parse(draft);
        const id = uniqueId('PR');
        setRows(prev => [{ id, title: d.title || 'Draft PR', department: d.department || 'Unknown', status: 'Draft', createdAt: new Date().toISOString(), actions: '' }, ...prev]);
      }
    } catch {}
  }, []);

  // Auto-export via routing: /procurement/pr?action=export
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'export') {
      setTimeout(() => {
        try {
          exportCSV(rows);
          navigate('/procurement/pr', { replace: true });
        } catch {}
      }, 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  function sendToSuppliers(prId: string) {
    try {
      const suppliers = JSON.parse(localStorage.getItem('mpsone_suppliers') || '[]');
      const now = Date.now();
      const sent = suppliers.map((s: any) => ({ supplierId: s.id, at: now }));
      const map = JSON.parse(localStorage.getItem('mpsone_pr_sent') || '{}');
      map[prId] = sent;
      localStorage.setItem('mpsone_pr_sent', JSON.stringify(map));
      alert(`Sent PR ${prId} to ${sent.length} suppliers`);
    } catch {}
  }

  function countSent(prId: string): number {
    try {
      const map = JSON.parse(localStorage.getItem('mpsone_pr_sent') || '{}');
      return Array.isArray(map[prId]) ? map[prId].length : 0;
    } catch { return 0; }
  }

  return (
    <div className="main" role="main" aria-label={t('pr.header')}>
      <div className="page-header procurement">
        <h1 style={{ margin: 0 }}>{t('pr.header')}</h1>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        <div className="status-badge info">{rows.length} {t('pr.total')}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="/procurement/pr/new" className="btn primary">{t('pr.new_pr')}</a>
          <button className="btn" onClick={() => exportCSV(rows)} aria-label={t('action.export_csv') || 'Export CSV'}>{t('action.export_csv') || 'Export CSV'}</button>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <DataTable
          data={rows}
          columns={[
            { key: 'id', header: t('pr.id') },
            { key: 'title', header: t('pr.title_label') },
            { key: 'department', header: t('pr.department') },
            { key: 'status', header: t('pr.status'), render: v => <span className="status-badge info">{v}</span> },
            { key: 'createdAt', header: t('pr.created') },
            { key: 'actions', header: 'Actions', render: (_v, row) => (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn outline" onClick={() => sendToSuppliers(row.id)}>Send PR to suppliers</button>
                <a className="btn" href={`/client/quotes/${encodeURIComponent(row.id)}`}>Compare quotes</a>
                {countSent(row.id) > 0 && (
                  <span className="status-badge info">Sent to {countSent(row.id)}</span>
                )}
              </div>
            ) },
          ]}
          virtualize
          height={360}
          rowHeight={48}
          overscan={computeOverscan('prList')}
        />
      </div>
    </div>
  );
}

function exportCSV(rows: { id: string; title: string; department: string; status: string; createdAt: string }[]) {
  const headers = ['ID','Title','Department','Status','CreatedAt'];
  const escape = (val: string) => '"' + String(val).replace(/"/g, '""') + '"';
  const body = rows.map(r => [r.id, r.title, r.department, r.status, r.createdAt].map(escape).join(',')).join('\n');
  const csv = headers.join(',') + '\n' + body;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'purchase_requests.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
