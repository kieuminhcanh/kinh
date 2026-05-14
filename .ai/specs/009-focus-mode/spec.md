# Spec: Focus mode (distraction-free reader)

Status: done
Created: 2026-05-13
Slug: 009-focus-mode

## Why

Header + sidebar + footer chiếm diện tích, làm phân tâm khi đọc kinh nghiêm túc. Cần 1 chế độ "chuyên tâm" ẩn chrome, chỉ còn nội dung.

## What

- Nút "Tập trung" trong `ReaderBottomBar` (slot mới).
- Bật → ẩn VPNav + VPSidebar + VPFooter + ReadingProgress + ShareSection + ReaderBottomBar; content căn giữa max-width thoải mái.
- Nút Exit nhỏ cố định góc trên-phải (visible suốt khi focus on).
- ESC key trên desktop → exit.
- Không persist: mỗi lần vào reader bắt đầu ở normal mode.

## Out of scope

- Fullscreen API.
- Đổi theme khi focus.
- Hide trên Home.
- Tap-to-toggle (đã bỏ — dễ trigger nhầm khi scroll).

## Acceptance criteria

- [x] Given ở reader, when bật focus, then VPNav + VPSidebar + VPFooter + ReadingProgress + ShareSection + ReaderBottomBar biến mất.
- [x] Bấm nút Exit (góc trên-phải) → trở về normal mode.
- [x] ESC trên desktop → exit.
- [x] Reload page → state reset về normal (không persist).
- [x] Không break TTS / bookmark / auto-scroll đang chạy.
- [x] i18n: "Tập trung" / "Thoát" (vi + en).

## Clarifications

Resolved 2026-05-13 (owner approved AI recommendations):

- Q1: Persist? → **No** — không persist, reload reset.
- Q2: Exit mechanism mobile? → **Nút Exit cố định góc trên-phải** + ESC desktop. Bỏ tap-to-toggle.
- Q3: Phạm vi ẩn? → **Full distraction-free**: VPNav + VPSidebar + VPFooter + ReadingProgress + ShareSection + ReaderBottomBar.
- Q4: Trigger button nằm đâu? → **Slot mới trong `ReaderBottomBar`** (icon eye, label "Tập trung").

## Plan (inline)

Touch list:

1. `composables/useFocusMode.ts` (new) — `ref<boolean>` + toggle/enter/exit; SSR-guard (chỉ chạy client); listen ESC keydown.
2. `components/ReaderBottomBar.vue` — thêm slot "Tập trung" (icon `i-lucide-focus` hoặc eye, label).
3. `components/ReaderTools.vue` — wire focus button → `useFocusMode().toggle`.
4. `components/FocusExitButton.vue` (new) — fixed top-right, visible khi focus on, click → exit.
5. `Layout.vue` — mount `FocusExitButton`; toggle CSS class `focus-mode` trên `<html>` khi focus on; conditionally render ReaderTools/ReadingProgress/ShareSection chỉ khi không focus.
6. `style.css` — `.focus-mode .VPNav { display: none } .focus-mode .VPSidebar { ... } .focus-mode .VPDocFooter { ... } .focus-mode .vp-doc { max-width: 70ch; margin-inline: auto }`.
7. `locales/{vi,en}.json` — `focusMode.enter`, `focusMode.exit`.

Storage delta: none (no persist).

Slot count check: bar hiện 8 (Bookmark, History, A−, A+, AutoScroll, TTS, Stop, Settings). Thêm Focus = 9. max 12 → OK.

## Notes

- VitePress CSS classes ổn định: `.VPNav`, `.VPSidebar`, `.VPDocFooter`, `.VPLocalNav`, `.VPNavBar`.
- Cẩn thận SSR: focus state init = false; toggle class `<html>` chỉ trong `onMounted` / event handler.
- ESC listener add ở `useFocusMode` mount, remove ở unmount.
