import React, { useEffect, useMemo, useState } from 'react';
import { listPosts, listUsers } from '../services/mock';
import type { TrustBadge } from '@thebridge/contracts/trustGraph';
import { BridgeClient, getClaims } from '@thebridge/sdk';

export function Company() {
  const users = listUsers();
  const allPosts = listPosts();
  const posts = useMemo(() => allPosts.slice(0, 5), [allPosts]);
  const [badges, setBadges] = useState<TrustBadge[]>([]);
  const [trustScore, setTrustScore] = useState<number>(0);
  const [companyName, setCompanyName] = useState<string>('Company');
  const [funnel, setFunnel] = useState<any | null>(null);
  const [forecast, setForecast] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const claims = getClaims();
        if (claims?.companyId) {
          setCompanyName(String(claims.companyId));
          const bc = new BridgeClient('http://localhost:3001');
          const signals = await bc.getVendorTrust(claims.companyId, '');
          const b = (signals[0]?.badges || []).map(x => ({ key: x.key, label: x.label }));
          setBadges(b);
          setTrustScore(Number(signals[0]?.score || 0));
          try {
            const token = localStorage.getItem('token') || 'dev-token';
            const [funnelData, forecastData] = await Promise.all([
              bc.getFunnelData(token),
              bc.getForecast(token)
            ]);
            setFunnel(funnelData);
            setForecast(forecastData);
          } catch {}
        }
      } catch {}
    })();
  }, []);

  const employeeCount = users.length;
  const postCount = allPosts.length;
  const totalValue = funnel?.totalValue || 0;
  const avgCycle = funnel?.avgCycleTime || '';
  const budgetProjection = forecast?.budget?.projected || 0;
  const budgetVariance = forecast?.budget?.variance || 0;

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ height: 140, background: 'linear-gradient(90deg, #0ea5e9 0%, #3b82f6 50%, #22c55e 100%)' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 16, padding: 16, alignItems: 'center' }}>
          <div className="avatar" style={{ width: 100, height: 100, transform: 'translateY(-40px)', border: '2px solid var(--border)' }} />
          <div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{companyName}</div>
            <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Business Network and Enterprise Profile</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              {badges.map(b => (
                <span key={b.key} className="btn" style={{ fontSize: 12 }}>{b.label || b.key}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Employees</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{employeeCount}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Posts</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{postCount}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Trust Score</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{trustScore}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Procurement Value</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{totalValue.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 700 }}>Company Updates</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{avgCycle ? `Avg Cycle: ${avgCycle}` : ''}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {posts.map(p => (
              <div key={p.id} className="card" style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 10, transition: 'transform .2s', willChange: 'transform' }}>
                <div className="avatar" />
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 600 }}>{users.find(u => u.id === p.authorId)?.name || '—'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(p.createdAt).toLocaleString()}</div>
                  </div>
                  <div style={{ marginTop: 6 }}>{p.content}</div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <div>❤ {p.likes}</div>
                    <div>💬 {p.comments}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ display: 'grid', gap: 12 }}>
          <div style={{ fontWeight: 700 }}>Trust & Compliance</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div className="card">
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Projected Budget</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{Number(budgetProjection).toLocaleString()}</div>
            </div>
            <div className="card">
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Variance</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{budgetVariance}%</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {badges.map(b => (
              <div key={b.key} className="btn" style={{ fontSize: 12, textAlign: 'center' }}>{b.label || b.key}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ fontWeight: 700 }}>Team</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 8 }}>
          {users.map(u => (
            <div key={u.id} className="card" style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 10 }}>
              <div className="avatar" />
              <div>
                <div style={{ fontWeight: 600 }}>{u.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{u.headline || ''}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
