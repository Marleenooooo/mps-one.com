# Changelog

## v0.1.1 (2025-11-09)

### Highlights
- UI theming consistency across dark and light modes.
- Replaced hardcoded gradients/colors with theme variables.
- Unified button styles (`primary`, `secondary`, `outline`) and micro-interactions.
- Standardized `status-badge` and `progress-bar` components.
- Module-aware accents using `--module-color` and `--module-gradient-end`.
- Updated `OfflineIndicator` to use theme-driven gradients and text variables.
- README wishlist: added `/login/client` friendly message and unknown redirect logging notes.

### Affected Files
- `webapp/src/pages/Login.tsx`
- `webapp/src/pages/Signup.tsx`
- `webapp/src/pages/CodeLogin.tsx`
- `webapp/src/pages/QuoteBuilder.tsx`
- `webapp/src/pages/procurement/PRCreate.tsx`
- `webapp/src/pages/DocumentManager.tsx`
- `webapp/src/pages/CommunicationHub.tsx`
- `webapp/src/pages/supplier/Reporting.tsx`
- `webapp/src/pages/supplier/EmailDashboard.tsx`
- `webapp/src/pages/supplier/AdminDashboard.tsx`
- `webapp/src/components/OfflineIndicator.tsx`

### Deployment Notes
- This project deploys manually (no CI/CD). See `DEPLOY.md` for environment variables and hosting steps.
- Recommended steps:
  - `cd webapp && npm ci && npm run build`
  - Upload the `webapp/dist/` contents to your hosting target
  - Ensure `VITE_APP_URL` and other envs are correct for your domain.

### Post-Deploy Checks
- Toggle theme and verify buttons, badges, progress bars, headers, and module accents render correctly.
- Validate `/login` and `/signup` flows and confirm no hardcoded hex colors remain in components.
