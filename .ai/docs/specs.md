# Specs workflow (lite spec-driven)

Inspired by github/spec-kit. Lite version: only `spec.md` + `tasks.md` per feature. Plan inline in `spec.md` unless feature is large.

## When to create a spec

| Change size                                                               | Spec needed?                                     |
| ------------------------------------------------------------------------- | ------------------------------------------------ |
| 1 file, <30 lines, no storage/theme/catalog change                        | No. Direct edit + `TODO.md` entry if multi-step. |
| Multi-file, new storage key, new theme, new locale, new catalog entry     | Yes. `.ai/specs/NNN-slug/`.                      |
| New kinh added (catalog + content + i18n + images)                        | Yes. Plus `content.md` checklist.                |
| Architecture change (layout switch, build pipeline, deploy, PWA strategy) | Yes + update `.ai/docs/arch.md` (per AGENTS §7). |

## Lifecycle

```
draft → clarified → planned → in-progress → done
```

1. **Draft** — owner gives request. Agent creates `.ai/specs/NNN-slug/spec.md` from `.ai/templates/spec/spec.md`. Fill Why + What + Out-of-scope + Acceptance. Status `draft`.
2. **Clarify** (gate, mandatory if non-trivial) — ambiguity → multi-choice via `.ai/docs/choice.md`. Record Q/A in spec `## Clarifications`. Status `clarified`.
3. **Plan** — inline in spec `## Plan` section for small features (touch list + storage schema delta + locale keys). For large: create `plan.md` next to `spec.md`. Status `planned`.
4. **Tasks** — copy `.ai/templates/spec/tasks.md` → `.ai/specs/NNN-slug/tasks.md`. ID + deps + `[P]` + file paths.
5. **Implement** — execute tasks in dep order. Per T-id: edit files → verify checkpoint → tick checkbox in `tasks.md` → auto commit+push (per `safety.md` §"Auto commit+push (spec workflow only)"): `bun run lint:fix` scoped → `git add` task files → commit `feat(NNN-slug): T<id> <desc>` → `git push`. Status `in-progress`.
6. **Analyze gate** (>3 files edited) — re-read `spec.md` `## Acceptance`. Verify each criterion impl. Mismatch → fix or update spec (out-of-sync = bug per AGENTS §7).
7. **Done** — all acceptance ticked. Status `done`. Move tasks to `## Done log`.

## Naming

- Slug: `NNN-kebab-feature` (NNN = 3-digit zero-pad, increment).
- Example: `.ai/specs/001-rewrite-vitepress/`, `.ai/specs/002-add-kinh-bat-nha/`.

## Rules

- Never start impl without `## Acceptance` filled.
- Never mark task done without verifying its checkpoint.
- Clarify question batched, not one-by-one. Use `choice.md`.
- Inline plan ≤ 10 bullets. Exceed → split to `plan.md`.

## Per-task summary (thread continuity)

After finishing any spec task (T-id ticked in `tasks.md`), emit a fenced ```summary block at the end of that turn.

Purpose: owner copies it into a new thread when current one nears context limit.

Required sections (terse, telegraphic, no fluff):

- `Spec`: spec id + slug
- `Done this turn`: T-ids + 1-line each
- `Files changed`: paths only
- `State`: next pending T-ids + blockers (if any)
- `Key decisions`: deviations from spec / clarifications resolved (if any)
- `Pitfalls`: things future-me must NOT redo / forget (file already exists, schema already bumped, etc.)

## Files in feature folder

```
.ai/specs/NNN-slug/
├── spec.md      # always
├── tasks.md     # always
├── plan.md      # optional, only if spec.md ## Plan overflows
├── research.md  # optional, vendor docs distilled (per lookup.md)
└── notes.md     # optional, scratch
```
