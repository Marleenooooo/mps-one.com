Language: [English](WORKFLOWS.md) | [Bahasa Indonesia](id/WORKFLOWS.md)

# Workflows

## Procurement Lifecycle
`PR → Quote → PO → Processing → Shipped → Delivered → Invoiced → Paid`

### Guards & Approvals
- Only approved PRs are visible to suppliers and eligible for quote conversion.
- Quotes are supplier-owned; clients review/approve but do not create quotes.
- Client can send one PR to multiple suppliers to compare pricing/terms.
- PO is generated from an accepted quote; client may split items across different suppliers into separate POs.
- Invoices must be backed by client-confirmed deliveries.

### Delivery & Invoicing
- Multiple deliveries per PO.
- Partial invoicing based on confirmed delivery quantities.

### Supplier Management (Client)
- Clients must add suppliers (existing app accounts) before distributing PRs.
- Use Supplier Directory to manage supplier connections and visibility.

### PR Distribution & Tracking (Client)
- "Send PR to suppliers" is available on PR List (row action) and PR detail.
- Track `sent_to[]` per PR with supplier IDs and timestamps; optionally mirror to an email thread.
- Add suppliers first; connections use a friend-like model (pending → connected).

### PO Split Rules & Numbering Scheme
- Allow splitting quantities within a line item across suppliers.
- PO number format: `PRNumber-<SplitIndexTotal>-SupplierNick[-Revision]`.
  - Example: `09857-320-MBERKAH@-A` means PR `09857`, 3rd of 20 splits, supplier nickname `MBERKAH@`, revision `A`.
- Budgets: warnings only; clients can set `0` for no budget limitation (default `0`).

### Audit Trails
- Track actor, timestamp, and comment for PR approval, quote acceptance, PO creation, delivery confirmation, and invoicing.
