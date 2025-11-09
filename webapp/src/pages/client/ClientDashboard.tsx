import React, { useMemo, useState } from 'react';
import { useModule } from '../../components/useModule';
import { useI18n } from '../../components/I18nProvider';
import { StatusPipeline } from '../../components/UI/StatusPipeline';

function ProgressBar({ value }: { value: number }) {
  return (
    <div aria-label={`Progress ${value}%`} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, height: 10 }}>
      <div style={{ width: `${value}%`, height: '100%', background: 'var(--accent)', borderRadius: 8 }}></div>
    </div>
  );
}

export default function ClientDashboard() {
  useModule('procurement');
  const [company] = useState('Kalimantan Mining Group');
  const [budgetUsed] = useState(62);
  const { t } = useI18n();

  const pipeline: ('pr'|'quote'|'po'|'processing'|'shipped'|'delivered'|'invoiced'|'paid')[] = ['pr','quote','po','processing','shipped','delivered','invoiced','paid'];

  const orders = useMemo(() => (
    [
      { id: 'PR-443', status: 'PO Issued', progress: 35 },
      { id: 'PO-9821', status: 'Shipped', progress: 70 },
      { id: 'INV-124', status: 'Unpaid', progress: 90 },
    ]
  ), []);

  const summaryActiveIndex = useMemo(() => {
    const map = (s: string) => {
      const low = s.toLowerCase();
      if (low.includes('po')) return 'po' as const;
      if (low.includes('ship')) return 'shipped' as const;
      if (low.includes('unpaid') || low.includes('invoice')) return 'invoiced' as const;
      return 'pr' as const;
    };
    const indices = orders.map(o => pipeline.indexOf(map(o.status)));
    return Math.max(...indices, pipeline.indexOf('pr'));
  }, [orders]);

  return (
    <div className="main" role="main">
      <div className="page-header procurement">
        <h1 style={{ margin: 0 }}>{t('client.welcome').replace('{company}', company)}</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div className="card" style={{ padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>{t('client.order_tracking')}</h2>
          <div style={{ marginBottom: 12 }}>
            <StatusPipeline statuses={pipeline} activeIndex={summaryActiveIndex} showLabels={false} />
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {orders.map(o => (
              <li key={o.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{o.id}</div>
                    <div className="status-badge info">{t('status.' + o.status.toLowerCase().replace(/\s+/g, '_'))}</div>
                  </div>
                  <div style={{ width: 240 }}>
                    <ProgressBar value={o.progress} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>{t('client.quick_pr')}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{t('client.quick_pr_desc')}</p>
          <button className="btn primary" onClick={() => alert('PR creation flow')}>{t('client.create_pr')}</button>
          <div style={{ marginTop: 24 }}>
            <h3 style={{ margin: 0 }}>{t('client.budget_utilization')}</h3>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{budgetUsed}%</div>
            <ProgressBar value={budgetUsed} />
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16 }} className="card">
        <div style={{ padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>{t('client.documents')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[1,2,3,4,5,6,7,8].map(n => (
              <div key={n} className="card" style={{ padding: 12, textAlign: 'center' }}>
                <div aria-label="Document thumbnail" className="skeleton" style={{ height: 80, borderRadius: 8 }}></div>
                <div style={{ marginTop: 8 }}>{t('client.document_label')} {n}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
