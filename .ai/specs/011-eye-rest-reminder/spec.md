# Spec: Eye-rest reminder

Status: done
Created: 2026-05-13
Slug: 011-eye-rest-reminder

## Why

Người cao tuổi đọc liên tục dễ mỏi mắt, khô mắt, nhức đầu. Lời nhắc nghỉ mỗi 25 phút giảm gánh nặng — tính năng "chăm sóc" phù hợp tôn chỉ ứng dụng.

## What

- Đếm thời gian đọc liên tục (chỉ tính khi tab visible + ở reader).
- Sau mỗi 25 phút (fixed) → DaisyUI alert toast top-center: "Nghỉ mắt 30 giây nhé".
- 2 nút trong toast: "Đã nghỉ" (reset counter) + "Tắt hôm nay" (mute đến nửa đêm local).
- Default: **OFF** — opt-in trong Settings.
- Khi tab hidden hoặc không ở reader → đếm pause.

## Out of scope

- Đếm tổng thời gian đọc cả ngày / lịch sử.
- Đề xuất bài tập mắt cụ thể.
- Notification API.
- Interval tuỳ chỉnh (fixed 25 phút).

## Acceptance criteria

- [x] Default: `eyeRestEnabled = false`. User bật trong Settings.
- [x] Khi enabled + ở reader + tab visible → counter tăng; tới 25 phút → toast hiện.
- [x] Tab inactive (`visibilitychange` hidden) → counter pause.
- [x] Rời reader (Home / page khác) → counter pause.
- [x] Bấm "Đã nghỉ" → counter reset 0, toast đóng.
- [x] Bấm "Tắt hôm nay" → mute đến 00:00 local hôm sau, toast đóng.
- [x] Toggle off Settings → counter dừng + reset.
- [x] i18n vi + en.
- [x] `arch.md` cập nhật storage key `kinh:eyeRestMutedUntil`.

## Clarifications

Resolved 2026-05-13 (owner approved AI recommendations):

- Q5: Default state? → **OFF** (opt-in trong Settings).
- Q6: Interval? → **Fixed 25 phút**, không cho user chỉnh.
- Q7: UI? → **DaisyUI alert toast top-center**, không che content.
- Q8: "Tắt hôm nay" reset khi nào? → **Nửa đêm local** (lưu `kinh:eyeRestMutedUntil` = timestamp ISO).

## Plan (inline)

Touch list:

1. `composables/useSettings.ts` — thêm `eyeRestEnabled: boolean` (default `false`).
2. `composables/useEyeRestTimer.ts` (new) — composable: setInterval (1s tick), tăng counter khi reader + visible + enabled + not muted; emit `due` khi đạt 25\*60s; reset/muteToday actions; localStorage `kinh:eyeRestMutedUntil`.
3. `components/EyeRestToast.vue` (new) — DaisyUI alert top-center, 2 nút.
4. `Layout.vue` — mount toast component khi `isReader && eyeRestEnabled`. Pass reader/visible state into composable.
5. `components/SettingsDrawer.vue` — thêm checkbox "Nhắc nghỉ mắt mỗi 25 phút".
6. `locales/{vi,en}.json` — keys.
7. `.ai/docs/arch.md` — settings field + storage key.

Storage delta:

- `kinh:settings.eyeRestEnabled: boolean` (default false, mergeDefaults safe).
- `kinh:eyeRestMutedUntil: string | null` (ISO timestamp; cleared when past).

## Notes

- Timer tick 1s qua `setInterval` (đơn giản, đủ chính xác cho 25 phút).
- Pause logic: composable kiểm tra `isReader && document.visibilityState === 'visible' && enabled && !muted` mỗi tick; chỉ tăng counter khi cả 4 true.
- Mute check: nếu `mutedUntil` set + còn trong tương lai → treat as muted. Khi expired → null hoá silently.
- SSR-guard: composable chỉ chạy interval trong `onMounted`.
