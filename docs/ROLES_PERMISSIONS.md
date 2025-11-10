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

## Workflow Alignment Policy
- Front-end enforces role-based access according to procurement lifecycle.
- Admin: corporate configuration (Corporate Onboarding), invitations, PO generation from accepted quotes.
- PIC Procurement: PR management, review supplier quotes, convert accepted quotes to PO.
- PIC Operational: create PR, support receiving and delivery corrections.
- PIC Finance: PR approvals, invoice review, payment processing.
- Supplier side: receives approved PRs, submits quotes, processes shipments (Delivery Letters), issues invoices based on confirmed deliveries.

### Identity Policy (NPWP & Names)
- Admins: must provide 2 NPWP numbers — Company NPWP (account ID) and Personal NPWP (responsibility).
- Non-admins: provide 1 Personal NPWP; it becomes the user’s account ID.
- All accounts: must have a display name and nickname; used in the UI and audit trail.
