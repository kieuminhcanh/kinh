# Spec: Recitation schedule (lịch tụng kinh) — Lite MVP

Status: done
Created: 2026-05-13
Slug: 013-recitation-schedule

## Why

Phật tử cao tuổi nhiều người có lịch tụng kinh đều đặn. Có công cụ ghi lịch + nhắc nhở phù hợp ngữ cảnh ứng dụng và tạo thói quen.

## What — Lite MVP

- User tạo schedule: chọn kinh (từ catalog) + giờ (HH:MM) + lặp `daily` | `weekly` (chọn weekday) | `once`.
- List schedule sort theo lần kế tiếp gần nhất.
- Tới giờ + app đang mở → in-app DaisyUI alert toast top-center, click "Mở kinh" → navigate tới kinh, "Đóng" → dismiss.
- "Lịch tụng kinh" entry-point trên Home (button cạnh Continue Reading) mở drawer.
- Drawer: list + form thêm + xoá per item.
- Storage: `kinh:schedules` versioned schema (`{ version: 1, items: Schedule[] }`).
- i18n vi + en.

## Out of scope

- Notifications API (clarify Q10 → No).
- Âm lịch (mùng 1, rằm) — clarify Q9 → out of MVP, parking lot.
- Sync calendar (Google/iCal).
- Edit existing schedule (chỉ create + delete cho MVP).
- Streak / gamification.

## Acceptance criteria

- [x] User tạo được ≥ 1 schedule entry (chọn kinh + giờ + repeat).
- [x] Schedule list trên drawer sort theo lần kế tiếp gần nhất (ascending).
- [x] Tới giờ + app đang mở (any page) → toast hiện, "Mở kinh" navigates to kinh, "Đóng" dismiss.
- [x] Once-mode item → fires 1 lần rồi auto-remove khỏi storage.
- [x] Storage key `kinh:schedules` shape `{ version: 1, items: Schedule[] }`.
- [x] Xoá schedule → biến mất khỏi list + storage.
- [x] Home button "Lịch tụng kinh" mở drawer.
- [x] i18n vi + en.
- [x] `arch.md` cập nhật storage key + versioning convention.

## Clarifications

Resolved 2026-05-13 (owner approved AI recommendations):

- Q9: Scope? → **Lite MVP** (daily/weekly/once, không âm lịch).
- Q10: Notifications API? → **No** (in-app toast only).
- Q11: Storage shape? → **Versioned**: `{ version: 1, items: Schedule[] }`.
- Q12: Where? → **Drawer mở từ Home** ("Lịch tụng kinh" button).

## Plan (inline)

Touch list:

1. `composables/useSchedules.ts` (new) — types + CRUD + nextOccurrence + active-check tick.
2. `components/ScheduleDrawer.vue` (new) — list + add form + delete.
3. `components/ScheduleToast.vue` (new) — DaisyUI alert top-center khi due; navigate hoặc dismiss.
4. `components/ScheduleButton.vue` (new) — Home entry button mounting the drawer.
5. `components/Home.vue` — wire button + drawer (small surgical add).
6. `Layout.vue` — mount `ScheduleToast` (global, all pages — composable handles "any page" trigger).
7. `locales/{vi,en}.json` — `schedule.*` keys.
8. `.ai/docs/arch.md` — document `kinh:schedules` shape + versioning note.

### Types

```ts
type Repeat = "daily" | "weekly" | "once";

type Schedule = {
  id: string; // crypto.randomUUID()
  kinhSlug: string; // from catalog
  time: string; // "HH:MM" 24h
  repeat: Repeat;
  weekday?: number; // 0-6 (Sunday=0), required if repeat='weekly'
  date?: string; // "YYYY-MM-DD", required if repeat='once'
  lastFiredAt?: string; // ISO timestamp — used to debounce within same minute
};

type SchedulesStore = {
  version: 1;
  items: Schedule[];
};
```

### `nextOccurrence(s: Schedule, now: Date): Date | null`

- `once` → return `new Date(`${date}T${time}`)` if >= now else null.
- `daily` → return today's time if >= now, else tomorrow's.
- `weekly` → next date matching weekday + time.

### Tick logic

`useSchedules.start()` runs `setInterval` 30s (cheap, no need for sub-minute precision). On each tick:

1. For each schedule: compute `nextOccurrence`.
2. If `now >= next AND (lastFiredAt unset OR lastFiredAt < next-1min)` → mark due → expose to toast.
3. `once` items: after fired, remove from store.
4. `daily`/`weekly`: update `lastFiredAt`, continue.

Storage delta:

- New key `kinh:schedules` = `{ version: 1, items: [] }`.

## Notes

- Versioning ready for future âm-lịch upgrade without migration code: bump to `version: 2` and add migration if `version === 1`.
- `crypto.randomUUID` SSR-guarded (only called from event handler client-side).
- Schedule creation form: simple `<select>` for kinh + `<input type="time">` + radio for repeat + conditional weekday `<select>` / date `<input>`.
- Sort comparator: `(a, b) => nextOccurrence(a).getTime() - nextOccurrence(b).getTime()`.
