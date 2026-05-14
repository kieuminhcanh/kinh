# Tasks: [Feature name]

Spec → `./spec.md`

## Format

- `T01 [P] (P1) <file> — task → deps: -` (P = parallel-safe)
- IDs sequential. Deps reference IDs.
- One file per task when possible. Group only if atomic.
- `(P1/P2/P3)` = priority within feature.

## Tasks

- [ ] T01 [P] (P1) `.vitepress/theme/composables/useFoo.ts` — impl new composable → deps: -
- [ ] T02 (P1) `.vitepress/theme/components/Foo.vue` — surface in UI → deps: T01
- [ ] T03 [P] (P1) `locales/vi.json` + `locales/en.json` — add i18n keys for new labels → deps: T02
- [ ] T04 (P2) `tests/useFoo.test.ts` — Vitest spec → deps: T01
- [ ] T05 (P2) `.ai/docs/arch.md` — update storage / catalog table if schema changed → deps: T01

## Checkpoints

- After T02 → `bun run dev` boots without errors; visual check on `/kinh/<route>/`.
- After T04 → `bun run test tests/useFoo.test.ts` green.
- After T05 → `bun run build` succeeds.

## Done log

[Move completed items here with date for trace. Optional.]

- ~~T00~~ scaffolding — YYYY-MM-DD
