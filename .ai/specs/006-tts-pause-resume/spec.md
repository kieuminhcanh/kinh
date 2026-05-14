# Spec: TTS pause / resume

Status: done
Created: 2026-05-13
Slug: 006-tts-pause-resume

## Why

TTS hiện chỉ có Play + Stop. Người cao tuổi nghe rồi muốn dừng để nghe điện thoại / con cháu nói chuyện → bấm Stop → phải bắt đầu lại từ đầu. Web Speech API hỗ trợ `pause()` / `resume()` sẵn — không thêm dep.

## What

- Khi TTS đang phát → nút chuyển thành "Tạm dừng".
- Bấm "Tạm dừng" → TTS pause, giữ vị trí. Nút chuyển thành "Tiếp tục".
- Bấm "Tiếp tục" → TTS phát tiếp từ chỗ dừng.
- Nút "Dừng" riêng → reset hoàn toàn.
- State 3 trạng thái: idle, playing, paused.

## Out of scope

- Seek tới đoạn bất kỳ.
- Hightlight câu đang đọc.
- Background play khi tắt màn (PWA limitation).

## Acceptance criteria

- [x] Given idle, when bấm Play, then state → playing, văn bản được đọc. (`toggleTts` gọi `tts.speak`)
- [x] Given playing, when bấm Pause, then `speechSynthesis.pause()` gọi (qua VueUse `toggle`), state → paused, nút label đổi.
- [x] Given paused, when bấm Resume, then `speechSynthesis.resume()` gọi (qua VueUse `toggle`), TTS tiếp tục từ chỗ dừng.
- [x] Given playing/paused, when bấm Stop (nút riêng), then `cancel()` + state → idle.
- [x] Navigate sang route khác → auto stop (preserved: `watch(path, () => tts.stop())`).
- [x] i18n labels vi + en: Phát/Read · Tạm dừng/Pause · Tiếp tục/Resume · Dừng/Stop.

## Clarifications

1. **Pause/resume impl** → Dùng VueUse `toggle()` từ `useSpeechSynthesis` (re-export qua `useTts`). Status values: `"init" | "play" | "pause" | "end"`.
2. **Bottom bar UI** → 1 nút động 3-state (Phát/Tạm dừng/Tiếp tục) + nút Dừng riêng chỉ hiện khi `!idle`.
3. **Auto-pause tab inactive** → KHÔNG. Để user control; Web Speech tự pause trên mobile background.
4. **State source** → Dùng `status.value` trực tiếp từ VueUse. UI derive: `playing = status === 'play'`, `paused = status === 'pause'`, else idle.
5. **Navigate route change** → Giữ nguyên behavior hiện tại: auto `cancel()`. Không resume khi back.

## Plan (inline)

File touch list:

1. `.vitepress/theme/composables/useTts.ts` (EDIT) — expose `toggle` từ `useSpeechSynthesis`. Thêm computed `isPaused = computed(() => status.value === 'pause')`. Return shape mới: `{ ..., toggle, isPaused }`.
2. `.vitepress/theme/components/ReaderBottomBar.vue` (EDIT) — props thêm `isPaused: boolean`. Logic nút TTS:
   - idle (`!isPlaying && !isPaused`) → label `tts` (Phát), icon play, click emit `toggle-tts` → speak.
   - playing (`isPlaying`) → label `ttsPause` (Tạm dừng), icon pause, click emit `toggle-tts` → toggle.
   - paused (`isPaused`) → label `ttsResume` (Tiếp tục), icon play, click emit `toggle-tts` → toggle.
   - Nút Stop riêng `v-if="isPlaying || isPaused"` → emit `stop-tts`.
3. `.vitepress/theme/components/ReaderTools.vue` (EDIT) — `toggleTts()` rewrite:
   - nếu `isPaused` → `tts.toggle()` (resume).
   - nếu `isPlaying` → `tts.toggle()` (pause).
   - nếu idle → `tts.speak(text)`.
   - Thêm handler `stopTts()` → `tts.stop()` (bị đặt tên lại? — vẫn `cancel()`).
   - Pass `:is-paused="tts.isPaused.value"` + listen `@stop-tts`.
4. `locales/vi.json` + `locales/en.json` (EDIT) — add keys:
   - `reader.bar.ttsPause` ("Tạm dừng" / "Pause")
   - `reader.bar.ttsResume` ("Tiếp tục" / "Resume")
   - `reader.pause` ("Tạm dừng đọc" / "Pause reading") — aria-label long form
   - `reader.resume` ("Tiếp tục đọc" / "Resume reading")

No new dependencies. No storage schema change. Doc sync: KHÔNG cần update `arch.md`.

Bottom bar slot budget: hiện 6 slots (Bookmark, History, A−, A+, TTS, Settings). Thêm Stop slot khi `!idle` → 7 slots. Mobile (`max-w-3xl` ≈ 768px) vẫn fit với `flex-1 min-w-16` (6×64 = 384 → 7×64 = 448, < 768). OK.

## Notes

- Lưu ý bug Chrome cũ: pause > 15s rồi resume có thể đứt. Chấp nhận như limitation Web Speech.
- Mobile Safari quirk pause/resume — test thật trên iOS.
- VueUse `toggle(value?)` — không param → tự switch dựa trên `isPlaying`. Truyền `true` → force play, `false` → force pause.
