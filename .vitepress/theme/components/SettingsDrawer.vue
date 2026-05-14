<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useSettings, type Theme, type AutoScrollSpeed } from "../composables/useSettings";
import { currentLocale, type Locale } from "../i18n";
import { useTts } from "../composables/useTts";

withDefaults(defineProps<{ showTrigger?: boolean }>(), { showTrigger: true });

const settings = useSettings();
const { t } = useI18n();
const open = ref(false);
const { voices, isSupported: ttsSupported } = useTts();

const themes: Theme[] = ["light", "auto", "dark"];
const themeIcons: Record<Theme, string> = { light: "☀️", auto: "🖥️", dark: "🌙" };
const locales: { value: Locale; label: string }[] = [
  { value: "vi", label: "Tiếng Việt" },
  { value: "en", label: "English" },
];
const autoScrollSpeeds: AutoScrollSpeed[] = ["slow", "normal", "fast"];

defineExpose({ open: () => (open.value = true) });

// Grouped picker classes (chained buttons with single rounded edges).
// Active/inactive states driven by scoped CSS below (.picker-btn + .is-active)
// because previous Tailwind arbitrary-value approach produced indistinguishable
// states on some themes.
const pickerBase =
  "picker-btn inline-flex items-center justify-center min-h-13 px-3 text-lg font-medium border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--vp-c-brand-1] transition-colors -ml-px first:ml-0 first:rounded-l-md last:rounded-r-md flex-1";
const pickerActive = "is-active";
const pickerInactive = "";
</script>

<template>
  <!-- Trigger -->
  <button
    v-if="showTrigger"
    type="button"
    class="inline-flex items-center justify-center min-h-11 min-w-11 rounded-full text-[--vp-c-text-1] hover:bg-[--vp-c-bg-soft] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--vp-c-brand-1] transition-colors"
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
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
      />
    </svg>
  </button>

  <!-- Drawer overlay -->
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-100 bg-black/80 backdrop-blur-md"
      @click="open = false"
    />
    <aside
      class="settings-drawer fixed top-0 right-0 z-101 h-full w-[28rem] max-w-[95vw] border-l-2 border-[--vp-c-divider] shadow-2xl transition-transform"
      :class="open ? 'translate-x-0' : 'translate-x-full'"
      role="dialog"
      :aria-label="t('settings.title')"
    >
      <div class="flex items-center justify-between p-4 border-b border-[--vp-c-divider]">
        <h2 class="text-3xl font-bold text-[--vp-c-text-1]">{{ t("settings.title") }}</h2>
        <button
          type="button"
          class="inline-flex items-center justify-center min-h-13 min-w-13 rounded-full text-2xl text-[--vp-c-text-1] hover:bg-[--vp-c-bg-soft] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--vp-c-brand-1] transition-colors"
          :aria-label="t('settings.close')"
          @click="open = false"
        >
          ✕
        </button>
      </div>

      <div class="p-4 space-y-6 overflow-y-auto h-[calc(100%-4rem)]">
        <!-- Language -->
        <section>
          <h3 class="text-xl font-semibold mb-2 text-[--vp-c-text-1]">
            {{ t("settings.language") }}
          </h3>
          <div class="flex w-full">
            <button
              v-for="l in locales"
              :key="l.value"
              type="button"
              :class="[pickerBase, currentLocale === l.value ? pickerActive : pickerInactive]"
              @click="currentLocale = l.value"
            >
              {{ l.label }}
            </button>
          </div>
        </section>

        <!-- Theme -->
        <section>
          <h3 class="text-xl font-semibold mb-2 text-[--vp-c-text-1]">
            {{ t("settings.theme.label") }}
          </h3>
          <div class="flex w-full">
            <button
              v-for="th in themes"
              :key="th"
              type="button"
              :class="[pickerBase, settings.theme === th ? pickerActive : pickerInactive]"
              @click="settings.theme = th"
            >
              <span class="mr-1" aria-hidden="true">{{ themeIcons[th] }}</span
              >{{ t(`settings.theme.${th}`) }}
            </button>
          </div>
        </section>

        <!-- Font family -->
        <section>
          <h3 class="text-xl font-semibold mb-2 text-[--vp-c-text-1]">
            {{ t("settings.fontFamily.label") }}
          </h3>
          <div class="flex w-full">
            <button
              type="button"
              :class="[pickerBase, settings.fontFamily === 'serif' ? pickerActive : pickerInactive]"
              @click="settings.fontFamily = 'serif'"
            >
              {{ t("settings.fontFamily.serif") }}
            </button>
            <button
              type="button"
              :class="[pickerBase, settings.fontFamily === 'sans' ? pickerActive : pickerInactive]"
              @click="settings.fontFamily = 'sans'"
            >
              {{ t("settings.fontFamily.sans") }}
            </button>
          </div>
        </section>

        <!-- Font size -->
        <section>
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-xl font-semibold text-[--vp-c-text-1]">
              {{ t("settings.fontSize") }}
            </h3>
            <span class="text-lg text-[--vp-c-text-2]">{{ settings.fontSize }}px</span>
          </div>
          <input
            type="range"
            min="16"
            max="60"
            step="1"
            v-model.number="settings.fontSize"
            class="w-full accent-[--vp-c-brand-1] min-h-11"
          />
        </section>

        <!-- Line height -->
        <section>
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-xl font-semibold text-[--vp-c-text-1]">
              {{ t("settings.lineHeight") }}
            </h3>
            <span class="text-lg text-[--vp-c-text-2]">{{ settings.lineHeight.toFixed(1) }}</span>
          </div>
          <input
            type="range"
            min="1.6"
            max="2.4"
            step="0.1"
            v-model.number="settings.lineHeight"
            class="w-full accent-[--vp-c-brand-1] min-h-11"
          />
        </section>

        <!-- Auto-scroll speed -->
        <section>
          <h3 class="text-xl font-semibold mb-2 text-[--vp-c-text-1]">
            {{ t("settings.autoScroll.label") }}
          </h3>
          <div class="flex w-full">
            <button
              v-for="sp in autoScrollSpeeds"
              :key="sp"
              type="button"
              :class="[pickerBase, settings.autoScrollSpeed === sp ? pickerActive : pickerInactive]"
              @click="settings.autoScrollSpeed = sp"
            >
              {{ t(`settings.autoScroll.${sp}`) }}
            </button>
          </div>
        </section>

        <!-- TTS -->
        <section v-if="ttsSupported">
          <h3 class="text-xl font-semibold mb-2 text-[--vp-c-text-1]">
            {{ t("settings.tts.label") }}
          </h3>
          <div class="space-y-3">
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="text-lg text-[--vp-c-text-1]">{{ t("settings.tts.rate") }}</span>
                <span class="text-lg text-[--vp-c-text-2]">{{ settings.ttsRate.toFixed(1) }}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                v-model.number="settings.ttsRate"
                class="w-full accent-[--vp-c-brand-1] min-h-11"
              />
            </div>
            <div v-if="voices.length">
              <label class="text-lg block mb-1 text-[--vp-c-text-1]">
                {{ t("settings.tts.voice") }}
              </label>
              <select
                v-model="settings.ttsVoice"
                class="w-full min-h-12 px-3 rounded-md text-lg border border-[--vp-c-divider] bg-[--vp-c-bg] text-[--vp-c-text-1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--vp-c-brand-1]"
              >
                <option value="" class="voice-option">
                  {{ t("settings.tts.voiceDefault") }}
                </option>
                <option
                  v-for="v in voices"
                  :key="v.voiceURI"
                  :value="v.voiceURI"
                  class="voice-option"
                >
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

