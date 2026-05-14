<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import HistoryDrawer from "./HistoryDrawer.vue";

withDefaults(defineProps<{ variant?: "header" }>(), { variant: "header" });

const { t } = useI18n();
const open = ref(false);
</script>

<template>
  <button class="btn btn-sm min-h-11 gap-2" :aria-label="t('history.open')" @click="open = true">
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
      <path d="M3 3v5h5" />
      <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
      <path d="M12 7v5l4 2" />
    </svg>
    <span>{{ t("history.title") }}</span>
  </button>

  <HistoryDrawer v-model:open="open" />
</template>
