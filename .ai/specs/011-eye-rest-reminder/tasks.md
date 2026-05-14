# Tasks: Eye-rest reminder

Spec → `./spec.md`

## Tasks

- [x] T01 (P1) `.vitepress/theme/composables/useSettings.ts` — add `eyeRestEnabled: boolean` field (default `false`) → deps: -
- [x] T02 [P] (P1) `.vitepress/theme/composables/useEyeRestTimer.ts` — new composable: interval tick, conditional counter, mute-until storage, due flag → deps: T01
- [x] T03 (P1) `.vitepress/theme/components/EyeRestToast.vue` — DaisyUI alert top-center with 2 buttons → deps: T02
- [x] T04 (P1) `.vitepress/theme/Layout.vue` — mount toast when reader + enabled → deps: T03
- [x] T05 (P1) `.vitepress/theme/components/SettingsDrawer.vue` — checkbox toggle for eye-rest → deps: T01
- [x] T06 [P] (P1) `locales/vi.json` + `locales/en.json` — `eyeRest.*` keys → deps: -
- [x] T07 [P] (P2) `.ai/docs/arch.md` — document settings field + new storage key → deps: T01, T02

## Checkpoints

- After T05 → Settings toggle persists across reload.
- After T04 → enable toggle + read reader page; toast does not appear before 25 min (can lower interval temporarily to test); "Đã nghỉ" resets; "Tắt hôm nay" silences till midnight.
- After T04 → switch to Home tab → counter pauses (verify by quick toggle).
- After T07 → arch doc reflects new field.
