<script setup lang="ts">
import { computed } from "vue";
import { withBase } from "vitepress";
import { useI18n } from "vue-i18n";
import { kinhCatalog } from "../../data/kinh";
import { useSettings } from "../composables/useSettings";

const settings = useSettings();
const { t, te } = useI18n();

// Quick font-size adjustment (same bounds as reader bottom bar).
const MIN_FONT_SIZE = 16;
const MAX_FONT_SIZE = 60;
const FONT_SIZE_STEP = 2;
const canDecreaseFont = computed(() => settings.value.fontSize > MIN_FONT_SIZE);
const canIncreaseFont = computed(() => settings.value.fontSize < MAX_FONT_SIZE);
function decreaseFont() {
  if (!canDecreaseFont.value) return;
  settings.value.fontSize = Math.max(MIN_FONT_SIZE, settings.value.fontSize - FONT_SIZE_STEP);
}
function increaseFont() {
  if (!canIncreaseFont.value) return;
  settings.value.fontSize = Math.min(MAX_FONT_SIZE, settings.value.fontSize + FONT_SIZE_STEP);
}

const isList = computed(() => settings.value.gridColumns === 1);
const gridClass = computed(() => {
  // 1 col = list (single column, horizontal card layout).
  // 2 col = grid.
  return isList.value ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2";
});

function kinhTitle(slug: string, fallback: string): string {
  const key = `kinh.${slug}.title`;
  return te(key) ? t(key) : fallback;
}

// Shared classes for grouped picker buttons (rounded-on-edges only).
const pickerBase =
  "inline-flex items-center justify-center min-h-11 min-w-11 px-3 text-sm font-medium border border-[--vp-c-divider] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--vp-c-brand-1] transition-colors -ml-px first:ml-0 first:rounded-l-md last:rounded-r-md";
const pickerActive = "bg-[--vp-c-brand-1] text-white border-[--vp-c-brand-1] z-10";
const pickerInactive = "bg-[--vp-c-bg-soft] text-[--vp-c-text-1] hover:bg-[--vp-c-bg-mute]";
</script>

<template>
  <div class="min-h-screen bg-[--vp-c-bg-soft]">
    <!-- Header bar (sticky) -->
    <header
      class="sticky top-0 z-30 bg-[--vp-c-bg-soft]/95 backdrop-blur border-b-2 border-[--vp-c-divider]"
    >
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <h1 class="text-xl sm:text-2xl font-bold text-[--vp-c-text-1]">
          {{ t("home.heading") }}
        </h1>
        <div class="flex items-center gap-3">
          <div class="flex" role="group" aria-label="Font size">
            <button
              type="button"
              :class="[pickerBase, pickerInactive]"
              :disabled="!canDecreaseFont"
              :aria-label="t('reader.bar.fontDecrease')"
              class="disabled:opacity-40 disabled:cursor-not-allowed"
              @click="decreaseFont"
            >
              <span aria-hidden="true" class="text-base font-bold">A−</span>
            </button>
            <button
              type="button"
              :class="[pickerBase, pickerInactive]"
              :disabled="!canIncreaseFont"
              :aria-label="t('reader.bar.fontIncrease')"
              class="disabled:opacity-40 disabled:cursor-not-allowed"
              @click="increaseFont"
            >
              <span aria-hidden="true" class="text-lg font-bold">A+</span>
            </button>
          </div>
          <div class="flex" role="group" :aria-label="t('home.columns')">
            <button
              v-for="n in [1, 2] as const"
              :key="n"
              type="button"
              :class="[pickerBase, settings.gridColumns === n ? pickerActive : pickerInactive]"
              :aria-label="t('home.columns') + ': ' + n"
              :aria-pressed="settings.gridColumns === n"
              @click="settings.gridColumns = n"
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
                aria-hidden="true"
              >
                <rect v-if="n === 1" x="4" y="4" width="16" height="16" rx="1" />
                <template v-else>
                  <rect x="4" y="4" width="7" height="16" rx="1" />
                  <rect x="13" y="4" width="7" height="16" rx="1" />
                </template>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 py-6">
      <!-- Grid -->
      <div class="grid gap-6" :class="gridClass">
        <a
          v-for="k in kinhCatalog"
          :key="k.slug"
          :href="withBase(`/${k.slug}/`)"
          class="group rounded-2xl overflow-hidden bg-[--vp-c-bg] border-2 border-[--vp-c-divider] shadow-md hover:shadow-xl hover:-translate-y-0.5 hover:border-[--vp-c-brand-1] focus-visible:border-[--vp-c-brand-1] focus-visible:outline-2 focus-visible:outline-[--vp-c-brand-1] transition-all"
          :class="isList ? 'flex flex-row items-stretch' : 'flex flex-col'"
        >
          <div
            class="relative overflow-hidden bg-[--vp-c-bg-soft]"
            :class="isList ? 'basis-1/3 shrink-0' : 'w-full'"
            style="aspect-ratio: 3 / 4"
          >
            <img
              :src="withBase(k.image)"
              :alt="kinhTitle(k.slug, k.title)"
              class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div
            class="flex items-center text-center bg-[--vp-c-bg] flex-1"
            :class="isList ? 'justify-start text-left px-5 py-4' : 'justify-center px-5 py-8'"
          >
            <h2
              class="font-bold text-[--vp-c-text-1] my-2 text-balance"
              style="
                font-size: calc(var(--reader-font-size) * 1.15);
                line-height: var(--reader-line-height);
              "
            >
              {{ kinhTitle(k.slug, k.title) }}
            </h2>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>
