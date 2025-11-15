import React from 'react';

export function Settings() {
  return (
    <div style={{ padding: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Settings</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="card">
            <div style={{ fontWeight: 600 }}>Profile</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Name, headline, avatar</div>
          </div>
          <div className="card">
            <div style={{ fontWeight: 600 }}>Notifications</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Email, push, in‑app</div>
          </div>
          <div className="card">
            <div style={{ fontWeight: 600 }}>Privacy</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Visibility and data sharing</div>
          </div>
          <div className="card">
            <div style={{ fontWeight: 600 }}>Language & Theme</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Locale and appearance</div>
          </div>
        </div>
      </div>
    </div>
  );
}

