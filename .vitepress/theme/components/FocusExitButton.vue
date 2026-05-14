<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useFocusMode } from "../composables/useFocusMode";

const { t } = useI18n();
const { active, exit } = useFocusMode();
</script>

<template>
  <button
    v-if="active"
    type="button"
    class="fixed top-3 right-3 z-60 min-h-14 min-w-14 rounded-full bg-base-100 border border-base-300 shadow-lg flex items-center justify-center hover:bg-base-200 transition-colors print:hidden"
    :aria-label="t('reader.focus.exit')"
    :title="t('reader.focus.exit')"
    @click="exit"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  </button>
</template>
