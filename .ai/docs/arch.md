# Kinh — Architecture

## System overview

Static site (PWA) for reading Buddhist sutras in Vietnamese. Pre-rendered by VitePress at build time, served from GitHub Pages at `/kinh/`. Single execution context: browser (no server, no extension contexts).

```
build time:                       runtime (browser):
  <slug>/**/*.md                    index.html (home)
       │                            ├─ <Home /> grid
       │ markdown → vue             ├─ <Reader /> per chapter
       ▼                            │   ├─ ContentRenderer (vp-doc)
  .vitepress/dist/                  │   └─ <ReaderTools /> (FAB)
       └─ per-chapter chunks        │       ├─ Bookmark
                                    │       ├─ TTS
                                    │       └─ <SettingsDrawer />
                                    └─ Service Worker (offline cache)
```

## File system layout

```
kinh/
├── .vitepress/
│   ├── config.ts                # base, sidebar (auto-gen), PWA, search, vite defines
│   ├── data/kinh.ts             # catalog metadata (KinhMeta[])
│   └── theme/
│       ├── index.ts             # enhanceApp: i18n + PWA register + applySettings
│       ├── Layout.vue           # home vs reader switch
│       ├── i18n.ts              # vue-i18n setup + locale detection
│       ├── style.css            # Tailwind v4 + reader CSS vars + focus/print rules
│       ├── components/
│       │   ├── Home.vue         # grid 1/2 col
│       │   ├── ReaderTools.vue  # TTS + auto-scroll + focus + settings
│       │   └── SettingsDrawer.vue
│       └── composables/
│           ├── useSettings.ts   # localStorage + DOM apply
│           └── useTts.ts        # Web Speech vi-VN
├── index.md                      # home (rendered via Home.vue)
├── <slug>/                       # one dir per kinh at repo root
│   ├── index.md                  # kinh root + TOC
│   └── NN-<chapter-slug>.md      # chapters (long kinh only)
├── locales/
│   ├── vi.json                  # default + fallback
│   └── en.json
├── public/{logo*.png, images/*.jpg}
├── scripts/split-chapters.ts    # one-shot migration helper
├── tests/                       # Vitest specs (composables)
├── .github/workflows/deploy.yml
└── package.json + tsconfig.json
```

## Storage schema

All keys persisted via `useLocalStorage` from VueUse. Single source of truth: `composables/useSettings.ts`.

### Keys (`kinh:*`)

| Key              | Type             | Default                        | Notes                                       |
| ---------------- | ---------------- | ------------------------------ | ------------------------------------------- |
| `kinh:settings`  | `Settings`       | see `useSettings.ts` `DEFAULT` | User preferences (single object)            |
| `kinh:schedules` | `SchedulesStore` | `{ version: 1, items: [] }`    | Versioned (spec 013). See `useSchedules.ts` |

