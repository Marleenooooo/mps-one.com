import React, { useEffect, useState } from 'react';
import { BridgeClient } from '@thebridge/sdk';

export function Insights() {
  const [funnel, setFunnel] = useState<any | null>(null);
  const [forecast, setForecast] = useState<any | null>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const bc = new BridgeClient('http://localhost:3001');
        const token = localStorage.getItem('token') || 'dev-token';
        const [f, fo, a] = await Promise.all([
          bc.getFunnelData(token),
          bc.getForecast(token),
          bc.getAnomalies(token)
        ]);
        setFunnel(f);
        setForecast(fo);
        setAnomalies(a);
      } catch {}
    })();
  }, []);

  const totalValue = funnel?.totalValue || 0;
  const avgCycle = funnel?.avgCycleTime || '';
  const projection = forecast?.budget?.projected || 0;
  const variance = forecast?.budget?.variance || 0;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Total Value</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{Number(totalValue).toLocaleString()}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Avg Cycle</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{avgCycle}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Projected Budget</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{Number(projection).toLocaleString()}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Variance</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{variance}%</div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Recent Anomalies</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {anomalies.map((a, idx) => (
            <div key={idx} className="card" style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 10 }}>
              <div className="avatar" />
              <div>
                <div style={{ fontWeight: 600 }}>{String(a.type || 'anomaly')} • {String(a.severity || '')}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{String(a.description || '')}</div>
              </div>
            </div>
          ))}
          {anomalies.length === 0 && (
            <div style={{ color: 'var(--text-secondary)' }}>No anomalies detected</div>
          )}
        </div>
      </div>
    </div>
  );
}

