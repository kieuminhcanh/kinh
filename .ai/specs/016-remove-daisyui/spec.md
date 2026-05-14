# Spec: Remove DaisyUI — keep Tailwind + VitePress DefaultTheme

Status: clarified
Created: 2025-11-21
Slug: 016-remove-daisyui

## Why

DaisyUI's `.btn` rules sit in `@layer utilities` and lose the cascade race against VitePress `base.css`'s unlayered `button { background: transparent; padding: 0 }` reset → buttons render flat. Workarounds (manual unlayered overrides per component class) accumulate friction. Owner prefers a single styling source = Tailwind utilities + VitePress's own visual language; DaisyUI components and themes are not worth the cascade fight.

## What

- Project no longer depends on DaisyUI (package + `@plugin` declarations gone).
- All DaisyUI class usages (`btn*`, `alert*`, `join*`, `tabs*`, `input*`, `select*`, `textarea*`, `badge*`, `bg-base-*`, `text-*-content`, `bg-primary` semantic, etc.) replaced by plain Tailwind utilities — no new component wrapper layer, no custom CSS classes beyond what already exists for reader typography.
- Theme system reduced to `light | dark | auto`:
  - `light` / `dark` — explicit user choice
  - `auto` — follows `prefers-color-scheme`
  - Implemented via VitePress's built-in dark mode (`html.dark` class toggled by VitePress's appearance API).
- Sepia theme removed.
- VitePress `appearance: true` (default) so its dark mode + auto detection work.
- Settings drawer theme switcher uses the 3-option set above.
- All existing user-facing features (bookmark drawer, schedule drawer, eye-rest toast, schedule toast, reader bottom bar, settings drawer, home language/columns pickers, focus mode, TTS, auto-scroll, share section, continue card) keep identical behavior and a11y (44×44 min targets, aria-labels, focus rings).

## Out of scope

- Adding new UI features.
- Rewriting markdown (`.vp-doc`) typography (already styled by VitePress).
- Replacing VitePress DefaultTheme with a custom shell.
- Per-user custom themes / color picker.
- Migrating reader CSS vars (`--reader-font-size`, etc.) — unchanged.

## Acceptance criteria

- [ ] `package.json` has no `daisyui` dependency; `bun install` runs clean.
- [ ] `.vitepress/theme/style.css` contains no `@plugin "daisyui*"` blocks and no references to DaisyUI CSS vars (`--btn-*`, `--color-base-*`, etc.).
- [ ] `grep -rE "\b(btn|alert|join|tabs|input-bordered|select-bordered|textarea-bordered|badge|bg-base-|text-.*-content|btn-primary|btn-ghost|btn-error|btn-outline|btn-sm|btn-active|btn-block|btn-circle|btn-square|alert-info)\b" .vitepress/theme` returns 0 matches in `.vue` files.
- [ ] All buttons across the app have visible background + padding + hover/focus state matching the rest of VitePress UI (no flat buttons).
- [ ] Settings drawer shows exactly 3 theme options labelled (vi) Sáng / Tối / Tự động and (en) Light / Dark / Auto.
- [ ] Selecting `light` forces light mode regardless of OS; `dark` forces dark; `auto` follows OS `prefers-color-scheme` live (changing OS theme flips the page without reload).
- [ ] `Settings.theme` type is `'light' | 'dark' | 'auto'`; legacy stored values (`'sepia'`) migrate silently to `'auto'` on load.
- [ ] `bun run build` succeeds with no console errors; `.vitepress/dist` produced.
- [ ] `bun run typecheck` passes (0 errors).
- [ ] `bun run lint` passes (0 errors).
- [ ] `bun run test` passes (all existing tests green).
- [ ] Print stylesheet still works (Ctrl+P hides chrome, content readable in B/W).
- [ ] Focus mode still hides VPNav / VPSidebar / VPLocalNav / VPDocFooter.
- [ ] PWA still installable, manifest unchanged.
- [ ] `.ai/docs/arch.md` updated: storage `Settings.theme` row, Themes section rewritten, file-system note about `style.css` (no DaisyUI).

## Clarifications

- Q: Keep DaisyUI partially (e.g. only for drawers/alerts) or remove entirely?
  A: Remove entirely. Pure Tailwind utilities + VitePress DefaultTheme.

- Q: Keep sepia theme via custom CSS?
  A: No. Drop sepia. Only light/dark/auto.

- Q: How to handle legacy `Settings.theme === 'sepia'` in existing user localStorage?
  A: Silent migration on load in `useSettings()` — map `'sepia'` → `'auto'`. No UI prompt.

- Q: Replacement pattern for DaisyUI components — utility classes inline, custom CSS classes, or Vue wrapper components?
  A: Inline Tailwind utilities. No new abstraction layer. Verbosity acceptable; one-off styling per use site.

