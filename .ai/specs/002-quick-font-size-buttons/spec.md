# Spec: Quick A−/A+ font size buttons

Status: done
Created: 2026-05-13
Slug: 002-quick-font-size-buttons

## Why

Để chỉnh cỡ chữ hiện tại owner phải: bấm FAB → mở Settings drawer → kéo slider. 3 bước cho thao tác phổ biến nhất với người cao tuổi/mắt kém. Slider lại khó kéo với tay run.

- 2 nút A−/A+ luôn nhìn thấy khi đang đọc (không cần mở drawer).
- 1 lần bấm = ±2 px (step lớn, dễ cảm nhận thay đổi).
- Clamp 16..28 (đúng range sau spec 003).
- Disable khi tới min/max, có visual feedback.
- Đồng bộ ngay với `useSettings` → DOM update qua `applySettings`.

## Out of scope

- Slider chính trong SettingsDrawer (giữ nguyên, vẫn dùng được).
- A−/A+ cho lineHeight (riêng spec khác nếu cần).
- Preset size profile (vd "Người cao tuổi", "Trẻ").

## Acceptance criteria

- [ ] Given đang đọc, when bấm A+, then `fontSize` tăng 2 px, văn bản phóng to ngay.
- [ ] Given `fontSize === 28`, when bấm A+, then nút disabled + không thay đổi.
- [ ] Given `fontSize === 16`, when bấm A−, then nút disabled.
- [ ] Reload trang → giữ nguyên cỡ chữ (đã có sẵn qua localStorage).
- [ ] Mỗi nút ≥ 44×44 px, có label chữ "A−" / "A+" rõ ràng (không chỉ aria).
- [ ] i18n aria-label vi + en.
- [ ] 2 nút được thêm vào `ReaderBottomBar` thành 6 slot tổng (Bookmark | History | A− | A+ | TTS | Settings).
- [ ] Disabled state: `disabled` attr + `aria-disabled="true"` + visual grayed (DaisyUI default).
- [ ] Lên labels: chỉ hiện "A−" / "A+" (no icon, no extra text).

## Clarifications

1. **Placement** → Thêm 2 item A−/A+ vào `ReaderBottomBar`. Tổng 6 slot: Bookmark | History | A− | A+ | TTS | Settings.
2. **Step size** → ±2 px / tap. 16→18→20→…→28 = 7 mức.
3. **Range floor** → 16 (theo spec 003 a11y baseline).
4. **Visual label** → Chữ "A−" / "A+" only, không icon. Aria-label riêng qua i18n.
5. **Disable behavior** → `disabled` attr + `aria-disabled="true"` + visual grayed-out, no-op on click.

## Plan (inline)

File touch list:

1. `.vitepress/theme/components/ReaderBottomBar.vue` (EDIT) — thêm 2 button `A−` / `A+` giữa History và TTS. Import `useSettings`. Const `MIN_FONT_SIZE = 16`, `MAX_FONT_SIZE = 28`, `FONT_SIZE_STEP = 2`. Computed `canDecrease` / `canIncrease`. Handlers `decreaseFont()` / `increaseFont()` clamp & assign to `settings.value.fontSize`. Disabled binding + `aria-disabled`. Labels "A−" / "A+" hiển thị trực tiếp (font-bold, text cỡ nhỏ/lớn cho A và dấu).
2. `locales/vi.json` (EDIT) — thêm `reader.bar.fontDecrease` = "Giảm cỡ chữ", `reader.bar.fontIncrease` = "Tăng cỡ chữ".
3. `locales/en.json` (EDIT) — thêm `reader.bar.fontDecrease` = "Decrease font size", `reader.bar.fontIncrease` = "Increase font size".

No storage change. No composable change. No new dep. `applySettings` watchEffect already picks up the mutation.

Note: 6 slot trên bar với `flex-1` chia đều; màn hình nhỏ vẫn fit vì mỗi item `min-w-16`, max-width container `max-w-3xl`. Label A−/A+ ngắn nên không vỡ.

## Notes

- Step 2px chọn vì khoảng 14..28 chia 7 mức → dễ nhớ và đủ tinh.
- Cân nhắc đặt ngang FAB hay riêng góc đối diện — clarify.
