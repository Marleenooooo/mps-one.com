import React, { useEffect, useMemo, useState } from 'react';
import { Topbar, Breadcrumbs } from '../components/Layout/Topbar';
import { useModule } from '../components/useModule';
import { useI18n } from '../components/I18nProvider';
import * as pillarStorage from '../services/pillarStorage';

type DeliveryItem = { id: string; name: string; orderedQty: number; shippedQty: number; receivedQty: number; correctionQty: number };

export default function DeliveryNotes() {
  useModule('inventory');
  const { t } = useI18n();
  const [poId, setPoId] = useState<string>(() => {
    try {
      const seed = JSON.parse(pillarStorage.getItem('mpsone_po_from_quote') || '{}');
      return seed?.poId || 'PO-9821';
    } catch { return 'PO-9821'; }
  });
  const [items, setItems] = useState<DeliveryItem[]>(() => (
    [
      { id: 'IT-001', name: 'Excavator Bucket', orderedQty: 10, shippedQty: 5, receivedQty: 5, correctionQty: 0 },
      { id: 'IT-002', name: 'Hydraulic Hose', orderedQty: 40, shippedQty: 20, receivedQty: 19, correctionQty: -1 },
      { id: 'IT-003', name: 'Safety Helmet', orderedQty: 100, shippedQty: 50, receivedQty: 50, correctionQty: 0 },
    ]
  ));

  const totalDeliveredAmount = useMemo(() => {
    // Simulate per-item price Rp 1,000,000 for demo purposes
    const price = 1_000_000;
    const delivered = items.reduce((acc, it) => acc + (it.receivedQty + it.correctionQty) * price, 0);
    return delivered;
  }, [items]);

  useEffect(() => {
    try {
      const key = `mpsone_delivery_notes_${poId}`;
      pillarStorage.setItem(key, JSON.stringify(items));
      const gateKey = 'mpsone_available_to_invoice';
      const gate = JSON.parse(pillarStorage.getItem(gateKey) || '{}');
      const availableQty = items.reduce((sum, it) => sum + Math.max(0, it.receivedQty + it.correctionQty), 0);
      gate[poId] = { availableQty, deliveredAmount: totalDeliveredAmount };
      pillarStorage.setItem(gateKey, JSON.stringify(gate));
    } catch {}
  }, [items, poId, totalDeliveredAmount]);

  function updateCorrection(idx: number, value: number) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, correctionQty: value } : it));
  }

  return (
    <div className="main" data-module="inventory">
      <Topbar>
        <Breadcrumbs items={["Inventory", t('delivery.title')]} />
      </Topbar>
      <div className="page-header inventory" role="region" aria-label="Delivery Notes Header">
        <h1 style={{ margin: 0 }}>{t('delivery.title')}</h1>
        <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>{t('delivery.header_desc')}</p>
      </div>
      <div className="card" style={{ padding: 16, borderImage: 'linear-gradient(90deg, var(--module-color), var(--module-gradient-end)) 1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 600 }}>{t('delivery.po_label')}: {poId}</div>
          <div className="status-badge info">{t('delivery.delivered_amount')}: Rp {totalDeliveredAmount.toLocaleString('id-ID')}</div>
        </div>
        <table className="table" style={{ width: '100%', marginTop: 12 }}>
          <thead>
            <tr><th>{t('delivery.table.item')}</th><th>{t('delivery.table.ordered')}</th><th>{t('delivery.table.shipped')}</th><th>{t('delivery.table.received')}</th><th>{t('delivery.table.correction')}</th><th>{t('delivery.table.available_to_invoice')}</th></tr>
          </thead>
          <tbody>
            {items.map((it, idx) => {
              const available = Math.max(0, it.receivedQty + it.correctionQty);
              return (
                <tr key={it.id}>
                  <td>{it.name}</td>
                  <td>{it.orderedQty}</td>
                  <td>{it.shippedQty}</td>
                  <td>{it.receivedQty}</td>
                  <td>
                    <input className="input" type="number" value={it.correctionQty}
                           onChange={e => updateCorrection(idx, parseInt(e.target.value || '0', 10))}
                           aria-label={t('delivery.correction_aria').replace('{name}', it.name)} style={{ width: 100 }} />
                  </td>
                  <td>
                    <span className="status-badge success">{available}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="card" style={{ padding: 12, marginTop: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {t('delivery.invariant')}
          </div>
        </div>
      </div>
    </div>
  );
}
