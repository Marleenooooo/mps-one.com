import React from 'react';
import { useModule } from '../components/useModule';
import { DataTable } from '../components/UI/DataTable';

const recentActivity = [
  { id: 1, user: 'PIC Procurement - Sari', action: 'Created Quote Q-1209 for PR-443', time: '2h ago' },
  { id: 2, user: 'PIC Finance - Damar', action: 'Approved PO-9821', time: '5h ago' },
  { id: 3, user: 'Admin - Rudi', action: 'Updated budget for Dept Mining Ops', time: '1d ago' },
];

const metrics = [
  { label: 'Pending Quotes', value: 12 },
  { label: 'Active POs', value: 8 },
  { label: 'Unpaid Invoices', value: 5 },
];

const clients = [
  { id: 'KAL-001', company: 'Kalimantan Mining Group', status: 'Active', lastContact: 'Today' },
  { id: 'BOR-225', company: 'Borneo Minerals Co', status: 'Pending Quote', lastContact: 'Yesterday' },
  { id: 'SAM-310', company: 'Samarinda Mining', status: 'Active', lastContact: '3d ago' },
];

export default function AdminDashboard() {
  useModule('reports');
  return (
    <div className="main" role="main">
      <div className="page-header reports">
        <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {metrics.map(m => (
          <div key={m.label} className="card" style={{ padding: 16 }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{m.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{m.value}</div>
            <div className="status-badge info">Updated 10m ago</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 16 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Client Communication Center</h2>
            <button className="btn">Compose Email</button>
          </div>
          <DataTable
            data={clients}
            columns={[
              { key: 'id', header: 'Client ID' },
              { key: 'company', header: 'Company' },
              { key: 'status', header: 'Status', render: v => <span className="status-badge info">{v}</span> },
              { key: 'lastContact', header: 'Last Contact' },
            ]}
          />
        </div>
        <div className="card" style={{ padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Recent Activity</h2>
          <ul aria-label="Recent activity" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {recentActivity.map(a => (
              <li key={a.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600 }}>{a.user}</div>
                <div style={{ color: 'var(--text-secondary)' }}>{a.action}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a.time}</div>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button className="btn">New PR</button>
            <button className="btn">New Quote</button>
            <button className="btn">New PO</button>
          </div>
        </div>
      </div>
    </div>
  );
}