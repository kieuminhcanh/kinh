# Tasks: Icon-only buttons → icon + text labels (bottom bar)

Spec → `./spec.md`

## Tasks

- [x] T01 [P] (P1) `locales/vi.json` + `locales/en.json` — added `reader.bar.{bookmark,history,tts,ttsStop,settings}` + `home.search`.
- [x] T02 [P] (P1) `.vitepress/theme/components/SettingsDrawer.vue` — added prop `showTrigger?: boolean` (default `true`); wrapped inline trigger in `v-if`.
- [x] T03 [P] (P1) `.vitepress/theme/components/HistoryButton.vue` — removed `'fab'` branch; prop is now optional `variant?: 'header'`.
- [x] T04 (P1) `.vitepress/theme/components/ReaderBottomBar.vue` (NEW) — fixed bottom bar, 4 buttons icon-over-text, safe-area inset, drawers via ref + v-model. Used `min-w-16` instead of `min-w-[64px]` per Tailwind lint hint.
- [x] T05 (P1) `.vitepress/theme/components/ReaderTools.vue` — FAB stack deleted; replaced with `<ReaderBottomBar>` receiving bookmark/TTS state + handlers via props/emits. Dropped `useI18n` + `SettingsDrawer` + `HistoryButton` imports.
- [x] T06 [P] (P1) `.vitepress/theme/components/Home.vue` — added "Tìm kiếm" labeled button between HistoryButton and columns group. Handler clicks `.VPNavBarSearch button`, falls back to Cmd/Ctrl+K dispatch.
- [x] T07 [P] (P1) `.vitepress/theme/style.css` (existing file, not new) — added `.VPNavBarSearch` offscreen rule (kept clickable) + `.vp-doc { padding-bottom: 5rem; }`.
- [~] T08 OBSOLETE — `style.css` already imported in `.vitepress/theme/index.ts`; no edit needed.
- [x] T09 (P2) Manual verify checklist — owner verified in dev.

## Checkpoints

- After T03 → typecheck green (HistoryButton consumers updated: `Home.vue` uses `variant="header"`, `ReaderTools.vue` no longer uses it).
- After T05 → `bun run dev` boots; reader page shows bar; FAB gone.
- After T08 → search overlay opens from Home button; Cmd+K still works; no double search UI.
- Pre-done analyze gate (>3 files edited) → re-read `spec.md` `## Acceptance`, tick each.

## Done log

- ~~T01~~ locales: + `reader.bar.*` + `home.search` — 2026-05-13
- ~~T02~~ SettingsDrawer: + `showTrigger` prop — 2026-05-13
- ~~T03~~ HistoryButton: removed `fab` variant — 2026-05-13
- ~~T04~~ ReaderBottomBar.vue (new): 4 labeled items + drawers — 2026-05-13
- ~~T05~~ ReaderTools.vue: FAB → bottom bar — 2026-05-13
- ~~T06~~ Home.vue: + labeled Search button — 2026-05-13
- ~~T07~~ style.css: VPNavBarSearch offscreen + `.vp-doc` padding — 2026-05-13
- T08 obsolete (style.css already imported) — 2026-05-13
- ~~T09~~ owner manual verify — 2026-05-13
