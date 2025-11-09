Language: [English](FAQ.md) | [Bahasa Indonesia](id/FAQ.md)

# FAQ

## Is this connected to a backend?
- Currently the app is a front-end SPA prepared for API wiring. Some flows use demo/sample data until connected.

## How do I convert a supplier quote into a PO?
- Accept the correct quote version, then click "Convert to PO". The PO preloads supplier/items/terms from the quote and enforces guards (matching quantities/prices).

## Why did my language default to Indonesian?
- First-time users in Indonesia get `id` by geolocation hint. You can switch back in the topbar.

## How are payment statuses calculated?
- Derived from `due_date`, current date, and `paid_at`: `paid`, `neutral`, `waiting payment (yellow)`, `next payment (green)`, `over‑due (red)`.

## Why can’t I invoice more than delivered?
- Invariant: `sum(invoice.amount) ≤ sum(delivered.amount)`.

## Can I split a quote across multiple POs?
- Yes. Each PO must reference the accepted quote version subset and follow guards/budget checks.

## How do I reset theme/language?
- Clear local storage keys `mpsone_lang` / `lang`. Refresh the page.
