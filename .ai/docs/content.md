# Content conventions

Rules for editing / adding markdown at repo root. Read before any change touching `<slug>/**/*.md`.

VitePress default `srcDir` (repo root) is used — markdown pages live next to `package.json`, NOT in `content/`.

## Hard rules

1. **Never edit body text of existing kinh** without explicit owner request. Kinh content is sacred source material — typo-fix only with approval.
2. Frontmatter changes (title, image, kinh flag, prev/next) — owner approval still required if structural; allowed for migration when owner says so.
3. Every kinh lives under `content/<slug>/`. Even single-file kinh use a directory (with only `index.md`) for consistency.
4. Slug = directory name = catalog entry slug. Must be kebab-case, ASCII only.

## Directory structure

```
<repo root>/
├── index.md                          # home page (rendered via custom Home.vue)
├── public/                           # static assets (default VitePress location)
│   └── images/<slug>.jpg
└── <slug>/
    ├── index.md                      # kinh root: title page + manual TOC (multi-chapter only)
    └── NN-<chapter-slug>.md          # individual chapters (multi-chapter kinh only)
```

Non-content markdown at root (`README.md`, `TODO.md`, `AGENTS.md`, `.ai/**`) excluded via `srcExclude` in `config.ts`.

Single-file kinh (short) → only `index.md` in the directory. Multi-chapter kinh → `index.md` is the table of contents + chapter files alongside.

## Filename conventions

- Chapter files: `NN-<chapter-slug>.md` where `NN` = 2-digit zero-padded chapter number.
  - Example: `01-pham-1-tua.md`, `28-pham-28-pho-hien-bo-tat-khuyen-phat.md`.
  - `NN` prefix drives sidebar sort order (alphabetical by filename).
- Chapter slug: derived from chapter title via `slugify` (Vietnamese → ASCII, lowercase, hyphens).
- No spaces, no diacritics, no special chars in filenames.

## Frontmatter schema

### Home page (`index.md`)

```yaml
---
title: Kinh Phật
layout: home
---
```

### Kinh root (`<slug>/index.md`)

```yaml
---
title: "Kinh Diệu Pháp Liên Hoa"
description: "28 phẩm — Pháp Hoa Kinh"
image: "/images/kinh-dieu-phap-lien-hoa.jpg"
author: "Hòa thượng Thích Trí Tịnh" # optional
kinh: true
---
```

Required: `title`, `image`. Optional: `description`, `author`. `kinh: true` flag marks kinh root pages (reserved for future filtering).

### Chapter file (`<slug>/NN-*.md`)

```yaml
---
title: "Phẩm 1: Tựa"
chapter: 1
kinh: "Kinh Diệu Pháp Liên Hoa"
image: "/images/kinh-dieu-phap-lien-hoa.jpg"
prev: false # or "./00-prev-slug" for chapter 2+
next: "./02-pham-2-phuong-tien" # or false for last chapter
---
```

Required: `title`, `chapter`, `kinh`, `image`. `prev` / `next` enable VitePress doc footer navigation; `false` disables that direction.

## Adding a kinh

Spec required (`specs.md` §"When to create a spec"). Steps in order:

1. Add `KinhMeta` entry to `.vitepress/data/kinh.ts` (slug, title, image, chapters flag, author?, description?).
2. Add cover image to `public/images/<slug>.jpg` (3:4 aspect ratio, ≥ 600×800).
3. Create `<slug>/` directory at repo root.
4. Create `<slug>/index.md` with frontmatter per schema above.
5. Multi-chapter? Split source into `NN-<chapter-slug>.md` files (use `scripts/split-chapters.ts` pattern).
6. Add i18n keys under `kinh.<slug>.{title,description}` in **both** `locales/vi.json` and `locales/en.json`.
7. Verify sidebar appears: `bun run dev` → `/kinh/<slug>/` → check sidebar shows all chapters.
8. Verify build: `bun run build` → no errors.

## Splitting an existing kinh

Source single-file kinh has `## ` headings for each section → use `scripts/split-chapters.ts` pattern:

1. Add new entry to `scripts/split-chapters.ts` `sources[]`.
2. Run `bun run scripts/split-chapters.ts`.
3. Manually verify: chapter count matches `## ` count; frontmatter `prev`/`next` chains correctly.
4. Remove old single-file source.
5. Flip `chapters: true` in catalog if changed.

Owner approval required before running the script (touches kinh markdown files at repo root).

## Image conventions

- Format: `.jpg` (cover art) or `.png` (logo).
- Path in frontmatter / catalog: absolute including base, e.g. `/images/kinh-dieu-phap-lien-hoa.jpg`. The `withBase()` helper is applied at render time in `Home.vue`.
- Store originals in `public/images/`. Never edit images in `.vitepress/dist/`.
- Catalog `image` field uses `/images/<file>` (NO base prefix). `Home.vue` wraps it with `withBase()` so the base ‘/kinh/’ is added at render time. NEVER hardcode ‘/kinh/’ in the catalog.

## Anchors (table of contents)

VitePress auto-generates anchor IDs from `##` / `###` headings. Sidebar `outline: { level: [2, 3] }` exposes them in the right-rail TOC.

In chapter files, prefer `### ` for sub-sections; reserve `## ` for major section breaks. The page `#` title is auto-prepended by `title` frontmatter.

## i18n for content

Content body text (kinh prayers, mantras, narrative) is **always Vietnamese** — never translated. Only metadata (kinh title / description on home grid, sidebar labels) is i18n'd via `locales/{vi,en}.json` under `kinh.<slug>.*`.

Sidebar chapter labels are derived from filenames in `config.ts` (`chaptersOf()`). To override per-locale → spec required (current impl is filename-based across all locales).
