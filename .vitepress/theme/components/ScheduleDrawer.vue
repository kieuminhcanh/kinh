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
      class="fixed top-0 right-0 z-101 h-full w-96 max-w-[95vw] bg-base-100 shadow-2xl transition-transform"
      :class="props.open ? 'translate-x-0' : 'translate-x-full'"
      role="dialog"
      :aria-label="t('schedule.title')"
    >
      <div class="flex items-center justify-between p-4 border-b border-base-300">
        <h2 class="text-lg font-bold">{{ t("schedule.title") }}</h2>
        <button
          class="btn btn-sm btn-circle btn-ghost"
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
          class="btn btn-primary btn-block min-h-12"
          @click="showForm = true"
        >
          + {{ t("schedule.add") }}
        </button>

        <form
          v-else
          class="space-y-3 border border-base-300 rounded-box p-3"
          @submit.prevent="submitForm"
        >
          <div>
            <label class="text-sm font-medium block mb-1">{{ t("schedule.field.kinh") }}</label>
            <select v-model="formSlug" class="select select-bordered select-sm w-full">
              <option v-for="k in kinhCatalog" :key="k.slug" :value="k.slug">
                {{ kinhTitle(k.slug) }}
              </option>
            </select>
          </div>

          <div>
            <label class="text-sm font-medium block mb-1">{{ t("schedule.field.time") }}</label>
            <input type="time" v-model="formTime" class="input input-bordered input-sm w-full" />
          </div>

          <div>
            <label class="text-sm font-medium block mb-1">{{ t("schedule.field.repeat") }}</label>
            <div class="join w-full">
              <button
                type="button"
                class="btn btn-sm join-item flex-1"
                :class="formRepeat === 'daily' ? 'btn-primary' : 'btn-ghost'"
                @click="formRepeat = 'daily'"
              >
                {{ t("schedule.repeat.daily") }}
              </button>
              <button
                type="button"
                class="btn btn-sm join-item flex-1"
                :class="formRepeat === 'weekly' ? 'btn-primary' : 'btn-ghost'"
                @click="formRepeat = 'weekly'"
              >
                {{ t("schedule.repeat.weekly") }}
              </button>
              <button
                type="button"
                class="btn btn-sm join-item flex-1"
                :class="formRepeat === 'once' ? 'btn-primary' : 'btn-ghost'"
                @click="formRepeat = 'once'"
              >
                {{ t("schedule.repeat.once") }}
              </button>
            </div>
          </div>

          <div v-if="formRepeat === 'weekly'">
            <label class="text-sm font-medium block mb-1">{{ t("schedule.field.weekday") }}</label>
            <select v-model.number="formWeekday" class="select select-bordered select-sm w-full">
              <option v-for="w in weekdays" :key="w.value" :value="w.value">{{ w.label }}</option>
            </select>
          </div>

          <div v-if="formRepeat === 'once'">
            <label class="text-sm font-medium block mb-1">{{ t("schedule.field.date") }}</label>
            <input type="date" v-model="formDate" class="input input-bordered input-sm w-full" />
          </div>

          <div class="flex gap-2 pt-1">
            <button type="submit" class="btn btn-sm btn-primary flex-1">
              {{ t("schedule.save") }}
            </button>
            <button type="button" class="btn btn-sm btn-ghost" @click="showForm = false">
              {{ t("settings.close") }}
            </button>
          </div>
        </form>

        <!-- List -->
        <p v-if="!sorted.length" class="text-sm text-base-content/70 text-center py-6">
          {{ t("schedule.empty") }}
        </p>
        <ul v-else class="space-y-2">
          <li
            v-for="s in sorted"
            :key="s.id"
            class="border border-base-300 rounded-box p-3 flex items-start justify-between gap-2"
          >
            <div class="flex-1 min-w-0">
              <p class="font-semibold truncate">{{ kinhTitle(s.kinhSlug) }}</p>
              <p class="text-sm text-base-content/70">
                {{ s.time }} · {{ t(`schedule.repeat.${s.repeat}`) }}
                <template v-if="s.repeat === 'weekly' && s.weekday != null">
                  ({{ t(`schedule.weekday.${s.weekday}`) }})
                </template>
              </p>
              <p class="text-xs text-base-content/60 mt-1">
                {{ t("schedule.next") }}: {{ formatNext(s) }}
              </p>
            </div>
            <button
              class="btn btn-sm btn-ghost btn-square"
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
