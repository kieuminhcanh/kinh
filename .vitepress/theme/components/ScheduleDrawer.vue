<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { kinhCatalog } from "../../data/kinh";
import {
  useSchedules,
  nextOccurrence,
  type Repeat,
  type Schedule,
} from "../composables/useSchedules";

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ "update:open": [value: boolean] }>();

const { t, te } = useI18n();
const { sorted, add, remove } = useSchedules();

const showForm = ref(false);

// Form state
const formSlug = ref(kinhCatalog[0]?.slug ?? "");
const formTime = ref("06:00");
const formRepeat = ref<Repeat>("daily");
const formWeekday = ref<number>(0);
const formDate = ref<string>(new Date().toISOString().slice(0, 10));

function close() {
  emit("update:open", false);
}

function kinhTitle(slug: string): string {
  const key = `kinh.${slug}.title`;
  const fallback = kinhCatalog.find((k) => k.slug === slug)?.title ?? slug;
  return te(key) ? t(key) : fallback;
}

function resetForm() {
  formSlug.value = kinhCatalog[0]?.slug ?? "";
  formTime.value = "06:00";
  formRepeat.value = "daily";
  formWeekday.value = 0;
  formDate.value = new Date().toISOString().slice(0, 10);
}

function submitForm() {
  if (!formSlug.value || !formTime.value) return;
  const payload: Omit<Schedule, "id"> = {
    kinhSlug: formSlug.value,
    time: formTime.value,
    repeat: formRepeat.value,
  };
  if (formRepeat.value === "weekly") payload.weekday = formWeekday.value;
  if (formRepeat.value === "once") payload.date = formDate.value;
  add(payload);
  resetForm();
  showForm.value = false;
}

