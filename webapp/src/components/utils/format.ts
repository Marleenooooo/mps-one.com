export type Language = 'ID' | 'EN';

export function formatIDR(amount: number, language: Language = 'ID') {
  const locale = language === 'ID' ? 'id-ID' : 'en-US';
  return amount.toLocaleString(locale, { style: 'currency', currency: 'IDR' });
}

export function computeTotals(subtotal: number, showPPN: boolean) {
  const EFFECTIVE_RATE = 0.11; // 11/12 * 12%
  const ppn = showPPN ? +(subtotal * EFFECTIVE_RATE).toFixed(2) : 0;
  const total = +(subtotal + ppn).toFixed(2);
  return { ppnLabel: 'VAT (PPN 12%)', ppn, total };
}

// Basic number-to-words (minimal implementation for Indonesian and English)
// Focused on integer amounts for PO totals; decimals are ignored.
const ID_SMALL = ['nol','satu','dua','tiga','empat','lima','enam','tujuh','delapan','sembilan','sepuluh','sebelas'];
function toWordsID(n: number): string {
  n = Math.floor(n);
  if (n < 12) return ID_SMALL[n];
  if (n < 20) return toWordsID(n - 10) + ' belas';
  if (n < 100) return toWordsID(Math.floor(n / 10)) + ' puluh' + (n % 10 ? ' ' + toWordsID(n % 10) : '');
  if (n < 200) return 'seratus' + (n - 100 ? ' ' + toWordsID(n - 100) : '');
  if (n < 1000) return toWordsID(Math.floor(n / 100)) + ' ratus' + (n % 100 ? ' ' + toWordsID(n % 100) : '');
  if (n < 2000) return 'seribu' + (n - 1000 ? ' ' + toWordsID(n - 1000) : '');
  if (n < 1000000) return toWordsID(Math.floor(n / 1000)) + ' ribu' + (n % 1000 ? ' ' + toWordsID(n % 1000) : '');
  if (n < 1000000000) return toWordsID(Math.floor(n / 1000000)) + ' juta' + (n % 1000000 ? ' ' + toWordsID(n % 1000000) : '');
  if (n < 1000000000000) return toWordsID(Math.floor(n / 1000000000)) + ' miliar' + (n % 1000000000 ? ' ' + toWordsID(n % 1000000000) : '');
  return toWordsID(Math.floor(n / 1000000000000)) + ' triliun' + (n % 1000000000000 ? ' ' + toWordsID(n % 1000000000000) : '');
}

function toWordsEN(n: number): string {
  n = Math.floor(n);
  const a = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
  const b = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
  function underThousand(x: number): string {
    if (x < 20) return a[x];
    if (x < 100) return b[Math.floor(x/10)] + (x%10? '-' + a[x%10] : '');
    return a[Math.floor(x/100)] + ' hundred' + (x%100? ' ' + underThousand(x%100) : '');
  }
  const units = ['','thousand','million','billion','trillion'];
  let words = '';
  let unitIndex = 0;
  while (n > 0) {
    const chunk = n % 1000;
    if (chunk) words = underThousand(chunk) + (units[unitIndex] ? ' ' + units[unitIndex] : '') + (words ? ' ' + words : '');
    n = Math.floor(n / 1000); unitIndex++;
  }
  return words || 'zero';
}

export function amountToWords(amount: number, language: Language = 'ID') {
  const int = Math.floor(amount);
  if (language === 'ID') return `Terbilang: ${toWordsID(int)} rupiah`;
  return `Amount in words: ${toWordsEN(int)} rupiah`;
}

