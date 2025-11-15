import React from 'react';

export function GroupDetail() {
  const group = { id: 'g1', name: 'Procurement Leaders', members: 1200, description: 'Discussion and best practices for procurement professionals.' };
  return (
    <div style={{ padding: 16 }}>
      <div className="card" style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 10 }}>
        <div className="avatar" />
        <div>
          <div style={{ fontWeight: 700 }}>{group.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{group.members} members</div>
          <div style={{ marginTop: 8 }}>{group.description}</div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Recent Posts</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card" style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 10 }}>
              <div className="avatar" />
              <div>
                <div style={{ fontWeight: 600 }}>Post #{i + 1}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Group discussion content placeholder</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

