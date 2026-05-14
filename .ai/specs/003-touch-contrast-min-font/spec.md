# Spec: Touch target ≥ 44px + contrast AA + min font 16

Status: done
Created: 2026-05-13
Slug: 003-touch-contrast-min-font

## Why

Audit hiện trạng:

- `btn-sm` ở SettingsDrawer + nhiều chỗ < 44×44 → vi phạm WCAG 2.5.5 (Target Size).
- `opacity-60/70` trên text phụ → contrast yếu, mắt kém không đọc nổi.
- `Settings.fontSize` min = 14 — quá nhỏ cho audience chính. WCAG khuyến nghị ≥ 16 cho body.

3 lỗi a11y căn bản, fix gọn trong 1 batch.

## What

- Mọi nút/icon-button tương tác ≥ 44×44 px (hit-area, có thể dùng padding nếu hình thị giác nhỏ hơn).
- Mọi text phụ (caption, meta, hint) đạt contrast ≥ 4.5:1 trên cả 3 theme (light, dark, sepia).
- `Settings.fontSize` min từ 14 → 16. Existing user đang ở 14 → migrate lên 16 ở lần load tiếp theo (one-time).

## Out of scope

- Đổi default fontSize (giữ nguyên trừ khi clarify chốt đổi).
- Đổi theme colors lớn — chỉ fix các `opacity-*` / text-muted dùng sai.
- A11y audit toàn bộ (keyboard nav, ARIA roles) — spec riêng nếu cần.

## Acceptance criteria

- [ ] Global CSS rule: `.btn-sm { min-height: 2.75rem; min-width: 2.75rem; }` in `style.css` — mọi `btn-sm` tự động ≥ 44×44.
- [ ] Mọi `<button>` / clickable trong app có computed width × height ≥ 44×44 px.
- [ ] Text phụ (author, description, value display, subtitle) đổi từ `opacity-60/70/80` → `text-base-content/70` (DaisyUI token, theme-aware).
- [ ] `Settings.fontSize` schema clamp 16..28 trong `useSettings.ts`. User có giá trị cũ < 16 → silent auto-bump lên 16 ngay khi load.
- [ ] `Settings.lineHeight` schema clamp 1.6..2.4 (nhân lúc fix font). User có giá trị cũ < 1.6 → silent bump.
- [ ] Slider range UI: fontSize `min=16`, lineHeight `min=1.6`.
- [ ] Default values: `fontSize=18` (giữ), `lineHeight=1.8` (giữ).
- [ ] `.ai/docs/arch.md` `Settings` table: fontSize Range `16..28`, lineHeight Range `1.6..2.4`.
- [ ] Diagnostics 0 errors, typecheck green.
- [ ] Contrast check (owner manual via Lighthouse / axe DevTools) → 0 violation "color-contrast" trên 3 theme (light, dark, sepia).

## Clarifications

1. **Touch target strategy** → Global CSS rule `.btn-sm { min-height: 2.75rem; min-width: 2.75rem; }` trong `style.css`. KISS, 1 dòng fix tất cả, không sửa 9 chỗ.
2. **Contrast** → Đổi `opacity-{60,70,80}` → `text-base-content/70` (DaisyUI token, theme-aware AA).
3. **Min fontSize** → 16. Default giữ 18.
4. **Migration `fontSize < 16`** → Silent auto-bump lên 16 ngay khi load (trong `useSettings`).
5. **Slider min** → Đổi UI slider từ 14 → 16 (đồng bộ với clamp).
6. **`lineHeight`** → Thêm vào scope: min 1.4 → 1.6, default 1.8 giữ. Migration silent.
7. **Contrast verify** → Owner chạy Lighthouse / axe DevTools thủ công sau impl, không setup tool auto.

Note: scope mở rộng nhẹ vì `lineHeight` mins (Q6) — cùng tính chất "a11y baseline reading", 1 dòng change.

## Plan (inline)

File touch list:

1. `.vitepress/theme/style.css` (EDIT) — add `.btn-sm { min-height: 2.75rem; min-width: 2.75rem; }` (after `.VPNavBarSearch` block).
2. `.vitepress/theme/composables/useSettings.ts` (EDIT) — add migration step after `useLocalStorage` init: clamp `fontSize` to `max(16, value)`, clamp `lineHeight` to `max(1.6, value)`. Use `nextTick`/sync write since `useLocalStorage` returns ref. Update `Settings` type comment `// px, 16..28` and `// 1.6..2.4`.
3. `.vitepress/theme/components/SettingsDrawer.vue` (EDIT) — fontSize slider `min="16"`. lineHeight slider `min="1.6"`. Replace 3 `opacity-70` value displays → `text-base-content/70`.
4. `.vitepress/theme/components/Home.vue` (EDIT) — `opacity-70` (author) + `opacity-60` (description) → `text-base-content/70`.
5. `.vitepress/theme/components/HistoryDrawer.vue` (EDIT) — 2x `opacity-80` (subtitle text) → `text-base-content/70`.
6. `.ai/docs/arch.md` (EDIT) — `Settings` table: fontSize Range `16..28`, lineHeight Range `1.6..2.4`.

No storage schema bump (just value clamping). No new dependencies. No locale changes.

## Notes

- Migration cách đơn giản: trong `useSettings`, sau load, `if (s.fontSize < 16) s.fontSize = 16; save()`.
- DaisyUI `btn` default đã ≥ 44. Vấn đề chủ yếu là `btn-sm` + icon-only buttons.
