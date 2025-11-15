import React from 'react';
import { Breadcrumbs } from '../../components/Layout/Topbar';

export default function ContractNegotiation() {
  return (
    <div className="main" data-module="procurement">
      <div style={{ padding: 8 }}>
        <Breadcrumbs items={["nav.admin_dashboard","nav.contract_negotiation"]} />
      </div>
      <div className="page-header procurement">
        <h1 style={{ margin: 0 }}>Contract Negotiation</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn">New Session</button>
          <button className="btn outline">Import Draft</button>
        </div>
      </div>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Negotiation Room</div>
        <div className="skeleton" style={{ height: 220 }}></div>
      </div>
    </div>
  );
}
