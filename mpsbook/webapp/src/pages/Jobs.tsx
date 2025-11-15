import React from 'react';

export function Jobs() {
  const jobs = [
    { id: 'j1', title: 'Procurement Analyst', company: 'ACME Corp', location: 'Remote' },
    { id: 'j2', title: 'Supplier Relations Manager', company: 'Berkah Industries', location: 'Jakarta' },
    { id: 'j3', title: 'Logistics Coordinator', company: 'MPS', location: 'Singapore' },
  ];
  return (
    <div style={{ padding: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Jobs</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {jobs.map(j => (
            <div key={j.id} className="card" style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 10 }}>
              <div className="avatar" />
              <div>
                <div style={{ fontWeight: 600 }}>{j.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{j.company} • {j.location}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

