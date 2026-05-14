import { onBeforeUnmount, ref } from "vue";
import { useSettings, type AutoScrollSpeed } from "./useSettings";

const SPEED_MAP: Record<AutoScrollSpeed, number> = {
  slow: 0.5,
  normal: 1,
  fast: 2,
};

// Resume auto-scroll quickly after the user lets go. Short debounce avoids
// fighting momentum scrolling / inertial touch flicks; long enough to feel
// intentional. User asked for "continue from current position" rather than
// "wait then catch up", which is already how this works (scrollBy uses
// window.scrollY at each tick) — just trim the pause so it feels responsive.
const RESUME_DELAY_MS = 1500;

// Keys that count as a manual scroll intent.
const PAUSE_KEYS = new Set([
  "PageUp",
  "PageDown",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
  "Space",
  " ",
]);

/**
 * Auto-scroll the document at user-configured speed.
 * Pauses on user interaction (wheel / touch / nav keys) for 3s then resumes.
 * Auto-stops at end of page.
 *
 * Single-instance: call once per mounted reader root.
 */
export function useAutoScroll() {
  const settings = useSettings();
  const isActive = ref(false);

  let rafId = 0;
  let resumeTimer: ReturnType<typeof setTimeout> | null = null;
  let listenersAttached = false;

  function speedPx(): number {
    return SPEED_MAP[settings.value.autoScrollSpeed] ?? 1;
  }

  function tick() {
    if (!isActive.value) {
      rafId = 0;
      return;
    }
    const doc = document.documentElement;
    const atEnd = window.scrollY + window.innerHeight >= doc.scrollHeight - 2;
    if (atEnd) {
      stop();
      return;
    }
    window.scrollBy(0, speedPx());
    rafId = requestAnimationFrame(tick);
  }

  function startRaf() {
    if (rafId) return;
    rafId = requestAnimationFrame(tick);
  }

  function cancelRaf() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  function scheduleResume() {
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      resumeTimer = null;
      if (isActive.value) startRaf();
    }, RESUME_DELAY_MS);
  }

  function onUserScrollIntent() {
    if (!isActive.value) return;
    cancelRaf();
    scheduleResume();
  }

  function onWheel() {
    onUserScrollIntent();
  }
  function onTouchStart() {
    onUserScrollIntent();
  }
  function onKeyDown(e: KeyboardEvent) {
    if (PAUSE_KEYS.has(e.key) || PAUSE_KEYS.has(e.code)) {
      onUserScrollIntent();
    }
  }

  function attach() {
    if (listenersAttached || typeof window === "undefined") return;
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    listenersAttached = true;
  }

  function detach() {
    if (!listenersAttached || typeof window === "undefined") return;
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("keydown", onKeyDown);
    listenersAttached = false;
  }

  function start() {
    if (typeof window === "undefined" || isActive.value) return;
    isActive.value = true;
    attach();
    startRaf();
  }

  function stop() {
    if (!isActive.value && !rafId && !resumeTimer) return;
    isActive.value = false;
    cancelRaf();
    if (resumeTimer) {
      clearTimeout(resumeTimer);
      resumeTimer = null;
    }
    detach();
  }

  function toggle() {
    if (isActive.value) stop();
    else start();
  }

  onBeforeUnmount(stop);

  return { isActive, start, stop, toggle };
}
