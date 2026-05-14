import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { useLocalStorage } from "@vueuse/core";

export type Repeat = "daily" | "weekly" | "once";

export type Schedule = {
  id: string;
  kinhSlug: string;
  time: string; // "HH:MM" 24h
  repeat: Repeat;
  weekday?: number; // 0-6 (Sunday=0), required when repeat='weekly'
  date?: string; // "YYYY-MM-DD", required when repeat='once'
  lastFiredAt?: string; // ISO timestamp — debounces within same minute
};

export type SchedulesStore = {
  version: 1;
  items: Schedule[];
};

const DEFAULT_STORE: SchedulesStore = { version: 1, items: [] };

const store = useLocalStorage<SchedulesStore>("kinh:schedules", DEFAULT_STORE, {
  mergeDefaults: true,
});

const dueItem = ref<Schedule | null>(null);

let tickHandle: ReturnType<typeof setInterval> | null = null;
let consumers = 0;
const TICK_MS = 30_000; // 30s — sub-minute precision unneeded

function parseHHMM(t: string): { h: number; m: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return { h, m: min };
}

/**
 * Compute the next occurrence of a schedule at or after `now`.
 * Returns null when the schedule has no future occurrence (e.g. `once` in the past).
 */
export function nextOccurrence(s: Schedule, now: Date = new Date()): Date | null {
  const time = parseHHMM(s.time);
  if (!time) return null;

  if (s.repeat === "once") {
    if (!s.date) return null;
    const [y, mo, d] = s.date.split("-").map(Number);
    if (!y || !mo || !d) return null;
    const dt = new Date(y, mo - 1, d, time.h, time.m, 0, 0);
    return dt.getTime() >= now.getTime() ? dt : null;
  }

  if (s.repeat === "daily") {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), time.h, time.m, 0, 0);
    if (today.getTime() >= now.getTime()) return today;
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  // weekly
  if (s.weekday == null) return null;
  for (let offset = 0; offset < 8; offset++) {
    const candidate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + offset,
      time.h,
      time.m,
      0,
      0,
    );
    if (candidate.getDay() === s.weekday && candidate.getTime() >= now.getTime()) {
      return candidate;
    }
  }
  return null;
}

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useSchedules() {
  const items = computed(() => store.value.items);

  const sorted = computed(() => {
    const now = new Date();
    return [...items.value]
      .map((s) => ({ s, next: nextOccurrence(s, now) }))
      .sort((a, b) => {
        if (!a.next && !b.next) return 0;
        if (!a.next) return 1;
        if (!b.next) return -1;
        return a.next.getTime() - b.next.getTime();
      })
      .map((entry) => entry.s);
  });

  function add(input: Omit<Schedule, "id">): Schedule {
    const item: Schedule = { ...input, id: generateId() };
    store.value = { ...store.value, items: [...store.value.items, item] };
    return item;
  }

  function remove(id: string) {
    store.value = {
      ...store.value,
      items: store.value.items.filter((it) => it.id !== id),
    };
  }

  function dismissDue() {
    dueItem.value = null;
  }

  function check() {
    const now = new Date();
    const updated: Schedule[] = [];
    let foundDue: Schedule | null = dueItem.value;

    for (const s of store.value.items) {
      const next = nextOccurrence(s, new Date(now.getTime() - 60_000)); // look back 1 min
      if (!next) {
        // `once` past or invalid — drop if `once`, else keep
        if (s.repeat === "once") continue;
        updated.push(s);
        continue;
      }

      // Fire if we've crossed the next-occurrence time and didn't already fire for this slot.
      const lastFired = s.lastFiredAt ? new Date(s.lastFiredAt).getTime() : 0;
      const slotStart = next.getTime();

      if (now.getTime() >= slotStart && lastFired < slotStart) {
        if (!foundDue) foundDue = s;
        if (s.repeat === "once") {
          // Once-mode: fire and remove
          continue;
        }
        updated.push({ ...s, lastFiredAt: new Date().toISOString() });
      } else {
        updated.push(s);
      }
    }

    if (
      updated.length !== store.value.items.length ||
      updated.some((u, i) => u.lastFiredAt !== store.value.items[i]?.lastFiredAt)
    ) {
      store.value = { ...store.value, items: updated };
    }

    if (foundDue && !dueItem.value) dueItem.value = foundDue;
  }

  onMounted(() => {
    if (typeof window === "undefined") return;
    consumers++;
    if (consumers === 1) {
      check();
      tickHandle = setInterval(check, TICK_MS);
    }
  });

  onBeforeUnmount(() => {
    if (typeof window === "undefined") return;
    consumers = Math.max(0, consumers - 1);
    if (consumers === 0 && tickHandle) {
      clearInterval(tickHandle);
      tickHandle = null;
    }
  });

  return {
    items,
    sorted,
    dueItem,
    add,
    remove,
    dismissDue,
    nextOccurrence,
  };
}