Legacy keys (no longer read; data stays inert in users' storage): `kinh:eyeRestMutedUntil` (spec 011 removed).

### `Settings` shape

| Field             | Type                           | Range / values                                                   |
| ----------------- | ------------------------------ | ---------------------------------------------------------------- |
| `theme`           | `'light' \| 'dark' \| 'auto'`  | Default `'auto'`. Drives VitePress appearance (spec 016).        |
| `fontSize`        | `number`                       | 16..60 (px)                                                      |
| `lineHeight`      | `number`                       | 1.6..2.4                                                         |
| `gridColumns`     | `1 \| 2 \| 3`                  | Default `1`.                                                     |
| `ttsRate`         | `number`                       | 0.5..2                                                           |
| `ttsVoice`        | `string`                       | `SpeechSynthesisVoice.voiceURI`                                  |
| `fontFamily`      | `'serif' \| 'sans'`            | —                                                                |
| `locale`          | `'vi' \| 'en' \| ''`           | `''` = uninitialized                                             |
| `autoScrollSpeed` | `'slow' \| 'normal' \| 'fast'` | Default `'normal'`. Maps to 0.5/1/2 px/frame in `useAutoScroll`. |

Adding a new key / changing shape → spec required (`specs.md`). Update this table + `composables/useSettings.ts`.

**Versioning convention** (spec 013 onwards): new keys that may evolve their schema use a `{ version: N, ... }` envelope from the start. Bumping schema:

1. Define new shape and bump `version`.
2. Add migration in the composable: if loaded value has older `version`, transform → write back.
3. Existing keys without an envelope (`kinh:settings`) stay un-versioned for now; introduce envelope only when a breaking change is needed.

## Themes

No custom theme layer. Visual theming = VitePress DefaultTheme + Tailwind v4 utilities (`bg-[--vp-c-bg]`, `text-[--vp-c-text-1]`, etc. referencing VitePress CSS vars). Dark mode is VitePress's built-in `html.dark` toggle.

3 user-facing choices for `Settings.theme`:

| Value   | Behavior                                                                |
| ------- | ----------------------------------------------------------------------- |
| `light` | Force light mode regardless of OS                                       |
| `dark`  | Force dark mode regardless of OS                                        |
| `auto`  | Follow `prefers-color-scheme` live (re-evaluates when OS theme changes) |

Wiring (`applySettings()` in `useSettings.ts`):

- Calls VueUse `useColorMode({ storageKey: 'vitepress-theme-appearance' })` — the same store VitePress's `useDark` uses internally.
- Two-way sync with `settings.theme`: changes in either VPNav's theme toggle or our SettingsDrawer propagate.
- VitePress reads the store and toggles `html.dark` itself; we do not touch the class.
- `config.ts` `appearance: true` enables this pathway.

Adding a new theme option → spec required. Pure colour tweaks (Tailwind palette / VitePress brand vars) can be done in `style.css` without a spec.

## Catalog

`.vitepress/data/kinh.ts` exports `kinhCatalog: KinhMeta[]`. Single source of truth for:

- Home grid render order
- Sidebar auto-generation (`config.ts` `chaptersOf()`)
- i18n key mapping (`locales/*/kinh.<slug>.title|description`)

`KinhMeta` shape:

```ts
{
  slug: string         // = directory name at repo root
  title: string        // VI fallback (en mirror in locales/en.json)
  image: string        // absolute path including base '/kinh/'
  author?: string
  description?: string
  chapters: boolean    // true = multi-chapter dir, false = single index.md
}
```

Adding kinh → spec required. Steps:

1. Add entry to `kinhCatalog`
2. Create `<slug>/index.md` at repo root (and `NN-*.md` chapters if `chapters: true`)
3. Place cover in `public/images/<slug>.jpg`
4. Mirror title + description in `locales/{vi,en}.json` under `kinh.<slug>`

## Layout switch

`.vitepress/theme/Layout.vue`:

- `page.relativePath === 'index.md'` → render `<Home />` (custom grid).
- otherwise → render `DefaultTheme.Layout` + reader-only overlays guarded by `isReader = !isHome && !page.isNotFound`:
  - `<ReadingProgress />` — fixed top progress bar (spec 008).
  - `<ShareSection />` — inline share section at chapter end (spec 014).
  - `<ReaderTools />` — bottom bar + drawers + auto-scroll + TTS state holder (spec 004 + 006 + 007).

All reader overlays carry `print:hidden` so Ctrl+P leaves only article content (spec 012).

## Build pipeline

```
bun run build
  └─ vitepress build
       ├─ vite SSR bundle build
       ├─ vite client bundle build (Tailwind v4 + PWA precache)
       └─ render each .md as static HTML (Node SSR pass)
```

SSR pass runs `Layout.vue` in Node — composables touching `window` / `localStorage` MUST guard. See AGENTS.md §4 VitePress specifics.

## PWA

`vite-plugin-pwa` in `config.ts`:

- `registerType: 'autoUpdate'`
- Scope + start_url + id = `/kinh/`
- Precache: `**/*.{js,css,html,png,svg,ico,jpg,jpeg,webp,woff,woff2,ttf,json}` (incl. web fonts + locale JSON)
- `maximumFileSizeToCacheInBytes: 5 MB` (raised so long kinh chapters / hero images aren't skipped)
- `cleanupOutdatedCaches: true`
- `navigateFallback: '/kinh/'` + denylist (`/api/*`, file-ext requests) so SPA fallback only fires for real navigations
- Runtime caching (CacheFirst, 1yr):
  - `https://fonts.googleapis.com/*` → `google-fonts-css`
  - `https://fonts.gstatic.com/*` → `google-fonts-webfonts`
- Runtime caching (StaleWhileRevalidate, 90d): any `image` destination → `images`

Result: full offline support after first visit — all HTML, JS, CSS, fonts, images, locale JSON, and service worker cached. Subsequent loads work with no network.

## Deploy

`.github/workflows/deploy.yml`: Bun → `bun install --frozen-lockfile` → `bun run build` → `actions/upload-pages-artifact` → `actions/deploy-pages`.

Branch: `main`. Concurrency group `pages` prevents overlapping deploys.

## Naming conventions

| Thing        | Convention                              | Example                           |
| ------------ | --------------------------------------- | --------------------------------- |
| Composable   | `useXxx` camelCase                      | `useSettings`, `useTts`           |
| Component    | PascalCase                              | `Home.vue`, `ReaderTools.vue`     |
| Storage key  | `kinh:<name>` lowercase                 | `kinh:settings`, `kinh:schedules` |
| Kinh slug    | kebab-case, matches directory name      | `kinh-dieu-phap-lien-hoa`         |
| Chapter file | `NN-<chapter-slug>.md`                  | `01-pham-1-tua.md`                |
| i18n key     | `feature.subsection.key` camelCase leaf | `settings.theme.dark`             |
| Spec slug    | `NNN-kebab-feature`                     | `001-rewrite-vitepress`           |
