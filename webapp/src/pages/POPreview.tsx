import React, { useMemo, useState, useEffect } from 'react';
import * as pillarStorage from '../services/pillarStorage';
import { POLayoutA } from '../components/po/POLayoutA';
import { POLayoutB } from '../components/po/POLayoutB';
import { POLayoutC } from '../components/po/POLayoutC';
import { amountToWords, formatIDR } from '../components/utils/format';
import { useModule } from '../components/useModule';
import '../components/po/print.css';
import { canPerform } from '../services/permissions';

export default function POPreview() {
  useModule('procurement');
  const [language, setLanguage] = useState<'ID'|'EN'>('ID');
  const [showPPN, setShowPPN] = useState(true);
  const [layout, setLayout] = useState<'A'|'B'|'C'>('A');
  const [showStockCode, setShowStockCode] = useState(true);
  const [showPartNo, setShowPartNo] = useState(true);
  const [showPRNumber, setShowPRNumber] = useState(false);
  const [prNumber, setPrNumber] = useState('09857');
  const [splitIndex, setSplitIndex] = useState(3);
  const [splitTotal, setSplitTotal] = useState(20);
  const [supplierNick, setSupplierNick] = useState('MBERKAH@');
  const [revision, setRevision] = useState<'A'|''>('');
  const [fromQuote, setFromQuote] = useState<{ prId: string; supplierId: string; version: number } | null>(null);

  const sampleIssuer = {
    name: 'PT MPS One Indonesia',
    addressLines: ['Jl. Antasari No. 88, Samarinda', 'Kalimantan Timur, Indonesia'],
    phone: '+62 541 123456',
    email: 'procurement@mpsone.co.id',
    website: 'www.mpsone.co.id',
  };
  const sampleRecipient = {
    name: 'CV Samarinda Supplies',
    addressLines: ['Jl. Mulawarman No. 10', 'Samarinda, Kalimantan Timur'],
    phone: '+62 541 654321',
  };
  const sampleHeader = {
    number: 'PO-2025-0001',
    date: new Date().toISOString(),
    vendorRef: 'RFQ-8899',
    dueDate: new Date(Date.now() + 7*24*3600*1000).toISOString(),
  };
  const sampleItems = [
    { description: 'Safety Helmet SNI', unitPrice: 185000, qty: 30, discountPct: 5, taxed: true },
    { description: 'Reflective Vest', unitPrice: 95000, qty: 50, taxed: true },
    { description: 'Work Gloves', unitPrice: 45000, qty: 80, taxed: true },
  ];
  const sampleItemsB = [
    { description: 'Spare Part Hydraulic Hose 3/4"', uom: 'PCS', stockCode: 'STK-991', partNo: 'PN-445-77', suppDelivery: new Date(Date.now()+5*24*3600*1000).toISOString(), unitPrice: 1250000, qty: 6, prNumber: 'PR-443' },
    { description: 'Seal Kit Excavator', uom: 'SET', stockCode: 'STK-221', partNo: 'SK-EX-88', suppDelivery: new Date(Date.now()+9*24*3600*1000).toISOString(), unitPrice: 2150000, qty: 3, prNumber: 'PR-444' },
  ];
  const sampleItemsC = [
    { description: 'Diesel Fuel 200L', prNumber: 'PR-441', department: 'Mining Ops', qty: 4, uom: 'DRM', unitPrice: 3150000 },
    { description: 'Grease Moly 1kg', prNumber: 'PR-441', department: 'Maintenance', qty: 15, uom: 'KG', unitPrice: 85000 },
  ];

  const subtotal = useMemo(() => sampleItems.reduce((s, it) => {
    const base = it.unitPrice * it.qty;
    const disc = it.discountPct ? base * (it.discountPct/100) : 0;
    return s + (base - disc);
  }, 0), []);

  const words = useMemo(() => amountToWords(subtotal, language), [subtotal, language]);
  const poNumberPreview = useMemo(() => {
    const split = `${splitIndex}${splitTotal}`;
    const revPart = revision ? `-${revision}` : '';
    return `${prNumber}-${split}-${supplierNick}${revPart}`;
  }, [prNumber, splitIndex, splitTotal, supplierNick, revision]);

  // Prefill from accepted quote context
  useEffect(() => {
    try {
      const seedRaw = pillarStorage.getItem('mpsone_po_from_quote');
      if (seedRaw) {
        const seed = JSON.parse(seedRaw);
        if (seed && seed.prId && seed.supplierId) {
          setFromQuote({ prId: String(seed.prId), supplierId: String(seed.supplierId), version: Number(seed.version || 1) });
          setPrNumber(String(seed.prId));
          setSupplierNick(String(seed.supplierId));
          setShowPRNumber(true);
          setLayout('B');
        }
      }
    } catch {}
  }, []);

  return (
    <div className="page" style={{ padding: 16 }}>
      <div className="page-header" style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>PO Preview</h2>
        <div style={{ color: 'var(--text-secondary)' }}>Optimize for A4 portrait, print/PDF ready.</div>
        {fromQuote && (
          <div style={{ marginTop: 6, color: 'var(--text-secondary)' }}>
            From accepted quote v{fromQuote.version} — PR <strong>{fromQuote.prId}</strong>, Supplier <strong>{fromQuote.supplierId}</strong>
          </div>
        )}
      </div>
      <div className="card" style={{ padding: 12, marginBottom: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>PO Numbering Scheme Preview</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>PR Number</span>
            <input className="input" value={prNumber} onChange={e => setPrNumber(e.target.value)} style={{ width: 120 }} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Split Index</span>
            <input className="input" type="number" value={splitIndex} onChange={e => setSplitIndex(Number(e.target.value))} style={{ width: 80 }} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Total Splits</span>
            <input className="input" type="number" value={splitTotal} onChange={e => setSplitTotal(Number(e.target.value))} style={{ width: 80 }} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Supplier Nickname</span>
            <input className="input" value={supplierNick} onChange={e => setSupplierNick(e.target.value)} style={{ width: 140 }} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Revision</span>
            <select className="input" value={revision} onChange={e => setRevision(e.target.value as 'A'|'') }>
              <option value="">None</option>
              <option value="A">A</option>
            </select>
          </label>
          <div className="status-badge info">Preview: <code>{poNumberPreview}</code></div>
          <button className="btn" onClick={() => { navigator.clipboard?.writeText(poNumberPreview); alert('PO number copied'); }}>Copy</button>
        </div>
        <div style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
          Format: PRNumber-<em>SplitIndexTotal</em>-SupplierNick[-Revision]. Example: 09857-320-MBERKAH@-A
        </div>
      </div>
      <div className="controls" style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Language</span>
          <select value={language} onChange={e => setLanguage(e.target.value as 'ID'|'EN')}>
            <option value="ID">Bahasa Indonesia</option>
            <option value="EN">English</option>
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>Layout</span>
          <select value={layout} onChange={e => setLayout(e.target.value as 'A'|'B'|'C')}>
            <option value="A">Layout A</option>
            <option value="B">Layout B</option>
            <option value="C">Layout C</option>
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={showPPN} onChange={e => setShowPPN(e.target.checked)} />
          <span>Show PPN (Display line even if off)</span>
        </label>
        {layout === 'B' && (
          <>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={showStockCode} onChange={e => setShowStockCode(e.target.checked)} />
              <span>Show Stock Code</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={showPartNo} onChange={e => setShowPartNo(e.target.checked)} />
              <span>Show Part No</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={showPRNumber} onChange={e => setShowPRNumber(e.target.checked)} />
              <span>Show PR Number column</span>
            </label>
          </>
        )}
      </div>
      <div style={{ background: 'var(--surface)', padding: 16, borderRadius: 8, border: '1px solid var(--border)' }}>
        {layout === 'A' && (
          <POLayoutA issuer={sampleIssuer} recipient={sampleRecipient} header={sampleHeader} items={sampleItems} showPPN={showPPN} language={language} />
        )}
        {layout === 'B' && (
          <POLayoutB issuer={sampleIssuer} recipient={sampleRecipient} header={{ ...sampleHeader, department: 'Procurement', prNumber: 'PR-444' }} items={sampleItemsB} showPPN={showPPN} language={language} showStockCode={showStockCode} showPartNo={showPartNo} showPRNumber={showPRNumber} />
        )}
        {layout === 'C' && (
          <POLayoutC issuer={sampleIssuer} recipient={sampleRecipient} header={{ ...sampleHeader, department: 'Finance' }} items={sampleItemsC} showPPN={showPPN} language={language} approverName={'PIC Procurement'} vendorSignerName={'CV Samarinda Supplies'} />
        )}
      </div>
      {layout === 'A' && <div style={{ marginTop: 12, color: 'var(--text-secondary)' }}>{words}</div>}
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button className="btn primary" aria-disabled={!canPerform('create:po')} onClick={() => window.print()}>Print / Save PDF</button>
        <button className="btn secondary" onClick={() => alert(`Grand total: ${formatIDR(subtotal, language)}`)}>Quick Total</button>
      </div>
    </div>
  );
}
