import React, { useEffect, useMemo, useState } from 'react';
import { useModule } from '../../components/useModule';
import { useI18n } from '../../components/I18nProvider';
import { canPerform } from '../../services/permissions';
import { DataTable } from '../../components/UI/DataTable';
import { invoiceMatchingService, type InvoiceMatching } from '../../services/invoiceMatchingService';

const InvoiceMatchingManager: React.FC = () => {
  useModule('procurement');
  const { t } = useI18n();
  const [matchings, setMatchings] = useState<InvoiceMatching[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const rows = await invoiceMatchingService.getInvoiceMatchings();
      setMatchings(rows);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleProcessMatching = async (id: number) => {
    try {
      await invoiceMatchingService.processMatching(id);
      await loadData();
    } catch (e) {
      setError(String(e));
    }
  };

  const handleResolveException = async (id: number) => {
    try {
      setMatchings(prev => prev.map(m => m.id === id ? { ...m, status: 'approved', exception_count: 0, manual_override: true, updated_at: new Date().toISOString() } : m));
    } catch (e) {
      setError(String(e));
    }
  };

  const filteredMatchings = useMemo(() => {
    return matchings.filter(m => statusFilter === 'all' ? true : m.status === statusFilter);
  }, [matchings, statusFilter]);

  const stats = useMemo(() => {
    const total = matchings.length;
    const matched = matchings.filter(m => m.status === 'matched').length;
    const exceptions = matchings.filter(m => m.status === 'exception').length;
    const pending = matchings.filter(m => m.status === 'pending').length;
    return { total, matched, exceptions, pending };
  }, [matchings]);

  const columns = [
    { key: 'invoice_number', header: t('invoiceMatching.invoiceNumber') },
    { key: 'vendor_name', header: t('invoiceMatching.vendor') },
    { key: 'matching_type', header: t('invoiceMatching.matchingType') },
    { key: 'status', header: t('invoiceMatching.status'), render: (v: string) => (
      <span className={`status-badge ${v === 'matched' ? 'success' : v === 'exception' ? 'warning' : v === 'rejected' ? 'danger' : 'info'}`}>{t(`invoiceMatching.status.${v}`)}</span>
    ) },
    { key: 'matching_score', header: t('invoiceMatching.matchingScore'), render: (v: number | undefined) => v != null ? `${v}%` : '-' },
    { key: 'exception_count', header: t('invoiceMatching.exceptions') },
    { key: 'invoice_date', header: t('invoiceMatching.date') || 'Date', render: (v: string) => new Date(v).toLocaleDateString() },
    { key: 'actions' as keyof InvoiceMatching, header: t('action.actions') || 'Actions', render: (_: any, row: InvoiceMatching) => (
      <div className="btn-row">
        <button className="btn sm outline" onClick={() => handleProcessMatching(row.id)} disabled={!canPerform('process:invoice-matching') || row.status !== 'pending'}>{t('invoiceMatching.actions.process') || 'Process'}</button>
        <button className="btn sm" onClick={() => handleResolveException(row.id)} disabled={!canPerform('resolve:matching-exceptions') || row.status !== 'exception'}>{t('invoiceMatching.actions.resolve') || 'Resolve'}</button>
      </div>
    ) },
  ];

  return (
    <div className="main" data-module="procurement">
      <div className="page-header procurement">
        <h1 style={{ margin: 0 }}>{t('invoiceMatching.title')}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={loadData}>{t('action.refresh') || 'Refresh'}</button>
          <select className="input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">{t('invoiceMatching.allStatuses') || 'All Statuses'}</option>
            <option value="pending">{t('invoiceMatching.status.pending')}</option>
            <option value="matched">{t('invoiceMatching.status.matched')}</option>
            <option value="exception">{t('invoiceMatching.status.exception')}</option>
            <option value="approved">{t('invoiceMatching.status.approved')}</option>
            <option value="rejected">{t('invoiceMatching.status.rejected')}</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="card" style={{ padding: 12, borderLeft: '4px solid var(--danger)' }}>
          <div style={{ color: 'var(--danger)' }}>{t('action.error') || 'Error'}: {error}</div>
        </div>
      )}

      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <div className="card" style={{ padding: 12 }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{t('invoiceMatching.stats.total')}</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.total}</div>
          </div>
          <div className="card" style={{ padding: 12 }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{t('invoiceMatching.stats.matched')}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--success)' }}>{stats.matched}</div>
          </div>
          <div className="card" style={{ padding: 12 }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{t('invoiceMatching.stats.exceptions')}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--warning)' }}>{stats.exceptions}</div>
          </div>
          <div className="card" style={{ padding: 12 }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{t('invoiceMatching.stats.pending')}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--info)' }}>{stats.pending}</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <DataTable data={filteredMatchings} columns={columns as any} pageSize={8} />
      </div>
      {loading && (
        <div className="card" style={{ padding: 12, marginTop: 12 }}>
          <div className="skeleton" style={{ height: 24 }}></div>
        </div>
      )}
    </div>
  );
};

export default InvoiceMatchingManager;
