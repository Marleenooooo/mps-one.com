Language: [English](REPORTING.md) | [Bahasa Indonesia](id/REPORTING.md)

# Reporting

## Overview
- Analyze spending, vendor performance, and budget utilization across departments.

## Key Reports
- Spending by department/vendor/period.
- PO lifecycle durations and delivery performance.
- Payment status distribution (paid, waiting, next, overdue).
- Next payment (green) schedule preview with countdown on dashboards.

## Exports
- Export-ready tables and charts with filters.

## Consistency
- Payment status calculation is consistent across dashboards and reports using `due_date` and `paid_at`.

## FX Rates for Reporting

To ensure consistent currency conversion in invoices and summary reports, the backend maintains daily FX rates per currency pair.

- Source table: `fx_rate (rate_date, base_ccy, quote_ccy, rate, source)` with unique `(rate_date, base_ccy, quote_ccy)`.
- Endpoints:
  - `GET /api/fx/latest?base=IDR&quote=USD` — returns latest rate and date.
  - `GET /api/fx/history?base=IDR&quote=USD&days=30` — returns time series for charts.
  - `POST /api/fx/refresh` — dev/manual populate or update; restricted to Admin.
- Caching & Locking: in-memory TTL cache for latest rates; one refresh per pair per day.

Usage guidance:
- Convert reported totals using the rate effective on the document date (e.g., invoice date).
- For charts, prefer history endpoint and align X-axis to `rate_date`.
- When `latest` not found, surface a clear UI message and fallback to local conversion rules.
