# Tasks: Quick A−/A+ font size buttons

Spec → `./spec.md`

## Tasks

- [x] T01 [P] (P1) `.vitepress/theme/components/ReaderBottomBar.vue` — import `useSettings`; add consts `MIN_FONT_SIZE=16`, `MAX_FONT_SIZE=28`, `FONT_SIZE_STEP=2`; computed `canDecrease` / `canIncrease`; handlers `decreaseFont` / `increaseFont` (clamp + assign). Insert 2 `<button>` elements between History and TTS slots with labels "A−" / "A+", `:disabled`, `:aria-disabled`, `:aria-label` via i18n keys. → deps: T02, T03
- [x] T02 [P] (P1) `locales/vi.json` — add `reader.bar.fontDecrease` = "Giảm cỡ chữ", `reader.bar.fontIncrease` = "Tăng cỡ chữ". → deps: -
- [x] T03 [P] (P1) `locales/en.json` — add `reader.bar.fontDecrease` = "Decrease font size", `reader.bar.fontIncrease` = "Increase font size". → deps: -
- [ ] T04 (P2) Manual verify — open any kinh page, confirm A−/A+ visible in bar, tap A+ until disabled at 28, tap A− until disabled at 16, reload → persisted. → deps: T01

## Checkpoints

- After T01 → diagnostics 0; visual: 6 items in bottom bar, font changes on tap.
- After T03 → no missing-i18n-key console warnings.
- Pre-done analyze gate → re-read `spec.md` `## Acceptance`, tick each.

## Done log

[Move completed items here with date.]
