# AGENTS.md — Kinh

Mandatory entry. Read FIRST before any edit.

## 1. Required reading

| Doc                   | When                                                                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `AGENTS.md`           | always                                                                                                      |
| `.ai/tone.md`         | always                                                                                                      |
| `.ai/docs/arch.md`    | storage schema / settings type / theme / layout / catalog / arch change                                     |
| `.ai/docs/plugins.md` | before adding VueUse composable / VitePress plugin / new dep                                                |
| `.ai/docs/lookup.md`  | before implementation needing vendor docs                                                                   |
| `.ai/docs/content.md` | adding kinh / splitting chapters / editing markdown / frontmatter                                           |
| `.ai/docs/i18n.md`    | editing `.vue` with user-facing text / adding label / new locale                                            |
| `.ai/docs/choice.md`  | when asking owner multi-choice                                                                              |
| `.ai/docs/safety.md`  | git / destructive terminal command                                                                          |
| `.ai/docs/specs.md`   | multi-file feature / new storage key / new theme / new kinh / arch change                                   |
| `.ai/docs/testing.md` | writing / debugging Vitest tests for composables                                                            |
| `.ai/skills/INDEX.md` | before web-fetching vendor docs (VitePress / Vue / VueUse / vue-i18n / DaisyUI / Vite / PWA / Vitest / oxc) |

New doc added under `.ai/docs/**` → update this table with read condition.

**Reference-only paths:** `.vitepress/cache/`, `.vitepress/dist/`, `node_modules/`, `public/images/` — never read/grep/list unless owner explicitly asks.

**Per-feature work:** non-trivial features → `.ai/specs/NNN-slug/` (spec + tasks). Trigger conditions + lifecycle → `.ai/docs/specs.md`. Cross-feature backlog → `TODO.md`.

**Spec workflow triggers:**

1. **Explicit**: owner prefixes request with `Theo spec:` → MUST follow full lifecycle in `specs.md` (draft → clarified → planned → in-progress → done).
2. **Auto-detect**: request hits any condition in `specs.md` §"When to create a spec" (multi-file logic, new storage key, new theme, new kinh, arch change) → PROPOSE spec creation before coding. Wait for owner approval. Do NOT auto-create.

## 2. Stack (ground truth)

| Layer     | Tech                                                             |
| --------- | ---------------------------------------------------------------- |
| Framework | VitePress 1.x (SSG, base `/kinh/`)                               |
| UI        | Vue 3 (Composition API, `<script setup lang="ts">`)              |
| Style     | Tailwind 4 (`@tailwindcss/vite`) + DaisyUI 5 (3 themes)          |
| State     | VueUse `useLocalStorage` (keys `kinh:*`)                         |
| i18n      | `vue-i18n` v10 (`locales/{vi,en}.json`, default vi, fallback vi) |
| Content   | Markdown in `content/`, YAML frontmatter                         |
| Types     | TypeScript strict, no `any`                                      |
| Runtime   | Bun                                                              |
| Lint      | oxlint (Oxc)                                                     |
| Format    | oxfmt (Oxc)                                                      |
| Test      | Vitest + happy-dom (composables only)                            |
| PWA       | `vite-plugin-pwa` (autoUpdate)                                   |
| Deploy    | GitHub Pages at `/kinh/` via Actions                             |

**Hard rules:**

1. `bun` only. No `npm/yarn/pnpm` fallback.
2. No `cd` in commands. Run from repo root.
3. Static site — no server runtime, no API keys, no secrets in repo.
4. Fail-fast: command fails → report + stop.
5. NEVER call binaries directly (`vitepress`, `vitest`, `vue-tsc`, `oxlint`, `oxfmt`). Always go through `package.json` scripts.
6. Never edit `content/**/*.md` body text without explicit owner request — kinh content is sacred source material.
7. **Windows shell** — never redirect to `/dev/null` or `nul`. Creates stray files (`dev/null/*`, `./nul`). If output suppression needed: omit redirect, or pipe to `: >/dev/null` ONLY on POSIX. For this repo (Win + sh): just don't redirect. `/dev/null/path.ext` is code-block placeholder syntax ONLY — never pass as real path to `edit_file` / `terminal` / fs API.

