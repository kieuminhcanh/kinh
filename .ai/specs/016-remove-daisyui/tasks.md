# Tasks: Remove DaisyUI

Spec → `./spec.md`

## Format

- `T<id> [P] (P1) <files> — task → deps: -` (P = parallel-safe)
- `[P]` only when write scope is disjoint from other `[P]` peers.

## Tasks

### Phase 1 — Foundations (sequential, build the new theme plumbing first)

- [x] T01 (P1) `.ai/specs/016-remove-daisyui/research.md` — investigate VitePress appearance API: how `useData().isDark` is set, name of localStorage key, how to force `light`/`dark`/`auto` programmatically without breaking VPNav theme toggle. Record exact API + caveats. → deps: -
- [x] T02 (P1) `.vitepress/config.ts` — flip `appearance: false` → `true`. → deps: T01
- [x] T03 (P1) `.vitepress/theme/composables/useSettings.ts` — change `Theme` to `'light' | 'dark' | 'auto'`, default `'auto'`, silent migration `'sepia' → 'auto'`, rewrite `applySettings()` to drive VitePress appearance (per T01 findings) instead of `data-theme` attribute. → deps: T01
- [x] T04 [P] (P1) `locales/vi.json` + `locales/en.json` — remove `settings.theme.sepia` key, add `settings.theme.auto` (vi `"Tự động"`, en `"Auto"`). → deps: -
- [x] T05 (P1) `.vitepress/theme/style.css` — drop `@plugin "daisyui"`, drop `@plugin "daisyui/theme" { name: "sepia" }`, drop `.btn { background-color: var(--btn-bg)... }` override block, drop `.btn-sm { min-height: 2.75rem; min-width: 2.75rem }`. Keep Tailwind import, font import, reader CSS vars, `.vp-doc` rules, focus-mode rules, print rules, `img.object-cover` rule. → deps: T03
- [x] T06 (P1) `package.json` + `bun.lock` — remove `daisyui` from devDependencies; run `bun install` to refresh lockfile. → deps: T05

### Phase 2 — Component migration (each touches a disjoint file, all `[P]` after T06)

- [x] T07 [P] (P1) `.vitepress/theme/components/SettingsDrawer.vue` — rewrite all DaisyUI classes with Tailwind utilities; theme picker becomes 3 buttons (light/dark/auto) styled per notes patterns. → deps: T03, T04, T06
- [x] T08 [P] (P1) `.vitepress/theme/components/Home.vue` — language + columns pickers without `join`/`btn-*`; use Tailwind grouped buttons. → deps: T06
- [x] T09 [P] (P1) `.vitepress/theme/components/HistoryButton.vue` — single trigger button, Tailwind utilities. → deps: T06
- [x] T10 [P] (P1) `.vitepress/theme/components/HistoryDrawer.vue` — tabs (bookmarks/reading), per-item remove buttons, clear-all button, confirm modal buttons; all plain Tailwind. → deps: T06
- [x] T11 [P] (P1) `.vitepress/theme/components/ScheduleButton.vue` — single trigger button. → deps: T06
- [x] T12 [P] (P1) `.vitepress/theme/components/ScheduleDrawer.vue` — form (input/select/textarea), repeat picker (daily/weekly/once grouped buttons), submit/cancel, schedule list rows, delete button. → deps: T06
- [x] T13 [P] (P1) `.vitepress/theme/components/ScheduleToast.vue` — alert surface + open/dismiss buttons. → deps: T06
- [x] T14 [P] (P1) `.vitepress/theme/components/EyeRestToast.vue` — alert surface + rested/mute buttons. → deps: T06
- [x] T15 [P] (P1) `.vitepress/theme/components/ContinueReadingCard.vue` — dismiss button (`absolute top-2 right-2`). → deps: T06
- [x] T16 [P] (P1) `.vitepress/theme/components/ReaderBottomBar.vue` — bottom bar with bookmark / TTS / auto-scroll / focus / voice / settings buttons (highest density of DaisyUI classes in repo). → deps: T06
- [x] T17 [P] (P1) `.vitepress/theme/components/ReaderTools.vue` — verify, strip any leftover DaisyUI classes (drawer host wrapper). → deps: T06
- [x] T18 [P] (P1) `.vitepress/theme/components/FocusExitButton.vue` — exit focus button, Tailwind utilities. → deps: T06
- [x] T19 [P] (P1) `.vitepress/theme/components/ShareSection.vue` — share buttons (native share + per-platform fallbacks). → deps: T06
- [x] T20 [P] (P1) `.vitepress/theme/components/ReadingProgress.vue` — verify (likely already no DaisyUI), confirm no `bg-base-*` etc. → deps: T06

### Phase 3 — Verify + doc sync

- [x] (P1) Run `bun run typecheck` + `bun run lint` + `bun run test` + `bun run build` → all green. Re-run DaisyUI-class grep across `.vitepress/theme/**/*.vue` to confirm 0 matches. → deps: T07..T20
- [x] (P2) `.ai/docs/arch.md` — update Settings table (`theme` row: `'light' | 'dark' | 'auto'`, default `auto`), rewrite Themes section (drop DaisyUI references, describe VitePress appearance), update file-system note for `style.css`. → deps: T21
- [x] (P2) `.ai/docs/plugins.md` — remove DaisyUI entry if present; note Tailwind v4 only. → deps: T21

## Checkpoints

- After T06 → `bun run dev` boots; pages still render (likely visually broken — that's expected and addressed in Phase 2).
- After each Phase 2 task → visual check on affected route; buttons have backgrounds + padding, hover/focus visible, 44×44 min target.
- After T07 → toggle theme between `light`/`dark`/`auto` in SettingsDrawer; verify OS-level change flips page when on `auto`.
- After T10 → bookmark add/remove + tab switch works; confirm modal opens.
- After T12 → add schedule, repeat picker selectable, delete works.
- After T16 → all reader controls clickable, bottom bar layout intact.
- After T21 → all commands green; grep returns 0; `bun run build` produces `.vitepress/dist`.
- After T22 → `arch.md` matches current code.

## Done log

(move ticked T-ids here on completion)
