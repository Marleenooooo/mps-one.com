import React, { useState } from 'react';

export default function VendorRiskAssessment() {
  const [query, setQuery] = useState('');
  const [tier, setTier] = useState('All');
  const [status, setStatus] = useState('All');
  return (
    <div className="main" data-module="procurement">
      <div className="page-header procurement">
        <h1 style={{ margin: 0 }}>Vendor Risk Assessment</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn">Refresh</button>
          <button className="btn outline">Export Report</button>
        </div>
      </div>
      <div className="card" style={{ padding: 16, marginBottom: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8 }}>
          <input className="input" placeholder="Search vendors" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select className="input" value={tier} onChange={(e) => setTier(e.target.value)}>
            <option>All</option>
            <option>Tier 1</option>
            <option>Tier 2</option>
            <option>Tier 3</option>
          </select>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>All</option>
            <option>Approved</option>
            <option>Pending</option>
            <option>Flagged</option>
          </select>
        </div>
      </div>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Risk Overview</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 600 }}>High Risk</div>
            <div className="skeleton" style={{ height: 24, marginTop: 8 }}></div>
          </div>
          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 600 }}>Medium Risk</div>
            <div className="skeleton" style={{ height: 24, marginTop: 8 }}></div>
          </div>
          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 600 }}>Low Risk</div>
            <div className="skeleton" style={{ height: 24, marginTop: 8 }}></div>
          </div>
          <div className="card" style={{ padding: 12 }}>
            <div style={{ fontWeight: 600 }}>Compliance Flags</div>
            <div className="skeleton" style={{ height: 24, marginTop: 8 }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

