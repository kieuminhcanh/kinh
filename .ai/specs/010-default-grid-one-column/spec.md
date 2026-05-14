# Spec: Default Home grid 2 → 1 column

Status: done
Created: 2026-05-13
Slug: 010-default-grid-one-column

## Why

`Settings.gridColumns` default = 2. Trên mobile/màn nhỏ, 2 cột làm card nhỏ + ảnh nhỏ + chữ nhỏ → audience cao tuổi khó nhìn. 1 cột mặc định + cho phép user tăng lên 2/3 nếu muốn.

## What

- Đổi default `gridColumns` từ 2 → 1.
- User hiện đang có 2 → giữ nguyên 2 (không migrate giảm — tôn trọng lựa chọn cũ).
- Update `arch.md` nếu có ghi default cụ thể.

## Out of scope

- Đổi range (vẫn 1/2/3).
- Auto-adapt theo viewport (responsive đã có Tailwind handle).
- Card layout redesign.

## Acceptance criteria

- [x] Given new user (chưa có `kinh:settings`), when vào Home, then thấy grid 1 cột.
- [x] Given existing user có gridColumns=2, when vào Home, then giữ nguyên 2.
- [x] `useSettings.ts` `DEFAULT.gridColumns` = 1.
- [x] Range UI trong SettingsDrawer vẫn 1..3.
- [x] `arch.md` đồng bộ nếu có ghi default.

## Clarifications

- 2026-05-13 — **No migration**: user hiện có `gridColumns` → giữ nguyên. `useLocalStorage` + `mergeDefaults: true` chỉ fill key thiếu, không ghi đè → backward-compat tự động.
- 2026-05-13 — **Surgical scope**: chỉ đổi `DEFAULT.gridColumns` + sync `arch.md`. Không động UI/Home/locale.

## Plan (inline)

Touch:

1. `.vitepress/theme/composables/useSettings.ts` — `DEFAULT.gridColumns: 2 → 1`.
2. `.ai/docs/arch.md` — update `gridColumns` row note if any default mentioned.

Total: ~2 lines code + 1 doc note.

## Notes

- Spec này rất nhỏ — borderline không cần spec, nhưng vì là default change ảnh hưởng UX nên ghi lại có lợi cho trace.
