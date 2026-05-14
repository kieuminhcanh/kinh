# Spec: Print stylesheet

Status: done
Created: 2026-05-13
Slug: 012-print-stylesheet

## Why

Người cao tuổi nhiều cụ thích đọc bản in giấy, hoặc in để mang đi tụng ở chùa khi không có wifi. Trang web in mặc định lộn xộn: header, sidebar, FAB đều xuất hiện trên giấy.

## What

- `@media print` CSS:
  - Ẩn header, sidebar, FAB/bottom bar, search, progress bar, footer.
  - Reset background → trắng. Text → đen.
  - Font serif lớn (vd 14pt), line-height thoải mái.
  - Page break: tránh cắt giữa heading + paragraph.
  - URL ngoài liên kết: in dưới dạng `(https://...)` nhỏ.
- "In" có thể trigger từ trình duyệt (Ctrl+P) — không cần nút riêng (clarify nếu muốn nút).

## Out of scope

- Export PDF custom (dùng print → save as PDF của trình duyệt là đủ).
- Header/footer page với số trang custom.
- Watermark.

## Acceptance criteria

- [x] Ctrl+P trên reader → preview chỉ thấy tiêu đề + nội dung, không có chrome.
- [x] Font in đen trên nền trắng kể cả khi đang ở dark/sepia theme.
- [x] Heading không bị cắt cuối trang (page-break-after avoid).
- [x] Link external in kèm URL.
- [ ] Test trên Chrome + Firefox preview. (deferred — manual owner verification)

## Clarifications

- 2026-05-13 — **No UI button**: chỉ Ctrl+P / browser menu. Giữ bottom bar gọn (đã 7-8 slot). User cao tuổi thường in qua menu sau khi preview.
- 2026-05-13 — **Font**: serif 14pt (truyền thống, dễ đọc trên giấy).
- 2026-05-13 — **Color**: force black-on-white kể cả ở dark/sepia (tiết mực, max contrast).
- 2026-05-13 — **External links**: in URL trong parens nhỏ sau text — useful offline.

## Plan (inline)

Touch:

1. `.vitepress/theme/style.css` (EDIT) — append `@media print { ... }` block:
   - Hide: `.VPNav`, `.VPSidebar`, `.VPFooter`, `.VPLocalNav`, `.VPDocFooter`, custom: `.reader-bottom-bar`, `.reading-progress`, `.continue-reading-card`, search modal, scroll-to-top.
   - Reset: `html, body { background: #fff !important; color: #000 !important; }`.
   - Content: `.VPDoc { max-width: none; padding: 0; }`.
   - Font: `body { font-family: Georgia, 'Times New Roman', serif; font-size: 14pt; line-height: 1.6; }`.
   - Page break: `h1, h2, h3 { page-break-after: avoid; } p, li { page-break-inside: avoid; orphans: 3; widows: 3; }`.
   - Link URL inline: `a[href^="http"]::after { content: " (" attr(href) ")"; font-size: 0.8em; color: #555; }`.
   - Strip link styling: `a { color: #000 !important; text-decoration: underline; }`.

Total: ~30 lines CSS, no JS, no component change.

## Notes

- Đây là spec CSS-only, không đổi storage / không đổi component logic.
