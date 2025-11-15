import React from 'react';
import { Breadcrumbs } from '../../components/Layout/Topbar';

export default function PaymentReconciliation() {
  return (
    <div className="main" data-module="finance">
      <div style={{ padding: 8 }}>
        <Breadcrumbs items={["nav.admin_dashboard","nav.payment_reconciliation"]} />
      </div>
      <div className="page-header procurement">
        <h1 style={{ margin: 0 }}>Payment Reconciliation</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn">Run Reconciliation</button>
          <button className="btn outline">Export</button>
        </div>
      </div>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Outstanding Items</div>
        <div className="skeleton" style={{ height: 220 }}></div>
      </div>
    </div>
  );
}
