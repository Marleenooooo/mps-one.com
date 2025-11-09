import React from 'react';
import { useModule } from '../../components/useModule';
import { DataTable } from '../../components/UI/DataTable';
import { useI18n } from '../../components/I18nProvider';

const recentActivity = [
  { id: 1, user: 'PIC Procurement - Sari', type: 'created_quote', idRef: 'Q-1209', prRef: 'PR-443', time: '2h' },
  { id: 2, user: 'PIC Finance - Damar', type: 'approved_po', poRef: 'PO-9821', time: '5h' },
  { id: 3, user: 'Admin - Rudi', type: 'updated_budget', dept: 'Dept Mining Ops', time: '1d' },
];

const metrics = [
  { label: 'Pending Quotes', value: 12 },
  { label: 'Active POs', value: 8 },
  { label: 'Unpaid Invoices', value: 5 },
];

const clients = [
  { id: 'KAL-001', company: 'Kalimantan Mining Group', status: 'Active', lastContact: 'Today' },
  { id: 'BOR-225', company: 'Borneo Minerals Co', status: 'Pending Quote', lastContact: 'Yesterday' },
  { id: 'SAM-310', company: 'Samarinda Mining', status: 'Active', lastContact: '3d' },
];

export default function AdminDashboard() {
  useModule('reports');
  const { t } = useI18n();

  function activityText(a: any) {
    switch (a.type) {
      case 'created_quote':
        return t('activity.created_quote').replace('{id}', a.idRef).replace('{pr}', a.prRef);
      case 'approved_po':
        return t('activity.approved_po').replace('{po}', a.poRef);
      case 'updated_budget':
        return t('activity.updated_budget').replace('{dept}', a.dept);
      default:
        return '';
    }
  }

  function formatAgo(token: string) {
    if (token.endsWith('h')) {
      const n = token.replace('h','');
      return t('time.hours_ago').replace('{n}', n);
    }
    if (token.endsWith('d')) {
      const n = token.replace('d','');
      return t('time.days_ago').replace('{n}', n);
    }
    return token;
  }
  return (
    <div className="main" role="main">
      <div className="page-header reports">
        <h1 style={{ margin: 0 }}>{t('admin.title')}</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[{ label: t('admin.metrics.pending_quotes'), value: 12 }, { label: t('admin.metrics.active_pos'), value: 8 }, { label: t('admin.metrics.unpaid_invoices'), value: 5 }].map(m => (
          <div key={m.label} className="card" style={{ padding: 16 }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{m.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{m.value}</div>
            <div className="status-badge info">{t('admin.updated_hint')}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 16 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>{t('admin.comm_center')}</h2>
            <button className="btn" aria-label={t('admin.compose_email')}>{t('admin.compose_email')}</button>
          </div>
          <DataTable
            data={clients}
            columns={[
              { key: 'id', header: t('datatable.client_id') },
              { key: 'company', header: t('datatable.company') },
              { key: 'status', header: t('datatable.status'), render: v => <span className="status-badge info">{t('status.' + String(v).toLowerCase().replace(/\s+/g, '_'))}</span> },
              { key: 'lastContact', header: t('datatable.last_contact'), render: v => {
                if (v === 'Today') return t('time.today');
                if (v === 'Yesterday') return t('time.yesterday');
                return formatAgo(String(v));
              } },
            ]}
          />
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>{t('admin.recent_activity')}</h2>
          <ul aria-label="Recent activity" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {recentActivity.map(a => (
              <li key={a.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600 }}>{a.user}</div>
                <div style={{ color: 'var(--text-secondary)' }}>{activityText(a)}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{formatAgo(String(a.time))}</div>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button className="btn" aria-label={t('admin.new_pr')}>{t('admin.new_pr')}</button>
            <button className="btn" aria-label={t('admin.new_quote')}>{t('admin.new_quote')}</button>
            <button className="btn" aria-label={t('admin.new_po')}>{t('admin.new_po')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
