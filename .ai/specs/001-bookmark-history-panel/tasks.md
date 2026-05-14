# Tasks: Bookmark + History panel

Spec → `./spec.md`

## Format

- `Tnn [P] (Pn) <file> — task → deps: -` (P = parallel-safe within feature)
- IDs sequential. Deps reference IDs.
- One file per task when possible.

## Tasks

- [x] T01 [P] (P1) `.vitepress/theme/composables/useBookmarks.ts` — add `removeAll()` for bookmarks; add `clearAllPositions()` helper in same file (or extend `useReadingPositions`). No schema change. → deps: -
- [x] T02 [P] (P1) `.vitepress/data/kinh.ts` — add helper `findKinhBySlug(slug: string): KinhMeta | undefined` (used to resolve route path → catalog title). → deps: -
- [x] T03 [P] (P1) `locales/vi.json` + `locales/en.json` — add `history.*` keys: `title`, `tab.bookmarks`, `tab.reading`, `empty.bookmarks`, `empty.reading`, `clearAll`, `confirmClear`, `confirmYes`, `confirmNo`, `removeOne`, `open`, `close`, `percent`. → deps: -
- [x] T04 (P1) `.vitepress/theme/components/HistoryDrawer.vue` (NEW) — DaisyUI drawer + 2 tabs ("Đánh dấu" | "Đang đọc"). Reads `useBookmarks` + `useReadingPositions`. Filters positions `0.05 ≤ scrollPct < 0.98`. Lists sort `ts` desc. Click entry → navigate via `withBase` + restore scroll. Per-entry delete + "Clear all" with DaisyUI `modal` confirm. SSR-guard any `window` access. Touch targets ≥ 44×44, text labels (no icon-only). → deps: T01, T02, T03
- [x] T05 [P] (P1) `.vitepress/theme/components/HistoryButton.vue` (NEW) — opens HistoryDrawer. Prop `variant: 'header' | 'fab'`. `header` = inline button with text label. `fab` = circular FAB matching existing TTS/bookmark style. i18n `history.open` aria-label. → deps: T04
- [x] T06 (P1) `.vitepress/theme/components/Home.vue` — insert `<HistoryButton variant="header" />` into header bar next to columns join group. → deps: T05
- [x] T07 (P1) `.vitepress/theme/components/ReaderTools.vue` — insert `<HistoryButton variant="fab" />` into FAB stack between bookmark and TTS button. Note in spec: will move to bottom bar when 004-icon-text-labels lands. → deps: T05
- [ ] T08 [P] (P2) `tests/useBookmarks.test.ts` — **BLOCKED**: repo has no `vitest.config.ts` and no `tests/` dir yet. Creating test infra is outside this spec's scope. Deferred until either (a) owner approves infra setup as part of 001, or (b) a separate `setup-vitest` spec lands. → deps: T01

## Checkpoints

- After T03 → `bun run typecheck` green (locale JSON keys match templates used in T04/T05).
- After T04 → manual: open drawer in `bun run dev`, verify both tabs render, empty states show, filter threshold works (seed `localStorage` manually).
- After T06+T07 → entry point visible on Home + reader pages; click flow round-trips: open → click entry → navigate → scroll restores within 1s.
- After T08 → `bun run test tests/useBookmarks.test.ts` green.
- Pre-done analyze gate (>3 files edited) → re-read `spec.md` `## Acceptance`, tick each.

## Done log

- ~~T01~~ useBookmarks.ts: + `removeAll()` + `clearAllPositions()` — 2026-05-13
- ~~T02~~ data/kinh.ts: + `findKinhBySlug()` — 2026-05-13
- ~~T03~~ locales vi/en: + `history.*` namespace — 2026-05-13
- ~~T04~~ HistoryDrawer.vue (new): tabs + filter + per-item delete + confirm modal — 2026-05-13
- ~~T05~~ HistoryButton.vue (new): header/fab variants — 2026-05-13
- ~~T06~~ Home.vue: header entry inserted — 2026-05-13
- ~~T07~~ ReaderTools.vue: fab entry inserted between bookmark + TTS — 2026-05-13
- T08 — DEFERRED. No vitest infra in repo; out of scope for 001. Move to parking lot → future `setup-vitest` spec.
