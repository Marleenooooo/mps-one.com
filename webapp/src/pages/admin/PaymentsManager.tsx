import React, { useEffect, useMemo, useState } from 'react';
import { useModule } from '../../components/useModule';
import { useI18n } from '../../components/I18nProvider';
import { DataTable } from '../../components/UI/DataTable';
import { canPerform } from '../../services/permissions';
import { paymentService, type PaymentRun, type Payment, type PaymentMethod, type BankStatement, type BankStatementTransaction } from '../../services/paymentService';

type TabKey = 'runs' | 'payments' | 'methods' | 'reconciliation';

export default function PaymentsManager() {
  useModule('procurement');
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TabKey>('runs');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runs, setRuns] = useState<PaymentRun[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [statements, setStatements] = useState<BankStatement[]>([]);
  const [transactions, setTransactions] = useState<BankStatementTransaction[]>([]);
  const [selectedStatementId, setSelectedStatementId] = useState<number | null>(null);
  const [companyId] = useState(1);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [r, p, m, s] = await Promise.all([
        paymentService.getPaymentRuns(companyId),
        paymentService.getPayments(companyId),
        paymentService.getPaymentMethods(companyId),
        paymentService.getBankStatements(companyId),
      ]);
      setRuns(r);
      setPayments(p);
      setMethods(m);
      setStatements(s);
      if (s.length && !selectedStatementId) setSelectedStatementId(s[0].id);
    } catch (e: any) {
      setError(String(e?.message || 'error'));
    } finally {
      setLoading(false);
    }
  }

  async function handleScheduleRun(id: number) {
    const scheduled = await paymentService.schedulePaymentRun(id, 1);
    if (scheduled) setRuns(prev => prev.map(r => r.id === id ? scheduled : r));
  }
  async function handleApproveRun(id: number) {
    const approved = await paymentService.approvePaymentRun(id, 1);
    if (approved) setRuns(prev => prev.map(r => r.id === id ? approved : r));
  }
  async function handleExecuteRun(id: number) {
    const done = await paymentService.executePaymentRun(id, 1);
    if (done) setRuns(prev => prev.map(r => r.id === id ? done : r));
    const ps = await paymentService.getPayments(companyId);
    setPayments(ps);
  }
  async function handleToggleMethod(id: number) {
    const updated = await paymentService.togglePaymentMethod(id);
    if (updated) setMethods(prev => prev.map(m => m.id === id ? updated : m));
  }
  async function handleDeleteMethod(id: number) {
    const ok = await paymentService.deletePaymentMethod(id);
    if (ok) setMethods(prev => prev.filter(m => m.id !== id));
  }
  async function handleSelectStatement(id: number) {
    setSelectedStatementId(id);
    const txns = await paymentService.getBankTransactions(id);
    setTransactions(txns);
  }
  async function handleReconcile(paymentId: number, tx: BankStatementTransaction) {
    const updated = await paymentService.reconcile(paymentId, tx.reference_number || 'REF', tx.amount);
    if (updated) setPayments(prev => prev.map(p => p.id === paymentId ? updated : p));
  }

  const runColumns = useMemo(() => [
    { key: 'run_name', header: t('payments.run_name') || 'Run Name' },
    { key: 'run_date', header: t('payments.run_date') || 'Run Date' },
    { key: 'status', header: t('payments.status') || 'Status' },
    { key: 'total_payments', header: t('payments.total_payments') || 'Payments' },
    { key: 'total_amount', header: t('payments.total_amount') || 'Total Amount' },
    { key: 'actions' as keyof PaymentRun, header: t('action.actions') || 'Actions', render: (_: any, row: PaymentRun) => (
      <div className="btn-row">
        <button className="btn sm outline" onClick={() => handleScheduleRun(row.id)} disabled={!canPerform('schedule:payment-run') || !(row.status === 'draft')}>{t('payments.actions.schedule') || 'Schedule'}</button>
        <button className="btn sm" onClick={() => handleApproveRun(row.id)} disabled={!canPerform('approve:payment-run') || !(row.status === 'scheduled' || row.status === 'draft')}>{t('payments.actions.approve') || 'Approve'}</button>
        <button className="btn sm success" onClick={() => handleExecuteRun(row.id)} disabled={!canPerform('execute:payment-run') || row.status !== 'processing'}>{t('payments.actions.execute') || 'Execute'}</button>
      </div>
    ) }
  ], [t]);

  const paymentColumns = useMemo(() => [
    { key: 'payment_reference', header: t('payments.payment_reference') || 'Reference' },
    { key: 'invoice_number', header: t('payments.invoice') || 'Invoice' },
    { key: 'vendor_name', header: t('payments.vendor') || 'Vendor' },
    { key: 'amount', header: t('payments.amount') || 'Amount' },
    { key: 'status', header: t('payments.status') || 'Status' },
    { key: 'reconciliation_status', header: t('payments.reconciliation_status') || 'Reconciliation' }
  ], [t]);

  const methodColumns = useMemo(() => [
    { key: 'method_name', header: t('payments.method_name') || 'Name' },
    { key: 'method_type', header: t('payments.method_type') || 'Type' },
    { key: 'currency', header: t('payments.currency') || 'Currency' },
    { key: 'is_active', header: t('payments.active') || 'Active' },
    { key: 'is_default', header: t('payments.default') || 'Default' },
    { key: 'actions' as keyof PaymentMethod, header: t('action.actions') || 'Actions', render: (_: any, row: PaymentMethod) => (
      <div className="btn-row">
        <button className="btn sm outline" onClick={() => handleToggleMethod(row.id)} disabled={!canPerform('manage:payment-methods')}>{row.is_active ? (t('payments.actions.disable') || 'Disable') : (t('payments.actions.enable') || 'Enable')}</button>
        <button className="btn sm danger" onClick={() => handleDeleteMethod(row.id)} disabled={!canPerform('manage:payment-methods')}>{t('payments.actions.delete') || 'Delete'}</button>
      </div>
    ) }
  ], [t]);

  return (
    <div className="main" data-module="procurement">
      <div className="page-header procurement">
        <div style={{ marginTop: 4, color: 'var(--text-secondary)' }}>{t('payments.title') || 'Payments Management'}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={loadAll}>{t('action.refresh') || 'Refresh'}</button>
          <button className={`btn ${activeTab === 'runs' ? '' : 'outline'}`} onClick={() => setActiveTab('runs')}>{t('payments.runs') || 'Runs'}</button>
          <button className={`btn ${activeTab === 'payments' ? '' : 'outline'}`} onClick={() => setActiveTab('payments')}>{t('payments.payments') || 'Payments'}</button>
          <button className={`btn ${activeTab === 'methods' ? '' : 'outline'}`} onClick={() => setActiveTab('methods')}>{t('payments.methods') || 'Methods'}</button>
          <button className={`btn ${activeTab === 'reconciliation' ? '' : 'outline'}`} onClick={() => setActiveTab('reconciliation')}>{t('payments.reconciliation') || 'Reconciliation'}</button>
        </div>
      </div>

      {error && (
        <div className="card" style={{ padding: 12, borderLeft: '4px solid var(--danger)' }}>
          <div style={{ color: 'var(--danger)' }}>{t('action.error') || 'Error'}: {error}</div>
        </div>
      )}

      {activeTab === 'runs' && (
        <div className="card" style={{ padding: 16 }}>
          <DataTable data={runs} columns={runColumns as any} pageSize={8} />
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="card" style={{ padding: 16 }}>
          <DataTable data={payments} columns={paymentColumns as any} pageSize={10} />
        </div>
      )}

      {activeTab === 'methods' && (
        <div className="card" style={{ padding: 16, marginTop: 12 }}>
          <div className="btn-row" style={{ marginBottom: 8 }}>
            <button className="btn outline" onClick={() => {}} disabled={!canPerform('manage:payment-methods')}>{t('payments.actions.add_method') || 'Add Method'}</button>
          </div>
          <DataTable data={methods} columns={methodColumns as any} pageSize={6} />
        </div>
      )}

      {activeTab === 'reconciliation' && (
        <div className="card" style={{ padding: 16, marginTop: 12 }}>
          <div className="btn-row" style={{ marginBottom: 8 }}>
            <select className="input" value={selectedStatementId ?? ''} onChange={e => handleSelectStatement(Number(e.target.value))}>
              {statements.map(s => (
                <option key={s.id} value={s.id}>{t('payments.bank_statement') || 'Statement'} {s.id} • {s.statement_date}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <h3 style={{ margin: 0 }}>{t('payments.bank_transactions') || 'Bank Transactions'}</h3>
              <DataTable data={transactions} columns={[
                { key: 'transaction_date', header: t('payments.date') || 'Date' },
                { key: 'description', header: t('payments.description') || 'Description' },
                { key: 'amount', header: t('payments.amount') || 'Amount' },
                { key: 'reference_number', header: t('payments.reference') || 'Reference' },
              ] as any} pageSize={6} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>{t('payments.unreconciled_payments') || 'Unreconciled Payments'}</h3>
              <DataTable data={payments.filter(p => p.reconciliation_status !== 'matched')} columns={[
                { key: 'payment_reference', header: t('payments.payment_reference') || 'Reference' },
                { key: 'amount', header: t('payments.amount') || 'Amount' },
                { key: 'actions' as keyof Payment, header: t('action.actions') || 'Actions', render: (_: any, row: Payment) => (
                  <div className="btn-row">
                    <button className="btn sm outline" onClick={() => {
                      const tx = transactions.find(x => Math.abs(x.amount - row.amount) < 0.01);
                      if (tx) handleReconcile(row.id, tx);
                    }} disabled={!canPerform('reconcile:payments')}>{t('payments.actions.match') || 'Match'}</button>
                  </div>
                )}
              ] as any} pageSize={6} />
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="card" style={{ padding: 12, marginTop: 12 }}>
          <div className="skeleton" style={{ height: 24 }}></div>
        </div>
      )}
    </div>
  );
}
