Sub‑Roadmap — Invoicing UI (Linked to Delivery Notes)

Purpose
- Link invoicing to Delivery Notes data; prevent over‑invoice; surface payment status clearly.
- Localize payment status labels and invoice UI elements (EN/ID).

Acceptance Criteria
- “Create Invoice” action is gated by `available_to_invoice` and shows a clear tooltip when disabled.
- Invoice modal displays remaining deliverable and Delivery References; submit validation prevents exceeding remaining.
- Payment status badges are localized and correctly computed: Paid, Over‑due, ≤7d Waiting, ≤14d Next, Neutral.
- Verified on `/supplier/reporting`; documented in `CHANGELOG.md` and `docs/UI_THEME_I18N.md`.

Plan — Breakdown Tasks
- Localize payment status labels via i18n keys in `I18nProvider`.
- Use localized labels in `Reporting.tsx` for tooltip, modal title, and references.
- Preview `/supplier/reporting` to verify badge labels and gating.
- Update UI theme/i18n docs to list new keys (EN/ID).

Verification Steps
- Run dev server; open `/supplier/reporting`.
- Confirm disabled tooltip appears with localized text when remaining deliverable is zero.
- Validate modal remaining deliverable and item references; ensure form validation messages.

Status
- Completed (2025-11-11):
  - Localized payment status labels; wired modal/tooltip and references to i18n.
  - Verified via preview; no console/terminal errors observed.
  - Documented keys in `docs/UI_THEME_I18N.md` and `docs/id/UI_THEME_I18N.md`; changelog updated.
