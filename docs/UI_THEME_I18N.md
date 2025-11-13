Language: [English](UI_THEME_I18N.md) | [Bahasa Indonesia](id/UI_THEME_I18N.md)

# UI Theme & Internationalization

## Theme System
- Light and Dark themes with smooth transitions.
- Preferences persist via local storage; OS detection used on first load.
- Visual navigation uses module signature colors to orient users.

### Pillar Context Indicator (Topbar)
- Topbar shows active pillar via `data-module` using module theme variables.
- Indicator maintains contrast in dark/light modes; focus uses `outline: 2px solid var(--module-color)`.
- QuickSearch suggestions are filtered by the active pillar to reduce cross‑pillar navigation bleed.
- Sidebar de‑emphasizes out‑of‑context links with `.btn.ghost.out-of-context` while preserving navigation and focus.

### Dark Mode Palette (key values)
- Background `#0A0F2D`, Surface `#1A1F3A`, Text Primary `#FFFFFF`.
- Module colors: Procurement `#00F0FF`, Finance `#FF00E5`, Inventory `#39FF14`, Reports `#FFB800`, Alerts `#FF2A50`.

### Light Mode Palette (key values)
- Background `#FFFFFF`, Surface `#F8FAFF`, Text Primary `#0A0F2D`.
- Module colors: Procurement `#0077FF`, Finance `#B84DB8`, Inventory `#00A86B`, Reports `#FF8A00`, Alerts `#FF4444`.

### Interaction Highlights
- Primary/secondary buttons use gradient fills with glow effects.
- Focus indicators: `outline: 2px solid [module-color]; outline-offset: 2px`.
 - Skip Link: visible on focus at top-left; keyboard users can jump to main content.
 - Keyboard shortcuts: `/` focuses People search; Alt+Left/Right moves DataTable pages; Alt+P exports to PDF.

## Standardized Utilities & Tokens (Global)
- Shapes & spacing are standardized to keep a neat, consistent look across pages:
  - Radii: `.radius-sm`, `.radius-md`, `.radius-lg`, `.radius-xl`, `.radius-pill`.
  - Spacing: `.pad-0`, `.pad-8`, `.pad-12`, `.pad-16`, `.pad-24`.
  - Stacks: `.stack-8`, `.stack-12`, `.stack-16`.
  - Containers: `.container-sm`, `.container-md`, `.container-lg`.
  - Borders/Text: `.border-b`, `.border-t`, `.text-secondary`.
  - Layout: `.center-grid`.
  - Header: `.header-gradient` (module-aware gradient background).
- Buttons use variant classes: `.btn-primary`, `.btn-secondary`, `.btn-success`, `.btn-danger`, `.btn ghost`, `.btn outline`.
- Prefer utilities over inline styles. If you need a new pattern, add a utility in `webapp/src/index.css`.

See `immitation.md` for detailed steps and verification checklist.

## Language Preferences (i18n)
- Supported: English (`en`) and Indonesian (`id`).
- Storage keys: new `mpsone_lang` (primary), legacy `lang` maintained for compatibility.
- First-time default: geolocation hint sets `id` for Indonesia, `en` otherwise.
- Toggle language in the topbar; preference is cached locally across sessions.

### Procurement Actions (Localized Labels)
- Quote Comparison labels: `quotes.title`, `quotes.subtitle`, `quote.version`, `quote.total`, `quote.tax_rate`, `quote.discount`, `quote.valid_until`.
- Action labels: `action.approve_quote`, `action.reject_quote`, `po.generate_from_quote`.
- Status label group: `status.label`, `actions.label`.
- Alerts: `quote.approved_alert`, `quote.rejected_alert`.
- Gate tooltips: `gating.approval_required_compare`, `gating.approval_required_send`, `gating.quote_builder_disabled`.

### Delivery Notes & Reporting (Supplier) Keys
- Delivery Notes:
  - `delivery.title`, `delivery.header_desc`, `delivery.po_label`, `delivery.delivered_amount`
  - `delivery.table.item`, `delivery.table.ordered`, `delivery.table.shipped`, `delivery.table.received`, `delivery.table.correction`, `delivery.table.available_to_invoice`
  - `delivery.invariant`, `delivery.correction_aria`
- Supplier Reporting:
  - `reporting.create_invoice`, `reporting.remaining_deliverable`, `reporting.delivery_references`, `reporting.no_delivery_records`, `reporting.insufficient_delivered_amount`
  - Payment status: `reporting.status.paid`, `reporting.status.over_due`, `reporting.status.waiting`, `reporting.status.next`, `reporting.status.neutral`

Notes
- Ensure new keys are present in both `en` and `id` dictionaries within `webapp/src/components/I18nProvider.tsx`.
- UI states follow neon interactions: hover glow, scale, and accessible focus indicators.

## Troubleshooting
- To reset theme/language, clear local storage keys and refresh.