- Q: Theme color tokens (primary / error / etc.)?
  A: Use Tailwind defaults (`bg-blue-600`, `bg-red-600`, `bg-gray-100`, etc.) chosen per-component. Match VitePress brand color (`#3451b2` light / `#a8b1ff` dark) only where it clearly belongs (e.g. primary CTAs); other widgets just pick a sensible Tailwind palette and stay consistent within their own component.

- Q: Dark mode mechanism?
  A: VitePress built-in. Set `appearance: true` in `config.ts`. Toggle `useData().isDark` for read; for write we drive via VitePress's `useData().lang`-style API — concretely, mutate `localStorage['vitepress-theme-appearance']` + dispatch storage event OR import VitePress's appearance composable. Investigation task T01.

## Plan (inline)

Stack: same as project. No new deps. Net deletion.

Touch list (write scope; group by T-id, no overlaps):

- `package.json` — remove `daisyui` from devDependencies.
- `bun.lock` — regenerated by `bun install`.
- `.vitepress/config.ts` — flip `appearance: false` → `true`.
- `.vitepress/theme/style.css` — drop `@plugin "daisyui"` + `@plugin "daisyui/theme"` (sepia) + `.btn { ... }` override + `.btn-sm { ... }` override. Keep tailwind import, reader CSS vars, focus-mode rules, print rules, `.vp-doc` rules, font import.
- `.vitepress/theme/composables/useSettings.ts` — `Theme = 'light' | 'dark' | 'auto'`, default `'auto'`, migrate `'sepia'` → `'auto'`, rewrite `applySettings()` to drive VitePress appearance (remove `data-theme` attribute).
- `.vitepress/theme/components/SettingsDrawer.vue` — 3-option picker, plain Tailwind.
- `.vitepress/theme/components/Home.vue` — language + columns pickers without `join`/`btn-*`.
- `.vitepress/theme/components/HistoryButton.vue` — single button.
- `.vitepress/theme/components/HistoryDrawer.vue` — tabs, buttons, confirm modal.
- `.vitepress/theme/components/ScheduleButton.vue` — single button.
- `.vitepress/theme/components/ScheduleDrawer.vue` — drawer form, inputs/selects, join repeat picker, list buttons.
- `.vitepress/theme/components/ScheduleToast.vue` — alert surface + buttons.
- `.vitepress/theme/components/EyeRestToast.vue` — alert surface + buttons.
- `.vitepress/theme/components/ContinueReadingCard.vue` — dismiss button.
- `.vitepress/theme/components/ReaderBottomBar.vue` — bottom bar buttons (highest density of `btn-*`).
- `.vitepress/theme/components/ReaderTools.vue` — verify no DaisyUI classes remain (mostly drawer host).
- `.vitepress/theme/components/FocusExitButton.vue` — exit button.
- `.vitepress/theme/components/ShareSection.vue` — share buttons.
- `.vitepress/theme/components/ReadingProgress.vue` — verify (likely no DaisyUI).
- `locales/vi.json`, `locales/en.json` — `settings.theme.sepia` removed, `settings.theme.auto` added.
- `.ai/docs/arch.md` — Themes section + Settings table updated.

Reusable Tailwind patterns (documented in `notes.md` for consistency, not enforced as classes):

- Primary button: `inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-md bg-[--vp-c-brand-1] text-white hover:bg-[--vp-c-brand-2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--vp-c-brand-1] transition-colors disabled:opacity-50`
- Ghost button: `... bg-transparent hover:bg-[--vp-c-bg-soft] text-[--vp-c-text-1] ...`
- Danger button: `... bg-red-600 text-white hover:bg-red-700 ...`
- Surface: `bg-[--vp-c-bg] border border-[--vp-c-divider] rounded-lg`
- Input: `w-full min-h-11 px-3 rounded-md border border-[--vp-c-divider] bg-[--vp-c-bg] text-[--vp-c-text-1] focus-visible:outline-2 focus-visible:outline-[--vp-c-brand-1]`
- Alert info: `flex items-start gap-3 p-4 rounded-lg bg-[--vp-c-brand-soft] text-[--vp-c-text-1] border border-[--vp-c-brand-1]/30`
- Tab active / inactive: `border-b-2 border-[--vp-c-brand-1] text-[--vp-c-brand-1]` / `border-b-2 border-transparent text-[--vp-c-text-2]`

Using VitePress CSS vars (`--vp-c-*`) → dark mode handled for free via `html.dark` switch.

## Notes

- VitePress brand vars reference: https://vitepress.dev/reference/default-theme-config + base.css. T01 confirms exact var names + dark mode appearance API.
- Cascade decision: stick with plain Tailwind utilities. No `@layer components` custom classes — if we needed them we'd be reinventing DaisyUI.
- WCAG 2.5.5 (44×44) enforced per-button via `min-h-11 min-w-11` (no global `.btn-sm` rule anymore).
- `appearance: true` re-enables VitePress's own theme toggle in VPNav — owner explicitly wants DefaultTheme, so this is fine and redundant with SettingsDrawer's theme switch (both write to the same VitePress appearance key).
