import React, { useEffect, useState } from 'react';
import { useModule } from '../../components/useModule';
import { useI18n } from '../../components/I18nProvider';
import { DataTable } from '../../components/UI/DataTable';

type ContractStatus = 'active' | 'expired' | 'pending' | 'terminated';
type Contract = {
  id: string;
  title: string;
  vendor: string;
  status: ContractStatus;
  start_date: string;
  end_date: string;
  renewal_date?: string | null;
};

export default function ContractRepository() {
  useModule('procurement');
  const { t } = useI18n();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      try {
        const mock: Contract[] = [
          { id: 'C-1001', title: 'Excavator Lease Agreement', vendor: 'Borneo Equipment Ltd', status: 'active', start_date: '2024-01-01', end_date: '2025-12-31', renewal_date: '2025-11-30' },
          { id: 'C-1002', title: 'Fuel Supply Contract', vendor: 'Kalimantan Energy Co', status: 'pending', start_date: '2025-06-01', end_date: '2026-05-31', renewal_date: null },
          { id: 'C-0991', title: 'Maintenance Services', vendor: 'Samarinda Tech Services', status: 'expired', start_date: '2023-01-01', end_date: '2024-12-31', renewal_date: null },
        ];
        setContracts(mock);
      } catch (e: any) {
        setError(String(e?.message || 'error'));
      } finally {
        setLoading(false);
      }
    }, 200);
  }, []);

  const columns = [
    { key: 'id', header: t('contracts.id') || 'ID' },
    { key: 'title', header: t('contracts.title') || 'Title' },
    { key: 'vendor', header: t('contracts.vendor') || 'Vendor' },
    { key: 'status', header: t('contracts.status') || 'Status' },
    { key: 'start_date', header: t('contracts.start_date') || 'Start Date' },
    { key: 'end_date', header: t('contracts.end_date') || 'End Date' },
    { key: 'renewal_date', header: t('contracts.renewal_date') || 'Renewal Date' },
  ] as any;

  return (
    <div className="main" data-module="procurement">
      <div className="page-header procurement">
        <h1 style={{ margin: 0 }}>{t('contracts.repository') || 'Contract Repository'}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => {
            setLoading(true);
            setTimeout(() => { setLoading(false); }, 300);
          }}>{t('action.refresh') || 'Refresh'}</button>
          <button className="btn outline" onClick={() => {}}>{t('contracts.actions.new_contract') || 'New Contract'}</button>
        </div>
      </div>

      {error && (
        <div className="card" style={{ padding: 12, borderLeft: '4px solid var(--danger)' }}>
          <div style={{ color: 'var(--danger)' }}>{t('action.error') || 'Error'}: {error}</div>
        </div>
      )}

      <div className="card" style={{ padding: 16 }}>
        <DataTable data={contracts} columns={columns} pageSize={8} />
      </div>

      {loading && (
        <div className="card" style={{ padding: 12, marginTop: 12 }}>
          <div className="skeleton" style={{ height: 24 }}></div>
        </div>
      )}
    </div>
  );
}
