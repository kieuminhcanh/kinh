<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  useSettings,
  type Theme,
  type Locale,
  type AutoScrollSpeed,
} from "../composables/useSettings";
import { useTts } from "../composables/useTts";

withDefaults(defineProps<{ showTrigger?: boolean }>(), { showTrigger: true });

const settings = useSettings();
const { t } = useI18n();
const open = ref(false);
const { voices, isSupported: ttsSupported } = useTts();

const themes: Theme[] = ["light", "sepia", "dark"];
const themeIcons: Record<Theme, string> = { light: "☀️", sepia: "📜", dark: "🌙" };
const locales: { value: Exclude<Locale, "">; label: string }[] = [
  { value: "vi", label: "Tiếng Việt" },
  { value: "en", label: "English" },
];
const autoScrollSpeeds: AutoScrollSpeed[] = ["slow", "normal", "fast"];

defineExpose({ open: () => (open.value = true) });
</script>

<template>
  <!-- Trigger -->
  <button
    v-if="showTrigger"
    class="btn btn-circle btn-ghost"
    :aria-label="t('reader.settings')"
    @click="open = true"
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
  </button>

  <!-- Drawer overlay -->
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-100 bg-black/40" @click="open = false" />
    <aside
      class="fixed top-0 right-0 z-101 h-full w-80 max-w-[90vw] bg-base-100 shadow-2xl transition-transform"
      :class="open ? 'translate-x-0' : 'translate-x-full'"
      role="dialog"
      :aria-label="t('settings.title')"
    >
      <div class="flex items-center justify-between p-4 border-b border-base-300">
        <h2 class="text-lg font-bold">{{ t("settings.title") }}</h2>
        <button
          class="btn btn-sm btn-circle btn-ghost"
          :aria-label="t('settings.close')"
          @click="open = false"
        >
          ✕
        </button>
      </div>

      <div class="p-4 space-y-6 overflow-y-auto h-[calc(100%-4rem)]">
        <!-- Language -->
        <section>
          <h3 class="font-semibold mb-2">{{ t("settings.language") }}</h3>
          <div class="join w-full">
            <button
              v-for="l in locales"
              :key="l.value"
              class="btn btn-sm join-item flex-1"
              :class="settings.locale === l.value ? 'btn-primary' : 'btn-ghost'"
              @click="settings.locale = l.value"
            >
              {{ l.label }}
            </button>
          </div>
        </section>

        <!-- Theme -->
        <section>
          <h3 class="font-semibold mb-2">{{ t("settings.theme.label") }}</h3>
          <div class="join w-full">
            <button
              v-for="th in themes"
              :key="th"
              class="btn btn-sm join-item flex-1"
              :class="settings.theme === th ? 'btn-primary' : 'btn-ghost'"
              @click="settings.theme = th"
            >
              <span class="mr-1">{{ themeIcons[th] }}</span
              >{{ t(`settings.theme.${th}`) }}
            </button>
          </div>
        </section>

        <!-- Font family -->
        <section>
          <h3 class="font-semibold mb-2">{{ t("settings.fontFamily.label") }}</h3>
          <div class="join w-full">
            <button
              class="btn btn-sm join-item flex-1"
              :class="settings.fontFamily === 'serif' ? 'btn-primary' : 'btn-ghost'"
              @click="settings.fontFamily = 'serif'"
            >
              {{ t("settings.fontFamily.serif") }}
            </button>
            <button
              class="btn btn-sm join-item flex-1"
              :class="settings.fontFamily === 'sans' ? 'btn-primary' : 'btn-ghost'"
              @click="settings.fontFamily = 'sans'"
            >
              {{ t("settings.fontFamily.sans") }}
            </button>
          </div>
        </section>

        <!-- Font size -->
        <section>
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-semibold">{{ t("settings.fontSize") }}</h3>
            <span class="text-sm text-base-content/70">{{ settings.fontSize }}px</span>
          </div>
          <input
            type="range"
            min="16"
            max="28"
            step="1"
            v-model.number="settings.fontSize"
            class="range range-primary range-sm"
          />
        </section>

        <!-- Line height -->
        <section>
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-semibold">{{ t("settings.lineHeight") }}</h3>
            <span class="text-sm text-base-content/70">{{ settings.lineHeight.toFixed(1) }}</span>
          </div>
          <input
            type="range"
            min="1.6"
            max="2.4"
            step="0.1"
            v-model.number="settings.lineHeight"
            class="range range-primary range-sm"
          />
        </section>

        <!-- Auto-scroll speed -->
        <section>
          <h3 class="font-semibold mb-2">{{ t("settings.autoScroll.label") }}</h3>
          <div class="join w-full">
            <button
              v-for="sp in autoScrollSpeeds"
              :key="sp"
              class="btn btn-sm join-item flex-1"
              :class="settings.autoScrollSpeed === sp ? 'btn-primary' : 'btn-ghost'"
              @click="settings.autoScrollSpeed = sp"
            >
              {{ t(`settings.autoScroll.${sp}`) }}
            </button>
          </div>
        </section>

        <!-- Eye-rest reminder (spec 011) -->
        <section>
          <label class="flex items-center justify-between gap-3 cursor-pointer">
            <span class="font-semibold">{{ t("settings.eyeRest.label") }}</span>
            <input
              type="checkbox"
              class="toggle toggle-primary"
              v-model="settings.eyeRestEnabled"
            />
          </label>
          <p class="text-xs text-base-content/70 mt-1">{{ t("settings.eyeRest.hint") }}</p>
        </section>

        <!-- TTS -->
        <section v-if="ttsSupported">
          <h3 class="font-semibold mb-2">{{ t("settings.tts.label") }}</h3>
          <div class="space-y-2">
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm">{{ t("settings.tts.rate") }}</span>
                <span class="text-sm text-base-content/70">{{ settings.ttsRate.toFixed(1) }}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                v-model.number="settings.ttsRate"
                class="range range-sm"
              />
            </div>
            <div v-if="voices.length">
              <label class="text-sm block mb-1">{{ t("settings.tts.voice") }}</label>
              <select v-model="settings.ttsVoice" class="select select-sm select-bordered w-full">
                <option value="">{{ t("settings.tts.voiceDefault") }}</option>
                <option v-for="v in voices" :key="v.voiceURI" :value="v.voiceURI">
                  {{ v.name }} ({{ v.lang }})
                </option>
              </select>
            </div>
          </div>
        </section>
      </div>
    </aside>
  </Teleport>
</template>
