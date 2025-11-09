import React, { useMemo } from 'react';
import { useModule } from '../useModule';
import { computeTotals, formatIDR, Language } from '../utils/format';
import { QRCode } from '../UI/QRCode';

type Party = {
  name: string;
  addressLines: string[];
  phone?: string;
  email?: string;
};

type POHeader = {
  number: string;
  date: string; // ISO
  department?: string;
  prNumber?: string;
};

type Item = {
  description: string;
  uom: string;
  stockCode?: string;
  partNo?: string;
  suppDelivery?: string; // ISO date of supplier promised delivery
  unitPrice: number;
  qty: number;
  prNumber?: string;
};

export function POLayoutB({
  issuer,
  recipient,
  header,
  items,
  showPPN = true,
  language = 'ID',
  showStockCode = true,
  showPartNo = true,
  showPRNumber = false,
}: {
  issuer: Party; recipient: Party; header: POHeader; items: Item[];
  showPPN?: boolean; language?: Language; showStockCode?: boolean; showPartNo?: boolean; showPRNumber?: boolean;
}) {
  useModule('procurement');

  const subtotal = useMemo(() => items.reduce((sum, it) => sum + it.qty * it.unitPrice, 0), [items]);
  const { ppnLabel, ppn, total } = computeTotals(subtotal, showPPN);

  const cols = [
    { key: 'no', label: 'No', width: '5%', align: 'center' as const },
    { key: 'description', label: 'Description', width: '36%', align: 'left' as const },
    ...(showPRNumber ? [{ key: 'pr', label: 'PR No', width: '10%', align: 'center' as const }] : []),
    { key: 'uom', label: 'UoM', width: '8%', align: 'center' as const },
    ...(showStockCode ? [{ key: 'stock', label: 'Stock Code', width: '10%', align: 'center' as const }] : []),
    ...(showPartNo ? [{ key: 'part', label: 'Part No', width: '10%', align: 'center' as const }] : []),
    { key: 'supp', label: 'Supp Delivery', width: '11%', align: 'center' as const },
    { key: 'qty', label: 'Qty', width: '6%', align: 'center' as const },
    { key: 'unit', label: 'Unit Price', width: '12%', align: 'right' as const },
    { key: 'amt', label: 'Amount', width: '12%', align: 'right' as const },
  ];

  return (
    <div className="po-layout po-layout-b" style={{ fontSize: 12 }}>
      {/* Header & Right Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>{issuer.name}</div>
          {issuer.addressLines.map((l, i) => <div key={i} style={{ color: 'var(--text-secondary)' }}>{l}</div>)}
          {issuer.phone && <div style={{ color: 'var(--text-secondary)' }}>Tel: {issuer.phone}</div>}
          {issuer.email && <div style={{ color: 'var(--text-secondary)' }}>Email: {issuer.email}</div>}
        </div>
        <div style={{ minWidth: 320 }}>
          <div style={{ fontWeight: 800, fontSize: 20, textAlign: 'right' }}>PURCHASE ORDER</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
            <tbody>
              <tr>
                <td style={{ width: 120, border: '1px solid var(--border)', padding: 6 }}>Date</td>
                <td style={{ border: '1px solid var(--border)', padding: 6 }}>{new Date(header.date).toLocaleDateString(language === 'ID' ? 'id-ID' : 'en-US')}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid var(--border)', padding: 6 }}>Order #</td>
                <td style={{ border: '1px solid var(--border)', padding: 6 }}>{header.number}</td>
              </tr>
              {header.department && (
                <tr>
                  <td style={{ border: '1px solid var(--border)', padding: 6 }}>Department</td>
                  <td style={{ border: '1px solid var(--border)', padding: 6 }}>{header.department}</td>
                </tr>
              )}
              {header.prNumber && (
                <tr>
                  <td style={{ border: '1px solid var(--border)', padding: 6 }}>PR Number</td>
                  <td style={{ border: '1px solid var(--border)', padding: 6 }}>{header.prNumber}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recipient */}
      <div style={{ marginTop: 10 }}>
        <div style={{ fontWeight: 700 }}>{recipient.name}</div>
        {recipient.addressLines.map((l, i) => <div key={i} style={{ color: 'var(--text-secondary)' }}>{l}</div>)}
      </div>

      {/* Items */}
      <div style={{ marginTop: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface2)', color: 'var(--text-primary)' }}>
              {cols.map(c => (
                <th key={c.key} style={{ textAlign: c.align, padding: 8, border: '1px solid var(--border)', width: c.width }}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => {
              const amt = it.qty * it.unitPrice;
              return (
                <tr key={idx}>
                  <td style={{ border: '1px solid var(--border)', padding: 8, textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ border: '1px solid var(--border)', padding: 8 }}>{it.description}</td>
                  {showPRNumber && <td style={{ border: '1px solid var(--border)', padding: 8, textAlign: 'center' }}>{it.prNumber || header.prNumber || ''}</td>}
                  <td style={{ border: '1px solid var(--border)', padding: 8, textAlign: 'center' }}>{it.uom}</td>
                  {showStockCode && <td style={{ border: '1px solid var(--border)', padding: 8, textAlign: 'center' }}>{it.stockCode || ''}</td>}
                  {showPartNo && <td style={{ border: '1px solid var(--border)', padding: 8, textAlign: 'center' }}>{it.partNo || ''}</td>}
                  <td style={{ border: '1px solid var(--border)', padding: 8, textAlign: 'center' }}>{it.suppDelivery ? new Date(it.suppDelivery).toLocaleDateString(language === 'ID' ? 'id-ID' : 'en-US') : ''}</td>
                  <td style={{ border: '1px solid var(--border)', padding: 8, textAlign: 'center' }}>{it.qty}</td>
                  <td style={{ border: '1px solid var(--border)', padding: 8, textAlign: 'right' }}>{formatIDR(it.unitPrice, language)}</td>
                  <td style={{ border: '1px solid var(--border)', padding: 8, textAlign: 'right' }}>{formatIDR(amt, language)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <table style={{ width: 360, borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid var(--border)', padding: 8 }}>Subtotal</td>
              <td style={{ border: '1px solid var(--border)', padding: 8, textAlign: 'right' }}>{formatIDR(subtotal, language)}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid var(--border)', padding: 8 }}>{ppnLabel}</td>
              <td style={{ border: '1px solid var(--border)', padding: 8, textAlign: 'right' }}>{formatIDR(ppn, language)}</td>
            </tr>
            <tr>
              <td style={{ borderTop: '2px solid var(--border)', padding: 8, fontWeight: 700 }}>GRAND TOTAL</td>
              <td style={{ borderTop: '2px solid var(--border)', padding: 8, textAlign: 'right', fontWeight: 700 }}>{formatIDR(total, language)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Signatures */}
      <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Approved By</div>
          <div style={{ border: '1px dashed var(--border)', padding: 12, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ color: 'var(--text-secondary)' }}>PIC Procurement</div>
            <QRCode value={JSON.stringify({ type: 'po_signature', layout: 'B', name: 'PIC Procurement', po_number: header.number, issued_date: header.date })} size={90} ariaLabel={`QR signature for PIC Procurement`} />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Vendor Confirmation</div>
          <div style={{ border: '1px dashed var(--border)', padding: 12, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ color: 'var(--text-secondary)' }}>{recipient.name}</div>
            <QRCode value={JSON.stringify({ type: 'po_signature', layout: 'B', name: recipient.name, po_number: header.number, issued_date: header.date })} size={90} ariaLabel={`QR signature for ${recipient.name}`} />
          </div>
        </div>
      </div>
      {/* Footer notes */}
      <div style={{ marginTop: 10, color: 'var(--text-secondary)', fontSize: 11 }}>
        VAT (PPN) applies to subtotal only. PPh is shown as note when applicable.
      </div>
    </div>
  );
}
