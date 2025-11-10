Language: [English](USER_GUIDE.md) | [Bahasa Indonesia](id/USER_GUIDE.md)

# User Guide

This guide explains how to use the B2B Procurement Webapp end-to-end: initiating requests, handling quotes, creating purchase orders, tracking deliveries, managing invoices and payments, and collaborating via documents and messaging.

## Audience & Roles
- Admin: full access across modules; can configure and override when needed.
- PIC Procurement: manages PRs, reviews supplier quotes, converts accepted quotes into POs, oversees orders.
- PIC Operational: initiates PRs and supports receiving; collaborates on corrections.
- PIC Finance: approves PRs, reviews payment terms, processes invoices and payments.

## Navigation Overview
- Sidebar groups modules: Procurement, Finance, Inventory, Reports.
- Page header uses module color cues for orientation.
- Topbar includes language toggle and theme switch.

### Role-Based Access & Workflow Alignment
- Admin: Corporate Onboarding, invitations, and can generate PO from accepted quotes.
- PIC Procurement: manage PRs, review supplier quotes, convert accepted quotes to POs.
- PIC Operational: create PRs and support receiving with corrections.
- PIC Finance: approve PRs, review invoices, process payments.
- Supplier Admin: access supplier-side pages (quote submission, shipments, invoicing) per approved PRs.

### Identity & NPWP Rules
- Admin accounts must submit two NPWP numbers:
  - Company NPWP: becomes the admin account ID; represents the corporate entity.
  - Personal NPWP: the admin’s personal responsibility identifier.
- Non-admin users submit one Personal NPWP; it becomes their account ID.
- All accounts must provide a display name and a nickname for clearer collaboration and auditability.

## Themes & Language
- Theme: switch between Light and Dark; preference persists.
- Language: English or Indonesian; preference persists to local storage.
  - First-time users may get a default based on geolocation (Indonesia → `id`, otherwise `en`).
  - You can change language anytime via the topbar.

## Procurement Lifecycle
State pipeline: `PR → Quote → PO → Processing → Shipped → Delivered → Invoiced → Paid`.

### 1) Purchase Request (PR)
- Create PR: department PIC or Procurement can initiate.
- Include: requester dept, item details (name, qty, unit), need date, budget notes.
- Submit for approval: Finance/Admin approve or reject.
- Guard: Only Approved PRs are visible to suppliers and eligible for quotes.

### 2) Supplier Quote
- Intake: Approved PRs are available for supplier quoting.
- Quote versioning: suppliers may submit revisions; select and accept the correct version.
- Review: validate items, taxes/discounts, pricing, validity window.
- Accept: lock the selected quote version to preserve auditability.

### 3) Convert Quote → Purchase Order (PO)
- From the accepted quote, click "Convert to PO".
- Prefill: supplier, client company, department, items, taxes/discounts from the quote.
- Complete: delivery schedule, shipping/logistics terms, payment terms, incoterms, addresses.
- References: link PR ID, Quote ID, Quote Version; assign a PO Number.
- Validate: totals vs department budget; quantities/prices should match accepted quote.
- Issue PO: the system generates the PO and advances status to `Processing`.

### 4) Delivery & Receiving
- Multiple deliveries per PO are supported.
- Each shipment has a Delivery Letter (Delivery Note): shipped quantities, tracking number, dates.
- Client confirmation: receiver confirms and may correct discrepancies (e.g., damaged or missing items).
- Corrections adjust available-to-invoice quantities.

### 5) Invoicing & Payment
- Invoices are issued based on confirmed deliveries; partial invoicing allowed.
- Invariants:
  - Per item: `sum(delivery.qty) ≤ sum(po.qty)`.
  - Per PO: `sum(invoice.amount) ≤ sum(delivered.amount)`.
- Payment status (30-day calendar): `paid`, `neutral`, `waiting payment (yellow)`, `next payment (green)`, `over‑due (red)`.
  - Derived from `due_date`, current date, and `paid_at`.

## Document Manager
- Store and version documents: PR attachments, quotes, PO PDFs, delivery letters, invoices.
- Perform bulk operations: upload, download, set access permissions.
- Version history: retain previous versions for audit.

## Communication Hub
- In-app messaging and email mirroring for supplier/client conversations.
- Templates with CC/BCC rules per client type; read receipts and @mentions.
- Attach files directly from Document Manager.

## Reporting
- Track spending, vendor performance, budget utilization.
- Export-ready reports with filters.
- Payment status consistency across dashboards and reporting.

## Audit Trail
- Every transition and key action records: actor, timestamp, comment.
- Examples: PR approval, quote acceptance, PO creation, delivery confirmation, invoicing, payments.

## Validations & Guards Summary
- Approved PR required before supplier quotes or PO conversion.
- PO must originate from an accepted quote; item changes require new quote or re-approval.
- Invoicing must respect confirmed delivery quantities and corrections.
- Budget warnings if PO total exceeds department allocation.

## Tips & Troubleshooting
- Language or theme not sticking? Clear local storage keys `mpsone_lang` / `lang` and try again.
- Geolocation set wrong language? Toggle language in the topbar; preference is persisted.
- Large documents? Use Document Manager bulk operations and versioning.
- Preview build: use `npm run preview` to review production-like behavior.

## Notes
- Current app is a front-end SPA ready for future API wiring; data workflows may use demo/sample data.
- Email flows and backend integrations are designed but may be simulated until connected.
