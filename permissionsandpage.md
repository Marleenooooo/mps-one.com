# Permissions & Page Matrix — Single Source of Truth

Purpose
- Canonical, machine-readable matrix that defines who can access what, under which mode, and for which flows.
- Every new route/feature MUST add a row here before implementation. PRs must reference row IDs.

Conventions
- Roles: Admin, PIC Operational, PIC Procurement, PIC Finance, Supplier Admin, Supplier PIC Procurement, Supplier PIC Finance.
- Modes: Client | Supplier.
- Pillar: Procurement | Social | Both.
- Permissions are kebab-case (e.g., `create:pr`, `approve:pr`, `open:comms`).

Columns
- ID | Route | Feature | Required Permission(s) | Required Role(s) | Allowed in Client Mode | Allowed in Supplier Mode | Primary Flow | Pillar

Matrix (Markdown table)

| ID | Route | Feature | Required Permission(s) | Required Role(s) | Client Mode | Supplier Mode | Primary Flow | Pillar |
|:--|:--|:--|:--|:--|:--:|:--:|:--|:--|
| PERM-001 | `/procurement/pr` | Purchase Requests list | `view:pr_list` | Admin; PIC Procurement;<br>PIC Operational; PIC Finance | Yes | No | Topbar/Sidebar → PR List; actions limited by role | Procurement |
| PERM-002 | `/procurement/pr/new` | Create PR | `create:pr` | PIC Operational; PIC Procurement; Admin | Yes | No | New PR form → submit/approve workflows | Procurement |
| PERM-003 | `/procurement/quote-builder` | Quote Builder | `build:quote` | Supplier Admin; Supplier PIC Procurement | No | Yes | Supplier build quote from approved PRs | Procurement |
| PERM-004 | `/procurement/po/preview` | PO Preview | `view:po_preview` | Admin; PIC Procurement | Yes | No | Preview PO from accepted quote | Procurement |
| PERM-005 | `/procurement/workflow` | Procurement Workflow | `view:procurement_workflow` | Admin; PIC Procurement;<br>PIC Operational; PIC Finance | Yes | Yes | Guided actions and gating overview | Procurement |
| PERM-006 | `/comms` | Communication Hub | `open:comms` | Admin; PIC Operational; PIC Procurement; PIC Finance;<br>Supplier Admin; Supplier PIC Procurement; Supplier PIC Finance | Yes | Yes | Messages/threads with blocked banner logic | Social |
| PERM-007 | `/supplier/admin` | Supplier Admin Dashboard | `view:supplier_admin` | Supplier Admin | No | Yes | Supplier admin overview | Procurement |
| PERM-007A | `/supplier/admin` | Supplier Admin Dashboard (actions) | `build:quote` | Supplier Admin | No | Yes | New Quote (client-only actions hidden) | Procurement |
| PERM-008 | `/supplier/reporting` | Supplier Reporting | `view:supplier_reporting` | Supplier Admin | No | Yes | Reporting dashboard | Procurement |
| PERM-009 | `/supplier/email` | Supplier Email Dashboard | `view:supplier_email` | Supplier Admin | No | Yes | Email integration pages | Procurement |
| PERM-010 | `/client/suppliers` | Supplier Directory | `view:supplier_directory` | Admin; PIC Procurement;<br>PIC Finance; PIC Operational | Yes | No | Client browsing suppliers | Procurement |
| PERM-011 | `/supplier/clients` | Client Directory | `view:client_directory` | Supplier Admin; Supplier PIC Procurement;<br>Supplier PIC Finance | No | Yes | Supplier browsing clients | Procurement |
| PERM-016 | `/client` | Client Dashboard | `view:client_dashboard` | Admin; PIC Operational;<br>PIC Procurement; PIC Finance | Yes | No | Client overview and quick PR | Procurement |
| PERM-017 | `/admin/invitations` | Invitations Management | `manage:invitations` | Supplier Admin | No | Yes | Manage supplier team invites | Procurement |
| PERM-018 | `/admin/people` | People Directory (Supplier Admin context) | `manage:people_directory` | Supplier Admin | No | Yes | Manage supplier people | Social |
| PERM-012 | `/admin/people` | People Directory | `manage:people_directory` | Admin | Yes | Yes | People management, invites | Social |
| PERM-013 | Topbar toggle | Switch procurement mode | `switch:procurement-mode` | Any logged-in role | Yes | Yes | Toggle Client↔Supplier; persists to profile/JWT | Both |
| PERM-014 | `/inventory/delivery-notes` | Delivery Notes | `manage:delivery_notes` | Admin; PIC Operational;<br>PIC Procurement | Yes | Yes | Record deliveries and corrections; drives available-to-invoice | Inventory |
| PERM-015 | `/supply/order-tracker` | Order Tracker | `view:order_tracker` | Admin; PIC Operational;<br>PIC Procurement; PIC Finance | Yes | Yes | Track shipment lifecycle with proof uploads | Inventory |

Notes
- Route guards should enforce both Role and Mode, and UI elements should hide/disable based on `Required Permission(s)`.
- Audit logs must include `active_mode` and permission checked.
- Analytics should tag pillar correctly (Social vs Procurement).
 - UI now surfaces an active Pillar indicator in the topbar and context guards: QuickSearch suggestions and sidebar visually de‑emphasize out‑of‑context links to reduce cross‑pillar bleed while preserving navigation.

Process Requirements
- Add row BEFORE implementing a new route/feature.
- PR description MUST reference row ID(s), e.g., “Implements PERM-001 & FLOW-012”.
- QA test cases must reference row IDs and cover positive/negative scenarios.
