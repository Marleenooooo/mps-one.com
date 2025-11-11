import React, { useEffect, useMemo, useState } from 'react';
import { Topbar, Breadcrumbs } from '../components/Layout/Topbar';
import { useModule } from '../components/useModule';

type DeliveryItem = { id: string; name: string; orderedQty: number; shippedQty: number; receivedQty: number; correctionQty: number };

export default function DeliveryNotes() {
  useModule('inventory');
  const [poId, setPoId] = useState<string>(() => {
    try {
      const seed = JSON.parse(localStorage.getItem('mpsone_po_from_quote') || '{}');
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
      localStorage.setItem(key, JSON.stringify(items));
      const gateKey = 'mpsone_available_to_invoice';
      const gate = JSON.parse(localStorage.getItem(gateKey) || '{}');
      const availableQty = items.reduce((sum, it) => sum + Math.max(0, it.receivedQty + it.correctionQty), 0);
      gate[poId] = { availableQty, deliveredAmount: totalDeliveredAmount };
      localStorage.setItem(gateKey, JSON.stringify(gate));
    } catch {}
  }, [items, poId, totalDeliveredAmount]);

  function updateCorrection(idx: number, value: number) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, correctionQty: value } : it));
  }

  return (
    <div className="main" data-module="inventory">
      <Topbar>
        <Breadcrumbs items={["Inventory", "Delivery Notes"]} />
      </Topbar>
      <div className="page-header inventory" role="region" aria-label="Delivery Notes Header">
        <h1 style={{ margin: 0 }}>Delivery Notes</h1>
        <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>Confirm receipts and record corrections; invoices must respect corrected quantities.</p>
      </div>
      <div className="card" style={{ padding: 16, borderImage: 'linear-gradient(90deg, var(--module-color), var(--module-gradient-end)) 1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 600 }}>PO: {poId}</div>
          <div className="status-badge info">Delivered Amount: Rp {totalDeliveredAmount.toLocaleString('id-ID')}</div>
        </div>
        <table className="table" style={{ width: '100%', marginTop: 12 }}>
          <thead>
            <tr><th>Item</th><th>Ordered</th><th>Shipped</th><th>Received</th><th>Correction</th><th>Available to Invoice</th></tr>
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
                           aria-label={`Correction for ${it.name}`} style={{ width: 100 }} />
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
            Invariant: sum(delivery.qty) ≤ sum(po.qty). Corrections adjust available-to-invoice quantities; invoices must respect corrected quantities.
          </div>
        </div>
      </div>
    </div>
  );
}

