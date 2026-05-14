# Testing

Tests are scoped to **composables only** — pure logic with storage/CSS-var side effects. No E2E, no component rendering tests (visual is verified by `bun run dev` manually).

## Stack

- **Vitest** (latest)
- **happy-dom** (lightweight DOM for `localStorage`, `document`, `navigator`)
- **@vue/test-utils** (if mounting needed; rare)

Config: `vitest.config.ts` at repo root (if absent, Vitest picks up `vite.config.ts` from `.vitepress/`).

## When to write a test

| Composable                     | Test? | Reason                                                                    |
| ------------------------------ | ----- | ------------------------------------------------------------------------- |
| `useSettings.ts`               | ✅    | `localStorage` schema + `applySettings` DOM apply                         |
| `useBookmarks.ts`              | ✅    | add/remove/has logic + FIFO cap + positions update                        |
| `useTts.ts`                    | ⚠️    | Wraps `useSpeechSynthesis` (VueUse-tested). Skip unless adding own logic. |
| New custom composable          | ✅    | If it has branches / mutations / cleanup logic.                           |
| Pure utility (slug, format, …) | ✅    | Simple, fast, high value.                                                 |

## File layout

```
tests/
├── useSettings.test.ts
├── useBookmarks.test.ts
└── utils/slug.test.ts          # if utilities extracted
```

Filename: `<composable-name>.test.ts`. One test file per composable.

## Conventions

- Always reset `localStorage` between tests: `beforeEach(() => localStorage.clear())`.
- For module-scoped singletons (e.g. `_settings` in `useSettings.ts`): use `vi.resetModules()` to reset between tests, then re-import.
- Use `flushPromises` / `nextTick` after writing reactive state when asserting DOM changes.
- Mock `navigator.language` if testing locale detection: `Object.defineProperty(navigator, 'language', { value: 'en-US', configurable: true })`.

## Example skeleton

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { nextTick } from "vue";

describe("useSettings", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it("persists changes to localStorage", async () => {
    const { useSettings } = await import("../.vitepress/theme/composables/useSettings");
    const settings = useSettings();
    settings.value.theme = "dark";
    await nextTick();
    const stored = JSON.parse(localStorage.getItem("kinh:settings")!);
    expect(stored.theme).toBe("dark");
  });
});
```

## Commands

```bash
bun run test                # run all once
bun run test:watch          # watch mode
bun run test tests/<file>.test.ts   # targeted run (REQUIRED for verifying a single change)
```

Targeted test must pass before marking related spec task done.

## What NOT to test

- VitePress internals (config parse, sidebar build, etc.) — out of scope.
- Vue / VueUse APIs — upstream tested.
- DaisyUI / Tailwind class output — visual, manual.
- Markdown rendering — VitePress responsibility.
- PWA service worker — `vite-plugin-pwa` responsibility.

## Failure protocol

Test failed after your change → do NOT assume your code broke it.

1. Reproduce same test on `main` (stash your changes).
2. Fails on `main` too → pre-existing flake. Document + move on.
3. Only fix regressions you caused.
