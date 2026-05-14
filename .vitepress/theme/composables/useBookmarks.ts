import { useLocalStorage } from "@vueuse/core";
import { computed } from "vue";

export type Bookmark = {
  path: string; // route path
  anchor?: string; // #h2-id
  label: string;
  ts: number;
};

export type ReadingPosition = {
  path: string;
  scrollPct: number; // 0..1
  ts: number;
};

let _bookmarks: ReturnType<typeof useLocalStorage<Bookmark[]>> | null = null;
let _positions: ReturnType<typeof useLocalStorage<Record<string, ReadingPosition>>> | null = null;

export function useBookmarks() {
  if (!_bookmarks) {
    _bookmarks = useLocalStorage<Bookmark[]>("kinh:bookmarks", []);
  }
  const bookmarks = _bookmarks;

  function add(b: Omit<Bookmark, "ts">) {
    const exists = bookmarks.value.find((x) => x.path === b.path && x.anchor === b.anchor);
    if (exists) return;
    bookmarks.value = [{ ...b, ts: Date.now() }, ...bookmarks.value].slice(0, 100);
  }

  function remove(path: string, anchor?: string) {
    bookmarks.value = bookmarks.value.filter((x) => !(x.path === path && x.anchor === anchor));
  }

  function has(path: string, anchor?: string) {
    return computed(() => bookmarks.value.some((x) => x.path === path && x.anchor === anchor));
  }

  function removeAll() {
    bookmarks.value = [];
  }

  return { bookmarks, add, remove, has, removeAll };
}

export function useReadingPositions() {
  if (!_positions) {
    _positions = useLocalStorage<Record<string, ReadingPosition>>("kinh:positions", {});
  }
  return _positions;
}

export function clearAllPositions() {
  const positions = useReadingPositions();
  positions.value = {};
}
