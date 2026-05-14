# Kinh — Architecture

## System overview

Static site (PWA) for reading Buddhist sutras in Vietnamese. Pre-rendered by VitePress at build time, served from GitHub Pages at `/kinh/`. Single execution context: browser (no server, no extension contexts).

```
build time:                       runtime (browser):
  content/**/*.md                   index.html (home)
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
│       ├── style.css            # Tailwind + DaisyUI + reader CSS vars
│       ├── components/
│       │   ├── Home.vue         # grid 1/2/3 col
│       │   ├── ReaderTools.vue  # bookmark + TTS + settings FAB
│       │   └── SettingsDrawer.vue
│       └── composables/
│           ├── useSettings.ts   # localStorage + DOM apply
│           ├── useBookmarks.ts  # bookmarks + reading positions
│           └── useTts.ts        # Web Speech vi-VN
├── content/
│   ├── index.md                 # home (layout: home)
│   └── <slug>/
│       ├── index.md             # kinh root + TOC
│       └── NN-<chapter-slug>.md # chapters (long kinh only)
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

All keys persisted via `useLocalStorage` from VueUse. Single source of truth: `composables/useSettings.ts` + `useBookmarks.ts`.

### Keys (`kinh:*`)

| Key                      | Type                              | Default                        | Notes                                       |
| ------------------------ | --------------------------------- | ------------------------------ | ------------------------------------------- |
| `kinh:settings`          | `Settings`                        | see `useSettings.ts` `DEFAULT` | User preferences (single object)            |
| `kinh:bookmarks`         | `Bookmark[]`                      | `[]`                           | Max 100 entries, FIFO                       |
| `kinh:positions`         | `Record<string, ReadingPosition>` | `{}`                           | Scroll % per route path                     |
| `kinh:eyeRestMutedUntil` | `string \| null`                  | `null`                         | ISO timestamp; spec 011 mute-until midnight |
| `kinh:schedules`         | `SchedulesStore`                  | `{ version: 1, items: [] }`    | Versioned (spec 013). See `useSchedules.ts` |

### `Settings` shape

| Field             | Type                           | Range / values                                                   |
| ----------------- | ------------------------------ | ---------------------------------------------------------------- |
| `theme`           | `'light' \| 'dark' \| 'sepia'` | —                                                                |
| `fontSize`        | `number`                       | 16..28 (px)                                                      |
| `lineHeight`      | `number`                       | 1.6..2.4                                                         |
| `gridColumns`     | `1 \| 2 \| 3`                  | Default `1`.                                                     |
| `ttsRate`         | `number`                       | 0.5..2                                                           |
| `ttsVoice`        | `string`                       | `SpeechSynthesisVoice.voiceURI`                                  |
| `fontFamily`      | `'serif' \| 'sans'`            | —                                                                |
| `locale`          | `'vi' \| 'en' \| ''`           | `''` = uninitialized                                             |
| `autoScrollSpeed` | `'slow' \| 'normal' \| 'fast'` | Default `'normal'`. Maps to 0.5/1/2 px/frame in `useAutoScroll`. |
| `eyeRestEnabled`  | `boolean`                      | Default `false`. Opt-in 25-min reminder (spec 011).              |

Adding a new key / changing shape → spec required (`specs.md`). Update this table + `composables/useSettings.ts`.

**Versioning convention** (spec 013 onwards): new keys that may evolve their schema use a `{ version: N, ... }` envelope from the start. Bumping schema:

1. Define new shape and bump `version`.
2. Add migration in the composable: if loaded value has older `version`, transform → write back.
3. Existing keys without an envelope (`kinh:settings`, `kinh:bookmarks`, `kinh:positions`, `kinh:eyeRestMutedUntil`) stay un-versioned for now; introduce envelope only when a breaking change is needed.

## Themes

3 DaisyUI themes declared in `.vitepress/theme/style.css`:

| Theme   | Source                              | Notes                                    |
| ------- | ----------------------------------- | ---------------------------------------- |
| `light` | DaisyUI built-in                    | —                                        |
| `dark`  | DaisyUI built-in (prefersdark)      | Default for `prefers-color-scheme: dark` |
| `sepia` | Custom plugin (oklch sepia palette) | Default for first-boot                   |

`Settings.theme` written to `document.documentElement[data-theme]` by `applySettings()`.

Adding theme → spec + update `Theme` union + `style.css` `@plugin "daisyui/theme"` block + locale `settings.theme.*` keys.

## Catalog

`.vitepress/data/kinh.ts` exports `kinhCatalog: KinhMeta[]`. Single source of truth for:

- Home grid render order
- Sidebar auto-generation (`config.ts` `chaptersOf()`)
- i18n key mapping (`locales/*/kinh.<slug>.title|description`)

`KinhMeta` shape:

```ts
{
  slug: string         // = directory name in content/
  title: string        // VI fallback (en mirror in locales/en.json)
  image: string        // absolute path including base '/kinh/'
  author?: string
  description?: string
  chapters: boolean    // true = multi-chapter dir, false = single index.md
}
```

Adding kinh → spec required. Steps:

1. Add entry to `kinhCatalog`
2. Create `content/<slug>/index.md` (and `NN-*.md` chapters if `chapters: true`)
3. Place cover in `public/images/<slug>.jpg`
4. Mirror title + description in `locales/{vi,en}.json` under `kinh.<slug>`

## Layout switch

`.vitepress/theme/Layout.vue`:

- `page.relativePath === 'index.md'` → render `<Home />` (custom grid). Home itself mounts `<ContinueReadingCard />` above its heading.
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
       ├─ vite client bundle build (Tailwind + DaisyUI + PWA precache)
       └─ render each .md as static HTML (Node SSR pass)
```

SSR pass runs `Layout.vue` in Node — composables touching `window` / `localStorage` MUST guard. See AGENTS.md §4 VitePress specifics.

## PWA

`vite-plugin-pwa` in `config.ts`:

- `registerType: 'autoUpdate'`
- Scope + start_url + id = `/kinh/`
- Precache: `**/*.{js,css,html,png,svg,ico,jpg,jpeg,webp}`
- `navigateFallback: '/kinh/'` (offline → home)

## Deploy

`.github/workflows/deploy.yml`: Bun → `bun install --frozen-lockfile` → `bun run build` → `actions/upload-pages-artifact` → `actions/deploy-pages`.

Branch: `main`. Concurrency group `pages` prevents overlapping deploys.

## Naming conventions

| Thing        | Convention                              | Example                           |
| ------------ | --------------------------------------- | --------------------------------- |
| Composable   | `useXxx` camelCase                      | `useSettings`, `useBookmarks`     |
| Component    | PascalCase                              | `Home.vue`, `ReaderTools.vue`     |
| Storage key  | `kinh:<name>` lowercase                 | `kinh:settings`, `kinh:bookmarks` |
| Kinh slug    | kebab-case, matches directory name      | `kinh-dieu-phap-lien-hoa`         |
| Chapter file | `NN-<chapter-slug>.md`                  | `01-pham-1-tua.md`                |
| i18n key     | `feature.subsection.key` camelCase leaf | `settings.theme.dark`             |
| Spec slug    | `NNN-kebab-feature`                     | `001-rewrite-vitepress`           |
