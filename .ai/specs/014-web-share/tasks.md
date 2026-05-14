# Tasks: Web Share

Spec → `./spec.md`

## Format

- `Tnn [P] (Pn) <file> — task → deps: -`
- IDs sequential. One file per task when possible.

## Tasks

- [x] T01 [P] (P1) `locales/vi.json` + `locales/en.json` — add `share.{button,heading,inviteText,copied,copyFailed,ariaShare}` keys both locales. → deps: -
- [x] T02 (P0) `.vitepress/theme/components/ShareSection.vue` (NEW) — inline component for chapter end. Detects native `navigator.share` (SSR-guard), falls back to clipboard. DaisyUI alert toast, auto-clear 3s, cleanup on unmount. `print:hidden` on section + toast. → deps: T01
- [x] T03 (P1) `.vitepress/theme/Layout.vue` — mount `<ShareSection v-if="isReader" />` after `<Layout />`. → deps: T02

## Checkpoints

- After T01 → `bun run typecheck` green; i18n keys load both locales.
- After T02 → component renders standalone, share button has ≥44 touch target, clipboard fallback toast appears + clears.
- After T03 → reader pages show section at end, Home does not, Ctrl+P hides section.
- Pre-done analyze gate (4 files = boundary) → re-read `spec.md` `## Acceptance`, tick each.

## Done log

- ~~T01~~ `vi.json` + `en.json`: added `share.{button,heading,inviteText,copied,copyFailed,ariaShare}` — 2026-05-13
- ~~T02~~ `ShareSection.vue` (NEW): native share + clipboard fallback + DaisyUI toast — 2026-05-13
- ~~T03~~ `Layout.vue`: mounted in reader template — 2026-05-13
