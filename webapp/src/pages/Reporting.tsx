import React from 'react';
import { useModule } from '../components/useModule';

function Chart({ title }: { title: string }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <button className="btn" onClick={() => alert('Export report')}>Export</button>
      </div>
      <div className="skeleton" style={{ height: 160, borderRadius: 8 }} aria-label="Chart placeholder"></div>
    </div>
  );
}

export default function Reporting() {
  useModule('reports');
  return (
    <div className="main">
      <div className="page-header reports">
        <h1 style={{ margin: 0 }}>Reporting</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        <Chart title="Spending Analytics" />
        <Chart title="Vendor Performance" />
        <Chart title="Budget Utilization" />
        <Chart title="Monthly Procurement" />
      </div>
    </div>
  );
}