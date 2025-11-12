import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import crypto from 'crypto';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors({
  origin: process.env.APP_ORIGIN || '*',
}));
app.use(express.json());

// --- Lightweight Analytics Collector (dev-friendly) ---
// Stores recent events in memory and logs to console for quick verification.
// In production, consider piping to log storage or APM.
const analyticsBuffer = [];
const ANALYTICS_MAX = 1000;

app.post('/api/analytics', (req, res) => {
  try {
    const body = req.body || {};
    const entry = {
      name: String(body.name || 'unknown'),
      data: body.data || null,
      ts: Number(body.ts || Date.now()),
      url: String(body.url || ''),
      ua: String(body.ua || (req.headers['user-agent'] || '')),
      ip: req.ip,
      received_at: new Date().toISOString(),
    };
    analyticsBuffer.push(entry);
    if (analyticsBuffer.length > ANALYTICS_MAX) analyticsBuffer.shift();
    // Dev visibility
    console.log(`[analytics] ${entry.name} ${entry.url}`);
    return res.status(201).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

// Optional: view recent analytics events (disabled in production)
app.get('/api/analytics', (req, res) => {
  if (String(process.env.NODE_ENV || '').toLowerCase() === 'production') {
    return res.status(403).json({ ok: false, error: 'Disabled in production' });
  }
  const limit = Math.min(Number(req.query.limit || 100), 500);
  const rows = analyticsBuffer.slice(Math.max(analyticsBuffer.length - limit, 0));
  return res.json({ ok: true, rows, count: rows.length });
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
});

// --- In-memory cache for FX rates ---
const fxCache = new Map(); // key: `${base}_${quote}` -> { ts: number, ttlMs: number, latest: { rate_date, rate } }
const fxDailyLocks = new Map(); // key: `${base}_${quote}_${date}` -> boolean

function cacheKey(base, quote) { return `${String(base).toUpperCase()}_${String(quote).toUpperCase()}`; }
function cacheGetLatest(base, quote) {
  const key = cacheKey(base, quote);
  const entry = fxCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > (entry.ttlMs || 10 * 60 * 1000)) { // default 10m TTL
    fxCache.delete(key);
    return null;
  }
  return entry.latest || null;
}
function cacheSetLatest(base, quote, latest, ttlMs = 10 * 60 * 1000) {
  const key = cacheKey(base, quote);
  fxCache.set(key, { ts: Date.now(), ttlMs, latest });
}

// --- Auth & RBAC (Phase 3 minimal) ---
// Parse dev token from Authorization: Bearer dev.<type>.<role>.<code>
function parseAuth(req) {
  const authz = req.header('authorization') || req.header('Authorization') || '';
  let email = String(req.header('x-email') || '').trim();
  let role = String(req.header('x-role') || '').trim();
  if (authz.toLowerCase().startsWith('bearer ')) {
    const token = authz.slice(7).trim();
    if (token.startsWith('dev.')) {
      const parts = token.split('.');
      // dev.<type>.<role>.<code>
      if (parts.length >= 4) {
        role = parts[2] || role || 'Admin';
      }
    }
  }
  if (!role) role = 'Admin';
  return { email, role };
}

function attachAuth(req, _res, next) {
  req.auth = parseAuth(req);
  next();
}
app.use(attachAuth);

// Role guard using parsed auth
function requireRole(roles = []) {
  return (req, res, next) => {
    const role = String(req?.auth?.role || 'Admin');
    if (roles.length && !roles.includes(role)) {
      return res.status(403).json({ ok: false, error: 'Forbidden: role not permitted', role });
    }
    next();
  };
}

// Audit utility
async function logAudit({ actorEmail, action, entityType = null, entityId = null, comment = null }) {
  try {
    await pool.query(
      'INSERT INTO audit_log (actor_email, action, entity_type, entity_id, comment) VALUES (?, ?, ?, ?, ?)',
      [String(actorEmail || ''), String(action), entityType, entityId, comment]
    );
  } catch (e) {
    // Swallow audit errors in demo mode
    console.warn('Audit log failed:', e?.message || e);
  }
}

app.get('/api/health', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT VERSION() AS version, DATABASE() AS db');
    return res.json({ ok: true, ...rows[0], db: true });
  } catch (err) {
    const msg = String(err?.message || err);
    // Graceful fallback: report health with db=false when unreachable
    if (msg.includes('ECONNREFUSED') || msg.includes('connect') || msg.includes('ENOTFOUND')) {
      return res.json({ ok: true, db: false, error: msg });
    }
    return res.status(500).json({ ok: false, error: msg });
  }
});

// Auth status endpoint (dev)
app.get('/api/auth/me', (req, res) => {
  res.json({ ok: true, role: req?.auth?.role || 'Admin', email: req?.auth?.email || null });
});

