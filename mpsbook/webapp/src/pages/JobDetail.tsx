import React from 'react';

export function JobDetail() {
  const job = { id: 'j1', title: 'Procurement Analyst', company: 'ACME Corp', location: 'Remote', description: 'Analyze procurement data and support sourcing decisions.' };
  return (
    <div style={{ padding: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 700 }}>{job.title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{job.company} • {job.location}</div>
        <div style={{ marginTop: 8 }}>{job.description}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button className="btn">Apply</button>
          <button className="btn">Save</button>
        </div>
      </div>
    </div>
  );
}

