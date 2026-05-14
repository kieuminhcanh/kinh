import { ref, onMounted, onBeforeUnmount } from "vue";

// Singleton state — shared across all components that call useFocusMode().
const active = ref(false);
let listenerCount = 0;
let escHandler: ((e: KeyboardEvent) => void) | null = null;

function enter() {
  active.value = true;
}

function exit() {
  active.value = false;
}

function toggle() {
  active.value = !active.value;
}

/**
 * Focus mode: hides VitePress chrome + reader chrome, leaves only sutra content.
 * Not persisted — every page load starts in normal mode.
 *
 * Mount once per consumer; ESC keydown listener is reference-counted so
 * the first mount adds the listener and the last unmount removes it.
 */
export function useFocusMode() {
  onMounted(() => {
    if (typeof window === "undefined") return;
    listenerCount++;
    if (listenerCount === 1) {
      escHandler = (e: KeyboardEvent) => {
        if (e.key === "Escape" && active.value) {
          e.preventDefault();
          exit();
        }
      };
      window.addEventListener("keydown", escHandler);
    }
  });

  onBeforeUnmount(() => {
    if (typeof window === "undefined") return;
    listenerCount = Math.max(0, listenerCount - 1);
    if (listenerCount === 0 && escHandler) {
      window.removeEventListener("keydown", escHandler);
      escHandler = null;
    }
  });

  return { active, enter, exit, toggle };
}
