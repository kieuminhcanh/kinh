<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import ScheduleDrawer from "./ScheduleDrawer.vue";

const { t } = useI18n();
const open = ref(false);
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center justify-center gap-2 min-h-11 px-3 rounded-md text-sm font-medium text-[--vp-c-text-1] bg-[--vp-c-bg-soft] border border-[--vp-c-divider] hover:bg-[--vp-c-bg-mute] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--vp-c-brand-1] transition-colors"
    :aria-label="t('schedule.open')"
    @click="open = true"
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
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
    <span>{{ t("schedule.button") }}</span>
  </button>

  <ScheduleDrawer v-model:open="open" />
</template>
