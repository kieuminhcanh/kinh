# Tasks: Auto-scroll mode

Spec → `./spec.md`

## Format

- `Tnn [P] (Pn) <file> — task → deps: -` (P = parallel-safe within feature)
- IDs sequential. Deps reference IDs.
- One file per task when possible.

## Tasks

- [x] T01 [P] (P1) `locales/vi.json` + `locales/en.json` — add `reader.bar.autoScroll`, `reader.bar.autoScrollStop`, `reader.autoScroll.{start,stop}`, `settings.autoScroll.{label,slow,normal,fast}` (both locales). → deps: -
- [x] T02 [P] (P1) `.vitepress/theme/composables/useSettings.ts` — add `autoScrollSpeed: 'slow' | 'normal' | 'fast'` to `Settings` type + `DEFAULT` (`'normal'`). `mergeDefaults: true` already handles legacy users. → deps: -
- [x] T03 (P1) `.vitepress/theme/composables/useAutoScroll.ts` (NEW) — composable returns `{ isActive, start, stop, toggle }`. rAF loop calls `window.scrollBy(0, speedPx)` where `speedPx = { slow: 0.5, normal: 1, fast: 2 }[settings.value.autoScrollSpeed]`. End-of-page: `scrollY+clientHeight >= scrollHeight-2` → `stop()`. Listen `wheel`/`touchstart`/`keydown` (PageUp/Down/ArrowUp/Down/Home/End/Space) → pause rAF + 3s `setTimeout` → resume. SSR-guard. Cleanup on stop. → deps: T02
- [x] T04 (P1) `.vitepress/theme/components/ReaderBottomBar.vue` — + `autoScrollActive: boolean` prop, + `toggle-auto-scroll` emit. New button slot between A+ and TTS. Icon: down-arrow when idle / pause when active. State-dependent label + `aria-pressed`. → deps: T01
- [x] T05 (P1) `.vitepress/theme/components/ReaderTools.vue` — instantiate `useAutoScroll`, add `toggleAutoScroll()` handler. Wire `:auto-scroll-active` + `@toggle-auto-scroll`. Call `autoScroll.stop()` in existing `watch(path)` and `onBeforeUnmount`. → deps: T03, T04
- [x] T06 [P] (P2) `.vitepress/theme/components/SettingsDrawer.vue` — new section "Auto-scroll speed" (3-button `join` group like `gridColumns`). Binds to `settings.autoScrollSpeed`. → deps: T01, T02
- [x] T07 [P] (P2) `.ai/docs/arch.md` — add `autoScrollSpeed` row to `Settings` shape table. → deps: T02

## Checkpoints

- After T01 → `bun run typecheck` green.
- After T02 → typecheck green (Settings type tightened, no consumer breaks since field is new).
- After T03 → typecheck green; manual: console-instantiate in DevTools to verify state machine.
- After T05 → full flow on reader page: bật → trang cuộn đều → wheel/touch → pause → 3s → resume → end of page → auto stop, toggle OFF. Navigate away → stop. Refresh keep speed preference.
- After T06 → drawer shows speed picker, choosing changes settings, while active auto-scroll speed updates live.
- Pre-done analyze gate (>3 files edited) → re-read `spec.md` `## Acceptance`, tick each.

## Done log

- ~~T01~~ locales vi/en: + autoScroll keys — 2026-05-13
- ~~T02~~ useSettings.ts: + `AutoScrollSpeed` type, + `autoScrollSpeed: 'normal'` default — 2026-05-13
- ~~T03~~ useAutoScroll.ts (new): rAF loop, pause-on-interaction, end-of-page auto-stop — 2026-05-13
- ~~T04~~ ReaderBottomBar.vue: + auto-scroll toggle slot — 2026-05-13
- ~~T05~~ ReaderTools.vue: wire `useAutoScroll`, stop on route change — 2026-05-13
- ~~T06~~ SettingsDrawer.vue: + speed picker section — 2026-05-13
- ~~T07~~ arch.md: + `autoScrollSpeed` row — 2026-05-13
