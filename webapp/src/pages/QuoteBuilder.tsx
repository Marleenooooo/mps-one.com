import React, { useMemo, useState } from 'react';
import { LoadingButton } from '../components/UI/LoadingButton';

type Item = { id: number; name: string; qty: number; price: number };

export default function QuoteBuilder() {
  const [items, setItems] = useState<Item[]>([
    { id: 1, name: 'Excavator Bucket', qty: 2, price: 15000000 },
    { id: 2, name: 'Hydraulic Hose', qty: 6, price: 750000 },
  ]);
  const [taxRate, setTaxRate] = useState(11);
  const [discount, setDiscount] = useState(0);
  const [template, setTemplate] = useState('Standard');
  const [preview, setPreview] = useState(false);

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.qty * i.price, 0), [items]);
  const tax = useMemo(() => subtotal * (taxRate / 100), [subtotal, taxRate]);
  const total = useMemo(() => Math.max(0, subtotal + tax - discount), [subtotal, tax, discount]);

  function updateItem(idx: number, patch: Partial<Item>) {
    setItems(it => it.map((item, i) => i === idx ? { ...item, ...patch } : item));
  }

  function addItem() {
    setItems(it => [...it, { id: Date.now(), name: '', qty: 1, price: 0 }]);
  }

  return (
    <div className="main">
      <h1>Quote Builder</h1>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ marginTop: 0 }}>Items</h2>
          <button className="btn" onClick={addItem}>Add Item</button>
        </div>
        <div role="table" aria-label="Quote items" style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          <div role="row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
            {['Item', 'Qty', 'Price', 'Total'].map(h => (
              <div role="columnheader" key={h} style={{ padding: 12, fontWeight: 600 }}>{h}</div>
            ))}
          </div>
          {items.map((item, idx) => (
            <div key={item.id} role="row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', borderBottom: '1px solid var(--border)' }}>
              <div role="cell" style={{ padding: 8 }}>
                <input className="input" value={item.name} onChange={e => updateItem(idx, { name: e.target.value })} />
              </div>
              <div role="cell" style={{ padding: 8 }}>
                <input className="input" type="number" value={item.qty} onChange={e => updateItem(idx, { qty: Number(e.target.value) })} />
              </div>
              <div role="cell" style={{ padding: 8 }}>
                <input className="input" type="number" value={item.price} onChange={e => updateItem(idx, { price: Number(e.target.value) })} />
              </div>
              <div role="cell" style={{ padding: 8, alignSelf: 'center' }}>
                {(item.qty * item.price).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <div className="card" style={{ padding: 16 }}>
              <div style={{ display: 'grid', gap: 8 }}>
              <label>Tax Rate (%)</label>
              <input className="input" type="number" value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} />
              <label>Discount (IDR)</label>
              <input className="input" type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} />
              <label>Template</label>
              <select className="select" value={template} onChange={e => setTemplate(e.target.value)}>
                {['Standard','Minimal','Detailed'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="card" style={{ padding: 16 }}>
              <div style={{ display: 'grid', gap: 8 }}>
              <div>Subtotal: <strong>{subtotal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</strong></div>
              <div>Tax: <strong>{tax.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</strong></div>
              <div>Total: <strong>{total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</strong></div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" onClick={() => setPreview(p => !p)}>{preview ? 'Close Preview' : 'Preview'}</button>
                <LoadingButton onClick={async () => { await new Promise(r => setTimeout(r, 1200)); alert('Quote sent'); }}>Send Quote</LoadingButton>
              </div>
            </div>
          </div>
        </div>
        {preview && (
          <div className="card" style={{ padding: 16, marginTop: 16 }}>
            <h3>Preview ({template} template)</h3>
            <p style={{ color: 'var(--text-secondary)' }}>This is a template preview. Content will match selected style.</p>
          </div>
        )}
      </div>
    </div>
  );
}