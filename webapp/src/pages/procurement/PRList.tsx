import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useModule } from '../../components/useModule';
import { DataTable } from '../../components/UI/DataTable';
import { AuditTimeline } from '../../components/UI/AuditTimeline';
import { computeOverscan, getOfflineMode } from '../../config';
import { useI18n } from '../../components/I18nProvider';
import { uniqueId } from '../../components/utils/uniqueId';
import { apiListPR } from '../../services/api';
import * as pillarStorage from '../../services/pillarStorage';
import { canPerform } from '../../services/permissions';

type PRRow = { id: string; title: string; department: string; status: 'Draft' | 'Submitted' | 'Approved' | 'PO'; createdAt: string; actions?: string };

export default function PRList() {
  useModule('procurement');
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [rows, setRows] = useState<PRRow[]>([]);
  const offline = getOfflineMode();

  // When offline, hydrate list from mock store via API layer
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!offline) {
        // Keep the original demo rows when online
        const now = new Date().toISOString();
        if (!cancelled) setRows([
          { id: 'PR-443', title: 'Hydraulic Hoses', department: 'Mining Ops', status: 'PO', createdAt: now, actions: '' },
          { id: 'PR-444', title: 'Excavator Bucket', department: 'Maintenance', status: 'Approved', createdAt: now, actions: '' },
          { id: 'PR-445', title: 'Safety Helmets', department: 'Logistics', status: 'Submitted', createdAt: now, actions: '' },
        ]);
        return;
      }
      try {
        const res = await apiListPR();
        const mapped: PRRow[] = (res.rows ?? []).map((r: any) => ({
          id: String(r.id),
          title: r.title || 'Untitled',
          department: r.department || 'Procurement',
          status: (r.status || 'Draft') as PRRow['status'],
          createdAt: r.need_date || new Date().toISOString(),
          actions: '',
        }));
        if (!cancelled) setRows(mapped);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [offline]);

  const insertedDraftRef = useRef(false);
  useEffect(() => {
    if (insertedDraftRef.current) return; // Guard against React StrictMode double-invoke
    insertedDraftRef.current = true;
    try {
      const draft = pillarStorage.getItem('mpsone_pr_draft');
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

  const role = (typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_role') : null);
  const userType = (typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_user_type') : null);

  function logAudit(entry: { entity: 'PR'; id: string; action: string; actorRole: string | null; actorType: string | null; at: number; comment?: string }) {
    try {
      const map = JSON.parse(pillarStorage.getItem('mpsone_audit_trail') || '{}');
      const key = `PR:${entry.id}`;
      const list = Array.isArray(map[key]) ? map[key] : [];
      list.push(entry);
      map[key] = list;
      pillarStorage.setItem('mpsone_audit_trail', JSON.stringify(map));
    } catch {}
  }

  function updateStatus(id: string, nextStatus: PRRow['status'], comment?: string) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, status: nextStatus } : r));
    logAudit({ entity: 'PR', id, action: `status:${nextStatus.toLowerCase()}`, actorRole: role, actorType: userType, at: Date.now(), comment });
  }

  function submitPR(id: string) {
    updateStatus(id, 'Submitted');
  }

  function approvePR(id: string) {
    updateStatus(id, 'Approved');
  }

  function rejectPR(id: string) {
    updateStatus(id, 'Draft', 'Rejected to Draft');
  }

  function sendToSuppliers(prId: string) {
    const pr = rows.find(r => r.id === prId);
    if (!pr || pr.status !== 'Approved') {
      alert(t('gating.approval_required_send') || 'Only Approved PRs can be sent to suppliers. Please get Finance/Admin approval first.');
      return;
    }
    try {
      const suppliers = JSON.parse(pillarStorage.getItem('mpsone_suppliers') || '[]');
      const now = Date.now();
      const sent = suppliers.map((s: any) => ({ supplierId: s.id, at: now }));
      const map = JSON.parse(pillarStorage.getItem('mpsone_pr_sent') || '{}');
      map[prId] = sent;
      pillarStorage.setItem('mpsone_pr_sent', JSON.stringify(map));
      logAudit({ entity: 'PR', id: prId, action: 'sent_to_suppliers', actorRole: role, actorType: userType, at: now, comment: `Sent to ${sent.length} suppliers` });
      alert(`Sent PR ${prId} to ${sent.length} suppliers`);
    } catch {}
  }

  function countSent(prId: string): number {
    try {
      const map = JSON.parse(pillarStorage.getItem('mpsone_pr_sent') || '{}');
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
          <a
            href={canPerform('create:pr') ? "/procurement/pr/new" : undefined}
            className={`btn primary${canPerform('create:pr') ? '' : ' disabled'}`}
            aria-disabled={!canPerform('create:pr')}
            onClick={e => { if (!canPerform('create:pr')) e.preventDefault(); }}
          >{t('pr.new_pr')}</a>
          <button className="btn" onClick={() => exportCSV(rows)} aria-label={t('action.export_csv') || 'Export CSV'}>{t('action.export_csv') || 'Export CSV'}</button>
        </div>
      </div>
      <div style={{ marginTop: 16, fontSize: 14, lineHeight: 1.4 }}>
        <DataTable
          data={rows}
          columns={[
            { key: 'id', header: t('pr.id') },
            { key: 'title', header: t('pr.title_label') },
            { key: 'department', header: t('pr.department') },
            { key: 'status', header: t('pr.status'), render: v => <span className="status-badge info">{v}</span> },
            { key: 'createdAt', header: t('pr.created') },
            { key: 'actions', header: 'Actions', render: (_v, row) => (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {row.status === 'Draft' && (
                  <button
                    className={`btn sm${canPerform('create:pr') ? '' : ' disabled'}`}
                    aria-disabled={!canPerform('create:pr')}
                    onClick={() => { if (canPerform('create:pr')) submitPR(row.id); }}
                  >{t('action.submit_pr')}</button>
                )}
                {row.status === 'Submitted' && (
                  <>
                    <button
                      className={`btn success sm${canPerform('approve:pr') ? '' : ' disabled'}`}
                      aria-disabled={!canPerform('approve:pr')}
                      onClick={() => { if (canPerform('approve:pr')) approvePR(row.id); }}
                    >{t('action.approve') || 'Approve'}</button>
                    <button
                      className={`btn danger sm${canPerform('reject:pr') ? '' : ' disabled'}`}
                      aria-disabled={!canPerform('reject:pr')}
                      onClick={() => { if (canPerform('reject:pr')) rejectPR(row.id); }}
                    >{t('action.reject') || 'Reject'}</button>
                  </>
                )}
                <button
                  className={`btn outline sm${canPerform('send:pr') ? '' : ' disabled'}`}
                  aria-disabled={!canPerform('send:pr') || row.status !== 'Approved'}
                  onClick={() => { if (canPerform('send:pr')) sendToSuppliers(row.id); }}
                  disabled={row.status !== 'Approved'}
                  title={row.status !== 'Approved' ? (t('gating.approval_required_send') || 'Only Approved PRs can be sent') : undefined}
                >{t('action.send_pr_to_suppliers')}</button>
                <a className={`btn sm${row.status !== 'Approved' ? ' disabled' : ''}`} aria-disabled={row.status !== 'Approved'} href={row.status === 'Approved' ? `/client/quotes/${encodeURIComponent(row.id)}` : undefined} onClick={e => { if (row.status !== 'Approved') { e.preventDefault(); alert(t('gating.approval_required_compare') || 'Approve PR to compare quotes.'); } }}>{t('action.compare_quotes') || 'Compare quotes'}</a>
                {countSent(row.id) > 0 && (
                  <span className="status-badge info">Sent to {countSent(row.id)}</span>
                )}
              </div>
            ) },
          ]}
          virtualize={true}
          height={480}
          rowHeight={48}
          overscan={computeOverscan('prList')}
        />
      </div>
      <AuditTimeline entity="PR" title="Recent PR Audit" limit={6} />
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
