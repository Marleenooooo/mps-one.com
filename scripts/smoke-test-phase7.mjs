// Smoke tests for Phase 7: Preferences & Notifications
// Requires backend running at http://localhost:3001 (via Vite proxy /api)

const BASE = process.env.API_BASE || 'http://localhost:3001';
const HEADERS = {
  'Content-Type': 'application/json',
  // Dev-only header used by backend to resolve demo user
  'x-email': process.env.TEST_EMAIL || 'admin@example.com',
};

async function req(path, opts = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, { headers: HEADERS, ...opts });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  console.log(`\n[${opts.method || 'GET'} ${path}] status=${res.status}`);
  console.log(body);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}: ${text}`);
  return body;
}

async function run() {
  console.log('>> Phase 7 Smoke Tests (Preferences & Notifications)');

  // 1) Get current preferences (should exist or fallback)
  await req('/api/user/preferences');

  // 2) Update preferences (toggle notify flags and set theme/language)
  const prefsPayload = {
    theme: 'dark',
    language: 'en',
    notify_inapp: 1,
    notify_email: 0,
  };
  await req('/api/user/preferences', { method: 'PUT', body: JSON.stringify(prefsPayload) });

  // 3) List notifications (limit 5)
  const list1 = await req('/api/notifications?limit=5');

  // 4) Create a new notification
  const createPayload = {
    module: 'procurement',
    title: 'Smoke: Preference Saved',
    body: 'Your notification preferences were updated.',
    type: 'info',
  };
  const created = await req('/api/notifications', { method: 'POST', body: JSON.stringify(createPayload) });
  const createdId = created?.id;
  if (!createdId) throw new Error('Created notification has no id');

  // 5) Verify notification appears in list and mark as read
  const list2 = await req('/api/notifications?limit=10');
  const target = Array.isArray(list2?.rows) ? list2.rows.find(n => n.id === createdId) : null;
  if (!target) throw new Error(`Created notification ${createdId} not found in subsequent list`);
  await req(`/api/notifications/${createdId}`, { method: 'PUT', body: JSON.stringify({ is_read: 1 }) });

  // 6) Confirm read state persisted
  const list3 = await req('/api/notifications?limit=10');
  const target2 = Array.isArray(list3?.rows) ? list3.rows.find(n => n.id === createdId) : null;
  if (!target2 || !target2.is_read) throw new Error(`Notification ${createdId} did not persist read state`);

  console.log('\n>> Phase 7 smoke tests completed successfully.');
}

run().catch(err => {
  console.error('Smoke tests FAILED:', err);
  process.exitCode = 1;
});