<style scoped>
/* Grouped picker buttons (language / theme / font family / auto-scroll speed).
   Active state must be unmistakable for elderly users: solid brand fill +
   white text + bold + inset ring so the selected button visually "pops".
   Scoped rules bypass any Tailwind utility-class ordering issues. */
.picker-btn {
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-divider);
}

/* Maximize readability of Settings drawer text (elderly users):
   override VitePress's slightly soft `--vp-c-text-1` (#3c3c43) with
   pure black on light theme. Dark theme keeps a near-white for the same
   reason. Applied via :deep on drawer content so all headings/labels gain
   max contrast against the panel background. */

.picker-btn:hover {
  background-color: var(--vp-c-bg-mute);
}
.picker-btn.is-active {
  background-color: var(--vp-c-brand-1);
  color: #fff;
  border-color: var(--vp-c-brand-1);
  font-weight: 700;
  box-shadow:
    inset 0 0 0 2px var(--vp-c-bg),
    inset 0 0 0 4px var(--vp-c-brand-1);
  z-index: 10;
}
.picker-btn.is-active:hover {
  background-color: var(--vp-c-brand-2);
  border-color: var(--vp-c-brand-2);
}

/* Force readable contrast on native <option> popup.
   Browsers (esp. Windows) inherit OS colors which can be low-contrast
   (gray on white) regardless of <select> parent styles. */
.voice-option {
  background-color: #fff;
  color: #111;
}
:global(html.dark) .voice-option {
  background-color: #1b1b1f;
  color: #f3f4f6;
}
</style>

<!-- Non-scoped: drawer is teleported to body, scoped attrs may not reach it
     on some Vue / Vite builds, and :global(html.dark) inside scoped sometimes
     fails. Plain global rules guarantee opacity + dark-mode swap. -->
<style>
.settings-drawer {
  background-color: #ffffff !important;
  color: #000;
}
html.dark .settings-drawer {
  background-color: #1b1b1f !important;
  color: #f3f4f6;
}
html.dark .settings-drawer h2,
html.dark .settings-drawer h3,
html.dark .settings-drawer label,
html.dark .settings-drawer section > div > span,
html.dark .settings-drawer section > p {
  color: #f3f4f6 !important;
}
.settings-drawer h2,
.settings-drawer h3,
.settings-drawer label,
.settings-drawer section > div > span,
.settings-drawer section > p {
  color: #000;
}
</style>
