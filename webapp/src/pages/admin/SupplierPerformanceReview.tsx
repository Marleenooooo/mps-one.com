import React, { useState } from 'react';

export default function SupplierPerformanceReview() {
  const [supplier, setSupplier] = useState('Select supplier');
  return (
    <div className="main" data-module="procurement">
      <div className="page-header procurement">
        <h1 style={{ margin: 0 }}>Supplier Performance Review</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn">Refresh</button>
          <button className="btn outline">Export</button>
        </div>
      </div>
      <div className="card" style={{ padding: 16, marginBottom: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
          <select className="input" value={supplier} onChange={(e) => setSupplier(e.target.value)}>
            <option>Select supplier</option>
            <option>Borneo Equipment Ltd</option>
            <option>Kalimantan Energy Co</option>
            <option>Samarinda Tech Services</option>
          </select>
          <button className="btn">Generate Review</button>
        </div>
      </div>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Performance Summary</div>
        <div className="skeleton" style={{ height: 180 }}></div>
      </div>
    </div>
  );
}

