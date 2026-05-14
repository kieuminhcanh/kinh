# TODO — Cross-feature backlog

Per-feature work lives in `.ai/specs/NNN-slug/`. This file tracks only cross-feature ordering / dependencies / parking lot.

## Active draft specs (elderly UX review)

Priority order from strategic review 2026-05-13. All currently `draft` — awaiting clarify gate before plan/impl.

### P0 — critical accessibility & broken UX

- [x] `001-bookmark-history-panel` — bookmark/positions UI (storage có sẵn, chỉ thiếu surface).
- [x] `002-quick-font-size-buttons` — A−/A+ luôn hiện ngoài drawer.
- [x] `003-touch-contrast-min-font` — WCAG fix: 44px touch + AA contrast + min font 16.

### P1 — high-value UX upgrades

- [x] `004-icon-text-labels` — bottom bar có nhãn thay icon-only FAB.
- [x] `005-continue-reading-card` — "Đọc tiếp" trên Home.
- [x] `006-tts-pause-resume` — pause/resume TTS thay vì stop only.
- [x] `007-auto-scroll-mode` — tự cuộn tốc độ chỉnh được.
- [x] `008-reading-progress-bar` — thanh % đã đọc.

### P2 — quality of life

- [x] `009-focus-mode` — distraction-free reader.
- [x] `010-default-grid-one-column` — Home grid mặc định 1 cột.
- [x] `011-eye-rest-reminder` — nhắc nghỉ mắt 25 phút.
- [x] `012-print-stylesheet` — `@media print` CSS sạch.
- [x] `013-recitation-schedule` — lịch tụng kinh.
- [x] `014-web-share` — share API + clipboard fallback.
- [x] `015-voice-command` — điều khiển giọng nói (Web Speech Recognition).

## Suggested execution order

1. **003** trước → thiết lập a11y baseline (touch target, contrast, min font) → các spec sau ăn theo.
2. **004** → bottom bar layout → các nút mới (002, 006, 007, 014) bám vào layout này.
3. **002** → A−/A+ nhanh (tận dụng layout 004).
4. **001** → bookmark panel (mở từ bottom bar 004).
5. **005, 006, 008** song song được (file scope rời nhau).
6. **007** sau 006 (cùng đụng `ReaderTools.vue`).
7. P2 batch tuỳ owner thứ tự, **013** + **015** lớn nhất nên cuối.

## Parking lot

- Storage schema versioning + migration framework (nếu P2 dồn nhiều field mới → cân nhắc tách spec hạ tầng riêng).
- A11y full audit (keyboard nav, ARIA roles) — chưa mở spec, sẽ làm sau khi P0+P1 settle.

## Lifecycle reminder

Mỗi spec hiện ở `draft`. Trước khi code:

1. Owner chốt → agent batch clarify questions theo `.ai/docs/choice.md`.
2. Status → `clarified`.
3. Agent điền `## Plan` + tạo `tasks.md` từ template.
4. Status → `planned` → bắt đầu code theo `specs.md` §Implement.
