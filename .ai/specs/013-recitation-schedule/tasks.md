# Tasks: Recitation schedule (Lite MVP)

Spec → `./spec.md`

## Tasks

- [x] T01 [P] (P1) `.vitepress/theme/composables/useSchedules.ts` — types + versioned storage + CRUD + nextOccurrence + interval tick + due ref → deps: -
- [x] T02 (P1) `.vitepress/theme/components/ScheduleDrawer.vue` — list (sorted by next), add form, delete per item → deps: T01
- [x] T03 (P1) `.vitepress/theme/components/ScheduleToast.vue` — DaisyUI alert showing due item; "Mở kinh" navigates, "Đóng" dismiss → deps: T01
- [x] T04 (P1) `.vitepress/theme/components/ScheduleButton.vue` — Home button + drawer mount → deps: T02
- [x] T05 (P1) `.vitepress/theme/components/Home.vue` — render `ScheduleButton` near ContinueReadingCard → deps: T04
- [x] T06 (P1) `.vitepress/theme/Layout.vue` — mount `ScheduleToast` (global) → deps: T03
- [x] T07 [P] (P1) `locales/vi.json` + `locales/en.json` — `schedule.*` keys → deps: -
- [x] T08 [P] (P2) `.ai/docs/arch.md` — document `kinh:schedules` + versioning note → deps: T01

## Checkpoints

- After T01 → composable exports types + state singleton; importable from components without runtime error.
- After T02 → drawer opens, add form creates entry, list re-sorts; delete removes.
- After T06 → set schedule 1 min in future → toast appears → "Mở kinh" navigates.
- After T08 → arch table reflects new key.
