Language: [English](ROLES_PERMISSIONS.md) | [Bahasa Indonesia](id/ROLES_PERMISSIONS.md)

# Roles & Permissions

## Roles
- Admin, PIC Operational, PIC Procurement, PIC Finance.

## Access Matrix
- PR creation: Operational/Procurement; PR approval: Finance/Admin.
- Quote creation: Supplier; PO generation: Client Procurement.
- Delivery confirmation: Client receiver (department PIC).
- Invoice and payment processing: Finance.

## Onboarding Model (Facebook for Procurement)
- New users choose to sign up as a `Supplier Admin` or `Client Admin` to represent their company.
- Admins invite additional users via invitation codes; the code determines company, department, and role.
- Admins can manage invitations, departments, and roles from the admin dashboard.

### Invitation Policy (Clarified)
- Expiration: codes expire after 7 days.
- Usage: single-use redemption; once redeemed, a code cannot be reused.
- Scope: Supplier Admins invite within their company only. Cross-company relationships are handled via directories (friend-like connect), not cross-company invites.
- Allowed roles: `PIC Operational`, `PIC Procurement`, `PIC Finance`. Admins may attach multiple roles to an existing user later.

### Directories & Gating
- Supplier Directory: client-only; clients add suppliers like adding friends (pending → connected).
- Client Directory: supplier-only; suppliers add client accounts similarly (pending → connected).
- Quote Builder: supplier-only.
- Invitations: admin-only.