## 3. Knowledge lookup (MANDATORY)

Detail → `.ai/docs/lookup.md`.

Entry decision:

| Need                                  | First stop                                |
| ------------------------------------- | ----------------------------------------- |
| VueUse composable already installed?  | `plugins.md` mapping table                |
| VitePress config / theme / SSR detail | web fetch `https://vitepress.dev/`        |
| Vue / VueUse API                      | MCP `vue_docs_search` / ecosystem search  |
| Tailwind 4 utility / syntax           | web fetch `https://tailwindcss.com/`      |
| DaisyUI component / theme             | web fetch `https://daisyui.com/`          |
| vue-i18n API                          | web fetch `https://vue-i18n.intlify.dev/` |
| Vitest API                            | web fetch `https://vitest.dev/`           |

Pre-flight before ANY impl → `lookup.md` §Pre-flight.

## 4. Code & engineering

- TS strict, fail-fast, throw early. No `any`.
- Composition API `<script setup lang="ts">` only.
- Comments: English only.
- KISS over DRY: minimum viable code, no speculative features, no abstraction for single-use.
- Inline-first abstraction: extract to module scope only when ≥ 2 callers share logic AND state.
- Rewrite threshold: 100 lines → 20 with same clarity → rewrite.
- Surgical edits: only request-tied files/lines. No reformatting nearby. No out-of-scope cleanup.
- Match repo style; no personal style.
- Cleanup scope: remove only imports/vars/fns unused **because of your own change**.
- Goal-driven: convert request → checkable goal. Step plan for non-trivial: `1. [task] → verify: [check]`.
- User-facing text (UI labels, aria, toasts) → i18n required. Rules → `.ai/docs/i18n.md`.

### VitePress specifics

- Theme entry: `.vitepress/theme/index.ts` — extends `DefaultTheme`, registers plugins (i18n, PWA) in `enhanceApp`.
- SSR-safe: any composable using `window` / `localStorage` / `navigator` MUST guard with `typeof window !== 'undefined'`. VitePress prerenders pages at build time.
- Content frontmatter conventions → `.ai/docs/content.md`.
- Catalog of available kinh → `.vitepress/data/kinh.ts` (single source of truth).
- Sidebar is auto-generated from `content/<slug>/` file listing in `config.ts`.
- `base: '/kinh/'` — never hardcode `/kinh/` in components; use `withBase()` from VitePress or relative paths.

**Customization priority (MANDATORY — follow in order, stop at first that works):**

1. **`themeConfig` flag** in `config.ts` — e.g. `aside: false`, `outline: false`, `docFooter`, `lastUpdated`. Docs: `https://vitepress.dev/reference/default-theme-config`.
2. **Frontmatter option** per page — e.g. `sidebar: false`, `aside: false`, `outline: false`, `layout: page`, `pageClass`. Docs: `https://vitepress.dev/reference/frontmatter-config`.
3. **Layout slot** via wrapper `<Layout>` in `.vitepress/theme/Layout.vue` — slots: `doc-top`, `doc-bottom`, `doc-before`, `doc-after`, `doc-footer-before`, `sidebar-nav-before/after`, `aside-top/bottom`, `aside-outline-before/after`, `layout-top/bottom`, `nav-bar-*`, `home-*`. Docs: `https://vitepress.dev/guide/extending-default-theme#layout-slots`.
4. **CSS variable override** in `style.css` — `--vp-c-*`, `--vp-sidebar-width`, `--vp-layout-max-width`, etc. Docs: `https://vitepress.dev/reference/default-theme-config` + theme `vars.css`.
5. **CSS class override** (`!important` on `.VP*` classes) — only when 1–4 cannot achieve the goal. Keep minimal: lines, scope, blast radius. Document why native option does not work.
6. **Vite alias component override** — last resort. Replace internal component (e.g. `VPNavBar.vue`) via `vite.resolve.alias`. Docs: `https://vitepress.dev/guide/extending-default-theme#overriding-internal-components`.

