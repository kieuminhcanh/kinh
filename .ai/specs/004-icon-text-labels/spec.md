# Spec: Icon-only buttons → icon + text labels

Status: done
Created: 2026-05-13
Slug: 004-icon-text-labels

## Why

FAB hiện chỉ có icon: bookmark, TTS play, settings. Người cao tuổi không nhận diện icon → không biết bấm gì. Search button cũng icon-only. UX cho audience này phải có chữ.

## What

- Mọi action button chính kèm nhãn chữ (visible, không chỉ aria/tooltip).
- 2 lựa chọn UX (clarify):
  - Option A: giữ FAB nhưng thêm label trượt ra khi hover/focus + label dưới icon trên mobile.
  - Option B: thay FAB bằng bottom bar cố định có icon + chữ.
- Search button có chữ "Tìm kiếm" / "Search".

## Out of scope

- Thay đổi action set (vẫn là bookmark, TTS, settings + có thể "Bookmarks" mới từ spec 001).
- Redesign Home.vue card.
- Đổi position FAB sang nơi khác (clarify).

## Acceptance criteria

- [x] Reader page: có bottom bar cố định (fixed bottom) với 4 item — Đánh dấu | Lịch sử | Đọc to | Cài đặt, mỗi item icon + chữ.
- [x] FAB stack cũ trong `ReaderTools.vue` bị xóa — KHÔNG còn nút tròn ở góc.
- [x] Home: có nút "Tìm kiếm" có chữ trong header bar (cùng hàng với HistoryButton + columns), trigger VitePress local search.
- [x] Search button mặc định của VitePress (VPNavBarSearchButton) được ẩn qua CSS (offscreen) để không trùng lặp — vẫn click được qua JS.
- [x] Mọi button trong bottom bar và nhãn "Tìm kiếm" có tap target ≥ 44×44 (`min-h-14` = 56px, `min-w-16` = 64px, `min-h-11` = 44px).
- [x] TTS playing state → item "Đọc to" đổi thành "Dừng" + `text-error`, không thêm row mới.
- [x] `.vp-doc` có `padding-bottom: 5rem` để bar không che nội dung.
- [x] Bar respect `env(safe-area-inset-bottom)` cho iOS PWA (inline style).
- [x] Bar vẫn render khi drawer mở (DOM-level); overlay của drawer sẽ phủ lên theo design — đúng UX dim (không ẩn / không mờ riêng bar).
- [x] Trên màn ≥ 1024px: bar vẫn ở đáy (consistent UX), không chuyển sang sidebar.
- [x] Trên màn hẹp (<360px): 4 item flex-1 fit bằng nhau, label `text-xs` (12px) trên icon, không truncate.
- [x] i18n vi + en cho mọi label.
- [x] Bottom bar CHỈ hiển thị trên reader page (Layout mount ReaderTools → ReaderBottomBar chỉ cho reader routes).
- [x] Diagnostics 0 errors, typecheck green.

## Clarifications

1. **FAB → Bottom bar** → Thay FAB hoàn toàn bằng bottom bar cố định, icon + chữ.
2. **Bottom bar items** → 4 items: Đánh dấu | Lịch sử | Đọc to | Cài đặt.
3. **Desktop layout** → Vẫn đáy màn (consistent, không sidebar).
4. **Search button** → Thêm nút "Tìm kiếm" có chữ trong Home header. Ẩn VPNavBarSearchButton default qua CSS. Trigger search bằng cách dispatch keyboard event hoặc kích `.VPNavBarSearch button` programmatically.
5. **TTS active state** → Item "Đọc to" đổi thành "Dừng" + `btn-error`, in-place. Không thêm row.
6. **Drawers** → Bar vẫn hiển thị (drawer slide phải, bar ở đáy → không conflict).
7. **Content padding** → Thêm `pb-20` (~5rem) vào reader wrapper / `.vp-doc`. Bar có `env(safe-area-inset-bottom)`.

Scope note: bottom bar CHỈ hiển trên reader page, không trên Home. Home giữ header layout có search + history + columns.

Follow-up từ spec 001: HistoryButton FAB variant sẽ bị xóa, thay bằng entry trong bottom bar.

## Plan (inline)

File touch list:

1. `.vitepress/theme/components/ReaderBottomBar.vue` (NEW) — fixed bottom, 4 items (Bookmark, History, TTS, Settings). Mỗi item = button với icon stack trên text label. Active states cho bookmark (toggled) và TTS (playing). Mở SettingsDrawer + HistoryDrawer qua ref/event. Respect `safe-area-inset-bottom`.
2. `.vitepress/theme/components/ReaderTools.vue` (REFACTOR) — Xóa FAB stack hiện tại; thay bằng `<ReaderBottomBar />`. Giữ logic scroll save/restore + TTS handlers (truyền xuống bar qua props hoặc composable). HistoryButton fab variant bị xóa khỏi component này.
3. `.vitepress/theme/components/HistoryButton.vue` (EDIT) — Xóa variant `'fab'`, chỉ giữ variant `'header'` cho Home. Bottom bar tự render nút lịch sử nội bộ.
4. `.vitepress/theme/components/SettingsDrawer.vue` (EDIT) — Tách trigger button khỏi component, expose `open()` method (đã có `defineExpose({ open })`); hoặc chuyển sang prop-based `v-model:open` cho đồng nhất với HistoryDrawer. **Quyết định**: giữ `defineExpose` hiện tại, bar có `ref` gọi `.open()` — ít thay đổi nhất. (Trigger inline cũ trong SettingsDrawer sẽ ẩn qua prop `showTrigger=false`.)
5. `.vitepress/theme/components/Home.vue` (EDIT) — Thêm nút "Tìm kiếm" có chữ trong header (cạnh HistoryButton). Click → trigger VitePress search via `document.querySelector('.VPNavBarSearch button')?.click()` (SSR-safe guard).
6. `.vitepress/theme/style.css` hoặc file CSS theme (EDIT) — Ẩn `.VPNavBarSearch` default qua `display: none` (giữ shortcut Cmd+K vẫn hoạt động — cần verify). Thêm `.vp-doc { padding-bottom: 5rem; }` cho reader. Đánh dấu: tìm file CSS hiện có — nếu chưa có → tạo `.vitepress/theme/custom.css` và import trong `index.ts`.
7. `locales/vi.json` + `locales/en.json` (EDIT) — Thêm:
   - `reader.bar.bookmark`, `reader.bar.history`, `reader.bar.tts`, `reader.bar.settings`, `reader.bar.ttsStop` (nếu khác `reader.stop`)
   - `home.search` ("Tìm kiếm" / "Search")
   - Reuse keys hiện có: `reader.bookmark`, `reader.unbookmark`, `reader.play`, `reader.stop`, `reader.settings`, `history.title`.

SettingsDrawer pattern: giữ nguyên `defineExpose({ open })`. Bottom bar nhận `ref` qua template ref + gọi `settingsDrawerRef.value?.open()`. Inline trigger button trong SettingsDrawer sẽ cần prop `:showTrigger="false"` (add prop) hoặc v-if guard.

**Risk**: VitePress search button selector `.VPNavBarSearch button` có thể thay đổi giữa version. Verify trong dev trước khi commit. Fallback: dispatch `KeyboardEvent('keydown', {key: 'k', metaKey: true})` lockey.

No new dependencies.

## Notes

- Owner trong thread đã nói: thay FAB? → (b) bottom bar có nhãn. Sẽ xác nhận lại ở clarify gate.
- Bottom bar có thể tận dụng `safe-area-inset-bottom` cho iOS PWA.
