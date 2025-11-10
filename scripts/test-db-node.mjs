import mysql from 'mysql2/promise';

// Read connection from environment variables with sensible defaults
const cfg = {
  host: process.env.DB_HOST || 'srv1631.hstgr.io',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'YOUR_DB_USER',
  password: process.env.DB_PASSWORD || 'YOUR_DB_PASSWORD',
  database: process.env.DB_NAME || 'u485208858_mpsonedatabase',
};

async function main() {
  console.log('Connecting to MySQL...', cfg.host, cfg.port, cfg.database);
  const pool = mysql.createPool({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    database: cfg.database,
    waitForConnections: true,
    connectionLimit: 5,
  });

  const [verRows] = await pool.query('SELECT VERSION() AS version, DATABASE() AS db');
  console.log('Connected:', verRows[0]);

  // Optional sanity queries if schema is present
  try {
    const [poCount] = await pool.query('SELECT COUNT(*) AS cnt FROM po');
    console.log('PO rows:', poCount[0]?.cnt);
  } catch (e) {
    console.log('PO check skipped (table may not exist):', e.message);
  }

  try {
    const [viewRows] = await pool.query(
      'SELECT po_id, ordered_qty, confirmed_qty FROM v_po_item_delivery_totals ORDER BY po_id DESC LIMIT 5'
    );
    console.table(viewRows);
  } catch (e) {
    console.log('View check skipped (views may not exist):', e.message);
  }

  await pool.end();
}

main().catch((err) => {
  console.error('Connection failed:', err.message);
  process.exitCode = 1;
});

