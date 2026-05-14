# Tasks: Focus mode

Spec → `./spec.md`

## Tasks

- [x] T01 [P] (P1) `.vitepress/theme/composables/useFocusMode.ts` — singleton ref + toggle/enter/exit + ESC keydown listener (SSR-guarded) → deps: -
- [x] T02 [P] (P1) `.vitepress/theme/components/FocusExitButton.vue` — fixed top-right exit button (shown only when focus on) → deps: T01
- [x] T03 (P1) `.vitepress/theme/components/ReaderBottomBar.vue` — add Focus slot button (icon + label) emitting `toggle-focus` → deps: T01
- [x] T04 (P1) `.vitepress/theme/components/ReaderTools.vue` — wire focus emit → `useFocusMode().toggle` → deps: T03
- [x] T05 (P1) `.vitepress/theme/Layout.vue` — mount `FocusExitButton`; toggle `<html>.focus-mode` class via watch; v-if guard ReadingProgress/ShareSection/ReaderTools when focus on → deps: T01, T02
- [x] T06 (P1) `.vitepress/theme/style.css` — `.focus-mode` rules to hide VitePress chrome + widen content → deps: T05
- [x] T07 [P] (P1) `locales/vi.json` + `locales/en.json` — `reader.bar.focus`, `reader.focus.exit` → deps: -

## Checkpoints

- After T06 → `bun run dev`; visit reader page, click Focus → all chrome hidden, content centered, exit button visible top-right.
- After T06 → ESC → exit. Reload → state reset (not persist).
- After T07 → all labels render in both locales.
