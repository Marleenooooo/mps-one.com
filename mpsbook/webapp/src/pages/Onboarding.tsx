import React from 'react';

export function Onboarding() {
  return (
    <div style={{ padding: 16 }}>
      <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="card">
          <div style={{ fontWeight: 700 }}>Set up profile</div>
          <input className="input" placeholder="Name" />
          <input className="input" placeholder="Headline" style={{ marginTop: 8 }} />
        </div>
        <div className="card">
          <div style={{ fontWeight: 700 }}>Preferences</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button className="btn">Theme</button>
            <button className="btn">Language</button>
          </div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <button className="btn primary">Finish</button>
      </div>
    </div>
  );
}

