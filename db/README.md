# MPSOne Database — Daily Use

**Start Local Database**
- From `db/`, run `docker compose up -d`.
- phpMyAdmin: `http://localhost:8081/`.
- Login: Server `db`, User `mpsone_dev`, Password `devpass`, Database `mpsone_dev`.
- MySQL connection: Host `localhost`, Port `3306`.

**Apply Migrations**
- In phpMyAdmin, use Import to apply files from `db/migrations/`.
- Apply in numeric order starting with `0001_init.sql`.
- Seed files are optional; skip for a clean database.

**Quick Verification**
- Run: `SELECT * FROM v_po_item_delivery_totals;`.
- Run: `SELECT * FROM v_po_invoice_totals;`.
- Run: `SELECT invoice_id, derived_status, due_date, paid_at FROM v_invoice_status;`.

**Reset/Cleanup**
- Stop and remove containers: `docker compose down`.
- Full reset (remove data volume): `docker compose down -v`.

**Stop Database**
- `docker compose stop` to stop services without removing data.
