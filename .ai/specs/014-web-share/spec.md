# Spec: Web Share (chia sẻ kinh)

Status: done
Created: 2026-05-13
Slug: 014-web-share

## Why

Người cao tuổi hay chia sẻ kinh hay với con cháu, bạn đạo qua Zalo/Messenger. Dùng Web Share API → tận dụng native sheet, không cần copy URL thủ công.

## What

- Nút "Chia sẻ" trong reader.
- Bấm → mở Web Share native sheet nếu hỗ trợ (mobile chủ yếu).
- Fallback (desktop / không support): copy URL vào clipboard + toast "Đã sao chép link".
- Share data: tiêu đề kinh + URL chương + 1 dòng mô tả.

## Out of scope

- Share trích đoạn được chọn.
- Share dạng ảnh (cards).
- Tracking analytics.

## Acceptance criteria

- [x] Given mobile có Web Share API, when bấm "Chia sẻ", then mở native sheet với title + url + text.
- [x] Given desktop / không support, when bấm "Chia sẻ", then URL được copy + toast hiện.
- [x] Nút có nhãn chữ "Chia sẻ" / "Share".
- [x] Touch target ≥ 44 (btn-lg + min-h-14).
- [x] i18n vi + en.

## Clarifications

- 2026-05-13 — **Placement**: inline section at chapter end (NOT bottom bar). Bottom bar đã 8 slot khi TTS active, phải giữ ngưỡng 12-slot 64px/slot trên 768px. Share là intentional end-of-reading action → contextual placement tốt hơn.
- 2026-05-13 — **Share data**: `title` = kinh title + chapter, `text` = i18n label "Mời bạn cùng đọc kinh", `url` = current URL.
- 2026-05-13 — **Fallback toast**: DaisyUI `alert` floating bottom-center, auto-dismiss 3s. Local timer state in component (no new dep, no global toast service).
- 2026-05-13 — **Clipboard fail edge case**: hiện toast error "Lỗi sao chép, vui lòng copy URL thủ công" + show URL inline nếu có thể.

## Plan (inline)

Touch:

1. `.vitepress/theme/components/ShareSection.vue` (NEW) — inline component rendered at chapter end. Contains: `<section class="print:hidden mt-12 pt-6 border-t border-base-300">` w/ heading, share button, fallback toast. Logic inline (no separate composable — single caller). Detects `'share' in navigator`. SSR-guard. Computes title/text/url from `useData()`.
2. `.vitepress/theme/Layout.vue` (EDIT) — mount `<ShareSection v-if="isReader" />` after default `<Layout>` content (above `<ReadingProgress>` / below docs slot).
3. `locales/vi.json` + `locales/en.json` (EDIT) — add keys:
   - `share.button` — "Chia sẻ" / "Share"
   - `share.heading` — "Chia sẻ kinh này" / "Share this kinh"
   - `share.inviteText` — "Mời bạn cùng đọc kinh" / "Read this sutra with me"
   - `share.copied` — "Đã sao chép link" / "Link copied"
   - `share.copyFailed` — "Lỗi sao chép, vui lòng copy URL thủ công" / "Copy failed, please copy URL manually"
   - `share.ariaShare` — "Chia sẻ bài kinh" / "Share this sutra"

Total: ~80 lines NEW component + ~5 lines Layout edit + 12 locale keys.

## Notes

- Feature phát hiện bằng `'share' in navigator`.
- Clipboard fallback dùng `navigator.clipboard.writeText`.
