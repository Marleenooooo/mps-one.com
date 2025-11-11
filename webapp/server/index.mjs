import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors({
  origin: process.env.APP_ORIGIN || '*',
}));
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
});

// Simple role check middleware (demo). Reads role from header `x-role`.
// In production, replace with real auth (JWT/session) and RBAC.
function requireRole(roles = []) {
  return (req, res, next) => {
    const role = String(req.header('x-role') || 'Admin');
    if (roles.length && !roles.includes(role)) {
      return res.status(403).json({ ok: false, error: 'Forbidden: role not permitted', role });
    }
    next();
  };
}

app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT VERSION() AS version, DATABASE() AS db');
    res.json({ ok: true, ...rows[0] });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.get('/api/po/summary', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT po_id, ordered_qty, confirmed_qty FROM v_po_item_delivery_totals ORDER BY po_id DESC LIMIT 10');
    res.json({ ok: true, rows });
  } catch (err) {
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
    const [rows] = await pool.query(
      'SELECT id, company_id, department_id, requester_id, status, title, need_date, budget_code, approver, created_at, updated_at FROM pr ORDER BY id DESC LIMIT 50'
    );
    res.json({ ok: true, rows });
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
    const participants = Array.isArray(body.participants) ? body.participants : [];
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const [result] = await pool.query(
      'INSERT INTO email_thread (pr_id, po_id, participants_json, messages_json) VALUES (?, ?, CAST(? AS JSON), CAST(? AS JSON))',
      [pr_id, po_id, JSON.stringify(participants), JSON.stringify(messages)]
    );
    res.status(201).json({ ok: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Get a thread
app.get('/api/email-thread/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await pool.query('SELECT id, pr_id, po_id, participants_json, messages_json, created_at, updated_at FROM email_thread WHERE id=?', [id]);
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
    let sql = 'SELECT id, pr_id, po_id, participants_json, messages_json, created_at, updated_at FROM email_thread';
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

app.listen(port, () => {
  console.log(`Backend API listening on http://localhost:${port}`);
});
