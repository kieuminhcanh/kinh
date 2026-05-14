<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

const pct = ref(0); // 0..1
const pctInt = computed(() => Math.round(pct.value * 100));

let rafId = 0;

function update() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - doc.clientHeight;
  pct.value = max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0;
}

function onScroll() {
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    update();
    rafId = 0;
  });
}

let ro: ResizeObserver | null = null;

onMounted(() => {
  if (typeof window === "undefined") return;
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  // Re-calc when content reflows (e.g. fonts load, images mount).
  if ("ResizeObserver" in window) {
    ro = new ResizeObserver(() => onScroll());
    ro.observe(document.documentElement);
  }
});

onBeforeUnmount(() => {
  if (typeof window === "undefined") return;
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", onScroll);
  if (rafId) cancelAnimationFrame(rafId);
  if (ro) ro.disconnect();
});
</script>

<template>
  <div
    class="fixed top-0 left-0 right-0 z-30 h-1 bg-base-300/50 pointer-events-none print:hidden"
    role="progressbar"
    :aria-label="t('reader.progress')"
    :aria-valuenow="pctInt"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <div
      class="h-full bg-primary"
      :class="reduceMotion ? '' : 'transition-[width] duration-150 ease-out'"
      :style="{ width: `${pctInt}%` }"
    />
    <span
      v-if="pct > 0.05"
      class="absolute top-1.5 right-2 text-xs font-medium text-base-content/80 bg-base-100/80 px-1.5 py-0.5 rounded shadow-sm"
      aria-hidden="true"
    >
      {{ pctInt }}%
    </span>
  </div>
</template>
