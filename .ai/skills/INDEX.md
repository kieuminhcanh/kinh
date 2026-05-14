# Skills — Offline LLM Docs

Vendor `llms.txt` snapshots cho tech stack của `kinh`. Đọc offline → no fetch khi đã có ở đây.

## Files

| File                      | Source                                         | Size | Khi nào đọc                                                      |
| ------------------------- | ---------------------------------------------- | ---- | ---------------------------------------------------------------- |
| `vitepress-llms.txt`      | https://vitepress.dev/llms.txt                 | 5K   | Quick map các trang VitePress docs                               |
| `vitepress-llms-full.txt` | https://vitepress.dev/llms-full.txt            | 191K | Config, theme, SSR, frontmatter, i18n, deploy, runtime API       |
| `vue-llms.txt`            | https://vuejs.org/llms.txt                     | 7K   | Quick map Vue docs                                               |
| `vue-llms-full.txt`       | https://vuejs.org/llms-full.txt                | 928K | Composition API, reactivity, lifecycle, SSR caveats              |
| `vueuse-llms.txt`         | https://vueuse.org/llms.txt                    | 268K | All composables (full content; llms.txt == llms-full.txt)        |
| `vueuse-llms-full.txt`    | https://vueuse.org/llms-full.txt               | 268K | (duplicate — keep for completeness)                              |
| `vue-i18n-llms.txt`       | https://vue-i18n.intlify.dev/llms.txt          | 2K   | Quick map vue-i18n docs                                          |
| `vue-i18n-llms-full.txt`  | https://vue-i18n.intlify.dev/llms-full.txt     | 352K | `createI18n`, `useI18n`, locale, fallback, SSR                   |
| `daisyui-llms.txt`        | https://daisyui.com/llms.txt                   | 62K  | All components + themes + install (no `llms-full.txt` published) |
| `vite-llms.txt`           | https://vite.dev/llms.txt                      | 3K   | Quick map Vite docs                                              |
| `vite-llms-full.txt`      | https://vite.dev/llms-full.txt                 | 396K | Vite config, plugins, build, SSR, asset                          |
| `vite-pwa-llms.txt`       | https://vite-pwa-org.netlify.app/llms.txt      | 20K  | Quick map vite-plugin-pwa docs                                   |
| `vite-pwa-llms-full.txt`  | https://vite-pwa-org.netlify.app/llms-full.txt | 229K | Workbox, manifest, autoUpdate, runtime caching                   |
| `vitest-llms.txt`         | https://vitest.dev/llms.txt                    | 10K  | Quick map Vitest docs                                            |
| `vitest-llms-full.txt`    | https://vitest.dev/llms-full.txt               | 1.1M | Config, API, happy-dom, mocking, coverage                        |
| `oxc-llms.txt`            | https://oxc.rs/llms.txt                        | 87K  | oxlint, oxfmt config + rules                                     |

**Tailwind 4**: không publish `llms.txt`. Fetch live khi cần: https://tailwindcss.com/docs/...

## Cách AI tham khảo (MANDATORY)

`AGENTS.md` §3 + `.ai/docs/lookup.md` đã chỉ MCP / web fetch. Bổ sung: **PRIORITY 0 = đọc file trong `.ai/skills/` trước**.

### Decision flow

1. Cần info về `<topic>` ở stack đã có file → **đọc file tương ứng từ `.ai/skills/`**. Dùng `grep` / `read_file` với line range.
2. Không có hoặc info quá cũ → fallback theo `lookup.md`:
   - MCP `vue_docs_search`, ecosystem search, `vue_api_lookup`.
   - Web fetch chính thức (`vitepress.dev`, `tailwindcss.com`…).
3. Tailwind 4 utility / DaisyUI mới → web fetch (Tailwind không có llms; DaisyUI llms cập nhật 5.5.x).

### Grep pattern gợi ý

| Query                           | Command                                                                     |
| ------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------- |
| VitePress `enhanceApp` / SSR    | `grep -n "enhanceApp\|SSR" kinh/.ai/skills/vitepress-llms-full.txt`         |
| `useLocalStorage` ràng buộc     | `grep -n "useLocalStorage" kinh/.ai/skills/vueuse-llms.txt`                 |
| `createI18n` options            | `grep -n "createI18n" kinh/.ai/skills/vue-i18n-llms-full.txt`               |
| DaisyUI `card` / theme list     | `grep -n "card\\                                                            | theme" kinh/.ai/skills/daisyui-llms.txt` |
| PWA `registerType` `autoUpdate` | `grep -n "autoUpdate\|registerType" kinh/.ai/skills/vite-pwa-llms-full.txt` |
| Vitest happy-dom                | `grep -n "happy-dom" kinh/.ai/skills/vitest-llms-full.txt`                  |

### Refresh

Stack/version thay đổi → re-download:

```bash
curl -fsSL -o .ai/skills/<name>.txt https://<vendor>/llms[-full].txt
```

Cập nhật cột Size + ghi chú ở table này nếu vendor đổi schema.

## Hard rules

- Không bao giờ commit `llms*.txt` đã edit tay. Đây là **read-only snapshot**.
- Không base quyết định trên file này nếu version stack project khác bản tải về > 1 major. Check `package.json` trước.
- File này KHÔNG thay thế `.ai/docs/*` — docs nội bộ vẫn là ground truth cho project rules.
