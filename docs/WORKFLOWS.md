Language: [English](WORKFLOWS.md) | [Bahasa Indonesia](id/WORKFLOWS.md)

# Workflows

Detailed step-by-step flows with permissions, guards, and invariants.

## Purchase Request (PR)
- States: `draft → submitted → approved | rejected`.
- Actors: Operational/Procurement create; Finance/Admin approve.
- Guards: Only `approved` PRs are visible to suppliers and convertible to quotes.
- Audit: record transitions (actor, timestamp, comment).

## Quote Intake and Acceptance
- Visibility: suppliers see approved PRs only.
- Quote content: items, taxes/discounts, pricing, validity window; track versions.
- Acceptance: client marks a specific version as accepted; version lock prevents ambiguity.
- Audit: acceptance recorded with actor and timestamp.
 - Client can send a single PR to multiple suppliers; quotes are supplier-owned (clients review/approve, do not author).
 - Track distribution per PR using `sent_to[]` (supplier IDs + timestamps). Optionally mirror to EmailThread.

### Quote Approval & Rejection (Client)
- Actions: Approve or Reject a specific supplier quote version.
- Persistence: status transitions are stored and reflected in UI badges (`accepted`, `rejected`, `pending`).
- Audit: writes entries to the audit trail with actor, role, timestamp, and supplier/version context.
- Guarding: only Approved PRs allow quote comparison. Disabled actions show localized tooltips.

### Generate PO from Accepted Quote
- Entry point: from an `accepted` quote, “Generate PO” becomes enabled.
- Route Guard: `/procurement/po/preview` requires an accepted quote context; missing/mismatched context redirects back to Workflow or Quote Comparison.
- Prefill: PO preview seeds supplier, PR, and quote version; items remain sample until backend wire-up.
- Audit: generating a PO logs an event (entity `PR`, action `po_generate`).

## Create Purchase Order (PO) from Accepted Quote
- Initiation: PIC Procurement or Admin.
- Prefill: supplier, items, prices, taxes/discounts from accepted quote.
- Complete: delivery schedule, logistics terms, payment terms, incoterms, addresses, references (PR, Quote, Version).
- Guards:
  - Cannot create PO from draft/unaccepted quote.
  - Quantities/prices must match accepted quote; deviations require re-approval or new quote version.
  - Budget warnings for over-allocation.
  - Clients may split items across suppliers, resulting in multiple POs per original PR.
  - PO Numbering Scheme: `PRNumber-<SplitIndexTotal>-SupplierNick[-Revision]` (e.g., `09857-320-MBERKAH@-A`).
  - Budgets are warnings-only; `0` indicates no budget limit and is the default.
- Status change: `PO → Processing`.
- Audit: creation, edits, issuance.

## Delivery & Receiving
- Support: multiple deliveries per PO.
- Delivery Letter per shipment: shipped quantities, tracking no, dates.
- Client confirmation with corrections: adjust actual received quantities.
- Invariant per item: `sum(delivery.qty) ≤ sum(po.qty)`.
 - Client must have added suppliers before distributing PRs to enable multi-supplier intake.

## Invoicing & Payments
- Basis: invoices reference one or more confirmed Delivery Letters (can be partial).
- Invariant per PO: `sum(invoice.amount) ≤ sum(delivered.amount)`.
- Payment status logic (30-day): derived from `due_date` and `paid_at`.

## Reporting & Auditability
- Spending analytics, vendor performance, budget utilization.
- Audit trail maintained across all transitions.

## Access Controls (Enforced)
- Only approved PRs are visible to suppliers and eligible for quote conversion.
- Admin handles corporate configuration and can issue POs from accepted quotes.
- PIC Procurement operates PRs and PO conversion.
- PIC Operational handles PR creation and receiving corrections.
- PIC Finance approves PRs and processes invoices/payments.

### UI + Route Guards (Client & Supplier)
 - Mode-aware dashboards and navigation:
   - Client Dashboard (`/client`) is accessible only when acting as Client.
   - Supplier Admin family routes (`/supplier/admin`, `/supplier/reporting`, `/supplier/email`, `/admin/invitations`, `/admin/people`) require acting as Supplier and correct role (Admin where applicable).
   - Supplier Admin Dashboard surfaces supplier actions (New Quote) and hides client-only actions.
- Quote Builder access (Supplier):
  - Route guard: `/procurement/quote-builder` requires supplier context with at least one Approved PR distributed to that supplier.
  - UI gating: Sidebar and Topbar QuickSearch disable the link with a tooltip until the gate is met.
- Client Quote Comparison:
  - Route guard: `/client/quotes/:prId` requires `Approved` PR; otherwise redirect to workflow.
  - UI gating: PR List disables “Compare quotes” until `Approved`, with localized tooltip.
- PO Preview:
  - Route guard: `/procurement/po/preview` requires accepted quote context (`mpsone_quote_accepted` + `mpsone_po_from_quote`).
  - Redirects: Missing context → Workflow; mismatch → back to Quote Comparison.
- Distribute PR to suppliers:
  - Action gated in PR List; only `Approved` PRs can be sent. Tooltip clarifies requirement.
- Internationalization:
  - Tooltips and labels for gates are localized (EN/ID) via i18n provider.
