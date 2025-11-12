import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useModule } from '../../components/useModule';
import { useI18n } from '../../components/I18nProvider';
import * as pillarStorage from '../../services/pillarStorage';
import { canPerform } from '../../services/permissions';

type DataRow = Record<string, string | number>;

function downloadCSV(filename: string, rows: DataRow[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: string | number) => {
    const s = String(v);
    if (s.includes(',') || s.includes('\n') || s.includes('"')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => escape(r[h] ?? '')).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadPDF(filename: string, title: string, rows: DataRow[]) {
  // Lightweight, export-ready PDF placeholder using a simple HTML snapshot.
  // In production, replace with a PDF library (e.g., jsPDF) keeping this API.
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body>
  <h1 style="font-family: system-ui">${title}</h1>
  <table style="border-collapse: collapse; width: 100%; font-family: system-ui">
    <thead><tr>${headers.map(h => `<th style="border:1px solid #999;padding:6px;text-align:left">${h}</th>`).join('')}</tr></thead>
    <tbody>
      ${rows.map(r => `<tr>${headers.map(h => `<td style="border:1px solid #999;padding:6px">${String(r[h] ?? '')}</td>`).join('')}</tr>`).join('')}
    </tbody>
  </table>
  </body></html>`;
  const blob = new Blob([html], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Reporting() {
  useModule('reports');
  const { t } = useI18n();
  const [exporting, setExporting] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all'|'paid'|'neutral'|'waiting'|'next'|'over-due'>('all');
  const [dueWindow, setDueWindow] = useState<'all'|'7'|'14'|'30'|'over-due'>('all');

  const spendingData = useMemo(() => ([
    { month: 'Jan', amount: 120_000_000 },
    { month: 'Feb', amount: 95_000_000 },
    { month: 'Mar', amount: 160_000_000 },
    { month: 'Apr', amount: 140_000_000 },
    { month: 'May', amount: 180_000_000 },
    { month: 'Jun', amount: 200_000_000 },
  ]), []);

  const vendorScores = useMemo(() => ([
    { vendor: 'PT. Batu Jaya', score: 86, onTime: '94%' },
    { vendor: 'CV. Mandiri Steel', score: 78, onTime: '89%' },
    { vendor: 'PT. Nusantara Logistik', score: 91, onTime: '97%' },
  ]), []);

  const budgets = useMemo(() => ([
    { dept: 'Operasional', used: 72 },
    { dept: 'Procurement', used: 58 },
    { dept: 'Finance', used: 33 },
  ]), []);

  const monthlyProcurement = useMemo(() => ([
    { month: 'Jan', pr: 18 },
    { month: 'Feb', pr: 22 },
    { month: 'Mar', pr: 15 },
    { month: 'Apr', pr: 25 },
    { month: 'May', pr: 28 },
    { month: 'Jun', pr: 31 },
  ]), []);

  type Invoice = { id: string; poId: string; amount: number; dueDate: string; paidAt?: string | null };
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 'INV-124', poId: 'PO-9821', amount: 50_000_000, dueDate: new Date(Date.now() + 5*24*3600*1000).toISOString(), paidAt: null },
    { id: 'INV-125', poId: 'PO-9821', amount: 75_000_000, dueDate: new Date(Date.now() - 3*24*3600*1000).toISOString(), paidAt: null },
    { id: 'INV-126', poId: 'PO-7777', amount: 40_000_000, dueDate: new Date(Date.now() + 15*24*3600*1000).toISOString(), paidAt: null },
    { id: 'INV-127', poId: 'PO-1200', amount: 20_000_000, dueDate: new Date(Date.now() - 1*24*3600*1000).toISOString(), paidAt: new Date().toISOString() },
  ]);

  // Modal state for creating a new invoice
  const [invoiceModal, setInvoiceModal] = useState<{ poId: string; amount: number; due: string } | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const amountRef = useRef<HTMLInputElement | null>(null);

  // Inline validation for invoice modal fields
  const amountError = useMemo(() => {
    if (!invoiceModal) return '';
    if (invoiceModal.amount <= 0) return 'Amount must be greater than 0';
    const remaining = remainingForPO(invoiceModal.poId);
    if (invoiceModal.amount > remaining) return 'Amount exceeds remaining deliverable';
    return '';
  }, [invoiceModal]);

  const dueError = useMemo(() => {
    if (!invoiceModal) return '';
    if (!invoiceModal.due) return 'Due date is required';
    const dueDt = new Date(invoiceModal.due);
    if (isNaN(dueDt.getTime())) return 'Invalid due date';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dueDt < today) return 'Due date must not be in the past';
    return '';
  }, [invoiceModal]);

  useEffect(() => {
    if (!invoiceModal) return;
    const el = modalRef.current;
    const focusables = (): HTMLElement[] => {
      const nodes = Array.from(
        el?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') || []
      );
      const elems = nodes.filter((e): e is HTMLElement => e instanceof HTMLElement);
      return elems.filter(e => !e.hasAttribute('disabled'));
    };
    const firstFocus = () => {
      setTimeout(() => {
        if (amountRef.current) amountRef.current.focus();
        else focusables()[0]?.focus();
      }, 0);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setInvoiceModal(null);
      } else if (e.key === 'Tab') {
        const f = focusables();
        if (f.length === 0) return;
        const active = document.activeElement as HTMLElement | null;
        const idx = active ? f.indexOf(active) : -1;
        if (e.shiftKey) {
          if (idx <= 0) {
            e.preventDefault();
            f[f.length - 1].focus();
          }
        } else {
          if (idx === f.length - 1) {
            e.preventDefault();
            f[0].focus();
          }
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    firstFocus();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [invoiceModal]);

  function derivePaymentStatus(inv: Invoice): { label: string; colorClass: string } {
    if (inv.paidAt) return { label: t('reporting.status.paid'), colorClass: 'success' };
    const now = Date.now();
    const due = new Date(inv.dueDate).getTime();
    if (now > due) return { label: t('reporting.status.over_due'), colorClass: 'danger' };
    const days = Math.ceil((due - now) / (24*3600*1000));
    if (days <= 7) return { label: t('reporting.status.waiting'), colorClass: 'warn' };
    if (days <= 14) return { label: t('reporting.status.next'), colorClass: 'success' };
    return { label: t('reporting.status.neutral'), colorClass: '' };
  }

  // Localization-safe status code for filtering logic
  function paymentStatusCode(inv: Invoice): 'paid'|'over-due'|'waiting'|'next'|'neutral' {
    if (inv.paidAt) return 'paid';
    const now = Date.now();
    const due = new Date(inv.dueDate).getTime();
    if (now > due) return 'over-due';
    const days = Math.ceil((due - now) / (24*3600*1000));
    if (days <= 7) return 'waiting';
    if (days <= 14) return 'next';
    return 'neutral';
  }

  function checkInvoiceGate(inv: Invoice): string | null {
    try {
      const gate = JSON.parse(pillarStorage.getItem('mpsone_available_to_invoice') || '{}');
      const g = gate[inv.poId];
      if (!g) return null;
      if (inv.amount > (g.deliveredAmount || 0)) return `Invoice exceeds delivered amount for ${inv.poId}`;
      return null;
    } catch { return null; }
  }

  function sumInvoicedForPO(poId: string): number {
    return invoices.filter(i => i.poId === poId).reduce((acc, i) => acc + i.amount, 0);
  }

  function remainingForPO(poId: string): number {
    try {
      const gate = JSON.parse(pillarStorage.getItem('mpsone_available_to_invoice') || '{}');
      const g = gate[poId];
      const deliveredAmount = g ? Number(g.deliveredAmount) : 0;
      return Math.max(0, deliveredAmount - sumInvoicedForPO(poId));
    } catch { return 0; }
  }

  function getDeliveryItems(poId: string): { id: string; name: string; received: number; correction: number; available: number }[] {
    try {
      const key = `mpsone_delivery_notes_${poId}`;
      const items = JSON.parse(pillarStorage.getItem(key) || '[]') as Array<{ id: string; name: string; receivedQty: number; correctionQty: number }>;
      return items.map(it => ({ id: it.id, name: it.name, received: it.receivedQty, correction: it.correctionQty, available: Math.max(0, (it.receivedQty || 0) + (it.correctionQty || 0)) }));
    } catch { return []; }
  }

  const exportSection = (key: string, rows: DataRow[], type: 'csv' | 'pdf' = 'csv') => {
    setExporting(key);
    setTimeout(() => {
      if (type === 'csv') downloadCSV(`${key}.csv`, rows);
      else downloadPDF(`${key}.pdf`, key, rows);
      setExporting(null);
    }, 300);
  };

  return (
    <div className="main">
      <div className="page-header reports">
        <h1 style={{ margin: 0 }}>{t('reports.title')}</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {/* Spending Analytics */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>{t('reports.spending_analytics')}</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn"
                onClick={() => exportSection('spending_analytics', spendingData, 'csv')}
                aria-busy={exporting === 'spending_analytics'}
                title={t('datatable.export_csv')}
              >
                {exporting === 'spending_analytics' ? '...' : 'CSV'}
              </button>
              <button
                className="btn outline"
                onClick={() => exportSection('spending_analytics', spendingData, 'pdf')}
                aria-busy={exporting === 'spending_analytics'}
                title={t('datatable.export_pdf')}
              >
                {exporting === 'spending_analytics' ? '...' : 'PDF'}
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'end', gap: 8, height: 160 }} aria-label="Spending bar chart">
            {spendingData.map(d => (
              <div key={d.month} title={`${d.month}: Rp ${d.amount.toLocaleString('id-ID')}`}
                   style={{
                     width: 40,
                     height: Math.max(24, (d.amount / 200_000_000) * 140),
                     background: 'linear-gradient(135deg, var(--primary-gradient-start) 0%, var(--primary-gradient-end) 100%)',
                     borderRadius: 6,
                     boxShadow: '0 4px 12px color-mix(in srgb, var(--primary-gradient-start) 40%, transparent)',
                     transition: 'transform 0.2s ease',
                   }}
                   onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                   onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              ></div>
            ))}
          </div>
        </div>

        {/* Vendor Performance */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>{t('reports.vendor_performance')}</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn"
                onClick={() => exportSection('vendor_performance', vendorScores, 'csv')}
                aria-busy={exporting === 'vendor_performance'}
                title="Export CSV"
              >
                {exporting === 'vendor_performance' ? '...' : 'CSV'}
              </button>
              <button
                className="btn outline"
                onClick={() => exportSection('vendor_performance', vendorScores, 'pdf')}
                aria-busy={exporting === 'vendor_performance'}
                title="Export PDF"
              >
                {exporting === 'vendor_performance' ? '...' : 'PDF'}
              </button>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
            <thead>
              <tr style={{ textAlign: 'left' }}>
                <th>Vendor</th>
                <th>Score</th>
                <th>On-Time</th>
              </tr>
            </thead>
            <tbody>
              {vendorScores.map(v => (
                <tr key={v.vendor}>
                  <td>{v.vendor}</td>
                  <td>
                    <span className={`status-badge ${v.score >= 85 ? 'success' : 'warn'}`} style={{ padding: '4px 8px', borderRadius: 999 }}>{v.score}</span>
                  </td>
                  <td>{v.onTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Budget Utilization */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>{t('reports.budget_utilization')}</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn"
                onClick={() => exportSection('budget_utilization', budgets, 'csv')}
                aria-busy={exporting === 'budget_utilization'}
                title="Export CSV"
              >
                {exporting === 'budget_utilization' ? '...' : 'CSV'}
              </button>
              <button
                className="btn outline"
                onClick={() => exportSection('budget_utilization', budgets, 'pdf')}
                aria-busy={exporting === 'budget_utilization'}
                title="Export PDF"
              >
                {exporting === 'budget_utilization' ? '...' : 'PDF'}
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {budgets.map(b => (
              <div key={b.dept}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>{b.dept}</span>
                  <span>{b.used}%</span>
                </div>
                <div className="progress-bar">
                  <div className="value" style={{ width: `${b.used}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Procurement */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>{t('reports.monthly_procurement')}</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn"
                onClick={() => exportSection('monthly_procurement', monthlyProcurement, 'csv')}
                aria-busy={exporting === 'monthly_procurement'}
                title="Export CSV"
              >
                {exporting === 'monthly_procurement' ? '...' : 'CSV'}
              </button>
              <button
                className="btn outline"
                onClick={() => exportSection('monthly_procurement', monthlyProcurement, 'pdf')}
                aria-busy={exporting === 'monthly_procurement'}
                title="Export PDF"
              >
                {exporting === 'monthly_procurement' ? '...' : 'PDF'}
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'end', gap: 8, height: 160 }} aria-label="Monthly PR bar chart">
            {monthlyProcurement.map(d => (
              <div key={d.month} title={`${d.month}: ${d.pr} PR`}
                   style={{
                     width: 40,
                     height: Math.max(24, (d.pr / 31) * 140),
                     background: 'linear-gradient(135deg, var(--secondary-gradient-start) 0%, var(--secondary-gradient-end) 100%)',
                     borderRadius: 6,
                     boxShadow: '0 4px 12px color-mix(in srgb, var(--secondary-gradient-start) 40%, transparent)',
                     transition: 'transform 0.2s ease',
                   }}
                   onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                   onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              ></div>
            ))}
          </div>
        </div>
      </div>
      {/* Invoices & Payment Status */}
      <div className="card" style={{ padding: 16, marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>Invoices & Payment Status</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Filters */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{t('datatable.status') || 'Status'}</span>
              <select className="input" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
                <option value="all">All</option>
                <option value="paid">{t('reporting.status.paid')}</option>
                <option value="neutral">{t('reporting.status.neutral')}</option>
                <option value="waiting">{t('reporting.status.waiting')} (≤7 {t('time.days')})</option>
                <option value="next">{t('reporting.status.next')} (≤14 {t('time.days')})</option>
                <option value="over-due">{t('reporting.status.over_due')}</option>
              </select>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--text-secondary)' }}>Due window</span>
              <select className="input" value={dueWindow} onChange={e => setDueWindow(e.target.value as any)}>
                <option value="all">All</option>
                <option value="7">≤ 7 {t('time.days')}</option>
                <option value="14">≤ 14 {t('time.days')}</option>
                <option value="30">≤ 30 {t('time.days')}</option>
                <option value="over-due">{t('reporting.status.over_due')}</option>
              </select>
            </label>
            <button
              className="btn"
              onClick={() => exportSection('invoice_statuses', invoices.map(i => ({ id: i.id, poId: i.poId, amount: i.amount, dueDate: i.dueDate, status: derivePaymentStatus(i).label })), 'csv')}
              aria-busy={exporting === 'invoice_statuses'}
              title="Export CSV"
            >
              {exporting === 'invoice_statuses' ? '...' : 'CSV'}
            </button>
            <button
              className="btn outline"
              onClick={() => exportSection('invoice_statuses', invoices.map(i => ({ id: i.id, poId: i.poId, amount: i.amount, dueDate: i.dueDate, status: derivePaymentStatus(i).label })), 'pdf')}
              aria-busy={exporting === 'invoice_statuses'}
              title="Export PDF"
            >
              {exporting === 'invoice_statuses' ? '...' : 'PDF'}
            </button>
          </div>
        </div>
        <table className="table" style={{ width: '100%', marginTop: 8 }}>
          <thead>
            <tr><th>Invoice</th><th>PO</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Gate</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {invoices.filter(inv => {
              const code = paymentStatusCode(inv);
              if (statusFilter !== 'all') {
                if (statusFilter !== code) return false;
              }
              if (dueWindow !== 'all') {
                const now = Date.now();
                const due = new Date(inv.dueDate).getTime();
                if (dueWindow === 'over-due') {
                  if (!(now > due && !inv.paidAt)) return false;
                } else {
                  const days = Math.ceil((due - now) / (24*3600*1000));
                  const max = parseInt(dueWindow, 10);
                  if (!(days <= max)) return false;
                }
              }
              return true;
            }).map(inv => {
              const st = derivePaymentStatus(inv);
              const gateWarn = checkInvoiceGate(inv);
              const remaining = remainingForPO(inv.poId);
              const canCreate = remaining > 0;
              return (
                <tr key={inv.id}>
                  <td>{inv.id}</td>
                  <td>{inv.poId}</td>
                  <td>Rp {inv.amount.toLocaleString('id-ID')}</td>
                  <td>{new Date(inv.dueDate).toLocaleDateString()}</td>
                  <td><span className={`status-badge ${st.colorClass}`}>{st.label}</span></td>
                  <td>{gateWarn ? <span className="status-badge warn">{gateWarn}</span> : '-'}</td>
                  <td>
                    <span className={canCreate ? '' : 'tooltip'} data-tip={canCreate ? undefined : t('reporting.insufficient_delivered_amount')}>
                      <button
                        className={`btn primary${canPerform('create:invoice') ? '' : ' disabled'}`}
                        disabled={!canCreate || !canPerform('create:invoice')}
                        aria-disabled={!canCreate || !canPerform('create:invoice')}
                        onClick={() => {
                          if (!canCreate || !canPerform('create:invoice')) return;
                          const defaultDue = new Date(Date.now() + 30*24*3600*1000).toISOString().slice(0,10);
                          const suggested = Math.min(remaining, 10_000_000);
                          setInvoiceModal({ poId: inv.poId, amount: suggested, due: defaultDue });
                        }}
                      >
                        {t('reporting.create_invoice')}
                      </button>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {invoiceModal && (
          <div role="dialog" aria-modal="true" aria-labelledby="create-invoice-title" aria-describedby="create-invoice-desc" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center' }}>
            <div ref={modalRef} className="card" style={{ width: 640, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 id="create-invoice-title" style={{ margin: 0 }}>{t('reporting.create_invoice')}</h3>
                <button className="btn ghost" aria-label="Close" onClick={() => setInvoiceModal(null)}>✕</button>
              </div>
              <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
                <div><span style={{ color: 'var(--text-secondary)' }}>PO</span> <strong>{invoiceModal.poId}</strong></div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>{t('reporting.remaining_deliverable')}</span> {' '}
                  <span className="status-badge info">Rp {remainingForPO(invoiceModal.poId).toLocaleString('id-ID')}</span>
                </div>
                <div className="card" style={{ padding: 12 }} aria-label="Delivery References">
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{t('reporting.delivery_references')}</div>
                  <table className="table" style={{ width: '100%' }}>
                    <thead>
                      <tr><th>{t('delivery.table.item')}</th><th>{t('delivery.table.received')}</th><th>{t('delivery.table.correction')}</th><th>{t('delivery.table.available_to_invoice')}</th></tr>
                    </thead>
                    <tbody>
                      {getDeliveryItems(invoiceModal.poId).map(ref => (
                        <tr key={ref.id}>
                          <td>{ref.name}</td>
                          <td>{ref.received}</td>
                          <td>{ref.correction}</td>
                          <td><span className="status-badge success">{ref.available}</span></td>
                        </tr>
                      ))}
                      {getDeliveryItems(invoiceModal.poId).length === 0 && (
                        <tr><td colSpan={4} style={{ color: 'var(--text-secondary)' }}>{t('reporting.no_delivery_records')}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span>Amount</span>
                  <input
                    className="input"
                    type="number"
                    min={0}
                    ref={amountRef}
                    value={invoiceModal.amount}
                    onChange={e => setInvoiceModal(m => m ? { ...m, amount: Number(e.target.value || 0) } : m)}
                    aria-invalid={Boolean(amountError)}
                    aria-describedby={amountError ? 'inv-amount-err' : undefined}
                  />
                  {amountError && (
                    <div id="inv-amount-err" role="alert" style={{ color: 'var(--secondary-gradient-start)', fontSize: 12 }}>
                      {amountError}
                    </div>
                  )}
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span>Due Date</span>
                  <input
                    className="input"
                    type="date"
                    value={invoiceModal.due}
                    onChange={e => setInvoiceModal(m => m ? { ...m, due: e.target.value } : m)}
                    aria-invalid={Boolean(dueError)}
                    aria-describedby={dueError ? 'inv-due-err' : undefined}
                  />
                  {dueError && (
                    <div id="inv-due-err" role="alert" style={{ color: 'var(--secondary-gradient-start)', fontSize: 12 }}>
                      {dueError}
                    </div>
                  )}
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                <button className="btn" onClick={() => setInvoiceModal(null)}>Cancel</button>
                <button
                  className="btn primary"
                  disabled={Boolean(amountError || dueError)}
                  aria-disabled={Boolean(amountError || dueError)}
                  onClick={() => {
                    const dueISO = new Date(invoiceModal.due).toISOString();
                    const newId = 'INV-' + Math.floor(Math.random() * 900 + 100);
                    setInvoices(prev => ([...prev, { id: newId, poId: invoiceModal.poId, amount: invoiceModal.amount, dueDate: dueISO, paidAt: null }]));
                    setInvoiceModal(null);
                  }}
                >
                  Create
                </button>
              </div>
              <div id="create-invoice-desc" style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
                Invoices must not exceed delivered totals. Partial invoices are allowed. Press Escape to close.
              </div>
            </div>
          </div>
        )}
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
          Payment status follows 30-day calendar logic; invoice gating enforces sum(invoice.amount) ≤ sum(delivered.amount).
        </div>
      </div>
    </div>
  );
}
