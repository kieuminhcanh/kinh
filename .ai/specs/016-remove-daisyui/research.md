# T01 Research — VitePress appearance API

## TL;DR

- VitePress drives dark mode via **VueUse `useDark`** internally.
- Storage key (exported as `APPEARANCE_KEY`): **`'vitepress-theme-appearance'`**.
- Stored values (raw localStorage strings): **`'dark'` | `'light'` | `'auto'`** (VueUse `useColorMode` modes).
- Result: `useDark` returns a boolean ref; VitePress exposes it as `useData().isDark` and toggles `html.dark` class.
- VitePress DefaultTheme's `VPSwitchAppearance` (in navbar) writes to this same store via `isDark.value = ...`. Toggling it flips between `'dark'` and `'auto'` (VueUse default — `valueLight = ''` collapses to `'auto'`).

## Source evidence

`node_modules/vitepress/dist/client/shared.js`:

```javascript
export const APPEARANCE_KEY = "vitepress-theme-appearance";
```

`node_modules/vitepress/dist/client/app/data.js` (lines 17–30):

```javascript
const appearance = site.value.appearance;
const isDark =
  appearance === "force-dark"
    ? ref(true)
    : appearance === "force-auto"
      ? usePreferredDark()
      : appearance
        ? useDark({
            storageKey: APPEARANCE_KEY,
            initialValue: () => (appearance === "dark" ? "dark" : "auto"),
            ...(typeof appearance === "object" ? appearance : {}),
          })
        : ref(false);
```

`node_modules/@vueuse/core/index.mjs` `useDark` defaults: `valueDark = 'dark'`, `valueLight = ''` (VueUse normalises `''` to `'auto'` internally via `useColorMode`).

## Storage contract

| User intent | What ends up in `localStorage['vitepress-theme-appearance']`   | Behavior                                                    |
| ----------- | -------------------------------------------------------------- | ----------------------------------------------------------- |
| Light       | `'light'`                                                      | Forces light regardless of OS                               |
| Dark        | `'dark'`                                                       | Forces dark regardless of OS                                |
| Auto        | `'auto'`                                                       | Follows `prefers-color-scheme` live (VueUse media listener) |
| (unset)     | key absent → defaults to `'auto'` (per VitePress initialValue) | Same as Auto                                                |

VueUse `useColorMode` (which `useDark` wraps) writes one of the three strings depending on its `store` ref's value. When user picks Auto, VueUse rebinds to `prefers-color-scheme` media query and applies `.dark` class reactively.

## Caveats

1. **Reading**: `useData().isDark` is a `Ref<boolean>` — gives the _current_ effective mode, NOT the user's chosen mode. If user picked "Auto" and OS is light → `isDark.value === false` but stored value is `'auto'` (not `'light'`). So we cannot reconstruct the 3-state choice from `isDark` alone.

2. **Writing**: Setting `isDark.value = true` only flips between `'dark'` and the opposite system-side bucket. To get explicit 3-state control (Light / Dark / Auto), we must write the raw string to `localStorage` ourselves AND ensure VitePress's `useDark` instance picks up the change.

3. **VitePress's `useDark` already listens to its own storage ref**, but a manual `localStorage.setItem` from another tab/script triggers a `storage` event — VueUse listens to it. So writing the raw value works cross-context. Within the same window, writing directly to localStorage may not fire `storage` (browsers fire `storage` only on _other_ windows/tabs). Workaround: dispatch a synthetic `StorageEvent`, OR — cleaner — instantiate our own VueUse `useDark` with the **same storage key** so VueUse's internal ref (shared `useStorage` instance per key) updates everywhere.

4. **VueUse `useStorage` IS shared across composable calls** with the same key (it caches per key, similar to our `useSettings` pattern). So calling `useDark({ storageKey: 'vitepress-theme-appearance' })` from `applySettings` gives the **same underlying ref** as VitePress's internal one. Setting that ref's value updates everywhere — including the VPNav toggle UI.

5. **`useColorMode` is the right abstraction** for 3-state. Sub-API of VueUse: `useColorMode({ storageKey: 'vitepress-theme-appearance' })` returns `Ref<'dark' | 'light' | 'auto'>` directly. This is the cleanest API for our use case. Internally it powers `useDark`.

## Recommended impl pattern for T03 (`applySettings`)

```typescript
// applySettings.ts (sketch)
import { useColorMode } from "@vueuse/core";
import { watch } from "vue";
import { useSettings } from "./useSettings";

let _mode: ReturnType<typeof useColorMode> | null = null;

export function applySettings() {
  if (typeof document === "undefined") return;
  const settings = useSettings();

  // Share the same storage as VitePress.
  if (!_mode) {
    _mode = useColorMode({
      storageKey: "vitepress-theme-appearance",
      emitAuto: true, // ensure 'auto' is a real stored value (not coerced to system mode)
    });
  }

  // Push settings.theme → VitePress storage.
  watch(
    () => settings.value.theme,
    (t) => {
      _mode!.value = t; // 'light' | 'dark' | 'auto'
    },
    { immediate: true },
  );

  // Reader CSS vars (unchanged).
  watch(
    () => settings.value,
    (s) => {
      const root = document.documentElement.style;
      root.setProperty("--reader-font-size", `${s.fontSize}px`);
      root.setProperty("--reader-line-height", String(s.lineHeight));
      root.setProperty(
        "--reader-font-family",
        s.fontFamily === "serif"
          ? `'Noto Serif', Georgia, serif`
          : `'Be Vietnam Pro', system-ui, sans-serif`,
      );
    },
    { immediate: true, deep: true },
  );
}
```

### Two-way sync question

VPNav has a built-in theme toggle (`VPSwitchAppearance`) that toggles its own ref → writes the same storage key. If user clicks **VPNav toggle**, our `settings.theme` would go stale. Should we two-way sync?

**Decision**: Yes — watch `_mode` and write back to `settings.theme`:

```typescript
watch(_mode, (m) => {
  if (settings.value.theme !== m) settings.value.theme = m as Theme;
});
```

This keeps SettingsDrawer's picker and VPNav toggle in lockstep.

### Migration

`useSettings` already does silent floor migration for `fontSize`/`lineHeight`. Add:

```typescript
if (s.theme === "sepia") s.theme = "auto";
// TypeScript: cast through unknown since old type literal is gone
```

## Open questions resolved

- Q: Will VitePress's inline init script (the one that pre-applies `.dark` before render) conflict?
  A: No — that script reads the same storage key. Setting `'auto'` makes it fall through to OS detection at boot.

- Q: Does `appearance: true` show a theme toggle in VPNav?
  A: Yes (default theme renders `VPSwitchAppearance`). Owner accepts this (covered in spec Notes).

- Q: SSR safety?
  A: `applySettings` already guards `typeof document === 'undefined'`. `useColorMode` is browser-only; guarded.

- Q: `darkModeSwitchLabel` in `themeConfig` (currently `"Giao diện"`) — still useful?
  A: Yes, labels VPNav toggle for screen readers. Keep.
