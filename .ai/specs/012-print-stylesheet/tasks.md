# Tasks: Print stylesheet

Spec → `./spec.md`

## Format

- `Tnn [P] (Pn) <file> — task → deps: -`
- IDs sequential. One file per task when possible.

## Tasks

- [x] T01 (P0) `.vitepress/theme/style.css` — append `@media print { ... }` block: reset bg/color to black-on-white, body serif 14pt + line-height 1.6, `.vp-doc` max-width none + padding 0 + reset font-size/family/padding-bottom, page-break rules (h1-h3 avoid-after, p/li avoid-inside + orphans/widows 3), hide VPNav/VPSidebar/VPLocalNav/VPDocFooter/VPNavBarSearch, strip link styling + append URL after external links via attribute selector. → deps: -
- [x] T02 [P] (P1) `.vitepress/theme/components/ReaderBottomBar.vue` — add `print:hidden` to root `<nav>`. → deps: -
- [x] T03 [P] (P1) `.vitepress/theme/components/ReadingProgress.vue` — add `print:hidden` to root `<div>`. → deps: -
- [x] T04 [P] (P1) `.vitepress/theme/components/ContinueReadingCard.vue` — add `print:hidden` to root element. → deps: -

## Checkpoints

- After T01 → manual: `bun run build` then `bun run preview`, open reader page, Ctrl+P → preview shows black-on-white, no chrome, h2 headings not orphaned, external link URL appended.
- After T02-T04 → Ctrl+P preview clean of bottom bar / progress bar / continue card.
- Pre-done analyze gate (4 files = boundary) → re-read `spec.md` `## Acceptance`, tick each.

## Done log

- ~~T01~~ `style.css`: appended `@media print` block (~60 lines) — black-on-white, hide VP chrome, serif 14pt, page-break rules, external URL append — 2026-05-13
- ~~T02~~ `ReaderBottomBar.vue`: `print:hidden` on root nav — 2026-05-13
- ~~T03~~ `ReadingProgress.vue`: `print:hidden` on root div — 2026-05-13
- ~~T04~~ `ContinueReadingCard.vue`: `print:hidden` on root anchor — 2026-05-13
