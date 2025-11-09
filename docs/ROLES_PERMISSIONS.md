Language: [English](ROLES_PERMISSIONS.md) | [Bahasa Indonesia](id/ROLES_PERMISSIONS.md)

# Roles & Permissions

Roles: `Admin`, `PIC Operational`, `PIC Procurement`, `PIC Finance`.

## Access Matrix (Summary)
- PR creation: Operational/Procurement.
- PR approval: Finance/Admin.
- Quote creation: Supplier side (intake on client side is read/review).
- PO generation: Client Procurement/Admin from accepted quote.
- Delivery confirmation: Client receiver (department PIC or designated role).
- Invoice and payment processing: Finance.

## Notes
- Maintain audit trail for each transition: actor, timestamp, comment.
- Enforce approval gating in UI and APIs: only approved PRs visible to suppliers and convertible to quotes.
