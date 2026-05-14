<script setup lang="ts">
import { computed } from "vue";
import { withBase } from "vitepress";
import { useI18n } from "vue-i18n";
import { kinhCatalog } from "../../data/kinh";
import { useSettings } from "../composables/useSettings";
import HistoryButton from "./HistoryButton.vue";
import ScheduleButton from "./ScheduleButton.vue";
import ContinueReadingCard from "./ContinueReadingCard.vue";

const settings = useSettings();
const { t, te } = useI18n();

const gridClass = computed(() => {
  switch (settings.value.gridColumns) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-1 sm:grid-cols-2";
    case 3:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  }
});

function kinhTitle(slug: string, fallback: string): string {
  const key = `kinh.${slug}.title`;
  return te(key) ? t(key) : fallback;
}

function kinhDesc(slug: string, fallback?: string): string {
  const key = `kinh.${slug}.description`;
  const v = te(key) ? t(key) : (fallback ?? "");
  return v;
}

// Trigger VitePress local search programmatically.
// Primary path: click the (hidden) default trigger so VitePress opens its overlay.
// Fallback: dispatch Cmd/Ctrl+K keyboard shortcut.
function openSearch() {
  if (typeof window === "undefined") return;
  const btn = document.querySelector<HTMLButtonElement>(".VPNavBarSearch button");
  if (btn) {
    btn.click();
    return;
  }
  const isMac = navigator.platform.toLowerCase().includes("mac");
  const event = new KeyboardEvent("keydown", {
    key: "k",
    code: "KeyK",
    metaKey: isMac,
    ctrlKey: !isMac,
    bubbles: true,
  });
  document.dispatchEvent(event);
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Continue reading card (hidden when no in-progress entry or dismissed this session) -->
    <ContinueReadingCard />
    <!-- Header bar -->
    <div class="flex items-center justify-between gap-3 mb-6 flex-wrap">
      <h1 class="text-2xl sm:text-3xl font-bold">{{ t("home.heading") }}</h1>
      <div class="flex items-center gap-2">
        <button
          class="btn btn-sm min-h-11 gap-2"
          :aria-label="t('home.search')"
          @click="openSearch"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>{{ t("home.search") }}</span>
        </button>
        <HistoryButton />
        <ScheduleButton />
        <div class="join" role="group" :aria-label="t('home.columns')">
          <button
            v-for="n in [1, 2, 3] as const"
            :key="n"
            class="btn btn-sm join-item"
            :class="settings.gridColumns === n ? 'btn-primary' : 'btn-ghost'"
            :aria-label="`${n}`"
            @click="settings.gridColumns = n"
          >
            {{ n }}
          </button>
        </div>
      </div>
    </div>

    <!-- Grid -->
    <div class="grid gap-6" :class="gridClass">
      <a
        v-for="k in kinhCatalog"
        :key="k.slug"
        :href="withBase(`/${k.slug}/`)"
        class="card bg-base-200 shadow-md hover:shadow-xl transition-shadow overflow-hidden"
      >
        <figure class="aspect-3/4 overflow-hidden">
          <img
            :src="k.image"
            :alt="kinhTitle(k.slug, k.title)"
            class="w-full h-full object-cover"
            loading="lazy"
          />
        </figure>
        <div class="card-body items-center text-center p-4">
          <h2 class="card-title text-base sm:text-lg lg:text-xl">
            {{ kinhTitle(k.slug, k.title) }}
          </h2>
          <p v-if="k.author" class="text-sm text-base-content/70">{{ k.author }}</p>
          <p v-if="kinhDesc(k.slug, k.description)" class="text-xs text-base-content/70">
            {{ kinhDesc(k.slug, k.description) }}
          </p>
        </div>
      </a>
    </div>
  </div>
</template>
