<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import SettingsDrawer from "./SettingsDrawer.vue";
import { useSettings } from "../composables/useSettings";

const props = defineProps<{
  isPlaying: boolean;
  isPaused: boolean;
  ttsSupported: boolean;
  autoScrollActive: boolean;
}>();

const emit = defineEmits<{
  "toggle-tts": [];
  "stop-tts": [];
  "toggle-auto-scroll": [];
}>();

const { t } = useI18n();
const settings = useSettings();

// TTS state derived from isPlaying/isPaused.
const ttsActive = computed(() => props.isPlaying || props.isPaused);
const ttsButtonLabel = computed(() => {
  if (props.isPlaying) return t("reader.bar.ttsPause");
  if (props.isPaused) return t("reader.bar.ttsResume");
  return t("reader.bar.tts");
});
const ttsButtonAria = computed(() => {
  if (props.isPlaying) return t("reader.pause");
  if (props.isPaused) return t("reader.resume");
  return t("reader.play");
});

// Quick font-size adjustment bounds (kept in sync with spec 003 a11y baseline).
const MIN_FONT_SIZE = 16;
const MAX_FONT_SIZE = 80;
const FONT_SIZE_STEP = 2;

const canDecrease = computed(() => settings.value.fontSize > MIN_FONT_SIZE);
const canIncrease = computed(() => settings.value.fontSize < MAX_FONT_SIZE);

function decreaseFont() {
  if (!canDecrease.value) return;
  settings.value.fontSize = Math.max(MIN_FONT_SIZE, settings.value.fontSize - FONT_SIZE_STEP);
}
function increaseFont() {
  if (!canIncrease.value) return;
  settings.value.fontSize = Math.min(MAX_FONT_SIZE, settings.value.fontSize + FONT_SIZE_STEP);
}

const settingsRef = ref<InstanceType<typeof SettingsDrawer> | null>(null);

function openSettings() {
  settingsRef.value?.open();
}
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-50 bg-[--vp-c-bg]/95 backdrop-blur-md border-t-2 border-[--vp-c-divider] shadow-[0_-4px_16px_rgba(0,0,0,0.12)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.4)] print:hidden"
    style="padding-bottom: env(safe-area-inset-bottom)"
    :aria-label="t('reader.bar.settings')"
  >
    <div class="flex items-stretch justify-around max-w-3xl mx-auto">
      <!-- Font decrease -->
      <button
        class="flex-1 min-h-14 min-w-16 flex flex-col items-center justify-center gap-1 py-2 text-[--vp-c-text-1] hover:bg-[--vp-c-bg-soft] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[--vp-c-brand-1] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        :disabled="!canDecrease"
        :aria-disabled="!canDecrease"
        :aria-label="t('reader.bar.fontDecrease')"
        @click="decreaseFont"
      >
        <span class="font-bold leading-none text-2xl" aria-hidden="true">A−</span>
      </button>

      <!-- Font increase -->
      <button
        class="flex-1 min-h-14 min-w-16 flex flex-col items-center justify-center gap-1 py-2 text-[--vp-c-text-1] hover:bg-[--vp-c-bg-soft] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[--vp-c-brand-1] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        :disabled="!canIncrease"
        :aria-disabled="!canIncrease"
        :aria-label="t('reader.bar.fontIncrease')"
        @click="increaseFont"
      >
        <span class="font-bold leading-none text-2xl" aria-hidden="true">A+</span>
      </button>

      <!-- Auto-scroll toggle -->
      <button
        class="flex-1 min-h-14 min-w-16 flex flex-col items-center justify-center gap-1 py-2 text-[--vp-c-text-1] hover:bg-[--vp-c-bg-soft] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[--vp-c-brand-1] transition-colors"
        :class="autoScrollActive ? '!text-[--vp-c-brand-1]' : ''"
        :aria-label="autoScrollActive ? t('reader.autoScroll.stop') : t('reader.autoScroll.start')"
        :aria-pressed="autoScrollActive"
        @click="emit('toggle-auto-scroll')"
      >
        <!-- Pause icon when active -->
        <svg
          v-if="autoScrollActive"
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <rect x="6" y="5" width="4" height="14" />
          <rect x="14" y="5" width="4" height="14" />
        </svg>
        <!-- Down-arrow icon when idle -->
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 5v14" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
      </button>

      <!-- TTS (3-state: idle Phát / playing Tạm dừng / paused Tiếp tục) -->
      <button
        v-if="ttsSupported"
        class="flex-1 min-h-14 min-w-16 flex flex-col items-center justify-center gap-1 py-2 text-[--vp-c-text-1] hover:bg-[--vp-c-bg-soft] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[--vp-c-brand-1] transition-colors"
        :class="isPlaying ? '!text-[--vp-c-brand-1]' : ''"
        :aria-label="ttsButtonAria"
        :aria-pressed="isPlaying"
        @click="emit('toggle-tts')"
      >
        <!-- Pause icon when playing -->
        <svg
          v-if="isPlaying"
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <rect x="6" y="5" width="4" height="14" />
          <rect x="14" y="5" width="4" height="14" />
        </svg>
        <!-- Play icon for idle + paused (resume) -->
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      </button>

      <!-- Stop (only visible while TTS active) -->
      <button
        v-if="ttsSupported && ttsActive"
        class="flex-1 min-h-14 min-w-16 flex flex-col items-center justify-center gap-1 py-2 text-red-600 dark:text-red-400 hover:bg-[--vp-c-bg-soft] focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600 transition-colors"
        :aria-label="t('reader.stop')"
        @click="emit('stop-tts')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <rect x="6" y="6" width="12" height="12" />
        </svg>
      </button>

      <!-- Settings -->
      <button
        class="flex-1 min-h-14 min-w-16 flex flex-col items-center justify-center gap-1 py-2 text-[--vp-c-text-1] hover:bg-[--vp-c-bg-soft] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[--vp-c-brand-1] transition-colors"
        :aria-label="t('reader.settings')"
        @click="openSettings"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
          />
        </svg>
      </button>
    </div>
  </nav>

  <SettingsDrawer ref="settingsRef" :show-trigger="false" />
</template>
