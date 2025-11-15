import React from 'react';

export function Leads() {
  const stages = [
    { name: 'New', leads: ['Packaging Q2', 'Logistics APAC'] },
    { name: 'Contacted', leads: ['Consulting Optimization'] },
    { name: 'Qualified', leads: ['Raw Materials Supplier'] },
    { name: 'Won', leads: ['Facilities Maintenance'] },
    { name: 'Lost', leads: [] }
  ];
  return (
    <div style={{ padding: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Leads Pipeline</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {stages.map(s => (
            <div key={s.name} className="card">
              <div style={{ fontWeight: 600 }}>{s.name}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {s.leads.map((l, i) => (
                  <div key={i} className="card">{l}</div>
                ))}
                {s.leads.length === 0 && (
                  <div style={{ color: 'var(--text-secondary)' }}>No leads</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

