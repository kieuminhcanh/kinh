# Spec: Bookmark + History panel

Status: done
Created: 2026-05-13
Slug: 001-bookmark-history-panel

## Why

Owner đã có `useBookmarks` lưu cả bookmark + reading positions, nhưng KHÔNG có UI để xem lại. Người cao tuổi tạo dấu xong không tìm thấy → tính năng coi như chết. Đây là gap nghiêm trọng nhất hiện tại.

## What

- User mở 1 panel/drawer thấy danh sách bookmark đã lưu (mới nhất trên).
- User mở cùng panel thấy danh sách "đang đọc dở" (reading positions) — kèm tên kinh + tên chương + % đã đọc.
- Bấm 1 item → điều hướng đến đúng route, scroll về vị trí cũ.
- Xoá từng bookmark / xoá toàn bộ.
- Empty state có hướng dẫn ngắn cách tạo bookmark.

## Out of scope

- Sync cloud / share bookmark.
- Bookmark có note / tag / màu.
- Export/import.

## Acceptance criteria

- [x] Given có ≥ 1 bookmark, when mở panel + chọn tab "Đánh dấu", then thấy list bookmark sort theo `ts` desc.
- [x] Given có reading position với `5% ≤ scrollPct < 98%`, when mở tab "Đang đọc", then thấy entry `<tên kinh> — <chương> (NN%)`. Lookup tên kinh từ `.vitepress/data/kinh.ts`; chương parse từ path segment cuối.
- [x] Given reading position `< 5%` hoặc `≥ 98%`, when mở tab "Đang đọc", then entry KHÔNG hiển thị.
- [x] Given bấm 1 bookmark/position, when navigate, then trang đích scroll về đúng `scrollPct` trong ≤ 1s. (via existing `ReaderTools.restoreScroll()` + native anchor for `#hash`)
- [x] Given tab rỗng, when mở, then thấy empty state + hướng dẫn 1 câu ("Bấm nút đánh dấu khi đang đọc để lưu lại").
- [x] Xoá 1 entry → list cập nhật ngay, `localStorage` (`kinh:bookmarks` hoặc `kinh:positions`) đồng bộ.
- [x] Nút "Xoá tất cả" → dialog confirm 2 nút lớn (≥ 44×44), không undo toast.
- [x] Panel có nhãn chữ (không icon-only), mọi nút chạm ≥ 44×44, contrast AA.
- [x] Entry point: Home.vue header + ReaderTools FAB stack (tạm thời, sẽ di chuyển khi 004 done).
- [x] i18n đầy đủ vi + en cho mọi label (tab name, empty state, confirm dialog, button labels).
- [x] SSR-safe: mọi access `localStorage` qua `useBookmarks`/`useReadingPositions` (đã guard sẵn qua VueUse).

## Clarifications

1. **UI surface** → Drawer phải (desktop) / bottom sheet (mobile) — pattern DaisyUI `drawer` responsive, đồng nhất với `SettingsDrawer.vue`.
2. **Entry point** → Cả Home.vue (header) + ReaderTools (FAB stack). Khi F4 (004-icon-text-labels) xong → entry trong ReaderTools sẽ chuyển vào bottom bar có chữ.
3. **Tabs** → 2 tab: "Đánh dấu" | "Đang đọc" — tách rõ ngữ nghĩa cố-ý-đánh-dấu vs auto-save.
4. **Reading position metadata** → KHÔNG đổi schema `kinh:positions`. Lookup `path` trong `.vitepress/data/kinh.ts` catalog để lấy tên kinh; tên chương parse từ segment cuối của path (fallback: bỏ qua nếu không tra được).
5. **Position threshold** → Chỉ hiển thị entries có `5% ≤ scrollPct < 98%`. Dưới 5% chưa đọc, trên 98% coi như xong.
6. **Clear-all confirm** → Dialog xác nhận với 2 nút lớn ("Xoá tất cả? Không thể hoàn tác" / "Huỷ"). Không dùng undo toast.
7. **Sort order** → Cả 2 tab sort theo `ts` desc (mới nhất trên).

Schema note: `ReadingPosition` hiện chỉ có `path + scrollPct + ts`. Hiển thị tên kinh/chương = derived data tại render time, không phải stored data. Nếu sau này cần performance hoặc tra cứu phức tạp → bump schema (thuộc parking lot storage versioning).

## Plan (inline)

File touch list:

1. `.vitepress/theme/components/HistoryDrawer.vue` (NEW) — DaisyUI drawer + tabs, render từ `useBookmarks` + `useReadingPositions`. Props: `open: boolean`, emit `update:open`.
2. `.vitepress/theme/components/HistoryButton.vue` (NEW) — nút mở drawer dùng chung cho Home + ReaderTools. Slot/prop variant: `header` (Home) | `fab` (ReaderTools).
3. `.vitepress/theme/components/Home.vue` (EDIT) — thêm `<HistoryButton variant="header">` vào header area.
4. `.vitepress/theme/components/ReaderTools.vue` (EDIT) — thêm `<HistoryButton variant="fab">` vào FAB stack (giữa bookmark + TTS).
5. `.vitepress/theme/composables/useBookmarks.ts` (EDIT) — bổ sung helper `removeAll()` cho bookmarks; thêm `clearAllPositions()` cho positions composable. Không đổi schema.
6. `.vitepress/data/kinh.ts` (READ-ONLY) — lookup tên kinh từ path. Nếu chưa có helper `findKinhByPath(path)` → thêm vào file này.
7. `locales/vi.json` + `locales/en.json` (EDIT) — keys mới dưới namespace `history.*`:
   - `history.title`, `history.tab.bookmarks`, `history.tab.reading`, `history.empty.bookmarks`, `history.empty.reading`, `history.clearAll`, `history.confirmClear`, `history.confirmYes`, `history.confirmNo`, `history.removeOne`, `history.open`, `history.close`, `history.percent` (e.g. `"{n}%"`).

Storage schema: UNCHANGED. `kinh:bookmarks` + `kinh:positions` giữ nguyên.

Derived rendering:

- `<tên kinh>` = `findKinhByPath(path)?.title ?? <fallback: lấy segment[1]>`.
- `<chương>` = `path.split('/').pop()?.replace(/-/g, ' ')` capitalize, fallback empty.
- `NN%` = `Math.round(scrollPct * 100)`.

Filtering positions:

```ts
Object.values(positions.value).filter((p) => p.scrollPct >= 0.05 && p.scrollPct < 0.98);
```

No new dependencies needed. DaisyUI `drawer` + `tabs` + `modal` (confirm) đủ.

## Notes

- `useBookmarks` đã có `bookmarks`, `positions`, `addBookmark`, `removeBookmark`, `getPosition`, `setPosition` — KHÔNG cần đổi schema.
- Cân nhắc UI: drawer phải hay bottom sheet — sẽ hỏi ở clarify.
