import React, { useMemo } from 'react';
import { useModule } from '../useModule';
import { computeTotals, formatIDR, amountToWords, Language } from '../utils/format';
import { QRCode } from '../UI/QRCode';

type Party = { name: string; addressLines: string[] };
type POHeader = { number: string; date: string; department?: string };
type Item = { description: string; prNumber?: string; department?: string; qty: number; uom: string; unitPrice: number };

export function POLayoutC({
  issuer,
  recipient,
  header,
  items,
  showPPN = true,
  language = 'ID',
  approverName = 'Approved PIC',
  vendorSignerName = 'Vendor PIC',
}: {
  issuer: Party; recipient: Party; header: POHeader; items: Item[];
  showPPN?: boolean; language?: Language; approverName?: string; vendorSignerName?: string;
}) {
  useModule('procurement');
  const subtotal = useMemo(() => items.reduce((s, it) => s + it.qty * it.unitPrice, 0), [items]);
  const { ppnLabel, ppn, total } = computeTotals(subtotal, showPPN);
  const words = amountToWords(total, language);

  return (
    <div className="po-layout po-layout-c" style={{ fontSize: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>{issuer.name}</div>
          {issuer.addressLines.map((l, i) => <div key={i} style={{ color: 'var(--text-secondary)' }}>{l}</div>)}
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
            </tbody>
          </table>
        </div>
      </div>

      {/* Items */}
      <div style={{ marginTop: 10 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface2)', color: 'var(--text-primary)' }}>
              {['No','Description','PR Number','Department','Qty','UoM','Unit Price','Amount'].map((h, i) => (
                <th key={h} style={{ padding: 8, border: '1px solid var(--border)', textAlign: i >= 6 ? 'right' : i === 4 || i === 5 ? 'center' : 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx}>
                <td style={{ border: '1px solid var(--border)', padding: 8, textAlign: 'center' }}>{idx + 1}</td>
                <td style={{ border: '1px solid var(--border)', padding: 8 }}>{it.description}</td>
                <td style={{ border: '1px solid var(--border)', padding: 8 }}>{it.prNumber || ''}</td>
                <td style={{ border: '1px solid var(--border)', padding: 8 }}>{it.department || ''}</td>
                <td style={{ border: '1px solid var(--border)', padding: 8, textAlign: 'center' }}>{it.qty}</td>
                <td style={{ border: '1px solid var(--border)', padding: 8, textAlign: 'center' }}>{it.uom}</td>
                <td style={{ border: '1px solid var(--border)', padding: 8, textAlign: 'right' }}>{formatIDR(it.unitPrice, language)}</td>
                <td style={{ border: '1px solid var(--border)', padding: 8, textAlign: 'right' }}>{formatIDR(it.qty * it.unitPrice, language)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <table style={{ width: 360, borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid var(--border)', padding: 8 }}>Sub-Total</td>
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

      {/* Amount in words */}
      <div style={{ marginTop: 8, color: 'var(--text-secondary)' }}>{words}</div>

      {/* Signatures with QR JSON */}
      <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Approved By</div>
          <div style={{ border: '1px dashed var(--border)', padding: 12, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ color: 'var(--text-secondary)' }}>{approverName}</div>
            <QRCode
              value={JSON.stringify({ type: 'po_signature', layout: 'C', name: approverName, po_number: header.number, issued_date: header.date })}
              size={90}
              ariaLabel={`QR signature for ${approverName}`}
            />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Vendor Confirmation</div>
          <div style={{ border: '1px dashed var(--border)', padding: 12, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ color: 'var(--text-secondary)' }}>{vendorSignerName}</div>
            <QRCode
              value={JSON.stringify({ type: 'po_signature', layout: 'C', name: vendorSignerName, po_number: header.number, issued_date: header.date })}
              size={90}
              ariaLabel={`QR signature for ${vendorSignerName}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
