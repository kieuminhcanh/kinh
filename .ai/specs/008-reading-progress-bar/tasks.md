# Tasks: Reading progress bar

Spec → `./spec.md`

## Format

- `Tnn [P] (Pn) <file> — task → deps: -` (P = parallel-safe within feature)
- IDs sequential. Deps reference IDs.
- One file per task when possible.

## Tasks

- [x] T01 [P] (P1) `locales/vi.json` + `locales/en.json` — add `reader.progress` key (both locales). → deps: -
- [x] T02 [P] (P1) `.vitepress/theme/components/ReadingProgress.vue` (NEW) — fixed top bar 4px, rAF-throttled scroll listener, `prefers-reduced-motion` via VueUse `useMediaQuery` drops transition. ARIA progressbar role. SSR-guard. Numeric label v-if `pct > 0.05`. → deps: T01
- [x] T03 (P1) `.vitepress/theme/Layout.vue` — mount `<ReadingProgress v-if="isReader" />`. → deps: T02

## Checkpoints

- After T01 → `bun run typecheck` green.
- After T02 → manual: mount in isolation (or T03 first), scroll reader page, bar fills, label appears after >5%, smooth motion.
- After T03 → bar visible on reader pages, hidden on Home; navigate Home→reader→Home → no stale state; `bun run build` SSR ok.
- Pre-done analyze gate (3 files edited = boundary) → re-read `spec.md` `## Acceptance`, tick each.

## Done log

- ~~T01~~ locales vi/en: + `reader.progress` — 2026-05-13
- ~~T02~~ ReadingProgress.vue (new): rAF-throttled, reduce-motion aware, ARIA progressbar — 2026-05-13
- ~~T03~~ Layout.vue: mount above default Layout — 2026-05-13
