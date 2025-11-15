import React from 'react';

export function Articles() {
  const articles = [
    { id: 'a1', title: 'Strategic Sourcing in 2025', author: 'Alex Chen' },
    { id: 'a2', title: 'Building Vendor Trust Graphs', author: 'Nadia Rahma' },
    { id: 'a3', title: 'Optimizing Logistics Operations', author: 'Diego Martínez' }
  ];
  return (
    <div style={{ padding: 16 }}>
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Articles</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {articles.map(a => (
            <div key={a.id} className="card">
              <div style={{ fontWeight: 600 }}>{a.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a.author}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

