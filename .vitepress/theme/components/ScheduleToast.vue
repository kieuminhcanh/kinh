<script setup lang="ts">
import { computed } from "vue";
import { withBase } from "vitepress";
import { useI18n } from "vue-i18n";
import { useSchedules } from "../composables/useSchedules";
import { findKinhBySlug } from "../../data/kinh";

const { t, te } = useI18n();
const { dueItem, dismissDue } = useSchedules();

const due = computed(() => dueItem.value);

function kinhTitle(slug: string): string {
  const key = `kinh.${slug}.title`;
  const fallback = findKinhBySlug(slug)?.title ?? slug;
  return te(key) ? t(key) : fallback;
}

function openKinh() {
  if (!due.value) return;
  const slug = due.value.kinhSlug;
  dismissDue();
  if (typeof window !== "undefined") {
    window.location.href = withBase(`/${slug}/`);
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="due"
      class="fixed top-3 left-1/2 -translate-x-1/2 z-60 print:hidden w-[min(92vw,30rem)]"
      role="alertdialog"
      aria-live="polite"
      :aria-label="t('schedule.toast.title')"
    >
      <div class="alert alert-info shadow-xl flex-col sm:flex-row gap-2">
        <div class="flex-1">
          <h3 class="font-bold">{{ t("schedule.toast.title") }}</h3>
          <p class="text-sm">
            {{ t("schedule.toast.body", { kinh: kinhTitle(due.kinhSlug) }) }}
          </p>
        </div>
        <div class="flex gap-2 shrink-0">
          <button
            type="button"
            class="btn btn-sm btn-primary"
            :aria-label="t('schedule.toast.open')"
            @click="openKinh"
          >
            {{ t("schedule.toast.open") }}
          </button>
          <button
            type="button"
            class="btn btn-sm btn-ghost"
            :aria-label="t('schedule.toast.dismiss')"
            @click="dismissDue"
          >
            {{ t("schedule.toast.dismiss") }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
