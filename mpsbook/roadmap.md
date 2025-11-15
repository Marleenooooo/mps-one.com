Roadmap — mpsbook (Social Pillar)

Goal
- Provide lightweight parity with mpsone: profiles, social graph, messaging placeholders, bridge analytics hooks, and performance discipline.
- Execute strictly in order; use PICK → PLAN → EXECUTE → NEXT.

## Execution Order (Single Source of Truth)
- Execute phases in the order below; no skipping.
- Acceptance for a phase requires: routes compile, preview shows no errors, typecheck/tests pass, docs updated.

## Phase A — Foundations
- [ ] Theme tokens and Neon VNS parity
- [ ] Routing skeleton: `/feed`, `/messages`, `/profiles`
- [ ] Basic pages: Feed, Messages placeholder, Profiles list
- [ ] Topbar/Sidebar minimal layout with breadcrumb and QuickSearch integration

## Phase B — Profiles & Social Graph
- [ ] People lists, profile pages
- [ ] Follow/block interactions (client-side mock)
- [ ] Invites and onboarding placeholders
- [ ] Doc viewer parity for shared assets

## Phase C — Bridge Hooks
- [ ] Shared analytics events
- [ ] Permissions matrix alignment with mpsone
- [ ] Bridge SDK hooks for shared auth/helpers

## Phase D — Performance
- [ ] Lazy routes and code splitting
- [ ] Virtualized long lists
- [ ] Bundle analysis and tuning

## Phase E — Release Prep
- [ ] Docs polish, preview verification, error monitoring hooks
- [ ] Final typecheck/tests pass

