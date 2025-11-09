Language: [English](WORKFLOWS.md) | [Bahasa Indonesia](id/WORKFLOWS.md)

# Workflows

## Procurement Lifecycle
`PR → Quote → PO → Processing → Shipped → Delivered → Invoiced → Paid`

### Guards & Approvals
- Only approved PRs are visible to suppliers and eligible for quote conversion.
- PO generated from an accepted quote.
- Invoices must be backed by confirmed deliveries.

### Delivery & Invoicing
- Multiple deliveries per PO.
- Partial invoicing based on confirmed delivery quantities.

### Audit Trails
- Track actor, timestamp, and comment for PR approval, quote acceptance, PO creation, delivery confirmation, and invoicing.

