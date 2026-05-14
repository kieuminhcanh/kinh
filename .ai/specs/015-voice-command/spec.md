# Spec: Voice command (điều khiển bằng giọng nói)

Status: done
Created: 2026-05-13
Slug: 015-voice-command

## Why

Người cao tuổi tay run, mắt kém, tay đang lần tràng hạt — không tiện bấm. Lệnh giọng cho 4 action TTS quan trọng (đọc, dừng, tạm dừng, tiếp tục) giải phóng tay.

## What — MVP

- Nút "Lệnh giọng" trong `ReaderBottomBar` (slot mới, chỉ render khi Web Speech Recognition support).
- Toggle session model: bấm bật → mic listen continuous trong session → user bấm tắt khi xong.
- Visual indicator khi listening (icon đỏ nhấp nháy + text "đang nghe").
- 4 phrase tiếng Việt cố định (case-insensitive, partial-match):
  - "đọc" / "phát" → start TTS (giống nút Đọc)
  - "dừng" → stop TTS
  - "tạm dừng" → pause TTS
  - "tiếp tục" → resume TTS
- Recognition error / unsupported → hide button (no disabled state).
- Recognition language: `vi-VN` fixed.

## Out of scope

- Font/nav lệnh ("phóng to", "thu nhỏ", "về trang chủ") — Q13 chốt core set.
- Search by voice.
- Multi-language.
- Wake word.
- Always-on listening across reload.
- Server-side STT.

## Acceptance criteria

- [x] Browser không support `SpeechRecognition` / `webkitSpeechRecognition` → nút ẩn hoàn toàn.
- [x] Browser support → nút hiện trong ReaderBottomBar.
- [x] Bấm nút → request mic permission (lần đầu) → indicator "đang nghe" hiện → start recognition session.
- [x] Bấm nút lần nữa → stop recognition, indicator tắt.
- [x] Trong session, nói "đọc" → TTS bắt đầu (cùng action như nút Đọc).
- [x] Trong session, nói "dừng" → TTS stop.
- [x] Trong session, nói "tạm dừng" → TTS pause.
- [x] Trong session, nói "tiếp tục" → TTS resume.
- [x] Recognition error (no-speech, network, permission denied) → silently restart session OR end gracefully (no crash).
- [x] Recognition language = `vi-VN`.
- [x] i18n: "Lệnh giọng" / "Đang nghe" / aria-labels.

## Clarifications

Resolved 2026-05-13 (owner approved AI recommendations):

- Q13: Scope? → **Core set**: 4 TTS commands (đọc/phát, dừng, tạm dừng, tiếp tục).
- Q14: Listening mode? → **Toggle session**: bấm bật → continuous listen → bấm tắt khi xong.
- Q15: Unsupported fallback? → **Ẩn hoàn toàn** nút.
- Q16: Language? → **Fixed `vi-VN`**.

## Plan (inline)

Touch list:

1. `composables/useVoiceCommand.ts` (new) — wrap Web Speech Recognition, expose `isSupported`, `isListening`, `start()`, `stop()`, `onCommand(cmd: 'play'|'pause'|'resume'|'stop')` event.
2. `components/ReaderBottomBar.vue` — thêm slot Voice (v-if isSupported), bấm → emit `toggle-voice`.
3. `components/ReaderTools.vue` — wire voice toggle + map `onCommand` → existing TTS handlers (`toggleTts`/`stopTts`).
4. `locales/{vi,en}.json` — `voice.button`, `voice.listening`, `voice.start`, `voice.stop`, aria.

Storage delta: none (no persist).

Slot count: bar hiện 9 (Bookmark, History, A−, A+, AutoScroll, TTS, Stop, Focus, Settings). +Voice = 10. max 12 → OK.

### Recognition wrapper notes

- Use `webkitSpeechRecognition` || `SpeechRecognition` (Chromium-only on most platforms).
- `continuous = true`, `interimResults = false`, `lang = 'vi-VN'`.
- On `result` event: read final transcript, lowercase, normalize spaces → match against phrase map.
- On `error`: if `aborted` / `not-allowed` → stop session; else restart (some browsers auto-stop on silence).
- On `end`: if `isListening` still true (user didn't toggle off) → restart (continuous workaround).

## Notes

- `vi-VN` STT phụ thuộc browser; Chrome Android/Desktop OK; Firefox không hỗ trợ Web Speech Recognition (only synthesis).
- Permission: browser xin lần đầu; nếu denied → `start()` throws → catch + hide button + stop.
- Privacy: chỉ recognize on user action, không stream khi `isListening = false`.
