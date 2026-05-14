# Tasks: Default Home grid 2 → 1 column

Spec → `./spec.md`

## Format

- `Tnn [P] (Pn) <file> — task → deps: -`
- IDs sequential. One file per task when possible.

## Tasks

- [x] T01 (P0) `.vitepress/theme/composables/useSettings.ts` — `DEFAULT.gridColumns: 2 → 1`. → deps: -
- [x] T02 [P] (P2) `.ai/docs/arch.md` — annotate `gridColumns` row with `Default 1`. → deps: -

## Checkpoints

- After T01 → `bun run typecheck` green; existing user with `gridColumns=2` in `kinh:settings` keeps 2 (verified by `mergeDefaults: true` semantics — does not overwrite present keys).
- After T02 → arch doc reflects new default.
- Pre-done analyze gate (2 files = trivial) → re-read `spec.md` `## Acceptance`, tick each.

## Done log

- ~~T01~~ `useSettings.ts`: `DEFAULT.gridColumns` 2 → 1 — 2026-05-13
- ~~T02~~ `arch.md`: `gridColumns` row annotated `Default 1` — 2026-05-13
