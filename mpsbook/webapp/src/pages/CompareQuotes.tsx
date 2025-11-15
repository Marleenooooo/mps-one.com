import React, { useState } from 'react';

export function CompareQuotes() {
  const [category, setCategory] = useState('Packaging');
  const [sort, setSort] = useState('Price');
  return (
    <div style={{ padding: 16 }}>
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700 }}>Compare Quotes</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Packaging</option>
              <option>Logistics</option>
              <option>Raw Materials</option>
              <option>IT Services</option>
            </select>
            <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option>Price</option>
              <option>Delivery</option>
              <option>Quality</option>
              <option>Rating</option>
            </select>
            <button className="btn">Export</button>
          </div>
        </div>
      </div>
      <div className="card" style={{ padding: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card" style={{ padding: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 10 }}>
                <div className="avatar" />
                <div>
                  <div style={{ fontWeight: 600 }}>Supplier #{i + 1}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Category: {category}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                <div className="card">
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Price</div>
                  <div style={{ fontWeight: 700 }}>${(i + 1) * 10}.00</div>
                </div>
                <div className="card">
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Delivery</div>
                  <div style={{ fontWeight: 700 }}>{3 + i} days</div>
                </div>
                <div className="card">
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Quality</div>
                  <div style={{ fontWeight: 700 }}>{90 - i}%</div>
                </div>
                <div className="card">
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Rating</div>
                  <div style={{ fontWeight: 700 }}>{4.3 - i * 0.2}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn">Contact</button>
                <button className="btn">Open Deal Room</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

