import React, { useEffect, useMemo, useState } from 'react';
import * as pillarStorage from '../../services/pillarStorage';
import { useParams, useNavigate } from 'react-router-dom';
import { Topbar, Breadcrumbs } from '../../components/Layout/Topbar';
import { AuditTimeline } from '../../components/UI/AuditTimeline';
import { formatIDR } from '../../components/utils/format';
import { useI18n } from '../../components/I18nProvider';
import { canPerform } from '../../services/permissions';

type QuoteVersion = { version: number; total: number; taxPct: number; discountPct: number; validUntil: string; status?: 'accepted' | 'pending' | 'rejected' };

export default function QuoteComparison() {
  const { prId } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const userType = (typeof localStorage !== 'undefined' ? localStorage.getItem('mpsone_user_type') : null);
  const [quotes, setQuotes] = useState<Record<string, QuoteVersion[]>>(() => {
    try { return JSON.parse(pillarStorage.getItem(`mpsone_quotes_${prId}`) || '{}'); } catch { return {}; }
  });

  useEffect(() => {
    if (userType !== 'client') {
      try { navigate('/procurement/workflow', { replace: true }); } catch {}
      return;
    }
    // Guard: only allow viewing comparison for Approved PRs
    try {
      const rows = JSON.parse(localStorage.getItem('mock_pr_rows') || '[]');
      const approved = Array.isArray(rows) && rows.some((r: any) => String(r.id) === String(prId) && r.status === 'Approved');
      if (!approved) {
        navigate('/procurement/workflow', { replace: true });
        return;
      }
    } catch {}
    // Seed quotes if none exist based on sent_to suppliers
    try {
      const map = JSON.parse(pillarStorage.getItem('mpsone_pr_sent') || '{}');
      const sent = map[String(prId)] || [];
      let changed = false;
      const next: Record<string, QuoteVersion[]> = { ...quotes };
      sent.forEach((s: any, idx: number) => {
        if (!next[s.supplierId]) {
          const base = 1000000 + idx * 250000;
          next[s.supplierId] = [
            { version: 1, total: base, taxPct: 11, discountPct: 0, validUntil: new Date(Date.now() + 7*24*3600*1000).toISOString(), status: 'pending' },
            { version: 2, total: base * 0.98, taxPct: 11, discountPct: 2, validUntil: new Date(Date.now() + 10*24*3600*1000).toISOString(), status: 'pending' },
          ];
          changed = true;
        }
      });
      if (changed) {
        setQuotes(next);
        pillarStorage.setItem(`mpsone_quotes_${prId}`, JSON.stringify(next));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prId]);

  function acceptQuote(supplierId: string, version: number) {
    const next = { ...quotes };
    const list = (next[supplierId] || []).map(q => ({ ...q, status: q.version === version ? 'accepted' : q.status }));
    next[supplierId] = list;
    setQuotes(next);
    try {
      pillarStorage.setItem(`mpsone_quotes_${prId}`, JSON.stringify(next));
      const acceptedMap = JSON.parse(pillarStorage.getItem('mpsone_quote_accepted') || '{}');
      acceptedMap[String(prId)] = { supplierId, version };
      pillarStorage.setItem('mpsone_quote_accepted', JSON.stringify(acceptedMap));
      const audit = JSON.parse(pillarStorage.getItem('mpsone_audit_trail') || '{}');
      const key = `PR:${String(prId)}`;
      const listAudit = Array.isArray(audit[key]) ? audit[key] : [];
      listAudit.push({ entity: 'PR', id: String(prId), action: 'quote_approved', actorRole: localStorage.getItem('mpsone_role'), actorType: localStorage.getItem('mpsone_user_type'), at: Date.now(), comment: `Supplier ${supplierId} v${version}` });
      audit[key] = listAudit;
      pillarStorage.setItem('mpsone_audit_trail', JSON.stringify(audit));
      alert(t('quote.approved_alert').replace('{version}', String(version)).replace('{supplier}', String(supplierId)) || `Approved quote v${version} from ${supplierId}. You can now generate a PO.`);
    } catch {}
  }

  function rejectQuote(supplierId: string, version: number) {
    const next = { ...quotes };
    const list = (next[supplierId] || []).map(q => ({ ...q, status: q.version === version ? 'rejected' : q.status }));
    next[supplierId] = list;
    setQuotes(next);
    try {
      pillarStorage.setItem(`mpsone_quotes_${prId}`, JSON.stringify(next));
      const audit = JSON.parse(pillarStorage.getItem('mpsone_audit_trail') || '{}');
      const key = `PR:${String(prId)}`;
      const listAudit = Array.isArray(audit[key]) ? audit[key] : [];
      listAudit.push({ entity: 'PR', id: String(prId), action: 'quote_rejected', actorRole: localStorage.getItem('mpsone_role'), actorType: localStorage.getItem('mpsone_user_type'), at: Date.now(), comment: `Supplier ${supplierId} v${version}` });
      audit[key] = listAudit;
      pillarStorage.setItem('mpsone_audit_trail', JSON.stringify(audit));
      alert(t('quote.rejected_alert').replace('{version}', String(version)).replace('{supplier}', String(supplierId)) || `Rejected quote v${version} from ${supplierId}.`);
    } catch {}
  }

  const supplierIds = useMemo(() => Object.keys(quotes), [quotes]);

  return (
    <div className="main" data-module="procurement">
      <Topbar>
        <Breadcrumbs items={["Client", "Quote Comparison"]} />
      </Topbar>
      <div className="page-header procurement" role="region" aria-label="Quote Comparison Header">
        <h1 style={{ margin: 0 }}>{t('quotes.title') || 'Quote Comparison'}</h1>
        <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
          {t('quotes.subtitle').replace('{pr}', String(prId)) || `Compare quotes per supplier for PR ${String(prId)}, review versions, totals, tax/discount, validity, and accept.`}
        </p>
      </div>
      <AuditTimeline entity="PR" refId={String(prId)} title="PR Audit Timeline" limit={6} />
      {supplierIds.length === 0 && (
        <div className="card" style={{ padding: 16, marginTop: 16 }}>
          <div>{t('quotes.none_hint') || 'No quotes yet. Use "Send PR to suppliers" from PR List, then check back.'}</div>
        </div>
      )}
      {supplierIds.map((sid) => (
        <div key={sid} className="card" style={{ padding: 16, marginTop: 16, borderImage: 'linear-gradient(90deg, var(--module-color), var(--module-gradient-end)) 1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>Supplier: {sid}</h3>
            <a className="btn outline" href="/client/suppliers">Manage Suppliers</a>
          </div>
          <table className="table" style={{ width: '100%', marginTop: 8 }}>
            <thead>
              <tr><th>{t('quote.version') || 'Version'}</th><th>{t('quote.total') || 'Total'}</th><th>{t('quote.tax_rate') || 'Tax'}</th><th>{t('quote.discount') || 'Discount'}</th><th>{t('quote.valid_until') || 'Valid Until'}</th><th>{t('status.label') || 'Status'}</th><th>{t('actions.label') || 'Actions'}</th></tr>
            </thead>
            <tbody>
              {(quotes[sid] || []).map(q => (
                <tr key={q.version}>
                  <td>v{q.version}</td>
                  <td>{formatIDR(q.total, 'ID')}</td>
                  <td>{q.taxPct}%</td>
                  <td>{q.discountPct}%</td>
                  <td>{new Date(q.validUntil).toLocaleDateString()}</td>
                  <td><span className={`status-badge ${q.status === 'accepted' ? 'success' : (q.status === 'rejected' ? 'danger' : 'info')}`}>{q.status || 'pending'}</span></td>
                  <td>
                    {q.status === 'accepted' ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn" aria-disabled={!canPerform('create:po')} onClick={() => {
                          try {
                            const poSeed = { prId, supplierId: sid, version: q.version };
                            pillarStorage.setItem('mpsone_po_from_quote', JSON.stringify(poSeed));
                            const audit = JSON.parse(pillarStorage.getItem('mpsone_audit_trail') || '{}');
                            const key = `PR:${String(prId)}`;
                            const listAudit = Array.isArray(audit[key]) ? audit[key] : [];
                            listAudit.push({ entity: 'PR', id: String(prId), action: 'po_generate', actorRole: localStorage.getItem('mpsone_role'), actorType: localStorage.getItem('mpsone_user_type'), at: Date.now(), comment: `From ${sid} v${q.version}` });
                            audit[key] = listAudit;
                            pillarStorage.setItem('mpsone_audit_trail', JSON.stringify(audit));
                          } catch {}
                          navigate('/procurement/po/preview');
                        }}>{t('po.generate_from_quote') || 'Generate PO'}</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn" aria-disabled={!canPerform('evaluate:quotes')} onClick={() => acceptQuote(sid, q.version)}>{t('action.approve_quote') || 'Approve Quote'}</button>
                        <button className="btn outline" onClick={() => rejectQuote(sid, q.version)}>{t('action.reject_quote') || 'Reject Quote'}</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
