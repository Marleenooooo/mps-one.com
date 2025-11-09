Language: [English](USER_GUIDE.md) | [Bahasa Indonesia](id/USER_GUIDE.md)

# User Guide

Welcome to the B2B Procurement Webapp. This guide walks you through core modules and workflows aligned with the procurement lifecycle and permissions.

## Navigation Overview
- Procurement, Finance, Inventory, and Reports sections are color coded for clarity.
- Use the sidebar to access modules; the topbar provides language/theme toggles and quick actions.

## Purchase Requests (PR)
- Create PRs with items, need dates, and budgets. Submit for approval.
- Statuses: `draft → submitted → approved | rejected`.
- Only `approved` PRs are visible to suppliers and convertible to quotes.

## Quotes
- Suppliers submit quotes with versioning. You can review, request changes, or accept a version.
- Keep an audit trail of who approved what and when.

## Convert Quote → Purchase Order (PO)
- Accept the correct quote version, then click `Convert to PO`.
- The PO preloads supplier/items/terms from the accepted quote and enforces guards (matching quantities/prices).
- Link POs to departments and budgets.

## Order Processing & Delivery
- Multiple deliveries per PO are supported. Each shipment generates a `Delivery Letter`.
- Client confirms receipt and can correct quantities on the delivery note.

## Invoicing & Payments
- Invoices are based on client-confirmed deliveries and may be partial.
- Payment status uses `due_date`, today, and `paid_at`.
  - `paid`, `neutral`, `waiting payment (yellow)`, `next payment (green)`, `over‑due (red)`.

## Key Invariants
- Per item: `sum(delivery.qty) ≤ sum(po.qty)`.
- Per PO: `sum(invoice.amount) ≤ sum(delivered.amount)`.
- Corrections to delivery letters adjust invoiceable quantities.

## Email & Communication
- Templates with CC/BCC rules; thread messages linked to PR/Quote/PO/Delivery/Invoice.

## UI Theme & I18N
- Dark and light modes with neon corporate palette; language toggle supports English and Indonesian.

## Troubleshooting
- Reset theme or language by clearing local storage keys `mpsone_lang` / `lang` and refresh.

