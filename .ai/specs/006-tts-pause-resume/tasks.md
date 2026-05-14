# Tasks: TTS pause / resume

Spec → `./spec.md`

## Format

- `Tnn [P] (Pn) <file> — task → deps: -` (P = parallel-safe within feature)
- IDs sequential. Deps reference IDs.
- One file per task when possible.

## Tasks

- [x] T01 [P] (P1) `locales/vi.json` + `locales/en.json` — add `reader.bar.ttsPause`, `reader.bar.ttsResume`, `reader.pause`, `reader.resume` keys (both locales). → deps: -
- [x] T02 [P] (P1) `.vitepress/theme/composables/useTts.ts` — expose `toggle` from `useSpeechSynthesis`; add `isPaused = computed(() => status.value === 'pause')`. Return `{ voices, isPlaying, isPaused, status, isSupported, speak, stop, toggle, setVoice }`. → deps: -
- [x] T03 (P1) `.vitepress/theme/components/ReaderBottomBar.vue` — add `isPaused: boolean` prop. Add `stop-tts` emit. TTS button 3-state (idle/playing/paused) with proper label/icon/aria. New separate Stop button `v-if="isPlaying || isPaused"` emits `stop-tts`. → deps: T01, T02
- [x] T04 (P1) `.vitepress/theme/components/ReaderTools.vue` — rewrite `toggleTts()` to call `tts.toggle()` when playing/paused, else `tts.speak(text)`. Add `stopTts()` handler → `tts.stop()`. Pass `:is-paused="tts.isPaused.value"` + `@stop-tts="stopTts"` to bar. → deps: T02, T03

## Checkpoints

- After T01 → `bun run typecheck` green (new locale keys present before T03 uses them).
- After T02 → `bun run typecheck` green; manual: `useTts()` returns `toggle` + `isPaused`.
- After T03 → bar renders without errors; visual check 3 states (need T04 to drive state changes).
- After T04 → full flow: open reader page → Phát → bar shows Tạm dừng + Dừng → Tạm dừng → bar shows Tiếp tục + Dừng → Tiếp tục → resumes from same position → Dừng → back to idle (only Phát visible). Navigate away → auto stop. SSR build OK.
- Pre-done analyze gate (4 files edited > 3) → re-read `spec.md` `## Acceptance`, tick each.

## Done log

- ~~T01~~ locales vi/en: + `reader.{pause,resume}` + `reader.bar.tts{Pause,Resume}` — 2026-05-13
- ~~T02~~ useTts.ts: + `toggle` re-export, + `isPaused` computed — 2026-05-13
- ~~T03~~ ReaderBottomBar.vue: 3-state TTS button + separate Stop button, computed label/aria — 2026-05-13
- ~~T04~~ ReaderTools.vue: toggleTts → speak/toggle, + stopTts handler, wire bar props/events — 2026-05-13
