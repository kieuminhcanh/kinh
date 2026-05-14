<script setup lang="ts">
import { computed, ref } from "vue";
import { withBase } from "vitepress";
import { useI18n } from "vue-i18n";
import { useReadingPositions, type ReadingPosition } from "../composables/useBookmarks";
import { findKinhBySlug } from "../../data/kinh";

const DISMISS_KEY = "kinh:continue:dismissed";

const { t } = useI18n();
const positions = useReadingPositions();

// Init dismiss flag from sessionStorage (SSR-guard).
const dismissed = ref<boolean>(
  typeof window !== "undefined" && window.sessionStorage.getItem(DISMISS_KEY) === "1",
);

// Most recent position passing threshold.
const entry = computed<ReadingPosition | undefined>(() => {
  if (dismissed.value) return undefined;
  return Object.values(positions.value)
    .filter((p) => p.scrollPct >= 0.05 && p.scrollPct < 0.98)
    .sort((a, b) => b.ts - a.ts)[0];
});

function slugFromPath(path: string): string {
  const parts = path.split("/").filter(Boolean);
  return parts[0] ?? "";
}

function chapterFromPath(path: string): string {
  const parts = path.split("/").filter(Boolean);
  if (parts.length < 2) return "";
  const last = parts[parts.length - 1]!.replace(/\.html$/, "");
  return last.replace(/-/g, " ");
}

function kinhTitle(path: string): string {
  const slug = slugFromPath(path);
  return findKinhBySlug(slug)?.title ?? slug;
}

function pct(scrollPct: number): string {
  return t("history.percent", { n: Math.round(scrollPct * 100) });
}

function dismiss() {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(DISMISS_KEY, "1");
  }
  dismissed.value = true;
}
</script>

<template>
  <a
    v-if="entry"
    :href="withBase(entry.path)"
    class="relative block bg-primary text-primary-content rounded-xl shadow-md hover:shadow-xl transition-shadow mb-6 p-4 sm:p-5 min-h-20 print:hidden"
  >
    <div class="flex flex-col gap-1 pr-12">
      <span class="text-sm opacity-80 font-medium">{{ t("continueReading.label") }}</span>
      <span class="text-lg sm:text-xl font-bold leading-tight">
        {{ kinhTitle(entry.path) }}
      </span>
      <span class="text-sm sm:text-base opacity-90">
        {{ chapterFromPath(entry.path) }} · {{ pct(entry.scrollPct) }}
      </span>
    </div>
    <button
      type="button"
      class="absolute top-2 right-2 btn btn-ghost btn-sm min-h-11 min-w-11 text-primary-content hover:bg-primary-content/20"
      :aria-label="t('continueReading.dismiss')"
      @click.prevent.stop="dismiss"
    >
      ✕
    </button>
  </a>
</template>
