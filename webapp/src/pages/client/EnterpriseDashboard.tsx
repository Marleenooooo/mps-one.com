import React, { useMemo, useState, useEffect } from 'react';
import { useModule } from '../../components/useModule';
import { useI18n } from '../../components/I18nProvider';
import MetricCard from '../../components/MetricCard';
import TrendChart from '../../components/TrendChart';
import QuickActions from '../../components/QuickActions';
import SupplierOverview from '../../components/SupplierOverview';
import { StatusPipeline } from '../../components/UI/StatusPipeline';
import { DollarSign, ShoppingCart, Users, CheckCircle, Clock, Target } from 'lucide-react';

interface DashboardMetric {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
}


interface Order {
  id: string;
  status: string;
  progress: number;
  supplier?: string;
  amount?: number;
  dueDate?: string;
}

interface Invoice {
  id: string;
  poId: string;
  amount: number;
  dueDate: string;
  paidAt?: string | null;
  supplier?: string;
}

function ProgressBar({ value, max = 100 }: { value: number; max?: number }) {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div 
      aria-label={`Progress ${percentage.toFixed(0)}%`} 
      style={{ 
        background: 'var(--surface2)', 
        border: '1px solid var(--border)', 
        borderRadius: 8, 
        height: 10,
        overflow: 'hidden'
      }}
    >
      <div 
        style={{ 
          width: `${percentage}%`, 
          height: '100%', 
          background: 'linear-gradient(90deg, var(--module-color) 0%, var(--module-gradient-end) 100%)',
          borderRadius: 8,
          transition: 'width 0.3s ease'
        }}
      ></div>
    </div>
  );
}

