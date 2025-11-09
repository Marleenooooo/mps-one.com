import React, { useMemo, useState } from 'react';
import { useModule } from '../components/useModule';
import { LoadingButton } from '../components/UI/LoadingButton';
import { useI18n } from '../components/I18nProvider';
import { uniqueId } from '../components/utils/uniqueId';

type Item = { id: string; name: string; qty: number; price: number };

export default function QuoteBuilder() {
  useModule('procurement');
  const { t } = useI18n();
  const [items, setItems] = useState<Item[]>([
    { id: uniqueId('item'), name: 'Excavator Bucket', qty: 2, price: 15000000 },
    { id: uniqueId('item'), name: 'Hydraulic Hose', qty: 6, price: 750000 },
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
    setItems(it => [...it, { id: uniqueId('item'), name: '', qty: 1, price: 0 }]);
  }
  function removeItem(idx: number) {
    setItems(it => it.filter((_, i) => i !== idx));
  }

  return (
    <div className="main">
      <div className="page-header procurement" style={{ borderImage: 'linear-gradient(90deg, #0077FF, #0055CC) 1' }}>
        <h1 style={{ margin: 0 }}>{t('nav.quote_builder')}</h1>
      </div>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ marginTop: 0 }}>{t('quote.items')}</h2>
          <button className="btn" onClick={addItem}>{t('action.add_item')}</button>
        </div>
        <div role="table" aria-label="Quote items" style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          <div role="row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
            {[t('quote.item'), t('quote.qty'), t('quote.price'), t('quote.total')].map(h => (
              <div role="columnheader" key={h} style={{ padding: 12, fontWeight: 600 }}>{h}</div>
            ))}
          </div>
          {items.map((item, idx) => (
            <div key={item.id} role="row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', borderBottom: '1px solid var(--border)' }}>
              <div role="cell" style={{ padding: 8 }}>
                <input className="input" value={item.name} onChange={e => updateItem(idx, { name: e.target.value })} />
              </div>
              <div role="cell" style={{ padding: 8 }}>
                <input className="input" type="number" min={1} value={item.qty} onChange={e => updateItem(idx, { qty: Number(e.target.value) })} />
              </div>
              <div role="cell" style={{ padding: 8 }}>
                <input className="input" type="number" min={0} value={item.price} onChange={e => updateItem(idx, { price: Number(e.target.value) })} />
              </div>
              <div role="cell" style={{ padding: 8, alignSelf: 'center', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {(item.qty * item.price).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
                <button className="btn" onClick={() => removeItem(idx)} style={{ marginLeft: 8 }}>{t('action.remove')}</button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <div className="card" style={{ padding: 16 }}>
              <div style={{ display: 'grid', gap: 8 }}>
              <label>{t('quote.tax_rate')}</label>
              <input className="input" type="number" value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} />
              <label>{t('quote.discount')}</label>
              <input className="input" type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} />
              <label>{t('quote.template')}</label>
              <select className="select" value={template} onChange={e => setTemplate(e.target.value)}>
                {['Standard','Minimal','Detailed'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="card" style={{ padding: 16 }}>
              <div style={{ display: 'grid', gap: 8 }}>
              <div>{t('quote.subtotal')}: <strong>{subtotal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</strong></div>
              <div>{t('quote.tax')}: <strong>{tax.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</strong></div>
              <div>{t('quote.grand_total')}: <strong>{total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</strong></div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" onClick={() => setPreview(p => !p)}>{preview ? t('action.close_preview') : t('action.preview')}</button>
                <LoadingButton onClick={async () => { await new Promise(r => setTimeout(r, 1200)); alert('Quote sent'); }}>{t('action.send_quote')}</LoadingButton>
              </div>
            </div>
          </div>
        </div>
        {preview && (
          <div className="card" style={{ padding: 16, marginTop: 16, borderImage: 'linear-gradient(90deg, #0A1F4D, #0A0F2D) 1', borderWidth: 2, borderStyle: 'solid' }}>
            <h3>{t('action.preview')} ({template} template)</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{t('quote.preview_hint')}</p>
            <div style={{ marginTop: 8, padding: 12, borderRadius: 8, background: 'var(--surface2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>PT Kalimantan Mining Group</strong>
                <span>Vendor: MPS One</span>
              </div>
              <div style={{ marginTop: 8 }}>
                {items.map(i => (
                  <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{i.name} × {i.qty}</span>
                    <span>{(i.qty * i.price).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 8, display: 'grid', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('quote.subtotal')}</span><strong>{subtotal.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('quote.tax')}</span><strong>{tax.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{t('quote.grand_total')}</span><strong>{total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</strong></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
