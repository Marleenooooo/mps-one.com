import React from 'react';

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
  return (
    <div className="main">
      <h1>Reporting</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        <Chart title="Spending Analytics" />
        <Chart title="Vendor Performance" />
        <Chart title="Budget Utilization" />
        <Chart title="Monthly Procurement" />
      </div>
    </div>
  );
}