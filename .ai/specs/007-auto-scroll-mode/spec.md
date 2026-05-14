# Spec: Auto-scroll mode

Status: done
Created: 2026-05-13
Slug: 007-auto-scroll-mode

## Why

Tay run / tay đau khớp → vuốt liên tục để cuộn rất mệt. Auto-scroll với tốc độ chỉnh được giải quyết vấn đề này (đặc biệt khi vừa đọc vừa nghe TTS).

## What

- 1 nút bật/tắt auto-scroll.
- Khi bật → trang cuộn dọc đều với tốc độ user chỉnh (slider hoặc 3 mức Chậm/Vừa/Nhanh).
- Bấm/scroll thủ công → tạm dừng auto-scroll (không tắt).
- Bỏ tay 3s → tiếp tục.
- Tốc độ lưu vào settings để lần sau giữ nguyên.

## Out of scope

- Đồng bộ tốc độ auto-scroll với tốc độ TTS.
- Smart pause khi camera detect ngủ gật :) .
- Reverse scroll.

## Acceptance criteria

- [x] Given bật auto-scroll, when chờ 1s, then trang cuộn xuống đều, smooth. (rAF loop, 0.5/1/2 px/frame)
- [x] Given đang auto-scroll, when user vuốt/scroll bằng tay, then auto-scroll tạm dừng. (`wheel`/`touchstart`/`keydown` PAUSE_KEYS → cancelRaf)
- [x] Sau 3s không tương tác → tự resume. (`RESUME_DELAY_MS = 3000` + `setTimeout` → `startRaf`)
- [x] Tốc độ chỉnh được, ít nhất 3 mức. (`'slow' | 'normal' | 'fast'` picker trong SettingsDrawer)
- [x] Tới cuối trang → tự dừng. (`scrollY + innerHeight >= scrollHeight - 2` → `stop()`)
- [x] Cài đặt tốc độ persist. (`Settings.autoScrollSpeed` trong `kinh:settings` localStorage)
- [x] i18n vi + en. (`reader.autoScroll.*`, `reader.bar.autoScroll{,Stop}`, `settings.autoScroll.*`)

## Clarifications

1. **Speed control UI** → 3 preset levels: Chậm / Vừa / Nhanh.
2. **Entry point** → Toggle button ở ReaderBottomBar (1-tap on/off). Speed picker ở SettingsDrawer (3 nút inline).
3. **Settings storage** → + field `autoScrollSpeed: 'slow' | 'normal' | 'fast'` vào `Settings` (literal union). Default `'normal'`.
4. **Pause-on-interaction** → Listen `wheel` + `touchstart` + `keydown` (PageUp/Down/Arrow) → pause + reset 3s resume timer. Click button không pause.
5. **prefers-reduced-motion** → Vẫn cho phép user opt-in (a11y need cho tay run), không disable hard.
6. **End-of-page** → `scrollY + clientHeight >= scrollHeight - 2` → tự stop, toggle → OFF.
7. **Speed mapping** → slow=0.5 / normal=1.0 / fast=2.0 px/frame (≈30/60/120 px/s @60fps).

## Plan (inline)

File touch list:

1. `.vitepress/theme/composables/useAutoScroll.ts` (NEW) — composable expose `{ isActive: Ref<boolean>, start(), stop(), toggle() }`. Internal:
   - `rafId` + `pauseTimer` state.
   - rAF loop: `scrollBy(0, speedPx)`. End check: `scrollY+clientHeight >= scrollHeight-2` → `stop()`.
   - User interaction handlers (`wheel`/`touchstart`/`keydown` selected keys) → cancel rAF, set 3s `setTimeout` → resume rAF.
   - Speed source: read `settings.value.autoScrollSpeed` reactive, map `{slow:0.5, normal:1, fast:2}`.
   - `onBeforeUnmount` → stop + cleanup listeners.
   - SSR-guard.
2. `.vitepress/theme/composables/useSettings.ts` (EDIT) — + `autoScrollSpeed: 'slow' | 'normal' | 'fast'` to `Settings` type. + default `'normal'`. `mergeDefaults: true` tự populate cho user cũ.
3. `.vitepress/theme/components/ReaderBottomBar.vue` (EDIT) — + new slot "Auto-scroll toggle" giữa A+ và TTS. Props: `autoScrollActive: boolean`. Emit: `toggle-auto-scroll`. Icon: arrow-down-circle / pause. Aria-label đổi theo state.
4. `.vitepress/theme/components/ReaderTools.vue` (EDIT) — import `useAutoScroll`, wire toggle. Pass `:auto-scroll-active="autoScroll.isActive.value"` + `@toggle-auto-scroll`. Cần stop auto-scroll khi route change (đã có watch path — reuse).
5. `.vitepress/theme/components/SettingsDrawer.vue` (EDIT) — + section "Auto-scroll speed" (3 nút inline `join` group tương tự gridColumns).
6. `locales/vi.json` + `locales/en.json` (EDIT) — add keys:
   - `reader.bar.autoScroll` ("Tự cuộn" / "Auto")
   - `reader.bar.autoScrollStop` ("Dừng cuộn" / "Stop scroll")
   - `reader.autoScroll.start` ("Bật tự cuộn" / "Start auto-scroll") — aria-label long
   - `reader.autoScroll.stop` ("Ngừng tự cuộn" / "Stop auto-scroll") — aria-label long
   - `settings.autoScroll.label` ("Tốc độ tự cuộn" / "Auto-scroll speed")
   - `settings.autoScroll.slow` ("Chậm" / "Slow")
   - `settings.autoScroll.normal` ("Vừa" / "Normal")
   - `settings.autoScroll.fast` ("Nhanh" / "Fast")
7. `.ai/docs/arch.md` (EDIT) — + row `autoScrollSpeed` vào `Settings` table.

No new dependencies. Storage schema bump: `Settings` gắn thêm optional-ish field (mergeDefaults handles legacy).

Bottom bar slot count: hiện 6 idle / 7 khi TTS active. Thêm auto-scroll → 7 idle / 8 max. Mobile `max-w-3xl` (768px) ÷ 8 = 96px/slot, vẫn > `min-w-16` (64px). OK.

A11y: toggle button — `aria-pressed`, `aria-label` state-dependent.

## Notes

- Implement bằng `requestAnimationFrame` + `window.scrollBy(0, delta)`.
- `prefers-reduced-motion` — KHÔNG auto-disable (a11y opt-in cho tay run). Owner accepted.
- Speed map: `{ slow: 0.5, normal: 1.0, fast: 2.0 }` px/frame at 60fps → ~30/60/120 px/s.
- Pause-on-interaction: `wheel`/`touchstart`/`keydown` (PageUp/Down/ArrowUp/Down/Home/End/Space) → cancel rAF, 3s `setTimeout` → resume. Self-triggered `scroll` event KHÔNG count as user interaction.
- Auto-scroll state KHÔNG persist across route changes (stop on `watch(path)` cleanup); only speed preference persists.
