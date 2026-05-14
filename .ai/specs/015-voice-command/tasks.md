# Tasks: Voice command

Spec → `./spec.md`

## Tasks

- [x] T01 [P] (P1) `.vitepress/theme/composables/useVoiceCommand.ts` — recognition wrapper, isSupported, start/stop, onCommand callback → deps: -
- [x] T02 (P1) `.vitepress/theme/components/ReaderBottomBar.vue` — add Voice slot button (v-if isSupported), emit `toggle-voice` → deps: T01
- [x] T03 (P1) `.vitepress/theme/components/ReaderTools.vue` — wire voice toggle + map onCommand → TTS handlers → deps: T02
- [x] T04 [P] (P1) `locales/vi.json` + `locales/en.json` — `voice.*` keys → deps: -

## Checkpoints

- After T03 → Chrome desktop: button visible, bấm → permission prompt → indicator on → say "đọc" → TTS starts.
- After T03 → say "dừng" → TTS stops. "tạm dừng" pause. "tiếp tục" resume.
- After T03 → Firefox: button hidden.
- After T03 → bấm nút lần 2 → indicator off, session ends.