export default function EnterpriseDashboard() {
  useModule('procurement');
  const { t } = useI18n();
  const [company] = useState('Kalimantan Mining Group');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  
  // Enhanced metrics with trend data
  const metrics: DashboardMetric[] = useMemo(() => [
    {
      label: t('dashboard.total_spend'),
      value: 'Rp 2.8M',
      change: 12.5,
      trend: 'up',
      icon: '💰'
    },
    {
      label: t('dashboard.pending_pos'),
      value: 24,
      change: -3,
      trend: 'down',
      icon: '📋'
    },
    {
      label: t('dashboard.active_suppliers'),
      value: 156,
      change: 8,
      trend: 'up',
      icon: '🏢'
    },
    {
      label: t('dashboard.approval_rate'),
      value: '94%',
      change: 2.1,
      trend: 'up',
      icon: '✅'
    },
    {
      label: t('dashboard.avg_procurement_cycle'),
      value: '14 days',
      change: -1.2,
      trend: 'down',
      icon: '⚡'
    },
    {
      label: t('dashboard.cost_savings'),
      value: 'Rp 450K',
      change: 15.8,
      trend: 'up',
      icon: '🎯'
    }
  ], [t]);

  // Enhanced orders with more details
  const orders: Order[] = useMemo(() => [
    { 
      id: 'PR-443', 
      status: 'PO Issued', 
      progress: 35,
      supplier: 'PT Makmur Sejahtera',
      amount: 125000000,
      dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString()
    },
    { 
      id: 'PO-9821', 
      status: 'Shipped', 
      progress: 70,
      supplier: 'CV Bumi Kaya',
      amount: 875000000,
      dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()
    },
    { 
      id: 'INV-124', 
      status: 'Unpaid', 
      progress: 90,
      supplier: 'PT Alam Lestari',
      amount: 50000000,
      dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'PR-445',
      status: 'Quote Review',
      progress: 15,
      supplier: 'PT Global Mining',
      amount: 250000000,
      dueDate: new Date(Date.now() + 21 * 24 * 3600 * 1000).toISOString()
    }
  ], []);

  // Enhanced invoice data
  const invoices: Invoice[] = useMemo(() => [
    { 
      id: 'INV-124', 
      poId: 'PO-9821', 
      amount: 50000000, 
      dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
      supplier: 'PT Alam Lestari'
    },
    { 
      id: 'INV-125', 
      poId: 'PO-9821', 
      amount: 75000000, 
      dueDate: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      supplier: 'CV Bumi Kaya'
    },
    { 
      id: 'INV-127', 
      poId: 'PO-1200', 
      amount: 20000000, 
      dueDate: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), 
      paidAt: new Date().toISOString(),
      supplier: 'PT Makmur Sejahtera'
    },
    {
      id: 'INV-128',
      poId: 'PR-443',
      amount: 125000000,
      dueDate: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(),
      supplier: 'PT Global Mining'
    }
  ], []);

  // Pipeline for status tracking
  const pipeline: ('pr'|'quote'|'po'|'processing'|'shipped'|'delivered'|'invoiced'|'paid')[] = 
    ['pr','quote','po','processing','shipped','delivered','invoiced','paid'];

  // Calculate payment statuses
  const invoiceStatuses = useMemo(() => {
    const counts = { paid: 0, neutral: 0, waiting: 0, next: 0, overdue: 0 };
    invoices.forEach(inv => {
      const st = derivePaymentStatus(inv);
      if (st === 'paid') counts.paid += 1;
      else if (st === 'over-due') counts.overdue += 1;
      else if (st === 'waiting payment') counts.waiting += 1;
      else if (st === 'next payment') counts.next += 1;
      else counts.neutral += 1;
    });
    return counts;
  }, [invoices]);

  // Calculate summary active index
  const summaryActiveIndex = useMemo(() => {
    const map = (s: string) => {
      const low = s.toLowerCase();
      if (low.includes('po')) return 'po' as const;
      if (low.includes('ship')) return 'shipped' as const;
      if (low.includes('unpaid') || low.includes('invoice')) return 'invoiced' as const;
      if (low.includes('quote')) return 'quote' as const;
      return 'pr' as const;
    };
    const indices = orders.map(o => pipeline.indexOf(map(o.status)));
    return Math.max(...indices, pipeline.indexOf('pr'));
  }, [orders]);

  function derivePaymentStatus(inv: Invoice): 'paid' | 'over-due' | 'waiting payment' | 'next payment' | 'neutral' {
    if (inv.paidAt) return 'paid';
    const now = Date.now();
    const due = new Date(inv.dueDate).getTime();
    if (now > due) return 'over-due';
    const days = Math.ceil((due - now) / (24*3600*1000));
    if (days <= 7) return 'waiting payment';
    if (days <= 14) return 'next payment';
    return 'neutral';
  }

  // Quick action handlers
  const handleCreatePR = () => {
    window.location.href = '/procurement/pr/enhanced';
  };

  const handleViewSuppliers = () => {
    window.location.href = '/client/suppliers';
  };

  const handleViewReports = () => {
    window.location.href = '/supplier/reporting';
  };

  return (
    <div className="main" role="main">
      {/* Enhanced Page Header with company info */}
      <div className="page-header procurement">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0 }}>{t('dashboard.welcome').replace('{company}', company)}</h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
              {t('dashboard.last_updated')}: {new Date().toLocaleString()}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <select 
              className="select" 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              style={{ minWidth: 120 }}
            >
              <option value="week">{t('period.week')}</option>
              <option value="month">{t('period.month')}</option>
              <option value="quarter">{t('period.quarter')}</option>
              <option value="year">{t('period.year')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
        <MetricCard
          title={t('dashboard.total_spend')}
          value="Rp 3.2M"
          subtitle="This month"
          trend={{ value: 12.5, label: 'vs last month' }}
          icon={<DollarSign className="w-6 h-6 text-blue-400" />}
          variant="primary"
        />
        <MetricCard
          title={t('dashboard.pending_pos')}
          value="24"
          subtitle="Awaiting approval"
          trend={{ value: -8.3, label: 'vs last month' }}
          icon={<ShoppingCart className="w-6 h-6 text-purple-400" />}
          variant="secondary"
        />
        <MetricCard
          title={t('dashboard.active_suppliers')}
          value="16"
          subtitle="Verified suppliers"
          trend={{ value: 6.7, label: 'vs last month' }}
          icon={<Users className="w-6 h-6 text-green-400" />}
          variant="success"
        />
        <MetricCard
          title={t('dashboard.approval_rate')}
          value="94%"
          subtitle="This quarter"
          trend={{ value: 2.1, label: 'vs last quarter' }}
          icon={<CheckCircle className="w-6 h-6 text-yellow-400" />}
          variant="warning"
        />
        <MetricCard
          title={t('dashboard.procurement_cycle')}
          value="8.2 days"
          subtitle="Average time"
          trend={{ value: -15.4, label: 'vs last quarter' }}
          icon={<Clock className="w-6 h-6 text-red-400" />}
          variant="danger"
        />
        <MetricCard
          title={t('dashboard.cost_savings')}
          value="Rp 450K"
          subtitle="This month"
          trend={{ value: 15.8, label: 'vs budget' }}
          icon={<Target className="w-6 h-6 text-cyan-400" />}
          variant="primary"
        />
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Order Tracking with Pipeline */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>{t('dashboard.order_tracking')}</h2>
            <button className="btn ghost" onClick={() => window.location.href = '/procurement/workflow'}>
              {t('dashboard.view_all')} →
            </button>
          </div>
          
          <div style={{ marginBottom: 20 }}>
            <StatusPipeline 
              statuses={pipeline} 
              activeIndex={summaryActiveIndex} 
              showLabels={true} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map((order) => (
              <div key={order.id} style={{ 
                padding: 12, 
                border: '1px solid var(--border)', 
                borderRadius: 8,
                background: 'var(--surface2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{order.id}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{order.supplier}</div>
                  </div>
                  <div className="status-badge info" style={{ fontSize: 11 }}>
                    {t('status.' + order.status.toLowerCase().replace(/\s+/g, '_'))}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Rp {order.amount?.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {order.dueDate && new Date(order.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <ProgressBar value={order.progress} />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Budget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <QuickActions />

          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>{t('dashboard.budget_utilization')}</h3>
              <span style={{ fontSize: 24, fontWeight: 700 }}>62%</span>
            </div>
            <ProgressBar value={62} max={100} />
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
              {t('dashboard.budget_remaining')}: Rp 1.52M dari Rp 4.0M
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Status & Supplier Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Invoice Status Overview */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>{t('dashboard.invoice_status')}</h3>
            <button className="btn ghost" onClick={() => window.location.href = '/supplier/reporting'}>
              {t('dashboard.view_all')} →
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <span className="status-badge success">Paid: {invoiceStatuses.paid}</span>
            <span className="status-badge warn">Waiting: {invoiceStatuses.waiting}</span>
            <span className="status-badge info">Next: {invoiceStatuses.next}</span>
            <span className="status-badge danger">Over-due: {invoiceStatuses.overdue}</span>
            <span className="status-badge">Neutral: {invoiceStatuses.neutral}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {invoices.slice(0, 3).map((invoice) => (
              <div key={invoice.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: 8,
                border: '1px solid var(--border)',
                borderRadius: 6,
                background: 'var(--surface2)'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>{invoice.id}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{invoice.supplier}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>Rp {invoice.amount.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supplier Overview */}
        <SupplierOverview />
      </div>

      {/* Documents & Trend Analysis */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
        {/* Recent Documents */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>{t('dashboard.recent_documents')}</h3>
            <button className="btn ghost" onClick={() => window.location.href = '/docs'}>
              {t('dashboard.view_all')} →
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {[1,2,3,4].map(n => (
              <div key={n} className="card" style={{ padding: 12, textAlign: 'center', cursor: 'pointer' }}>
                <div aria-label="Document thumbnail" className="skeleton" style={{ height: 60, borderRadius: 6 }}></div>
                <div style={{ marginTop: 8, fontSize: 12 }}>{t('dashboard.document')} {n}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Spend Trend Analysis */}
        <TrendChart />
      </div>
    </div>
  );
}
