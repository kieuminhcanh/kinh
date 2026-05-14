# Tasks: "Đọc tiếp" card on Home

Spec → `./spec.md`

## Format

- `Tnn [P] (Pn) <file> — task → deps: -` (P = parallel-safe within feature)
- IDs sequential. Deps reference IDs.
- One file per task when possible.

## Tasks

- [x] T01 [P] (P1) `locales/vi.json` + `locales/en.json` — add `continueReading.label` + `continueReading.dismiss` keys (both locales). → deps: -
- [x] T02 (P1) `.vitepress/theme/components/ContinueReadingCard.vue` (NEW) — read `useReadingPositions`, filter `0.05 ≤ scrollPct < 0.98`, sort `ts` desc, take first. Render full-card `<a :href="withBase(path)">` with title kinh + chapter + `%`. `✕` dismiss button sets `sessionStorage['kinh:continue:dismissed'] = '1'` + flips local `dismissed` ref. SSR-guard `sessionStorage`. Card hidden if no entry OR `dismissed === true`. Touch targets ≥ 44×44, full card ≥ 80px tall. → deps: T01
- [x] T03 (P1) `.vitepress/theme/components/Home.vue` — import + mount `<ContinueReadingCard />` directly above the header bar `<div class="flex items-center justify-between ...">`. → deps: T02

## Checkpoints

- After T01 → `bun run typecheck` green (locale keys exist before T02 references them).
- After T02 → manual: seed `localStorage.kinh:positions` with one entry `{ path: '/kinh-dia-tang/01-pham-1/', scrollPct: 0.42, ts: Date.now() }`, reload Home → card hiện, title + `42%` đúng. Bấm `✕` → ẩn. Reload tab → ẩn (sessionStorage). Mở tab mới → hiện lại.
- After T03 → card xuất hiện đúng vị trí (trên header bar), bấm card → navigate + auto-scroll restore (đã có sẵn `ReaderTools.restoreScroll()`).
- Pre-done analyze gate (3 files edited = boundary) → re-read `spec.md` `## Acceptance`, tick each.

## Done log

- ~~T01~~ locales vi/en: + `continueReading.*` namespace — 2026-05-13
- ~~T02~~ ContinueReadingCard.vue (new): reactive card, sessionStorage dismiss, SSR-guard — 2026-05-13
- ~~T03~~ Home.vue: mount card above header bar — 2026-05-13
