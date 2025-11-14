# Subroadmap — Phase 7: Icon System Modernization (Lucide Migration)

Item: Migrate emoji icons to Lucide components for consistency and accessibility across UI
Status: Completed

Acceptance Criteria
- Topbar QuickSearch renders icons via Lucide mapping; no raw emoji in rendered results.
- Mode toggle uses Lucide ShoppingCart/Tag with accessible aria-labels (no emoji tooltips).
- OverscanControl labels use Lucide Folder and FileText.
- NotificationBell uses Lucide Bell; Logged-in status uses Lucide User.
- App sidebar toggle uses Lucide ChevronLeft/ChevronRight.
- CommunicationHub link button uses Lucide Link.
- UI preview shows no console or terminal errors.

Plan & Alignment
- Extend `renderIcon` mapping in Topbar QuickSearch to cover all used emoji codes.
- Replace direct emoji components in Topbar buttons with Lucide equivalents and improve aria-labels.
- Keep theme and i18n untouched; minimal visual changes aligned to neon theme.

Tasks
- [x] Extend `renderIcon` with mappings for 📄, 💵, 📈, ⬇️, ⚙️, 🔀.
- [x] Remove emoji tooltip on mode toggle and add descriptive aria-labels.
- [x] Ensure OverscanControl uses Folder/FileText icons.
- [x] Ensure NotificationBell uses Bell; Logged-in label uses User.
- [x] Replace App sidebar arrow emojis with Lucide chevrons.
- [x] Replace CommunicationHub link emoji with Lucide Link.
- [x] Run dev server and preview; verify no errors.
 - [x] Audit for inline emojis in pages and replace with Lucide (OrderTracker).
 - [x] Remove dormant emoji-based metrics array from EnterpriseDashboard.
 - [x] Build and scan for residual emojis; update CHANGELOG.

Notes
- Verified via local preview on Topbar and QuickSearch; no console/terminal errors observed.
- Kept Item.icon as string source for QuickSearch to maintain simple data model while rendering with Lucide components.
 - Additional audit (2025-11-14): No remaining inline emojis outside `Topbar` mapping; `OrderTracker` and `EnterpriseDashboard` aligned to Lucide.
