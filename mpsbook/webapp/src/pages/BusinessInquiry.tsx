import React from 'react';

export function BusinessInquiry() {
  return (
    <div style={{ padding: 16 }}>
      <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="card">
          <div style={{ fontWeight: 700 }}>Business Inquiry</div>
          <input className="input" placeholder="Company" />
          <input className="input" placeholder="Contact Name" style={{ marginTop: 8 }} />
          <input className="input" placeholder="Email" style={{ marginTop: 8 }} />
          <textarea className="input" placeholder="Message" style={{ marginTop: 8, height: 120 }} />
        </div>
        <div className="card">
          <div style={{ fontWeight: 700 }}>Context</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Describe your business needs, timelines, and expectations.</div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <button className="btn primary">Send Inquiry</button>
      </div>
    </div>
  );
}

