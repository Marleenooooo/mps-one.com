import React, { useMemo } from 'react';
import { useModule } from '../useModule';
import { computeTotals, formatIDR, Language } from '../utils/format';
import { QRCode } from '../UI/QRCode';

type Party = {
  name: string;
  addressLines: string[];
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
};

type POHeader = {
  number: string;
  date: string; // ISO
  vendorRef?: string;
  dueDate?: string; // ISO
};

type Item = {
  description: string;
  unitPrice: number;
  qty: number;
  discountPct?: number; // only for Layout A
  taxed?: boolean; // display X
};

export function POLayoutA({
  issuer,
  recipient,
  header,
  items,
  showPPN = true,
  language = 'ID',
}: {
  issuer: Party;
  recipient: Party;
  header: POHeader;
  items: Item[];
  showPPN?: boolean;
  language?: Language;
}) {
  useModule('procurement');

  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => {
      const base = it.qty * it.unitPrice;
      const disc = it.discountPct ? base * (it.discountPct / 100) : 0;
      return sum + (base - disc);
    }, 0);
  }, [items]);

  const { ppnLabel, ppn, total } = computeTotals(subtotal, showPPN);

  const styles: React.CSSProperties = {
    fontSize: 12,
    color: 'var(--text-primary)'
  };

  return (
    <div className="po-layout po-layout-a" style={{ ...styles }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{issuer.name}</div>
          {issuer.addressLines.map((l, i) => (
            <div key={i} style={{ color: 'var(--text-secondary)' }}>{l}</div>
          ))}
          {issuer.phone && <div style={{ color: 'var(--text-secondary)' }}>Phone: {issuer.phone}</div>}
          {issuer.email && <div style={{ color: 'var(--text-secondary)' }}>Email: {issuer.email}</div>}
          {issuer.website && <div style={{ color: 'var(--text-secondary)' }}>Website: {issuer.website}</div>}
        </div>
        <div style={{ minWidth: 280 }}>
          <div style={{ fontWeight: 800, fontSize: 20, textAlign: 'right' }}>PURCHASE ORDER</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
            <tbody>
              <tr>
                <td style={{ width: 120, border: '1px solid var(--border)', padding: 6 }}>DATE</td>
                <td style={{ border: '1px solid var(--border)', padding: 6 }}>{new Date(header.date).toLocaleDateString(language === 'ID' ? 'id-ID' : 'en-US')}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid var(--border)', padding: 6 }}>ORDER #</td>
                <td style={{ border: '1px solid var(--border)', padding: 6 }}>{header.number}</td>
              </tr>
              {header.vendorRef && (
                <tr>
                  <td style={{ border: '1px solid var(--border)', padding: 6 }}>VENDOR REF</td>
                  <td style={{ border: '1px solid var(--border)', padding: 6 }}>{header.vendorRef}</td>
                </tr>
              )}
              {header.dueDate && (
                <tr>
                  <td style={{ border: '1px solid var(--border)', padding: 6 }}>DUE DATE</td>
                  <td style={{ border: '1px solid var(--border)', padding: 6 }}>{new Date(header.dueDate).toLocaleDateString(language === 'ID' ? 'id-ID' : 'en-US')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recipient */}
      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'inline-block', background: 'var(--surface2)', color: 'var(--text-primary)', padding: '4px 8px', borderRadius: 4, fontWeight: 700 }}>FOR</div>
        <div style={{ marginTop: 6, fontWeight: 600 }}>{recipient.name}</div>
        {recipient.addressLines.map((l, i) => (<div key={i} style={{ color: 'var(--text-secondary)' }}>{l}</div>))}
        {recipient.phone && <div style={{ color: 'var(--text-secondary)' }}>Tel: {recipient.phone}</div>}
      </div>

      {/* Items */}
      <div style={{ marginTop: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface2)', color: 'var(--text-primary)' }}>
              <th style={{ textAlign: 'left', padding: 8, border: '1px solid var(--border)', width: '48%' }}>DESCRIPTION</th>
              <th style={{ textAlign: 'right', padding: 8, border: '1px solid var(--border)', width: '14%' }}>UNIT PRICE (Rp.)</th>
              <th style={{ textAlign: 'center', padding: 8, border: '1px solid var(--border)', width: '7%' }}>QTY</th>
              <th style={{ textAlign: 'center', padding: 8, border: '1px solid var(--border)', width: '8%' }}>DISCOUNT</th>
              <th style={{ textAlign: 'center', padding: 8, border: '1px solid var(--border)', width: '6%' }}>TAXED</th>
              <th style={{ textAlign: 'right', padding: 8, border: '1px solid var(--border)', width: '17%' }}>AMOUNT (Rp.)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => {
              const base = it.qty * it.unitPrice;
              const disc = it.discountPct ? base * (it.discountPct / 100) : 0;
              const amt = base - disc;
              return (
                <tr key={idx}>
                  <td style={{ border: '1px solid var(--border)', padding: 8 }}>{it.description}</td>
                  <td style={{ border: '1px solid var(--border)', padding: 8, textAlign: 'right' }}>{formatIDR(it.unitPrice, language)}</td>
                  <td style={{ border: '1px solid var(--border)', padding: 8, textAlign: 'center' }}>{it.qty}</td>
                  <td style={{ border: '1px solid var(--border)', padding: 8, textAlign: 'center' }}>{it.discountPct ? `${it.discountPct.toFixed(1)}%` : '0.0%'}</td>
                  <td style={{ border: '1px solid var(--border)', padding: 8, textAlign: 'center' }}>{it.taxed ? 'X' : ''}</td>
                  <td style={{ border: '1px solid var(--border)', padding: 8, textAlign: 'right' }}>{formatIDR(amt, language)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <table style={{ width: 320, borderCollapse: 'collapse' }}>
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
              <td style={{ borderTop: '2px solid var(--border)', padding: 8, fontWeight: 700 }}>TOTAL</td>
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
            <QRCode value={JSON.stringify({ type: 'po_signature', layout: 'A', name: 'PIC Procurement', po_number: header.number, issued_date: header.date })} size={90} ariaLabel={`QR signature for PIC Procurement`} />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Vendor Confirmation</div>
          <div style={{ border: '1px dashed var(--border)', padding: 12, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ color: 'var(--text-secondary)' }}>{recipient.name}</div>
            <QRCode value={JSON.stringify({ type: 'po_signature', layout: 'A', name: recipient.name, po_number: header.number, issued_date: header.date })} size={90} ariaLabel={`QR signature for ${recipient.name}`} />
          </div>
        </div>
      </div>

      {/* Notes & Footer */}
      <div style={{ marginTop: 12, color: 'var(--text-secondary)', fontSize: 11 }}>
        <div><strong>Notes:</strong> Invoice must reference this PO number. PPh 23 for services applies as per regulation; shown as note only.</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, color: 'var(--text-secondary)' }}>
        <div>Purchase Order #{header.number}</div>
        <div>Page 1</div>
      </div>
    </div>
  );
}
