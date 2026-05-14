<script setup lang="ts">
import { toRef } from "vue";
import { useI18n } from "vue-i18n";
import { useEyeRestTimer } from "../composables/useEyeRestTimer";

const props = defineProps<{ isReader: boolean }>();

const { t } = useI18n();
const { due, resetCounter, muteToday } = useEyeRestTimer(toRef(props, "isReader"));
</script>

<template>
  <Teleport to="body">
    <div
      v-if="due"
      class="fixed top-3 left-1/2 -translate-x-1/2 z-60 print:hidden w-[min(92vw,30rem)]"
      role="alertdialog"
      aria-live="polite"
      :aria-label="t('eyeRest.title')"
    >
      <div class="alert alert-info shadow-xl flex-col sm:flex-row gap-2">
        <div class="flex-1">
          <h3 class="font-bold">{{ t("eyeRest.title") }}</h3>
          <p class="text-sm">{{ t("eyeRest.body") }}</p>
        </div>
        <div class="flex gap-2 shrink-0">
          <button
            type="button"
            class="btn btn-sm btn-primary"
            :aria-label="t('eyeRest.rested')"
            @click="resetCounter"
          >
            {{ t("eyeRest.rested") }}
          </button>
          <button
            type="button"
            class="btn btn-sm btn-ghost"
            :aria-label="t('eyeRest.muteToday')"
            @click="muteToday"
          >
            {{ t("eyeRest.muteToday") }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
