# Tasks: Touch target ≥ 44 + contrast AA + min font 16

Spec → `./spec.md`

## Tasks

- [x] T01 [P] (P1) `.vitepress/theme/style.css` — add `.btn-sm { min-height: 2.75rem; min-width: 2.75rem; }` global rule. → deps: -
- [x] T02 [P] (P1) `.vitepress/theme/composables/useSettings.ts` — silent migration: after `useLocalStorage` returns, clamp `fontSize` to `max(16, v)`, `lineHeight` to `max(1.6, v)`. Update `Settings.fontSize` comment `// px, 16..28` and `Settings.lineHeight` comment `// 1.6..2.4`. Default values unchanged. → deps: -
- [x] T03 [P] (P1) `.vitepress/theme/components/SettingsDrawer.vue` — fontSize slider `min="16"`, lineHeight slider `min="1.6"`. Replace 3 `opacity-70` value-display `<span>` → `text-base-content/70`. → deps: -
- [x] T04 [P] (P1) `.vitepress/theme/components/Home.vue` — author `opacity-70` → `text-base-content/70`; description `opacity-60` → `text-base-content/70`. → deps: -
- [x] T05 [P] (P1) `.vitepress/theme/components/HistoryDrawer.vue` — 2 subtitle `opacity-80` → `text-base-content/70`. → deps: -
- [x] T06 [P] (P1) `.ai/docs/arch.md` — `Settings` table: fontSize Range `16..28`, lineHeight Range `1.6..2.4`. → deps: -
- [ ] T07 (P2) Manual verify — owner runs Lighthouse / axe DevTools on each theme (light/dark/sepia), expects 0 `color-contrast` violations. → deps: T01-T05

## Checkpoints

- After T02 → `bun run typecheck` green; reload dev → previously stored `fontSize < 16` becomes 16.
- After T05 → diagnostics 0; visual scan: no `opacity-*` remaining on important text.
- Pre-done analyze gate → re-read `spec.md` `## Acceptance`, tick each.

## Done log

[Move completed items here with date.]
