# Plugins & Composables Mapping

> Reference for `AGENTS.md` §3 coverage. Before writing manual logic for the use cases below, **you MUST** use the official module / composable in the right column.
>
> Pre-flight workflow → `.ai/docs/lookup.md` §Pre-flight. Do not duplicate here.

## Mapping table

`Installed?` column reflects current `package.json`. Re-verify with `grep` before assuming.

| Use case                          | ❌ Manual                                  | ✅ Official                                                     | Installed?         |
| --------------------------------- | ------------------------------------------ | --------------------------------------------------------------- | ------------------ |
| VitePress theme override          | Hand-roll layouts                          | `vitepress/theme` `DefaultTheme.Layout` + `extends`             | ✅ (built-in)      |
| Persistent storage (localStorage) | Raw `localStorage.getItem` + JSON.parse    | VueUse → `useLocalStorage` (reactive, type-safe, mergeDefaults) | ✅                 |
| Tailwind v4 build                 | Hand-roll PostCSS                          | `@tailwindcss/vite` plugin                                      | ✅                 |
| DaisyUI themes                    | Hand-roll CSS variables per theme          | `@plugin "daisyui"` + `@plugin "daisyui/theme"` in CSS          | ✅                 |
| Vue i18n (locale switching)       | Manual switch + JSON imports               | `vue-i18n` v10 (composition API, `useI18n`)                     | ✅                 |
| PWA + service worker              | Hand-roll Workbox setup                    | `vite-plugin-pwa` (`registerType: 'autoUpdate'`)                | ✅                 |
| Local search                      | Hand-roll MiniSearch index                 | VitePress `themeConfig.search.provider: 'local'`                | ✅ (built-in)      |
| Sidebar generation                | Hand-write per kinh                        | `themeConfig.sidebar` + `fs.readdirSync` helper in `config.ts`  | ✅ (custom helper) |
| Web Speech API (TTS)              | Raw `window.speechSynthesis` calls         | VueUse → `useSpeechSynthesis`                                   | ✅                 |
| Debounce / throttle               | Manual `setTimeout` clears                 | VueUse → `useDebounceFn`, `useThrottleFn`                       | ✅                 |
| Scroll position tracking          | Manual `window.addEventListener('scroll')` | VueUse → `useScroll`, `useWindowScroll`                         | ✅                 |
| Element tracking                  | Manual `document.activeElement` polling    | VueUse → `useActiveElement`                                     | ✅                 |
| Media query                       | Manual `window.matchMedia`                 | VueUse → `useMediaQuery`, `usePreferredDark`                    | ✅                 |
| Clipboard                         | Manual `navigator.clipboard.writeText`     | VueUse → `useClipboard`                                         | ✅                 |

> When `Installed? = ❌` and the use case is needed → `bun add <name>` and update this table.

## Documented custom-composable exceptions

These stay as repo composables because no upstream covers the exact need.

| Composable                    | File                                           | Why no plugin                                                                                                                            |
| ----------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Settings store + DOM apply    | `.vitepress/theme/composables/useSettings.ts`  | Single object backed by `useLocalStorage` + `watchEffect` that maps fields → CSS vars + `data-theme`. No upstream covers the apply step. |
| Bookmarks + reading positions | `.vitepress/theme/composables/useBookmarks.ts` | Two stores wrapping `useLocalStorage` with domain-specific add/remove/has helpers + 100-entry FIFO cap.                                  |
| TTS wrapper                   | `.vitepress/theme/composables/useTts.ts`       | Wraps `useSpeechSynthesis`: lang `vi-VN`, voice persisted in settings, paragraph-by-paragraph speak from `.vp-doc`.                      |

Rule: any new custom composable adopted as a shared utility belongs in this table with its justification.

## Hard bans

- ❌ Raw `localStorage.*` for user-visible settings — always `useLocalStorage`.
- ❌ Hand-roll service worker — always `vite-plugin-pwa`.
- ❌ Inline `<style>` blocks with theme-specific colors — always reach DaisyUI `--color-*` vars or Tailwind utilities.
- ❌ Hardcoded `/kinh/` in components — use VitePress `withBase()` or relative paths.
- ❌ Hardcoded UI strings in templates — always `t('key')` (i18n required, see `.ai/docs/i18n.md`).
- ❌ Assuming a module is not installed — always check `package.json` first.

## Updating this file

When adopting a new VueUse composable / VitePress plugin:

1. Install via `bun add <name>`.
2. Add to the mapping table (or custom-exceptions if not standard).
3. Update `package.json` deps section AND `arch.md` if it changes architecture.
4. Reference it from feature code instead of any prior manual impl.