// --- Helpers to resolve current user id (demo-friendly) ---
async function resolveUserId(emailHint = null) {
  const conn = await pool.getConnection();
  try {
    const email = String(emailHint || '').trim();
    if (email) {
      const [[user]] = await conn.query('SELECT id FROM user WHERE email=? LIMIT 1', [email]);
      if (user?.id) return Number(user.id);
    }
    // Fallback demo user
    const [[client]] = await conn.query("SELECT id FROM company WHERE name='MPS One Demo' LIMIT 1");
    const [[user]] = await conn.query("SELECT id FROM user WHERE company_id=? AND email='proc.pic@example.com' LIMIT 1", [client?.id]);
    return Number(user?.id || 0);
  } finally {
    conn.release();
  }
}

// --- User Preferences ---
app.get('/api/user/preferences', async (req, res) => {
  try {
    const userId = await resolveUserId(req?.auth?.email || null);
    if (!userId) return res.json({ ok: true, row: null });
    const [rows] = await pool.query('SELECT user_id, theme, language, notify_inapp, notify_email, updated_at FROM user_preferences WHERE user_id=?', [userId]);
    const row = rows[0] || null;
    res.json({ ok: true, row });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.put('/api/user/preferences', async (req, res) => {
  try {
    const userId = await resolveUserId(req?.auth?.email || null);
    if (!userId) return res.status(400).json({ ok: false, error: 'User not found' });
    const body = req.body || {};
    const theme = ['light','dark','system'].includes(body.theme) ? body.theme : 'light';
    const language = ['en','id'].includes(body.language) ? body.language : 'en';
    const notify_inapp = body.notify_inapp ? 1 : 0;
    const notify_email = body.notify_email ? 1 : 0;
    await pool.query(
      'INSERT INTO user_preferences (user_id, theme, language, notify_inapp, notify_email) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE theme=VALUES(theme), language=VALUES(language), notify_inapp=VALUES(notify_inapp), notify_email=VALUES(notify_email)'
      , [userId, theme, language, notify_inapp, notify_email]
    );
    await logAudit({ actorEmail: req?.auth?.email, action: 'prefs.update', entityType: 'user_preferences', entityId: userId, comment: `${theme}/${language}` });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// --- Notifications ---
app.get('/api/notifications', async (req, res) => {
  try {
    const userId = await resolveUserId(req?.auth?.email || null);
    if (!userId) return res.json({ ok: true, rows: [] });
    const onlyUnread = String(req.query.unread || '').toLowerCase() === 'true';
    const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 200);
    const sql = onlyUnread ? 'SELECT * FROM notifications WHERE user_id=? AND is_read=0 ORDER BY id DESC LIMIT ?' : 'SELECT * FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT ?';
    const [rows] = await pool.query(sql, [userId, limit]);
    res.json({ ok: true, rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const userId = await resolveUserId(req?.auth?.email || null);
    if (!userId) return res.status(400).json({ ok: false, error: 'User not found' });
    const body = req.body || {};
    const module = ['procurement','finance','inventory','reports','alerts'].includes(body.module) ? body.module : 'alerts';
    const title = String(body.title || 'Notification');
    const notifBody = String(body.body || '');
    const type = ['info','warning','success','error'].includes(body.type) ? body.type : 'info';
    const [result] = await pool.query('INSERT INTO notifications (user_id, module, title, body, type, is_read) VALUES (?,?,?,?,?,0)', [userId, module, title, notifBody, type]);
    await logAudit({ actorEmail: req?.auth?.email, action: 'notifications.create', entityType: 'notification', entityId: result.insertId, comment: title });
    res.status(201).json({ ok: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.put('/api/notifications/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = await resolveUserId(req?.auth?.email || null);
    if (!userId) return res.status(400).json({ ok: false, error: 'User not found' });
    const body = req.body || {};
    const is_read = body.is_read ? 1 : 0;
    const [rows] = await pool.query('UPDATE notifications SET is_read=? WHERE id=? AND user_id=?', [is_read, id, userId]);
    if (!rows || rows.affectedRows === 0) return res.status(404).json({ ok: false, error: 'Not found' });
    await logAudit({ actorEmail: req?.auth?.email, action: 'notifications.update', entityType: 'notification', entityId: id, comment: `is_read=${is_read}` });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.get('/api/po/summary', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT po_id, ordered_qty, confirmed_qty FROM v_po_item_delivery_totals ORDER BY po_id DESC LIMIT 10');
    res.json({ ok: true, rows });
  } catch (err) {
    console.error('docs upload error:', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.get('/api/invoice/status', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT invoice_id, po_id, amount, due_date, paid_at, derived_status FROM v_invoice_status ORDER BY invoice_id DESC LIMIT 10');
    res.json({ ok: true, rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// --- Purchase Requests (PR) CRUD ---
// Helper: resolve demo defaults if body omits IDs
async function resolveDefaults() {
  const conn = await pool.getConnection();
  try {
    const [[client]] = await conn.query("SELECT id FROM company WHERE name='MPS One Demo' LIMIT 1");
    const [[dept]] = await conn.query("SELECT id FROM department WHERE company_id=? AND name='Procurement' LIMIT 1", [client?.id]);
    const [[user]] = await conn.query("SELECT id FROM user WHERE company_id=? AND email='proc.pic@example.com' LIMIT 1", [client?.id]);
    return { company_id: client?.id, department_id: dept?.id, requester_id: user?.id };
  } finally {
    conn.release();
  }
}

// List PRs (basic)
app.get('/api/pr', async (req, res) => {
  try {
    const status = req.query.status ? String(req.query.status) : null;
    const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 200);
    const offset = Math.max(Number(req.query.offset || 0), 0);
    let sql = 'SELECT id, company_id, department_id, requester_id, status, title, need_date, budget_code, approver, created_at, updated_at FROM pr';
    const params = [];
    if (status) { sql += ' WHERE status=?'; params.push(status); }
    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    const [rows] = await pool.query(sql, params);
    res.json({ ok: true, rows, pagination: { limit, offset } });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Get PR by id
app.get('/api/pr/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.query('SELECT * FROM pr WHERE id=?', [id]);
    if (!rows.length) return res.status(404).json({ ok: false, error: 'Not found' });
    res.json({ ok: true, row: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Create PR (submit)
app.post('/api/pr', requireRole(['Admin','PIC_Procurement','PIC_Operational']), async (req, res) => {
  try {
    const body = req.body || {};
    const defaults = await resolveDefaults();
    const company_id = Number(body.company_id || defaults.company_id);
    const department_id = Number(body.department_id || defaults.department_id);
    const requester_id = Number(body.requester_id || defaults.requester_id);
    const title = String(body.title || 'Untitled PR');
    const need_date = body.neededBy ? String(body.neededBy) : body.need_date ? String(body.need_date) : null;
    const description = body.description ? String(body.description) : null;
    const budget_code = body.budgetCode ? String(body.budgetCode) : body.budget_code ? String(body.budget_code) : null;
    const approver = body.approver ? String(body.approver) : null;
    const items = Array.isArray(body.items) ? body.items : [];
    const items_json = JSON.stringify(items);
    const status = 'submitted';

    const [result] = await pool.query(
      'INSERT INTO pr (company_id, department_id, requester_id, status, title, need_date, description, budget_code, approver, items_json) VALUES (?,?,?,?,?,?,?,?,?,CAST(? AS JSON))',
      [company_id, department_id, requester_id, status, title, need_date, description, budget_code, approver, items_json]
    );
    const id = result.insertId;
    await logAudit({ actorEmail: req?.auth?.email, action: 'pr.create', entityType: 'PR', entityId: id, comment: title });
    res.status(201).json({ ok: true, id });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Update PR
app.put('/api/pr/:id', requireRole(['Admin','PIC_Procurement']), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body || {};
    const fields = [];
    const values = [];
    function set(field, value) { fields.push(`${field}=?`); values.push(value); }
    if ('title' in body) set('title', String(body.title));
    if ('need_date' in body || 'neededBy' in body) set('need_date', String(body.need_date || body.neededBy));
    if ('description' in body) set('description', body.description ? String(body.description) : null);
    if ('budgetCode' in body || 'budget_code' in body) set('budget_code', String(body.budgetCode || body.budget_code));
    if ('approver' in body) set('approver', String(body.approver));
    if ('status' in body) set('status', String(body.status));
    if ('items' in body) set('items_json', JSON.stringify(body.items));
    if (!fields.length) return res.status(400).json({ ok: false, error: 'No updatable fields' });
    const sql = `UPDATE pr SET ${fields.join(', ')} WHERE id=?`;
    values.push(id);
    const [result] = await pool.query(sql, values);
    await logAudit({ actorEmail: req?.auth?.email, action: 'pr.update', entityType: 'PR', entityId: id, comment: JSON.stringify(body).slice(0, 256) });
    res.json({ ok: true, affectedRows: result.affectedRows });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Delete PR
app.delete('/api/pr/:id', requireRole(['Admin']), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [result] = await pool.query('DELETE FROM pr WHERE id=?', [id]);
    await logAudit({ actorEmail: req?.auth?.email, action: 'pr.delete', entityType: 'PR', entityId: id });
    res.json({ ok: true, affectedRows: result.affectedRows });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// --- Communication Threads (send/receive) ---
// Create a new email thread
app.post('/api/email-thread', requireRole(['Admin','PIC_Procurement','PIC_Finance']), async (req, res) => {
  try {
    const body = req.body || {};
    const pr_id = body.pr_id ? Number(body.pr_id) : null;
    const po_id = body.po_id ? Number(body.po_id) : null;
    const subject = body.subject ? String(body.subject) : null;
    const participants = Array.isArray(body.participants) ? body.participants : [];
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const [result] = await pool.query(
      'INSERT INTO email_thread (pr_id, po_id, subject, participants_json, messages_json) VALUES (?, ?, ?, CAST(? AS JSON), CAST(? AS JSON))',
      [pr_id, po_id, subject, JSON.stringify(participants), JSON.stringify(messages)]
    );
    await logAudit({ actorEmail: req?.auth?.email, action: 'thread.create', entityType: 'EmailThread', entityId: result.insertId });
    res.status(201).json({ ok: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Get a thread
app.get('/api/email-thread/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.query('SELECT id, pr_id, po_id, subject, participants_json, messages_json, created_at, updated_at FROM email_thread WHERE id=?', [id]);
    if (!rows.length) return res.status(404).json({ ok: false, error: 'Not found' });
    res.json({ ok: true, row: rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Append a message to a thread
app.post('/api/email-thread/:id/messages', requireRole(['Admin','PIC_Procurement','PIC_Finance','PIC_Operational']), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body || {};
    const message = body.message || {};
    const conn = await pool.getConnection();
    try {
      const [[row]] = await conn.query('SELECT messages_json FROM email_thread WHERE id=?', [id]);
      if (!row) return res.status(404).json({ ok: false, error: 'Thread not found' });
      let current;
      try {
        current = Array.isArray(row.messages_json) ? row.messages_json : JSON.parse(row.messages_json || '[]');
      } catch { current = []; }
      current.push(message);
      const [result] = await conn.query('UPDATE email_thread SET messages_json=CAST(? AS JSON) WHERE id=?', [JSON.stringify(current), id]);
      await logAudit({ actorEmail: req?.auth?.email, action: 'thread.append', entityType: 'EmailThread', entityId: id });
      res.json({ ok: true, affectedRows: result.affectedRows });
    } finally {
      conn.release();
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// List threads by context (PR/PO)
app.get('/api/email-thread', async (req, res) => {
  try {
    const prId = req.query.pr_id ? Number(req.query.pr_id) : null;
    const poId = req.query.po_id ? Number(req.query.po_id) : null;
    let sql = 'SELECT id, pr_id, po_id, subject, participants_json, messages_json, created_at, updated_at FROM email_thread';
    const params = [];
    if (prId != null) { sql += ' WHERE pr_id=?'; params.push(prId); }
    else if (poId != null) { sql += ' WHERE po_id=?'; params.push(poId); }
    sql += ' ORDER BY updated_at DESC LIMIT 50';
    const [rows] = await pool.query(sql, params);
    res.json({ ok: true, rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// --- Email Accounts (OAuth Dev Stubs) & Sync ---
// Begin OAuth (dev stub): create account and return a fake auth URL
app.post('/api/email/oauth/start', requireRole(['Admin','PIC_Procurement','PIC_Finance']), async (req, res) => {
  try {
    const provider = String(req.body?.provider || 'generic').toLowerCase();
    const account_email = String(req.body?.account_email || '').toLowerCase();
    if (!account_email) return res.status(400).json({ ok: false, error: 'Missing account_email' });
    const token = { dev: true, created_at: new Date().toISOString(), provider };
    const [result] = await pool.query(
      'INSERT INTO email_account (provider, account_email, token_json) VALUES (?, ?, CAST(? AS JSON)) ON DUPLICATE KEY UPDATE token_json=VALUES(token_json)',
      [provider, account_email, JSON.stringify(token)]
    );
    await logAudit({ actorEmail: req?.auth?.email, action: 'email.oauth.start', entityType: 'EmailAccount', entityId: result.insertId || null, comment: account_email });
    res.status(201).json({ ok: true, id: result.insertId || null, authUrl: `https://auth.example.com/${provider}`, account_email });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// OAuth callback (dev stub): update token_json
app.get('/api/email/oauth/callback', async (req, res) => {
  try {
    const provider = String(req.query?.provider || 'generic').toLowerCase();
    const account_email = String(req.query?.account_email || '').toLowerCase();
    const code = String(req.query?.code || '');
    if (!account_email) return res.status(400).json({ ok: false, error: 'Missing account_email' });
    const token = { dev: true, code, updated_at: new Date().toISOString(), provider };
    const [result] = await pool.query('UPDATE email_account SET token_json=CAST(? AS JSON) WHERE provider=? AND account_email=?', [JSON.stringify(token), provider, account_email]);
    await logAudit({ actorEmail: req?.auth?.email, action: 'email.oauth.callback', entityType: 'EmailAccount', entityId: null, comment: `${provider}:${account_email}` });
    res.json({ ok: true, affectedRows: result.affectedRows });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// List email accounts
app.get('/api/email/accounts', requireRole(['Admin','PIC_Procurement','PIC_Finance']), async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, provider, account_email, token_json, created_at FROM email_account ORDER BY id DESC');
    res.json({ ok: true, rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Delete email account
app.delete('/api/email/accounts/:id', requireRole(['Admin']), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [result] = await pool.query('DELETE FROM email_account WHERE id=?', [id]);
    await logAudit({ actorEmail: req?.auth?.email, action: 'email.account.delete', entityType: 'EmailAccount', entityId: id });
    res.json({ ok: true, affectedRows: result.affectedRows });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Manual sync trigger (dev): marks last_synced_at
app.post('/api/email/sync', requireRole(['Admin','PIC_Procurement','PIC_Finance']), async (req, res) => {
  try {
    const account_id = Number(req.body?.account_id || 0);
    if (!account_id) return res.status(400).json({ ok: false, error: 'Missing account_id' });
    const [result] = await pool.query(
      'INSERT INTO email_sync_state (account_id, last_synced_at) VALUES (?, NOW()) ON DUPLICATE KEY UPDATE last_synced_at=NOW()',
      [account_id]
    );
    await logAudit({ actorEmail: req?.auth?.email, action: 'email.sync', entityType: 'EmailAccount', entityId: account_id });
    res.json({ ok: true, affectedRows: result.affectedRows });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// --- Courier Webhooks ---
app.post('/api/webhooks/courier/:vendor', async (req, res) => {
  try {
    const vendor = String(req.params.vendor || '').toLowerCase();
    const tracking_no = String(req.body?.tracking_no || '');
    const po_id = Number(req.body?.po_id || 0);
    const status = String(req.body?.status || 'unknown');
    const events = Array.isArray(req.body?.events) ? req.body.events : [];
    if (!vendor || !tracking_no || !po_id) return res.status(400).json({ ok: false, error: 'Missing vendor/tracking_no/po_id' });
    const [result] = await pool.query(
      'INSERT INTO shipment_tracking (po_id, vendor, tracking_no, status, events_json) VALUES (?, ?, ?, ?, CAST(? AS JSON)) ON DUPLICATE KEY UPDATE status=VALUES(status), events_json=VALUES(events_json), updated_at=NOW()',
      [po_id, vendor, tracking_no, status, JSON.stringify(events)]
    );
    await logAudit({ actorEmail: req?.auth?.email, action: 'courier.webhook', entityType: 'ShipmentTracking', entityId: null, comment: `${vendor}:${tracking_no}` });
    res.status(201).json({ ok: true, id: result.insertId || null });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// --- FX Rates & Tax Utilities ---
// Latest rate for a currency pair
app.get('/api/fx/latest', async (req, res) => {
  try {
    const base = String(req.query?.base || 'IDR').toUpperCase();
    const quote = String(req.query?.quote || 'USD').toUpperCase();
    const cached = cacheGetLatest(base, quote);
    if (cached) return res.json({ ok: true, source: 'cache', latest: cached });
    const [rows] = await pool.query(
      'SELECT rate_date, rate, source FROM fx_rate WHERE base_ccy=? AND quote_ccy=? ORDER BY rate_date DESC LIMIT 1',
      [base, quote]
    );
    if (!rows.length) return res.status(404).json({ ok: false, error: 'Rate not found' });
    const latest = rows[0];
    cacheSetLatest(base, quote, latest);
    res.json({ ok: true, source: 'db', latest });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Historical rates for a pair
app.get('/api/fx/history', async (req, res) => {
  try {
    const base = String(req.query?.base || 'IDR').toUpperCase();
    const quote = String(req.query?.quote || 'USD').toUpperCase();
    const days = Math.min(Math.max(Number(req.query?.days || 30), 1), 365);
    const [rows] = await pool.query(
      'SELECT rate_date, rate, source FROM fx_rate WHERE base_ccy=? AND quote_ccy=? AND rate_date >= CURDATE() - INTERVAL ? DAY ORDER BY rate_date ASC',
      [base, quote, days]
    );
    res.json({ ok: true, rows, window_days: days });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Dev/manual refresh to populate rates
app.post('/api/fx/refresh', requireRole(['Admin']), async (req, res) => {
  try {
    const base = String(req.body?.base || 'IDR').toUpperCase();
    const quote = String(req.body?.quote || 'USD').toUpperCase();
    const source = String(req.body?.source || 'dev');
    const items = Array.isArray(req.body?.rates)
      ? req.body.rates
      : [0,1,2,3,4].map((i) => ({
          rate_date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0,10),
          rate: Number((15000 + i * 10).toFixed(4)),
        }));
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      let inserted = 0;
      for (const it of items) {
        const rate_date = String(it.rate_date);
        const lockKey = `${cacheKey(base, quote)}_${rate_date}`;
        if (fxDailyLocks.get(lockKey)) continue; // prevent double refresh same day
        fxDailyLocks.set(lockKey, true);
        const rate = Number(it.rate);
        const [result] = await conn.query(
          'INSERT INTO fx_rate (rate_date, base_ccy, quote_ccy, rate, source) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE rate=VALUES(rate), source=VALUES(source), created_at=CURRENT_TIMESTAMP',
          [rate_date, base, quote, rate, source]
        );
        inserted += result.affectedRows ? 1 : 0;
      }
      await conn.commit();
      // Bust cache for pair so next latest is fresh
      fxCache.delete(cacheKey(base, quote));
      await logAudit({ actorEmail: req?.auth?.email, action: 'fx.refresh', entityType: 'FX', comment: `${base}/${quote}:${inserted}` });
      res.status(201).json({ ok: true, inserted });
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// --- Users, Relationships, Blocks, Invites ---
async function getUserByEmail(email) {
  const [rows] = await pool.query('SELECT id, name, email, role FROM user WHERE email=? LIMIT 1', [email]);
  return rows.length ? rows[0] : null;
}

// List users (basic directory)
app.get('/api/users', async (req, res) => {
  try {
    const q = req.query.q ? String(req.query.q).trim() : '';
    const limit = Math.min(Math.max(Number(req.query.limit || 100), 1), 500);
    const offset = Math.max(Number(req.query.offset || 0), 0);
    const sort = (req.query.sort === 'email') ? 'email' : 'name';
    let sql = 'SELECT id, name, email, role FROM user';
    const params = [];
    if (q) { sql += ' WHERE name LIKE ? OR email LIKE ?'; params.push(`%${q}%`, `%${q}%`); }
    sql += ` ORDER BY ${sort} ASC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    const [rows] = await pool.query(sql, params);
    res.json({ ok: true, rows, pagination: { limit, offset }, sort });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Follow
app.post('/api/users/follow', async (req, res) => {
  try {
    const { followerEmail, followeeEmail } = req.body || {};
    if (!followerEmail || !followeeEmail) return res.status(400).json({ ok: false, error: 'Missing emails' });
    const follower = await getUserByEmail(String(followerEmail));
    const followee = await getUserByEmail(String(followeeEmail));
    if (!follower || !followee) return res.status(404).json({ ok: false, error: 'User not found' });
    // Block check: either direction blocks following
    const [blk] = await pool.query(
      'SELECT id FROM user_blocks WHERE (blocker_id=? AND blocked_id=?) OR (blocker_id=? AND blocked_id=?) LIMIT 1',
      [follower.id, followee.id, followee.id, follower.id]
    );
    if (blk.length) return res.status(409).json({ ok: false, error: 'Blocked: cannot follow' });
    await pool.query('INSERT IGNORE INTO user_relationships (follower_id, followee_id) VALUES (?, ?)', [follower.id, followee.id]);
    await logAudit({ actorEmail: req?.auth?.email, action: 'user.follow', entityType: 'User', entityId: followee.id, comment: `${follower.email} -> ${followee.email}` });
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Unfollow
app.post('/api/users/unfollow', async (req, res) => {
  try {
    const { followerEmail, followeeEmail } = req.body || {};
    if (!followerEmail || !followeeEmail) return res.status(400).json({ ok: false, error: 'Missing emails' });
    const follower = await getUserByEmail(String(followerEmail));
    const followee = await getUserByEmail(String(followeeEmail));
    if (!follower || !followee) return res.status(404).json({ ok: false, error: 'User not found' });
    const [result] = await pool.query('DELETE FROM user_relationships WHERE follower_id=? AND followee_id=?', [follower.id, followee.id]);
    await logAudit({ actorEmail: req?.auth?.email, action: 'user.unfollow', entityType: 'User', entityId: followee.id, comment: `${follower.email} -/-> ${followee.email}` });
    res.json({ ok: true, affectedRows: result.affectedRows });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Block
app.post('/api/users/block', async (req, res) => {
  try {
    const { blockerEmail, blockedEmail } = req.body || {};
    if (!blockerEmail || !blockedEmail) return res.status(400).json({ ok: false, error: 'Missing emails' });
    const blocker = await getUserByEmail(String(blockerEmail));
    const blocked = await getUserByEmail(String(blockedEmail));
    if (!blocker || !blocked) return res.status(404).json({ ok: false, error: 'User not found' });
    await pool.query('INSERT IGNORE INTO user_blocks (blocker_id, blocked_id) VALUES (?, ?)', [blocker.id, blocked.id]);
    // Optional: remove relationships if any
    await pool.query('DELETE FROM user_relationships WHERE (follower_id=? AND followee_id=?) OR (follower_id=? AND followee_id=?)', [blocker.id, blocked.id, blocked.id, blocker.id]);
    await logAudit({ actorEmail: req?.auth?.email, action: 'user.block', entityType: 'User', entityId: blocked.id, comment: `${blocker.email} x ${blocked.email}` });
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Unblock
app.post('/api/users/unblock', async (req, res) => {
  try {
    const { blockerEmail, blockedEmail } = req.body || {};
    if (!blockerEmail || !blockedEmail) return res.status(400).json({ ok: false, error: 'Missing emails' });
    const blocker = await getUserByEmail(String(blockerEmail));
    const blocked = await getUserByEmail(String(blockedEmail));
    if (!blocker || !blocked) return res.status(404).json({ ok: false, error: 'User not found' });
    const [result] = await pool.query('DELETE FROM user_blocks WHERE blocker_id=? AND blocked_id=?', [blocker.id, blocked.id]);
    await logAudit({ actorEmail: req?.auth?.email, action: 'user.unblock', entityType: 'User', entityId: blocked.id, comment: `${blocker.email} ~ ${blocked.email}` });
    res.json({ ok: true, affectedRows: result.affectedRows });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Relationships summary for a user
app.get('/api/users/:email/relationships', async (req, res) => {
  try {
    const email = String(req.params.email);
    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });
    const [followingRows] = await pool.query('SELECT u.email FROM user_relationships r JOIN user u ON u.id=r.followee_id WHERE r.follower_id=?', [user.id]);
    const [followersRows] = await pool.query('SELECT u.email FROM user_relationships r JOIN user u ON u.id=r.follower_id WHERE r.followee_id=?', [user.id]);
    res.json({ ok: true, following: followingRows.map(r => r.email), followers: followersRows.map(r => r.email) });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Blocks summary for a user
app.get('/api/users/:email/blocks', async (req, res) => {
  try {
    const email = String(req.params.email);
    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json({ ok: false, error: 'User not found' });
    const [blockedRows] = await pool.query('SELECT u.email FROM user_blocks b JOIN user u ON u.id=b.blocked_id WHERE b.blocker_id=?', [user.id]);
    const [blockedByRows] = await pool.query('SELECT u.email FROM user_blocks b JOIN user u ON u.id=b.blocker_id WHERE b.blocked_id=?', [user.id]);
    res.json({ ok: true, blocked: blockedRows.map(r => r.email), blockedBy: blockedByRows.map(r => r.email) });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Invite user (basic email token creation)
function randomToken(len = 24) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let t = '';
  for (let i = 0; i < len; i++) t += chars[Math.floor(Math.random() * chars.length)];
  return t;
}

app.post('/api/users/invite', async (req, res) => {
  try {
    const { fromEmail, toEmail } = req.body || {};
    if (!fromEmail || !toEmail) return res.status(400).json({ ok: false, error: 'Missing emails' });
    const inviter = await getUserByEmail(String(fromEmail));
    if (!inviter) return res.status(404).json({ ok: false, error: 'Inviter not found' });
    const token = randomToken(32);
    const [result] = await pool.query(
      'INSERT INTO user_invites (email, from_email, role, user_type, token, status, expires_at) VALUES (?, ?, NULL, NULL, ?, "pending", DATE_ADD(NOW(), INTERVAL 7 DAY))',
      [String(toEmail), String(fromEmail), token]
    );
    await logAudit({ actorEmail: req?.auth?.email || fromEmail, action: 'invite.create', entityType: 'Invite', entityId: result.insertId, comment: `${fromEmail} -> ${toEmail}` });
    res.status(201).json({ ok: true, id: result.insertId, token });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// List invites for an email
app.get('/api/users/:email/invites', async (req, res) => {
  try {
    const email = String(req.params.email);
    const [sent] = await pool.query(
      'SELECT id, email AS `to`, from_email AS `from`, token, status, created_at, expires_at FROM user_invites WHERE from_email=? ORDER BY created_at DESC',
      [email]
    );
    const [received] = await pool.query(
      'SELECT id, email AS `to`, from_email AS `from`, token, status, created_at, expires_at FROM user_invites WHERE email=? ORDER BY created_at DESC',
      [email]
    );
    res.json({ sent, received });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Update invite status (accept/decline/expire)
app.put('/api/users/invites/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body || {};
    const allowed = new Set(['pending','accepted','expired','declined']);
    const next = String(status || '').toLowerCase();
    if (!allowed.has(next)) return res.status(400).json({ ok: false, error: 'Invalid status' });
    const [result] = await pool.query('UPDATE user_invites SET status=? WHERE id=?', [next, id]);
    await logAudit({ actorEmail: req?.auth?.email, action: `invite.${next}`, entityType: 'Invite', entityId: id });
    res.json({ ok: true, affectedRows: result.affectedRows });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Cancel invite
app.delete('/api/users/invites/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [result] = await pool.query('DELETE FROM user_invites WHERE id=?', [id]);
    await logAudit({ actorEmail: req?.auth?.email, action: 'invite.delete', entityType: 'Invite', entityId: id });
    res.json({ ok: true, affectedRows: result.affectedRows });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Conversation block check for participants
app.post('/api/users/conv-blocked', async (req, res) => {
  try {
    const participants = Array.isArray(req.body?.participants) ? req.body.participants : [];
    const emails = participants.map(p => String(p.email || '').toLowerCase()).filter(Boolean);
    if (emails.length < 2) return res.json({ ok: true, blocked: false });
    const users = await Promise.all(emails.map(e => getUserByEmail(e)));
    const ids = users.filter(Boolean).map(u => u.id);
    if (ids.length < 2) return res.json({ ok: true, blocked: false });
    // Check any block among pairs
    let blocked = false;
    for (let i = 0; i < ids.length && !blocked; i++) {
      for (let j = i + 1; j < ids.length && !blocked; j++) {
        const a = ids[i], b = ids[j];
        const [rows] = await pool.query('SELECT id FROM user_blocks WHERE (blocker_id=? AND blocked_id=?) OR (blocker_id=? AND blocked_id=?) LIMIT 1', [a, b, b, a]);
        if (rows.length) blocked = true;
      }
    }
    res.json({ ok: true, blocked });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// --- Documents (secure storage, AV scan stub) ---
app.get('/api/docs', async (req, res) => {
  try {
    const type = req.query.type ? String(req.query.type) : null;
    const refId = req.query.ref_id ? Number(req.query.ref_id) : null;
    const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 200);
    const offset = Math.max(Number(req.query.offset || 0), 0);
    let sql = 'SELECT * FROM document';
    const params = [];
    if (type && refId != null) { sql += ' WHERE type=? AND ref_id=?'; params.push(type, refId); }
    else if (type) { sql += ' WHERE type=?'; params.push(type); }
    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    const [rows] = await pool.query(sql, params);
    return res.json({ ok: true, rows, pagination: { limit, offset } });
  } catch (err) {
    const msg = String(err?.message || err);
    if (msg.includes('ECONNREFUSED') || msg.includes('connect') || msg.includes('ENOTFOUND')) {
      // Offline fallback: return empty list to keep UI responsive
      return res.json({ ok: true, rows: [], pagination: { limit: Number(req.query.limit || 50), offset: Number(req.query.offset || 0) }, offline: true });
    }
    return res.status(500).json({ ok: false, error: msg });
  }
});

app.post('/api/docs/upload', requireRole(['Admin','PIC_Procurement','PIC_Finance','PIC_Operational']), async (req, res) => {
  try {
    const body = req.body || {};
    const type = String(body.type || 'Generic');
    const refId = body.refId != null ? Number(body.refId) : null;
    const url = String(body.url || '');
    const canAccess = Array.isArray(body.canAccess) ? body.canAccess : ['Admin'];
    const storageProvider = String(body.storage_provider || 'demo');
    const storageKey = String(body.storage_key || `demo/${Date.now()}`);
    const hash = body.hash_sha256 || crypto.createHash('sha256').update(`${type}|${url}|${storageKey}`).digest('hex');
    const [result] = await pool.query(
      'INSERT INTO document (type, ref_id, version, url, can_access_json, storage_provider, storage_key, hash_sha256, scan_status, scan_vendor, scan_at) VALUES (?, ?, 1, ?, CAST(? AS JSON), ?, ?, ?, "scanned", "demo", NOW())',
      [type, refId, url, JSON.stringify(canAccess), storageProvider, storageKey, hash]
    );
    await logAudit({ actorEmail: req?.auth?.email, action: 'doc.upload', entityType: 'Document', entityId: result.insertId, comment: `${type}:${refId}` });
    res.status(201).json({ ok: true, id: result.insertId, hash_sha256: hash });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.listen(port, () => {
  console.log(`Backend API listening on http://localhost:${port}`);
});
