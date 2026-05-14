import { ref, computed, onMounted, onBeforeUnmount, watch, type Ref } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { useSettings } from "./useSettings";

const INTERVAL_SECONDS = 25 * 60; // 25 minutes
const TICK_MS = 1000;

// Singleton state — shared across components.
const elapsed = ref(0); // seconds accumulated while conditions met
const due = ref(false); // true when elapsed reached INTERVAL_SECONDS
const mutedUntil = useLocalStorage<string | null>("kinh:eyeRestMutedUntil", null);

let tickHandle: ReturnType<typeof setInterval> | null = null;
let visibilityHandler: (() => void) | null = null;
let visible = ref(true);
let consumers = 0;

function isMuted(): boolean {
  const v = mutedUntil.value;
  if (!v) return false;
  const until = new Date(v).getTime();
  if (Number.isNaN(until) || until <= Date.now()) {
    // Expired — clear silently.
    mutedUntil.value = null;
    return false;
  }
  return true;
}

/**
 * Eye-rest reminder (spec 011).
 *
 * Counter ticks only while: enabled in settings + isReader + tab visible + not muted.
 * Fires `due = true` at 25 min mark. Toast component watches `due` and reacts.
 *
 * Call sites pass `isReader` ref so the composable knows when to count.
 */
export function useEyeRestTimer(isReader: Ref<boolean>) {
  const settings = useSettings();

  const enabled = computed(() => settings.value.eyeRestEnabled);
  const muted = computed(() => isMuted());

  const shouldCount = computed(
    () => enabled.value && isReader.value && visible.value && !muted.value && !due.value,
  );

  function resetCounter() {
    elapsed.value = 0;
    due.value = false;
  }

  function muteToday() {
    // Mute until next local midnight.
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    mutedUntil.value = midnight.toISOString();
    resetCounter();
  }

  onMounted(() => {
    if (typeof window === "undefined") return;
    consumers++;
    if (consumers === 1) {
      visible.value = document.visibilityState === "visible";
      visibilityHandler = () => {
        visible.value = document.visibilityState === "visible";
      };
      document.addEventListener("visibilitychange", visibilityHandler);

      tickHandle = setInterval(() => {
        if (!shouldCount.value) return;
        elapsed.value++;
        if (elapsed.value >= INTERVAL_SECONDS) {
          due.value = true;
        }
      }, TICK_MS);
    }
  });

  onBeforeUnmount(() => {
    if (typeof window === "undefined") return;
    consumers = Math.max(0, consumers - 1);
    if (consumers === 0) {
      if (tickHandle) clearInterval(tickHandle);
      tickHandle = null;
      if (visibilityHandler) document.removeEventListener("visibilitychange", visibilityHandler);
      visibilityHandler = null;
    }
  });

  // Reset counter when disabled or muted state changes (clean state on toggle).
  watch([enabled, muted], ([en, mu]) => {
    if (!en || mu) resetCounter();
  });

  return {
    elapsed,
    due,
    enabled,
    muted,
    resetCounter,
    muteToday,
  };
}
