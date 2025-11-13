# Theme Imitation Guide — Global Neon Style

Purpose
- Adopt the clean, neat, consistent theme patterns from `mpsone/components` into our app globally.
- Provide precise steps, class mappings, and verification so future changes remain coherent.

Scope
- Applies to all pages and shared components within `webapp/src/*`.
- Standardizes shapes, spacing, containers, buttons, headers, and sidebar interactions.

Key Tokens (already defined in `webapp/src/index.css`)
- Radii: `--radius-1`, `--radius-2`, `--radius-3`, `--radius-4`, `--radius-pill`.
- Spacing: `--space-4`, `--space-8`, `--space-12`, `--space-16`, `--space-24`.
- Containers: `--container-sm`, `--container-md`, `--container-lg`.
- Module colors and gradients for light/dark per Neon Corporate palette.

Utilities
- Radii: `.radius-sm`, `.radius-md`, `.radius-lg`, `.radius-xl`, `.radius-pill`.
- Spacing: `.pad-0`, `.pad-8`, `.pad-12`, `.pad-16`, `.pad-24`.
- Stacks: `.stack-8`, `.stack-12`, `.stack-16`.
- Containers: `.container-sm`, `.container-md`, `.container-lg`.
- Borders/Text: `.border-b`, `.border-t`, `.text-secondary`.
- Layout helper: `.center-grid`.
- Header background: `.header-gradient`.

Buttons
- Use variant classes globally: `.btn-primary`, `.btn-secondary`, `.btn-success`, `.btn-danger`, `.btn ghost`, `.btn outline`.
- Hover/active/disabled states handled via global CSS. Do not add inline shadows.
- Loading states: keep `LoadingButton` and apply variant classes via `className`.

Headers (Page/Card)
- Apply `.header-gradient border-b pad-16` to top sections.
- Titles use normal text color; gradient text is optional and can be added later.

Sidebar & Navigation
- Use `btn ghost` for items.
- Active item: `.btn.ghost.active` gains accent border/contrast.
- Out-of-context items: `.btn.ghost.out-of-context` reduces emphasis but retains focus visibility.

Forms & Inputs
- Inputs/selects inherit focus rings: `outline: 2px solid var(--module-color); outline-offset: 2px`.
- Keep placeholder and error colors aligned with palette.

Accessibility
- Contrast: 7:1 primary, 4.5:1 secondary.
- Focus indicators present for all interactive elements.

Implementation Steps
1) Global tokens/utilities exist in `webapp/src/index.css` (done).
2) Refactor pages to use utilities:
   - Login: use `.container-sm`, `.pad-*`, `.stack-*`, `btn-*` (done).
   - Topbar: toned-down glow, standardized toggles (done).
   - Sidebar: replace inline styles with `.pad-16`, `.border-b`, `.text-secondary` (in progress).
3) Verify via dev/preview servers. Check buttons, inputs, status badges, progress bars, headers, sidebar.
4) Update docs: `docs/UI_THEME_I18N.md` and `docs/id/UI_THEME_I18N.md` to describe utilities and usage.
5) Log in `CHANGELOG.md`.

Verification Checklist
- No console errors in browser during navigation.
- Buttons glow reduced ~50% yet remain legible in dark/light.
- Cards/tooltips use `.card` with standardized radius.
- Header sections display `.header-gradient` correctly.
- Sidebar items show hover/active/out-of-context states.

Notes
- Module selection via `data-module` or `useModule(...)` controls accent colors.
- Prefer utilities over inline styles; if a new pattern emerges, add a utility instead of repeating styles.

