# Kinh Phật

Web app/PWA đọc kinh Phật. Built với VitePress + Tailwind 4 + DaisyUI.

Live: https://kieuminhcanh.github.io/kinh/

## Stack

- **VitePress** — SSG, search local, markdown render
- **Tailwind 4** + **DaisyUI 5** — UI + 3 themes (light/dark/sepia)
- **VueUse** — `useLocalStorage`, `useSpeechSynthesis`
- **vite-plugin-pwa** — installable, offline
- **Bun** — package manager + runtime

## Phát triển

```sh
bun install
bun run dev        # http://localhost:5173
bun run build      # → .vitepress/dist
bun run preview
bun run typecheck
```

## Cấu trúc

```
.vitepress/
  config.ts           # base URL, sidebar (auto), PWA, search
  data/kinh.ts        # catalog metadata
  theme/
    Layout.vue        # home vs reader switch
    style.css         # Tailwind + DaisyUI themes
    components/       # Home, ReaderTools, SettingsDrawer
    composables/      # useSettings, useBookmarks, useTts
content/
  index.md            # home (rendered via custom Home.vue)
  <slug>/
    index.md          # kinh root + TOC
    NN-pham-N-…md     # chapters (long kinh)
public/
  logo*.png
  images/             # cover art
scripts/
  split-chapters.ts   # one-shot migration from old single-file md
```

## Thêm kinh mới

1. Thêm entry vào `.vitepress/data/kinh.ts`
2. Tạo thư mục `content/<slug>/`:
   - Multi-chapter: `index.md` + `NN-<chapter-slug>.md`
   - Single file: chỉ `index.md`
3. Đặt ảnh bìa vào `public/images/`

## Tính năng

- 3 themes (light / dark / sepia)
- Cỡ chữ + khoảng cách dòng tuỳ chỉnh
- Phông: Noto Serif (mặc định) hoặc Be Vietnam Pro
- Đánh dấu trang (bookmark)
- Lưu vị trí đọc cuối theo trang
- Đọc to (TTS Web Speech API, tiếng Việt)
- Grid 1/2/3 cột trang chủ
- Tìm kiếm toàn văn (local)
- PWA installable + offline