Never skip levels. Before writing CSS for a UI tweak: search `themeConfig` + frontmatter docs first. Owner has called this out — violating the order is a process bug.

## 5. Ops

Commands (bun only, repo root — per §2 hard rules):

```bash
bun install
bun run dev           # vitepress dev
bun run build         # vitepress build → .vitepress/dist
bun run preview       # serve dist
bun run typecheck     # vue-tsc --noEmit
bun run lint          # oxlint
bun run lint:fix      # oxlint --fix
bun run format        # oxfmt --check
bun run format:fix    # oxfmt
bun run test          # vitest run
bun run test:watch    # vitest watch
```

**Targeted test (REQUIRED for verification of single change):**

```bash
bun run test tests/<file>.test.ts
```

Post-edit (always):

1. Diagnostics → 0 errors in edited files.
2. **Task-done signal**: a task is done ONLY when owner says exactly `thanks` or `thank you` (standalone closing acknowledgement). Exception: spec workflow T-ids are "done" the moment the checkbox is ticked in `tasks.md` (see §6 below).
3. Lint+format: run `bun run lint:fix` then `bun run format:fix` ONLY at task-done signal. Never per-file, never between edits, never after a mid-task turn. Exception: spec workflow runs both per T-id before auto-commit (scoped to that T-id's files only via positional args).
4. Do NOT auto-run `bun run dev` / `bun run build` unless owner asks.
5. Content edits: never auto-edit `content/**/*.md` body — only frontmatter when migrating / structural changes, and only with owner approval.

Spec workflow only (active `.ai/specs/NNN-slug/`):

- Analyze gate + per-task summary → `.ai/docs/specs.md`.
- **Auto commit+push per T-id** → `.ai/docs/safety.md` §"Auto commit+push (spec workflow only)". Tick checkbox → lint:fix scoped → `git add` task files → commit `feat(NNN-slug): T<id> <desc>` → `git push`. Fail → stop + report, no retry.

## 6. Decision & escalation

- Ambiguous request → ask before coding.
- **Clarify gate**: non-trivial req (multi-file, new storage key, new theme, new kinh source, or ambiguous acceptance) → batch Q&A via `choice.md` BEFORE plan/impl. Record in spec `## Clarifications`.
- Over-engineering or rule violation → push back.
- State assumptions explicitly.
- Multi-choice format → `.ai/docs/choice.md`.

Retry limit: **3 attempts on same root cause** (same diagnostic / same failing command / same logical bug) → STOP + report: tried, why failed, alternatives, request guidance.

Count attempts per root cause regardless of approach changes (switching strategy does not reset the counter).

No infinite loops. No vague proposals. Don't switch problems to "make progress".

## 7. Doc sync (same-change rule)

| Change                                           | Update                                            |
| ------------------------------------------------ | ------------------------------------------------- |
| Settings schema / storage key / theme / catalog  | `arch.md` + feature `spec.md`                     |
| New VueUse composable / VitePress plugin adopted | `plugins.md`                                      |
| New workflow rule                                | `AGENTS.md`                                       |
| Frontmatter / chapter naming convention          | `content.md`                                      |
| New user-facing label / locale key               | `locales/{vi,en}.json` (both) + `i18n.md` if rule |
| Feature acceptance changed mid-impl              | feature `spec.md` `## Acceptance` + `tasks.md`    |

Out of sync = bug.

## 8. Safety

Git + destructive command rules → `.ai/docs/safety.md`. Read before any git command.

No API keys in this project (static site, all providers run client-side via Web Speech API only). If a future feature requires keys → spec required, follow secret rules.
