// Simple smoke tests for Phase 4 endpoints
import http from 'http';

const BASE = process.env.API_BASE || 'http://localhost:3001';
const headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer dev.x.Admin.code',
  'x-email': 'admin@example.com',
};

async function req(path, opts = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, { headers, ...opts });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  console.log(`\n[${opts.method || 'GET'} ${path}] status=${res.status}`);
  console.log(body);
  return body;
}

async function main() {
  await req('/api/health');
  await req('/api/email/oauth/start', {
    method: 'POST',
    body: JSON.stringify({ provider: 'gmail', account_email: 'proc.pic@example.com' }),
  });
  await req('/api/email/oauth/callback?provider=gmail&account_email=proc.pic@example.com&code=demo');
  const accounts = await req('/api/email/accounts');
  const account_id = Array.isArray(accounts?.rows) && accounts.rows.length ? accounts.rows[0].id : 1;
  await req('/api/email/sync', { method: 'POST', body: JSON.stringify({ account_id }) });
  await req('/api/webhooks/courier/jne', {
    method: 'POST',
    body: JSON.stringify({ tracking_no: 'ABC123', po_id: 42, status: 'in_transit', events: [{ ts: new Date().toISOString(), desc: 'Picked up' }] }),
  });
  // FX endpoints
  await req(`/api/fx/refresh`, {
    method: 'POST',
    body: JSON.stringify({ base: 'IDR', quote: 'USD', source: 'dev', rates: [{ rate_date: new Date().toISOString().slice(0,10), rate: 15500.1234 }] }),
  });
  await req(`/api/fx/latest?base=IDR&quote=USD`);
  await req(`/api/fx/history?base=IDR&quote=USD&days=7`);
}

main().catch((e) => {
  console.error('Smoke tests failed:', e);
  process.exitCode = 1;
});
