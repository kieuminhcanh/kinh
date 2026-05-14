<script setup lang="ts">
import { useData } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { computed, watch } from "vue";
import Home from "./components/Home.vue";
import ReaderTools from "./components/ReaderTools.vue";
import ReadingProgress from "./components/ReadingProgress.vue";
import ShareSection from "./components/ShareSection.vue";
import FocusExitButton from "./components/FocusExitButton.vue";
import EyeRestToast from "./components/EyeRestToast.vue";
import ScheduleToast from "./components/ScheduleToast.vue";
import { useFocusMode } from "./composables/useFocusMode";
import { useSettings } from "./composables/useSettings";

const { Layout } = DefaultTheme;
const { page } = useData();

const isHome = computed(() => page.value.relativePath === "index.md");
const isReader = computed(() => !isHome.value && !page.value.isNotFound);

const focus = useFocusMode();
const settings = useSettings();
const eyeRestEnabled = computed(() => settings.value.eyeRestEnabled);

// Toggle `.focus-mode` class on <html> so global CSS rules can hide VPNav etc.
watch(
  () => focus.active.value,
  (on) => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("focus-mode", on);
  },
);

// Auto-exit focus when navigating off a reader page (e.g. back to Home).
watch(isReader, (reader) => {
  if (!reader && focus.active.value) focus.exit();
});
</script>

<template>
  <ScheduleToast />
  <Home v-if="isHome" />
  <template v-else>
    <ReadingProgress v-if="isReader && !focus.active.value" />
    <Layout />
    <ShareSection v-if="isReader && !focus.active.value" />
    <ReaderTools v-if="isReader && !focus.active.value" />
    <FocusExitButton v-if="isReader" />
    <EyeRestToast v-if="eyeRestEnabled" :is-reader="isReader" />
  </template>
</template>
