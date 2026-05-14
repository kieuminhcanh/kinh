# Knowledge lookup workflow

Mandatory before any implementation. `AGENTS.md` §3 has the entry table.

## Unified template

```
0. .ai/skills/INDEX.md → offline llms.txt snapshot covers it?
1. plugins.md mapping → VueUse / VitePress / Tailwind official module already covers?
2. MCP (if domain has one) → live detail / version-sensitive
3. Web fetch official docs → only under staleness triggers
4. Custom code → propose + wait for owner confirmation
```

## Pre-flight (before ANY impl)

1. Domain → file to grep: frontend deps → `package.json`. Module / composable already installed?
2. Check `.ai/skills/INDEX.md` → vendor `llms*.txt` snapshot exists? → grep it.
3. Consult `plugins.md` mapping table → official VueUse composable / VitePress plugin exists?
4. Not in either → web fetch first stop (per Entry table below) → discover unlisted modules / APIs.
5. Found → USE IT (install if needed). Nothing → state reason + propose custom → wait.

## Domain overrides

### VitePress (config / theme / SSR)

1. `plugins.md` mapping table.
2. Web fetch `https://vitepress.dev/` slice — config, theme extending, SSR compat, search, sidebar.
3. Need custom layout / new VitePress plugin → propose + wait for owner approval → record in spec `## Plan` + `plugins.md` exceptions.

Bans: hardcoding `/kinh/` (use `withBase()`); touching `node_modules`; bypassing `themeConfig` for sidebar generation.

### Vue / VueUse

1. MCP (`vue_docs_search`, ecosystem search) — semantic / version-sensitive.
2. Web fetch `https://vueuse.org/` — only under staleness triggers.
3. Custom composable in `.vitepress/theme/composables/` → last resort. Inline-first (AGENTS §4) until ≥ 2 callers.

### Tailwind 4

1. Web fetch `https://tailwindcss.com/` — utilities + v4-specific syntax (CSS-first config, `@import "tailwindcss"`, `@plugin`).
2. Existing `.vitepress/theme/style.css` → match conventions.

Notes for v4:

- Config lives in CSS (`@theme`, `@plugin`), not `tailwind.config.js`.
- Arbitrary value syntax: `aspect-3/4`, `z-100` (no brackets needed for simple cases).
- `@tailwindcss/vite` plugin auto-scans content from imported files.

### DaisyUI 5

1. Web fetch `https://daisyui.com/` — component class names + theme variables.
2. Existing themes in `.vitepress/theme/style.css` (sepia is custom).
3. Theme variables: `--color-base-100`, `--color-primary`, `--color-base-content`, etc. (oklch).

### vue-i18n

1. Web fetch `https://vue-i18n.intlify.dev/` — composition API, `useI18n`, `legacy: false`.
2. Existing `.vitepress/theme/i18n.ts` setup — extend, don't replicate.
3. Locale files: `locales/{vi,en}.json`. vi is the source of truth.

### Vitest (composables only)

1. Web fetch `https://vitest.dev/` for API detail.
2. Existing `tests/**` patterns first — match `happy-dom` env, `localStorage` reset between tests.

## Staleness triggers (web fetch)

Web fetch only when ALL true:

1. `plugins.md` mapping miss.
2. MCP (if available) also misses.
3. OR owner explicitly says snapshot stale.
4. OR feature released after model knowledge cutoff.

## Local skills snapshot (priority 0)

`.ai/skills/` ships vendor `llms.txt` / `llms-full.txt` for: VitePress, Vue, VueUse, vue-i18n, DaisyUI, Vite, vite-plugin-pwa, Vitest, oxc.

Flow per query:

1. Read `.ai/skills/INDEX.md` → file mapping + grep patterns.
2. `grep -n "<symbol>" kinh/.ai/skills/<file>.txt` → read surrounding lines.
3. Found + version matches `package.json` → use it. No further fetch.
4. Not found OR snapshot stale (vendor major bump since download) → escalate to MCP / web fetch per Domain overrides.

Refresh snapshot: `curl -fsSL -o .ai/skills/<name>.txt https://<vendor>/llms[-full].txt` → update `INDEX.md` size column.

Tailwind 4 has **no published `llms.txt`** → always web fetch `https://tailwindcss.com/`.
