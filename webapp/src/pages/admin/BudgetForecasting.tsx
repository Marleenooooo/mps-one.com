import React, { useState } from 'react';
import { Breadcrumbs } from '../../components/Layout/Topbar';

export default function BudgetForecasting() {
  const [period, setPeriod] = useState('FY2026');
  const [dept, setDept] = useState('All Departments');
  return (
    <div className="main" data-module="procurement">
      <div style={{ padding: 8 }}>
        <Breadcrumbs items={["nav.admin_dashboard","nav.budget_forecasting"]} />
      </div>
      <div className="page-header procurement">
        <h1 style={{ margin: 0 }}>Budget Forecasting</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn">Recalculate</button>
          <button className="btn outline">Export</button>
        </div>
      </div>
      <div className="card" style={{ padding: 16, marginBottom: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <select className="input" value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option>FY2025</option>
            <option>FY2026</option>
            <option>FY2027</option>
          </select>
          <select className="input" value={dept} onChange={(e) => setDept(e.target.value)}>
            <option>All Departments</option>
            <option>Mining Ops</option>
            <option>Maintenance</option>
            <option>Logistics</option>
            <option>Procurement</option>
            <option>Finance</option>
          </select>
        </div>
      </div>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Forecast Summary</div>
        <div className="skeleton" style={{ height: 180 }}></div>
      </div>
    </div>
  );
}