function formatNext(s: Schedule): string {
  const next = nextOccurrence(s);
  if (!next) return "—";
  return next.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const weekdays = computed(() => [
  { value: 0, label: t("schedule.weekday.0") },
  { value: 1, label: t("schedule.weekday.1") },
  { value: 2, label: t("schedule.weekday.2") },
  { value: 3, label: t("schedule.weekday.3") },
  { value: 4, label: t("schedule.weekday.4") },
  { value: 5, label: t("schedule.weekday.5") },
  { value: 6, label: t("schedule.weekday.6") },
]);
</script>

<template>
  <Teleport to="body">
    <div v-if="props.open" class="fixed inset-0 z-100 bg-black/40" @click="close" />
    <aside
      class="fixed top-0 right-0 z-101 h-full w-96 max-w-[95vw] bg-[--vp-c-bg] shadow-2xl transition-transform"
      :class="props.open ? 'translate-x-0' : 'translate-x-full'"
      role="dialog"
      :aria-label="t('schedule.title')"
    >
      <div class="flex items-center justify-between p-4 border-b border-[--vp-c-divider]">
        <h2 class="text-lg font-bold text-[--vp-c-text-1]">{{ t("schedule.title") }}</h2>
        <button
          type="button"
          class="inline-flex items-center justify-center min-h-11 min-w-11 rounded-full text-[--vp-c-text-1] hover:bg-[--vp-c-bg-soft] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--vp-c-brand-1] transition-colors"
          :aria-label="t('settings.close')"
          @click="close"
        >
          ✕
        </button>
      </div>

      <div class="p-4 space-y-4 overflow-y-auto h-[calc(100%-4rem)]">
        <!-- Add button / form -->
        <button
          v-if="!showForm"
          type="button"
          class="w-full min-h-12 px-4 rounded-md text-base font-semibold text-white bg-[--vp-c-brand-1] hover:bg-[--vp-c-brand-2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--vp-c-brand-1] transition-colors"
          @click="showForm = true"
        >
          + {{ t("schedule.add") }}
        </button>

        <form
          v-else
          class="space-y-3 border border-[--vp-c-divider] rounded-lg p-3"
          @submit.prevent="submitForm"
        >
          <div>
            <label class="text-sm font-medium block mb-1 text-[--vp-c-text-1]">
              {{ t("schedule.field.kinh") }}
            </label>
            <select
              v-model="formSlug"
              class="w-full min-h-11 px-3 rounded-md text-sm border border-[--vp-c-divider] bg-[--vp-c-bg] text-[--vp-c-text-1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--vp-c-brand-1]"
            >
              <option v-for="k in kinhCatalog" :key="k.slug" :value="k.slug">
                {{ kinhTitle(k.slug) }}
              </option>
            </select>
          </div>

          <div>
            <label class="text-sm font-medium block mb-1 text-[--vp-c-text-1]">
              {{ t("schedule.field.time") }}
            </label>
            <input
              type="time"
              v-model="formTime"
              class="w-full min-h-11 px-3 rounded-md text-sm border border-[--vp-c-divider] bg-[--vp-c-bg] text-[--vp-c-text-1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--vp-c-brand-1]"
            />
          </div>

          <div>
            <label class="text-sm font-medium block mb-1 text-[--vp-c-text-1]">
              {{ t("schedule.field.repeat") }}
            </label>
            <div class="flex w-full">
              <button
                v-for="r in ['daily', 'weekly', 'once'] as const"
                :key="r"
                type="button"
                :class="[
                  'inline-flex items-center justify-center min-h-11 px-3 text-sm font-medium border border-[--vp-c-divider] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--vp-c-brand-1] transition-colors -ml-px first:ml-0 first:rounded-l-md last:rounded-r-md flex-1',
                  formRepeat === r
                    ? 'bg-[--vp-c-brand-1] text-white border-[--vp-c-brand-1] z-10'
                    : 'bg-[--vp-c-bg-soft] text-[--vp-c-text-1] hover:bg-[--vp-c-bg-mute]',
                ]"
                @click="formRepeat = r"
              >
                {{ t(`schedule.repeat.${r}`) }}
              </button>
            </div>
          </div>

          <div v-if="formRepeat === 'weekly'">
            <label class="text-sm font-medium block mb-1 text-[--vp-c-text-1]">
              {{ t("schedule.field.weekday") }}
            </label>
            <select
              v-model.number="formWeekday"
              class="w-full min-h-11 px-3 rounded-md text-sm border border-[--vp-c-divider] bg-[--vp-c-bg] text-[--vp-c-text-1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--vp-c-brand-1]"
            >
              <option v-for="w in weekdays" :key="w.value" :value="w.value">{{ w.label }}</option>
            </select>
          </div>

          <div v-if="formRepeat === 'once'">
            <label class="text-sm font-medium block mb-1 text-[--vp-c-text-1]">
              {{ t("schedule.field.date") }}
            </label>
            <input
              type="date"
              v-model="formDate"
              class="w-full min-h-11 px-3 rounded-md text-sm border border-[--vp-c-divider] bg-[--vp-c-bg] text-[--vp-c-text-1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--vp-c-brand-1]"
            />
          </div>

          <div class="flex gap-2 pt-1">
            <button
              type="submit"
              class="flex-1 min-h-11 px-3 rounded-md text-sm font-medium text-white bg-[--vp-c-brand-1] hover:bg-[--vp-c-brand-2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--vp-c-brand-1] transition-colors"
            >
              {{ t("schedule.save") }}
            </button>
            <button
              type="button"
              class="inline-flex items-center justify-center min-h-11 px-3 rounded-md text-sm font-medium text-[--vp-c-text-1] bg-transparent hover:bg-[--vp-c-bg-soft] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--vp-c-brand-1] transition-colors"
              @click="showForm = false"
            >
              {{ t("settings.close") }}
            </button>
          </div>
        </form>

        <!-- List -->
        <p v-if="!sorted.length" class="text-sm text-[--vp-c-text-2] text-center py-6">
          {{ t("schedule.empty") }}
        </p>
        <ul v-else class="space-y-2">
          <li
            v-for="s in sorted"
            :key="s.id"
            class="border border-[--vp-c-divider] rounded-lg p-3 flex items-start justify-between gap-2"
          >
            <div class="flex-1 min-w-0">
              <p class="font-semibold truncate text-[--vp-c-text-1]">
                {{ kinhTitle(s.kinhSlug) }}
              </p>
              <p class="text-sm text-[--vp-c-text-2]">
                {{ s.time }} · {{ t(`schedule.repeat.${s.repeat}`) }}
                <template v-if="s.repeat === 'weekly' && s.weekday != null">
                  ({{ t(`schedule.weekday.${s.weekday}`) }})
                </template>
              </p>
              <p class="text-xs text-[--vp-c-text-3] mt-1">
                {{ t("schedule.next") }}: {{ formatNext(s) }}
              </p>
            </div>
            <button
              type="button"
              class="inline-flex items-center justify-center min-h-11 min-w-11 rounded-md text-[--vp-c-text-1] hover:bg-[--vp-c-bg-soft] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--vp-c-brand-1] transition-colors"
              :aria-label="t('schedule.delete')"
              @click="remove(s.id)"
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
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  </Teleport>
</template>
