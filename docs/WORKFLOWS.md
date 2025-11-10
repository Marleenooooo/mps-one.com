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
