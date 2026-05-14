<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import SettingsDrawer from "./SettingsDrawer.vue";
import HistoryDrawer from "./HistoryDrawer.vue";
import { useSettings } from "../composables/useSettings";

const props = defineProps<{
  isBookmarked: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  ttsSupported: boolean;
  autoScrollActive: boolean;
  voiceSupported: boolean;
  voiceListening: boolean;
}>();

const emit = defineEmits<{
  "toggle-bookmark": [];
  "toggle-tts": [];
  "stop-tts": [];
  "toggle-auto-scroll": [];
  "toggle-focus": [];
  "toggle-voice": [];
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
const MAX_FONT_SIZE = 28;
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

const historyOpen = ref(false);
const settingsRef = ref<InstanceType<typeof SettingsDrawer> | null>(null);

function openSettings() {
  settingsRef.value?.open();
}
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-50 bg-base-100 border-t border-base-300 shadow-lg print:hidden"
    style="padding-bottom: env(safe-area-inset-bottom)"
    :aria-label="t('reader.bar.settings')"
  >
    <div class="flex items-stretch justify-around max-w-3xl mx-auto">
      <!-- Bookmark -->
      <button
        class="flex-1 min-h-14 min-w-16 flex flex-col items-center justify-center gap-1 py-2 hover:bg-base-200 transition-colors"
        :class="isBookmarked ? 'text-primary' : ''"
        :aria-label="isBookmarked ? t('reader.unbookmark') : t('reader.bookmark')"
        :aria-pressed="isBookmarked"
        @click="emit('toggle-bookmark')"
      >
        <svg
          v-if="isBookmarked"
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        <span class="text-xs sm:text-sm font-medium">{{ t("reader.bar.bookmark") }}</span>
      </button>

      <!-- History -->
      <button
        class="flex-1 min-h-14 min-w-16 flex flex-col items-center justify-center gap-1 py-2 hover:bg-base-200 transition-colors"
        :aria-label="t('history.open')"
        @click="historyOpen = true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 3v5h5" />
          <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
          <path d="M12 7v5l4 2" />
        </svg>
        <span class="text-xs sm:text-sm font-medium">{{ t("reader.bar.history") }}</span>
      </button>

      <!-- Font decrease -->
      <button
        class="flex-1 min-h-14 min-w-16 flex flex-col items-center justify-center gap-1 py-2 hover:bg-base-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        :disabled="!canDecrease"
        :aria-disabled="!canDecrease"
        :aria-label="t('reader.bar.fontDecrease')"
        @click="decreaseFont"
      >
        <span class="font-bold leading-none" aria-hidden="true">
          <span class="text-base">A</span><span class="text-lg">−</span>
        </span>
        <span class="text-xs sm:text-sm font-medium">{{ t("reader.bar.fontDecrease") }}</span>
      </button>

      <!-- Font increase -->
      <button
        class="flex-1 min-h-14 min-w-16 flex flex-col items-center justify-center gap-1 py-2 hover:bg-base-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        :disabled="!canIncrease"
        :aria-disabled="!canIncrease"
        :aria-label="t('reader.bar.fontIncrease')"
        @click="increaseFont"
      >
        <span class="font-bold leading-none" aria-hidden="true">
          <span class="text-lg">A</span><span class="text-lg">+</span>
        </span>
        <span class="text-xs sm:text-sm font-medium">{{ t("reader.bar.fontIncrease") }}</span>
      </button>

      <!-- Auto-scroll toggle -->
      <button
        class="flex-1 min-h-14 min-w-16 flex flex-col items-center justify-center gap-1 py-2 hover:bg-base-200 transition-colors"
        :class="autoScrollActive ? 'text-primary' : ''"
        :aria-label="autoScrollActive ? t('reader.autoScroll.stop') : t('reader.autoScroll.start')"
        :aria-pressed="autoScrollActive"
        @click="emit('toggle-auto-scroll')"
      >
        <!-- Pause icon when active -->
        <svg
          v-if="autoScrollActive"
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
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
          width="22"
          height="22"
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
        <span class="text-xs sm:text-sm font-medium">{{
          autoScrollActive ? t("reader.bar.autoScrollStop") : t("reader.bar.autoScroll")
        }}</span>
      </button>

      <!-- TTS (3-state: idle Phát / playing Tạm dừng / paused Tiếp tục) -->
      <button
        v-if="ttsSupported"
        class="flex-1 min-h-14 min-w-16 flex flex-col items-center justify-center gap-1 py-2 hover:bg-base-200 transition-colors"
        :class="isPlaying ? 'text-primary' : ''"
        :aria-label="ttsButtonAria"
        :aria-pressed="isPlaying"
        @click="emit('toggle-tts')"
      >
        <!-- Pause icon when playing -->
        <svg
          v-if="isPlaying"
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
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
          width="22"
          height="22"
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
        <span class="text-xs sm:text-sm font-medium">{{ ttsButtonLabel }}</span>
      </button>

      <!-- Stop (only visible while TTS active) -->
      <button
        v-if="ttsSupported && ttsActive"
        class="flex-1 min-h-14 min-w-16 flex flex-col items-center justify-center gap-1 py-2 hover:bg-base-200 transition-colors text-error"
        :aria-label="t('reader.stop')"
        @click="emit('stop-tts')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <rect x="6" y="6" width="12" height="12" />
        </svg>
        <span class="text-xs sm:text-sm font-medium">{{ t("reader.bar.ttsStop") }}</span>
      </button>

      <!-- Voice command toggle -->
      <button
        v-if="voiceSupported"
        class="flex-1 min-h-14 min-w-16 flex flex-col items-center justify-center gap-1 py-2 hover:bg-base-200 transition-colors"
        :class="voiceListening ? 'text-error animate-pulse' : ''"
        :aria-label="voiceListening ? t('voice.stop') : t('voice.start')"
        :aria-pressed="voiceListening"
        @click="emit('toggle-voice')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
        <span class="text-xs sm:text-sm font-medium">{{
          voiceListening ? t("voice.listening") : t("voice.button")
        }}</span>
      </button>

      <!-- Focus mode toggle -->
      <button
        class="flex-1 min-h-14 min-w-16 flex flex-col items-center justify-center gap-1 py-2 hover:bg-base-200 transition-colors"
        :aria-label="t('reader.bar.focus')"
        @click="emit('toggle-focus')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M3 7V5a2 2 0 0 1 2-2h2" />
          <path d="M17 3h2a2 2 0 0 1 2 2v2" />
          <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
          <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <span class="text-xs sm:text-sm font-medium">{{ t("reader.bar.focus") }}</span>
      </button>

      <!-- Settings -->
      <button
        class="flex-1 min-h-14 min-w-16 flex flex-col items-center justify-center gap-1 py-2 hover:bg-base-200 transition-colors"
        :aria-label="t('reader.settings')"
        @click="openSettings"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
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
        <span class="text-xs sm:text-sm font-medium">{{ t("reader.bar.settings") }}</span>
      </button>
    </div>
  </nav>

  <HistoryDrawer v-model:open="historyOpen" />
  <SettingsDrawer ref="settingsRef" :show-trigger="false" />
</template>
