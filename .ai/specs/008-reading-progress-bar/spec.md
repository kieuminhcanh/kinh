# Spec: Reading progress bar

Status: done
Created: 2026-05-13
Slug: 008-reading-progress-bar

## Why

Người đọc kinh thường tụng theo phiên cố định, cần biết "còn bao xa nữa". Hiện không có chỉ báo % → cảm giác đọc mãi không hết, dễ nản.

## What

- Thanh ngang mảnh ở top hoặc bottom của reader, fill theo % đã đọc (scrollY / scrollHeight).
- Update mượt khi cuộn.
- Ẩn ở Home, chỉ hiện ở reader.
- Tuỳ chọn hiện thêm số % bằng chữ (tuỳ clarify).

## Out of scope

- Progress theo số câu / số chữ (cần tokenize nội dung).
- Progress toàn kinh (tổng các chương).
- ETA "còn ~3 phút".

## Acceptance criteria

- [x] Given đang ở reader route, when scroll, then thanh progress update theo % tương ứng. (rAF-throttled scroll + ResizeObserver)
- [x] Given đang ở Home, when render, then không hiện thanh. (`v-if="isReader"` trong `Layout.vue`)
- [x] Thanh không che nội dung (h-1 = 4px, `pointer-events-none`, `z-30` dưới nav).
- [x] Tôn trọng `prefers-reduced-motion` (drop `transition-[width]` khi reduce).
- [x] Không gây layout shift (`fixed` positioning, không đụng document flow).
- [x] i18n `reader.progress` (vi + en) cho `aria-label`.

## Clarifications

1. **Placement** → Fixed top, full-width, 3px tall (above content). Standard Medium/Substack pattern.
2. **Numeric % label** → Có, right-aligned nhỏ, chỉ hiện khi scroll > 5%.
3. **Update strategy** → `requestAnimationFrame` throttle + passive scroll listener.
4. **Scroll % source** → Live calc từ `window.scrollY / scrollHeight` (không reuse `kinh:positions` vì 400ms debounce sẽ giật).
5. **prefers-reduced-motion** → Disable CSS transition trên fill (jump tức thì), giữ tần suất update.
6. **Styling** → DaisyUI `bg-primary` fill trên `bg-base-300` track, h-1 (4px). Theme-aware.

## Plan (inline)

File touch list:

1. `.vitepress/theme/components/ReadingProgress.vue` (NEW) — Fixed top bar. `ref<number>` cho `pct` (0..1). `onMounted` register scroll listener + ResizeObserver. `requestAnimationFrame` throttle. `prefers-reduced-motion` qua VueUse `useMediaQuery`. Cleanup `onBeforeUnmount`. SSR-guard.
2. `.vitepress/theme/Layout.vue` (EDIT) — mount `<ReadingProgress v-if="isReader" />` ngay trên `<Layout />`.
3. `locales/vi.json` + `locales/en.json` (EDIT) — add key `reader.progress` ("Tiến độ đọc" / "Reading progress") cho `aria-label`.

No new dependencies (VueUse `useMediaQuery` đã có). No storage schema change.

A11y: `role="progressbar"` + `aria-valuenow` (0-100) + `aria-valuemin=0` + `aria-valuemax=100` + `aria-label`.

Visual:

- Outer track: `fixed top-0 left-0 right-0 z-30 h-1 bg-base-300/50 pointer-events-none`.
- Fill: `h-full bg-primary transition-[width] duration-150 ease-out` (drop `transition-*` khi `reduce`).
- Label: `absolute top-1.5 right-2 text-xs text-base-content/70 bg-base-100/80 px-1 rounded` (v-if `pct > 0.05`).

z-30 để tránh đụng VitePress nav (`z-50`+) và modals (`z-100`+).

## Notes

- Throttle scroll handler để tiết kiệm CPU trên thiết bị cũ.
- Có thể trùng region với progress bar TTS (nếu sau này có) — design cần tách rõ.
- VitePress default theme sticky nav z-index cao. Bar ở `top-0` với `z-30` sẽ bị nav che khi scroll — chấp nhận (bar vẫn xuất hiện ở top viewport khi nav co lại; default theme có `hideOnScroll`).
- `transition-[width]` với `duration-150` cho cảm giác mượt mà không lag.
