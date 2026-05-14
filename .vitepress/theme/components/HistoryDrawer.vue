<script setup lang="ts">
import { computed, ref } from "vue";
import { withBase } from "vitepress";
import { useI18n } from "vue-i18n";
import {
  useBookmarks,
  useReadingPositions,
  clearAllPositions,
  type Bookmark,
  type ReadingPosition,
} from "../composables/useBookmarks";
import { findKinhBySlug } from "../../data/kinh";

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ "update:open": [value: boolean] }>();

const { t } = useI18n();
const { bookmarks, remove, removeAll } = useBookmarks();
const positions = useReadingPositions();

type Tab = "bookmarks" | "reading";
const tab = ref<Tab>("bookmarks");

// Sorted bookmarks (newest first)
const sortedBookmarks = computed<Bookmark[]>(() =>
  [...bookmarks.value].sort((a, b) => b.ts - a.ts),
);

// Filtered + sorted reading positions
const visiblePositions = computed<ReadingPosition[]>(() =>
  Object.values(positions.value)
    .filter((p) => p.scrollPct >= 0.05 && p.scrollPct < 0.98)
    .sort((a, b) => b.ts - a.ts),
);

// Resolve kinh slug from route path: "/kinh-dia-tang/01-pham-1-..." → "kinh-dia-tang"
function slugFromPath(path: string): string {
  const parts = path.split("/").filter(Boolean);
  return parts[0] ?? "";
}

// Resolve chapter label from path: last segment, dashes → spaces
function chapterFromPath(path: string): string {
  const parts = path.split("/").filter(Boolean);
  if (parts.length < 2) return "";
  const last = parts[parts.length - 1]!.replace(/\.html$/, "");
  return last.replace(/-/g, " ");
}

function kinhTitle(path: string): string {
  const slug = slugFromPath(path);
  return findKinhBySlug(slug)?.title ?? slug;
}

function entryHref(path: string, anchor?: string): string {
  const base = withBase(path);
  return anchor ? `${base}#${anchor}` : base;
}

function close() {
  emit("update:open", false);
}

function onEntryClick() {
  // Close drawer; navigation handled by <a href>.
  close();
}

// Clear-all confirm modal
const confirmKind = ref<Tab | null>(null);

function askClear(kind: Tab) {
  confirmKind.value = kind;
}

function cancelClear() {
  confirmKind.value = null;
}

function doClear() {
  if (confirmKind.value === "bookmarks") removeAll();
  else if (confirmKind.value === "reading") clearAllPositions();
  confirmKind.value = null;
}

function removeBookmark(b: Bookmark) {
  remove(b.path, b.anchor);
}

function removePosition(p: ReadingPosition) {
  const next = { ...positions.value };
  delete next[p.path];
  positions.value = next;
}

function pct(scrollPct: number): string {
  return t("history.percent", { n: Math.round(scrollPct * 100) });
}
</script>

<template>
  <Teleport to="body">
    <!-- Overlay -->
    <div v-if="props.open" class="fixed inset-0 z-100 bg-black/40" @click="close" />
    <aside
      class="fixed top-0 right-0 z-101 h-full w-96 max-w-[95vw] bg-base-100 shadow-2xl transition-transform flex flex-col"
      :class="props.open ? 'translate-x-0' : 'translate-x-full'"
      role="dialog"
      :aria-label="t('history.title')"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-base-300 shrink-0">
        <h2 class="text-lg font-bold">{{ t("history.title") }}</h2>
        <button
          class="btn btn-sm btn-ghost min-h-11 min-w-11"
          :aria-label="t('history.close')"
          @click="close"
        >
          {{ t("history.close") }}
        </button>
      </div>

      <!-- Tabs -->
      <div role="tablist" class="tabs tabs-bordered px-4 shrink-0">
        <button
          role="tab"
          :aria-selected="tab === 'bookmarks'"
          class="tab min-h-11 text-base"
          :class="tab === 'bookmarks' ? 'tab-active' : ''"
          @click="tab = 'bookmarks'"
        >
          {{ t("history.tab.bookmarks") }}
        </button>
        <button
          role="tab"
          :aria-selected="tab === 'reading'"
          class="tab min-h-11 text-base"
          :class="tab === 'reading' ? 'tab-active' : ''"
          @click="tab = 'reading'"
        >
          {{ t("history.tab.reading") }}
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-4">
        <!-- Bookmarks tab -->
        <div v-if="tab === 'bookmarks'">
          <p v-if="sortedBookmarks.length === 0" class="text-base py-8 text-center">
            {{ t("history.empty.bookmarks") }}
          </p>
          <ul v-else class="space-y-2">
            <li
              v-for="b in sortedBookmarks"
              :key="`${b.path}#${b.anchor ?? ''}`"
              class="flex items-stretch gap-2 bg-base-200 rounded-lg"
            >
              <a
                :href="entryHref(b.path, b.anchor)"
                class="flex-1 px-4 py-3 min-h-11 flex flex-col justify-center"
                @click="onEntryClick"
              >
                <span class="font-medium text-base">{{ b.label }}</span>
                <span class="text-sm text-base-content/70">{{ kinhTitle(b.path) }}</span>
              </a>
              <button
                class="btn btn-ghost min-h-11 min-w-11 self-stretch"
                :aria-label="t('history.removeOne')"
                @click="removeBookmark(b)"
              >
                ✕
              </button>
            </li>
          </ul>
          <button
            v-if="sortedBookmarks.length > 0"
            class="btn btn-outline btn-error w-full mt-4 min-h-11"
            @click="askClear('bookmarks')"
          >
            {{ t("history.clearAll") }}
          </button>
        </div>

        <!-- Reading positions tab -->
        <div v-else>
          <p v-if="visiblePositions.length === 0" class="text-base py-8 text-center">
            {{ t("history.empty.reading") }}
          </p>
          <ul v-else class="space-y-2">
            <li
              v-for="p in visiblePositions"
              :key="p.path"
              class="flex items-stretch gap-2 bg-base-200 rounded-lg"
            >
              <a
                :href="entryHref(p.path)"
                class="flex-1 px-4 py-3 min-h-11 flex flex-col justify-center"
                @click="onEntryClick"
              >
                <span class="font-medium text-base">{{ kinhTitle(p.path) }}</span>
                <span class="text-sm text-base-content/70">
                  {{ chapterFromPath(p.path) }} · {{ pct(p.scrollPct) }}
                </span>
              </a>
              <button
                class="btn btn-ghost min-h-11 min-w-11 self-stretch"
                :aria-label="t('history.removeOne')"
                @click="removePosition(p)"
              >
                ✕
              </button>
            </li>
          </ul>
          <button
            v-if="visiblePositions.length > 0"
            class="btn btn-outline btn-error w-full mt-4 min-h-11"
            @click="askClear('reading')"
          >
            {{ t("history.clearAll") }}
          </button>
        </div>
      </div>
    </aside>

    <!-- Confirm modal -->
    <div
      v-if="confirmKind"
      class="fixed inset-0 z-200 bg-black/60 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      :aria-label="t('history.confirmClear')"
      @click.self="cancelClear"
    >
      <div class="bg-base-100 rounded-xl shadow-2xl max-w-sm w-full p-6">
        <p class="text-base mb-6">{{ t("history.confirmClear") }}</p>
        <div class="flex gap-3">
          <button class="btn btn-ghost flex-1 min-h-12 text-base" @click="cancelClear">
            {{ t("history.confirmNo") }}
          </button>
          <button class="btn btn-error flex-1 min-h-12 text-base" @click="doClear">
            {{ t("history.confirmYes") }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
