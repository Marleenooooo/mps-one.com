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
    const [rows] = await pool.query('SELECT invoice_id, po_id, amount, due_date, paid_at FROM v_invoice_status ORDER BY invoice_id DESC LIMIT 10');
    res.json({ ok: true, rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.listen(port, () => {
  console.log(`Backend API listening on http://localhost:${port}`);
});

