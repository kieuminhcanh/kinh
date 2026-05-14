# Spec: "Đọc tiếp" card on Home

Status: done
Created: 2026-05-13
Slug: 005-continue-reading-card

## Why

`useBookmarks` đã lưu reading positions với `lastReadAt`. Người cao tuổi mở app lại nhiều lần trong ngày → cần 1 cú chạm để quay lại chỗ đọc dở, không phải tìm trong sidebar.

## What

- Trên Home, ngay trên grid, hiển thị 1 card lớn "Đọc tiếp: <title kinh> — <tên chương> (NN%)" nếu có position gần đây nhất.
- Bấm card → navigate đến route, auto-scroll về vị trí.
- Nếu không có position nào → ẩn card (không placeholder rỗng).
- Có thể "Bỏ qua" để ẩn card này 1 phiên (không xoá position).

## Out of scope

- Hiển thị > 1 mục (list nhiều mục đã có ở spec 001 panel).
- Đề xuất kinh mới / gợi ý ngày tụng.
- Animation phức tạp.

## Acceptance criteria

- [x] Given không có position, when vào Home, then card không xuất hiện, grid bắt đầu ngay. (`v-if="entry"` ẩn hẳn)
- [x] Given có ≥ 1 position, when vào Home, then card hiện ở top với title kinh + chapter + %.
- [x] Given bấm card, when navigate, then mở đúng route + scroll về vị trí trong ≤ 1s. (existing `ReaderTools.restoreScroll()`)
- [x] Bấm "Bỏ qua" → card ẩn cho đến reload (sessionStorage → reload tab vẫn ẩn, tab mới reset).
- [x] Card có touch target lớn (toàn card clickable, `min-h-20` = 80px).
- [x] i18n vi + en (`continueReading.label`, `continueReading.dismiss`).

## Clarifications

1. **Pick which position** → Most recent (max `ts`). Single card. List nhiều mục đã có ở Spec 001 panel.
2. **Empty state** → Ẩn hẳn card, không placeholder.
3. **"Bỏ qua" persistence** → `sessionStorage` key `kinh:continue:dismissed` (reload tab = quên, cross-navigation cùng tab = nhớ).
4. **Placement** → Trên header bar (above `<h1>` trong `Home.vue`).
5. **Threshold** → Tái dùng `0.05 ≤ scrollPct < 0.98` từ Spec 001 (đồng nhất "đang đọc dở").
6. **Dismiss UI** → Nút "✕" nhỏ góc phải card, `aria-label` đầy đủ; touch target ≥ 44×44.

`ReadingPosition` shape đã xác nhận: `{ path, scrollPct, ts }` (file `useBookmarks.ts`). `scrollPct` đã lưu sẵn, không cần derive on-the-fly.

## Plan (inline)

File touch list:

1. `.vitepress/theme/components/ContinueReadingCard.vue` (NEW) — Tự đọc `useReadingPositions`, lọc threshold, sort `ts` desc, lấy entry đầu. Render `<a>` clickable toàn card → `withBase(path)`. Nút `✕` dismiss → set `sessionStorage` flag. Reactive `dismissed = ref(false)` init từ `sessionStorage` (SSR-guard).
2. `.vitepress/theme/components/Home.vue` (EDIT) — chèn `<ContinueReadingCard />` ngay trên `<div class="flex items-center justify-between ...">` header bar.
3. `locales/vi.json` + `locales/en.json` (EDIT) — namespace `continueReading.*`:
   - `continueReading.label` ("Đọc tiếp" / "Continue reading")
   - `continueReading.dismiss` ("Bỏ qua mục này" / "Dismiss")

Derived rendering (reuse logic Spec 001):

- Title kinh: `findKinhBySlug(slugFromPath(path))?.title ?? slug`.
- Chapter: last path segment, dashes → spaces.
- Percent: `Math.round(scrollPct * 100)` qua i18n key `history.percent` (đã có).

Storage:

- Đọc: `kinh:positions` (existing, unchanged).
- Ghi: `sessionStorage.kinh:continue:dismissed` = `"1"` (chỉ tồn tại đến khi tab đóng).

No new dependencies. No schema change. Doc sync: KHÔNG cần update `arch.md` (sessionStorage là transient, không phải storage key bền vững theo định nghĩa `arch.md`).

## Notes

- `ReadingPosition` đã có `scrollPct` sẵn → không cần derive.
- Dismiss in-memory + sessionStorage flag → reactive sync qua `useStorage` từ VueUse có thể overkill; dùng raw `sessionStorage` + `ref` init một lần là đủ.
- Khi entry click → navigation chuyển trang → `ContinueReadingCard` unmount → không cần reset state.
