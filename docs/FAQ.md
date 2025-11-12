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

## Onboarding Troubleshooting

### Playwright error: `winldd` missing
- Install the Windows dependency loader: `npx playwright install winldd`, then run `npx playwright test`.

### Playwright browsers hang during install
- Cancel the install, then re-run: `npx playwright install` → `npx playwright test`.
- If a lock occurs, close the terminal and retry the install.

### Vite preview shows blank page on deep routes
- Build with explicit base: `npm run build -- --base=/`.
- Then `npm run preview` and open `http://localhost:4173`.

### Proxy errors to `/api/*` during preview/tests
- These are expected when backend is not running; tests use seeded `localStorage`.
- Ignore `http proxy error` messages for `/api/analytics`, `/api/notifications`, etc.

### Ports and conflicts
- Dev server `5173`, Preview `4173`, Backend proxy `3001`.
- Stop conflicting processes or change ports if needed.

### Docker not available in Windows PowerShell
- Use WSL only: `wsl -d Ubuntu-20.04` then run Docker commands inside WSL.
- See SOP in `.trae/rules/project_rules.md`.
