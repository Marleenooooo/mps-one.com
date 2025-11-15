import React from 'react';

export function HelpCenter() {
  const faqs = [
    { q: 'How to create a post?', a: 'Use the composer on Home to write and publish.' },
    { q: 'How to manage invitations?', a: 'Open Invitations to accept or ignore requests.' },
    { q: 'Where to find analytics?', a: 'Insights page shows summaries and anomalies.' }
  ];
  return (
    <div style={{ padding: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Help Center</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {faqs.map((f, i) => (
            <div key={i} className="card">
              <div style={{ fontWeight: 600 }}>{f.q}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{f.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

