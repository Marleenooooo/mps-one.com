import React, { useMemo, useState } from 'react';
import { useModule } from '../../components/useModule';
import { useI18n } from '../../components/I18nProvider';

type DataRow = Record<string, string | number>;

function downloadCSV(filename: string, rows: DataRow[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: string | number) => {
    const s = String(v);
    if (s.includes(',') || s.includes('\n') || s.includes('"')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => escape(r[h] ?? '')).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadPDF(filename: string, title: string, rows: DataRow[]) {
  // Lightweight, export-ready PDF placeholder using a simple HTML snapshot.
  // In production, replace with a PDF library (e.g., jsPDF) keeping this API.
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body>
  <h1 style="font-family: system-ui">${title}</h1>
  <table style="border-collapse: collapse; width: 100%; font-family: system-ui">
    <thead><tr>${headers.map(h => `<th style="border:1px solid #999;padding:6px;text-align:left">${h}</th>`).join('')}</tr></thead>
    <tbody>
      ${rows.map(r => `<tr>${headers.map(h => `<td style="border:1px solid #999;padding:6px">${String(r[h] ?? '')}</td>`).join('')}</tr>`).join('')}
    </tbody>
  </table>
  </body></html>`;
  const blob = new Blob([html], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Reporting() {
  useModule('reports');
  const { t } = useI18n();
  const [exporting, setExporting] = useState<string | null>(null);

  const spendingData = useMemo(() => ([
    { month: 'Jan', amount: 120_000_000 },
    { month: 'Feb', amount: 95_000_000 },
    { month: 'Mar', amount: 160_000_000 },
    { month: 'Apr', amount: 140_000_000 },
    { month: 'May', amount: 180_000_000 },
    { month: 'Jun', amount: 200_000_000 },
  ]), []);

  const vendorScores = useMemo(() => ([
    { vendor: 'PT. Batu Jaya', score: 86, onTime: '94%' },
    { vendor: 'CV. Mandiri Steel', score: 78, onTime: '89%' },
    { vendor: 'PT. Nusantara Logistik', score: 91, onTime: '97%' },
  ]), []);

  const budgets = useMemo(() => ([
    { dept: 'Operasional', used: 72 },
    { dept: 'Procurement', used: 58 },
    { dept: 'Finance', used: 33 },
  ]), []);

  const monthlyProcurement = useMemo(() => ([
    { month: 'Jan', pr: 18 },
    { month: 'Feb', pr: 22 },
    { month: 'Mar', pr: 15 },
    { month: 'Apr', pr: 25 },
    { month: 'May', pr: 28 },
    { month: 'Jun', pr: 31 },
  ]), []);

  const exportSection = (key: string, rows: DataRow[], type: 'csv' | 'pdf' = 'csv') => {
    setExporting(key);
    setTimeout(() => {
      if (type === 'csv') downloadCSV(`${key}.csv`, rows);
      else downloadPDF(`${key}.pdf`, key, rows);
      setExporting(null);
    }, 300);
  };

  return (
    <div className="main">
      <div className="page-header reports">
        <h1 style={{ margin: 0 }}>{t('reports.title')}</h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {/* Spending Analytics */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>{t('reports.spending_analytics')}</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn"
                onClick={() => exportSection('spending_analytics', spendingData, 'csv')}
                aria-busy={exporting === 'spending_analytics'}
                title="Export CSV"
              >
                {exporting === 'spending_analytics' ? '...' : 'CSV'}
              </button>
              <button
                className="btn outline"
                onClick={() => exportSection('spending_analytics', spendingData, 'pdf')}
                aria-busy={exporting === 'spending_analytics'}
                title="Export PDF"
              >
                {exporting === 'spending_analytics' ? '...' : 'PDF'}
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'end', gap: 8, height: 160 }} aria-label="Spending bar chart">
            {spendingData.map(d => (
              <div key={d.month} title={`${d.month}: Rp ${d.amount.toLocaleString('id-ID')}`}
                   style={{
                     width: 40,
                     height: Math.max(24, (d.amount / 200_000_000) * 140),
                     background: 'linear-gradient(135deg, #0077FF 0%, #0055CC 100%)',
                     borderRadius: 6,
                     boxShadow: '0 4px 12px rgba(0,119,255,0.3)',
                     transition: 'transform 0.2s ease',
                   }}
                   onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                   onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              ></div>
            ))}
          </div>
        </div>

        {/* Vendor Performance */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>{t('reports.vendor_performance')}</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn"
                onClick={() => exportSection('vendor_performance', vendorScores, 'csv')}
                aria-busy={exporting === 'vendor_performance'}
                title="Export CSV"
              >
                {exporting === 'vendor_performance' ? '...' : 'CSV'}
              </button>
              <button
                className="btn outline"
                onClick={() => exportSection('vendor_performance', vendorScores, 'pdf')}
                aria-busy={exporting === 'vendor_performance'}
                title="Export PDF"
              >
                {exporting === 'vendor_performance' ? '...' : 'PDF'}
              </button>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
            <thead>
              <tr style={{ textAlign: 'left' }}>
                <th>Vendor</th>
                <th>Score</th>
                <th>On-Time</th>
              </tr>
            </thead>
            <tbody>
              {vendorScores.map(v => (
                <tr key={v.vendor}>
                  <td>{v.vendor}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: 999,
                      background: v.score >= 85 ? 'linear-gradient(135deg, #39FF14 0%, #00CC66 100%)' : 'linear-gradient(135deg, #FFB800 0%, #FF5E00 100%)',
                      color: '#0A0F2D'
                    }}>{v.score}</span>
                  </td>
                  <td>{v.onTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Budget Utilization */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>{t('reports.budget_utilization')}</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn"
                onClick={() => exportSection('budget_utilization', budgets, 'csv')}
                aria-busy={exporting === 'budget_utilization'}
                title="Export CSV"
              >
                {exporting === 'budget_utilization' ? '...' : 'CSV'}
              </button>
              <button
                className="btn outline"
                onClick={() => exportSection('budget_utilization', budgets, 'pdf')}
                aria-busy={exporting === 'budget_utilization'}
                title="Export PDF"
              >
                {exporting === 'budget_utilization' ? '...' : 'PDF'}
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {budgets.map(b => (
              <div key={b.dept}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>{b.dept}</span>
                  <span>{b.used}%</span>
                </div>
                <div style={{ height: 10, borderRadius: 6, background: '#E5E9F0' }}>
                  <div style={{
                    width: `${b.used}%`,
                    height: '100%',
                    borderRadius: 6,
                    background: 'linear-gradient(90deg, #0077FF 0%, #0055CC 100%)',
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Procurement */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>{t('reports.monthly_procurement')}</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn"
                onClick={() => exportSection('monthly_procurement', monthlyProcurement, 'csv')}
                aria-busy={exporting === 'monthly_procurement'}
                title="Export CSV"
              >
                {exporting === 'monthly_procurement' ? '...' : 'CSV'}
              </button>
              <button
                className="btn outline"
                onClick={() => exportSection('monthly_procurement', monthlyProcurement, 'pdf')}
                aria-busy={exporting === 'monthly_procurement'}
                title="Export PDF"
              >
                {exporting === 'monthly_procurement' ? '...' : 'PDF'}
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'end', gap: 8, height: 160 }} aria-label="Monthly PR bar chart">
            {monthlyProcurement.map(d => (
              <div key={d.month} title={`${d.month}: ${d.pr} PR`}
                   style={{
                     width: 40,
                     height: Math.max(24, (d.pr / 31) * 140),
                     background: 'linear-gradient(135deg, #FF8A00 0%, #FF5E00 100%)',
                     borderRadius: 6,
                     boxShadow: '0 4px 12px rgba(255,138,0,0.3)',
                     transition: 'transform 0.2s ease',
                   }}
                   onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                   onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
