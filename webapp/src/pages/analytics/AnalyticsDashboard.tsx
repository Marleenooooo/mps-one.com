import React, { useEffect, useState } from 'react';
import { useI18n } from '../../components/I18nProvider';
import { analytics, trackUserEvent } from '../../services/analytics';

export default function AnalyticsDashboard() {
  const { t } = useI18n();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [funnelAnalytics, setFunnelAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFunnel, setSelectedFunnel] = useState<string>('procurement_workflow');

  useEffect(() => {
    trackUserEvent('analytics_dashboard_viewed', {});
    
    // Load analytics summary
    const data = analytics.getSummary();
    const funnelData = analytics.getFunnelAnalytics();
    setAnalyticsData(data);
    setFunnelAnalytics(funnelData);
    setLoading(false);
  }, []);

  const refreshFunnelData = (funnelName: string) => {
    setSelectedFunnel(funnelName);
    const data = analytics.getFunnelAnalytics(funnelName);
    setFunnelAnalytics({ funnels: [data] });
  };

  if (loading) {
    return (
      <div className="main">
        <div className="page-header analytics">
          <h1>{t('analytics.dashboard') || 'Analytics Dashboard'}</h1>
        </div>
        <div className="skeleton" style={{ height: 400, borderRadius: 8 }} />
      </div>
    );
  }

  return (
    <div className="main">
      <div className="page-header analytics" style={{ borderImage: 'linear-gradient(90deg, var(--module-color), var(--module-gradient-end)) 1' }}>
        <h1>{t('analytics.dashboard') || 'Analytics Dashboard'}</h1>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <h3>Analytics Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          <div className="card" style={{ padding: 12, background: 'var(--bg-secondary)' }}>
            <h4>Session Info</h4>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Session ID</div>
              <div style={{ fontSize: 14, fontFamily: 'monospace' }}>{analyticsData?.session_id}</div>
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Events</div>
              <div style={{ fontSize: 18, fontWeight: 'bold' }}>{analyticsData?.total_events || 0}</div>
            </div>
          </div>
          
          <div className="card" style={{ padding: 12, background: 'var(--bg-secondary)' }}>
            <h4>User Context</h4>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Mode</div>
              <div style={{ fontSize: 14 }}>{analyticsData?.user_context?.mode || 'Unknown'}</div>
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Role</div>
              <div style={{ fontSize: 14 }}>{analyticsData?.user_context?.role || 'Unknown'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <h3>Available Analytics Features</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          <div className="card" style={{ padding: 12, background: 'var(--bg-secondary)' }}>
            <h4>🎯 Funnel Analysis</h4>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Track procurement workflow progression from PR creation to payment completion
            </p>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Configured Funnels</div>
              <div style={{ fontSize: 14 }}>{analyticsData?.funnels?.join(', ') || 'None'}</div>
            </div>
          </div>
          
          <div className="card" style={{ padding: 12, background: 'var(--bg-secondary)' }}>
            <h4>👥 Cohort Analysis</h4>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Analyze user behavior patterns and retention by user segments
            </p>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Available Cohorts</div>
              <div style={{ fontSize: 14 }}>{analyticsData?.cohorts?.join(', ') || 'None'}</div>
            </div>
          </div>
          
          <div className="card" style={{ padding: 12, background: 'var(--bg-secondary)' }}>
            <h4>🔍 Drilldown Analysis</h4>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Deep dive into data by dimensions like department, supplier, or user role
            </p>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Dimensions</div>
              <div style={{ fontSize: 14 }}>Department, User Role, Supplier, User Mode</div>
            </div>
          </div>
          
          <div className="card" style={{ padding: 12, background: 'var(--bg-secondary)' }}>
            <h4>⚠️ Anomaly Detection</h4>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Automatically detect unusual patterns in pricing, approvals, and workflows
            </p>
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Configured Metrics</div>
              <div style={{ fontSize: 14 }}>{analyticsData?.anomalies?.join(', ') || 'Price Variance, Approval Delays'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3>Funnel Analytics</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <select 
              className="select" 
              value={selectedFunnel}
              onChange={(e) => refreshFunnelData(e.target.value)}
              style={{ minWidth: 200 }}
            >
              <option value="procurement_workflow">Procurement Workflow</option>
              <option value="supplier_onboarding">Supplier Onboarding</option>
            </select>
          </div>
        </div>
        {funnelAnalytics?.funnels?.length > 0 && funnelAnalytics.funnels[0] && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div className="card" style={{ padding: 12, background: 'var(--bg-secondary)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Users</div>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--module-color)' }}>
                    {funnelAnalytics.funnels[0].total_users || 0}
                  </div>
                </div>
                <div className="card" style={{ padding: 12, background: 'var(--bg-secondary)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Overall Conversion</div>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--success)' }}>
                    {funnelAnalytics.funnels[0].overall_conversion?.toFixed(1) || 0}%
                  </div>
                </div>
                <div className="card" style={{ padding: 12, background: 'var(--bg-secondary)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Avg Duration</div>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--warning)' }}>
                    {funnelAnalytics.funnels[0].avg_duration_days?.toFixed(1) || 0}d
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4>Funnel Steps</h4>
              <div style={{ marginTop: 8 }}>
                {funnelAnalytics.funnels[0].steps?.map((step: any, index: number) => (
                  <div key={step.step} className="card" style={{ padding: 12, marginBottom: 8, background: 'var(--bg-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ fontWeight: 'bold' }}>{step.step}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Step {index + 1}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Users</div>
                        <div style={{ fontSize: 16, fontWeight: 'bold' }}>{step.users_at_step}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Conversion Rate</div>
                        <div style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--success)' }}>
                          {step.conversion_rate.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Dropoff Rate</div>
                        <div style={{ fontSize: 16, fontWeight: 'bold', color: step.dropoff_rate > 20 ? 'var(--danger)' : 'var(--warning)' }}>
                          {step.dropoff_rate.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: 8, height: 4, background: 'var(--border)', borderRadius: 2 }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          background: 'linear-gradient(90deg, var(--module-color), var(--module-gradient-end))',
                          borderRadius: 2,
                          width: `${step.conversion_rate}%`,
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 16 }}>
        <h3>Recent Events</h3>
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {analyticsData?.recent_events?.length > 0 ? (
            analyticsData.recent_events.map((event: any, index: number) => (
              <div key={index} className="card" style={{ padding: 8, marginBottom: 8, background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 'bold' }}>{event.event}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {event.userId}
                  </div>
                </div>
                {event.attributes && Object.keys(event.attributes).length > 0 && (
                  <div style={{ marginTop: 4, fontSize: 11, color: 'var(--text-secondary)' }}>
                    Attributes: {JSON.stringify(event.attributes, null, 2)}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 20 }}>
              No recent events found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
