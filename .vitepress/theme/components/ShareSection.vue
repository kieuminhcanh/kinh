<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import { useData } from "vitepress";
import { useI18n } from "vue-i18n";
import { findKinhBySlug } from "../../data/kinh";

const { t } = useI18n();
const { page } = useData();

type ToastKind = "success" | "error";
const toastMessage = ref<string>("");
const toastKind = ref<ToastKind>("success");
let toastTimer: ReturnType<typeof setTimeout> | undefined;

const canNativeShare = computed(
  () => typeof navigator !== "undefined" && typeof navigator.share === "function",
);

// Derive title: "<Kinh title> · <Chapter title>" (chapter optional for single-file kinh).
const shareTitle = computed(() => {
  const slug = page.value.relativePath.split("/")[0] ?? "";
  const kinh = findKinhBySlug(slug);
  const kinhTitle = kinh?.title ?? "Kinh";
  const chapter = (page.value.title as string) || "";
  if (chapter && chapter !== kinhTitle) return `${kinhTitle} · ${chapter}`;
  return kinhTitle;
});

function showToast(kind: ToastKind, key: "share.copied" | "share.copyFailed") {
  toastKind.value = kind;
  toastMessage.value = t(key);
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastMessage.value = "";
  }, 3000);
}

async function copyToClipboard(url: string): Promise<boolean> {
  if (typeof navigator === "undefined") return false;
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

async function handleShare() {
  if (typeof window === "undefined") return;
  const url = window.location.href;
  const payload = { title: shareTitle.value, text: t("share.inviteText"), url };

  if (canNativeShare.value) {
    try {
      await navigator.share(payload);
      return;
    } catch (err) {
      // User cancelled (AbortError) → silent. Other errors → fall through to clipboard.
      if (err instanceof Error && err.name === "AbortError") return;
    }
  }

  const ok = await copyToClipboard(url);
  showToast(ok ? "success" : "error", ok ? "share.copied" : "share.copyFailed");
}

onBeforeUnmount(() => {
  if (toastTimer) clearTimeout(toastTimer);
});
</script>

<template>
  <section class="print:hidden mt-12 pt-6 border-t border-base-300 max-w-3xl mx-auto px-4">
    <h2 class="text-lg font-semibold mb-3 text-center">{{ t("share.heading") }}</h2>
    <div class="flex justify-center">
      <button
        type="button"
        class="btn btn-primary btn-lg min-h-14 min-w-44 gap-2"
        :aria-label="t('share.ariaShare')"
        @click="handleShare"
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
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        <span class="font-semibold">{{ t("share.button") }}</span>
      </button>
    </div>

    <!-- Floating toast (above bottom bar). Auto-clears after 3s. -->
    <Teleport to="body">
      <div
        v-if="toastMessage"
        class="fixed bottom-24 left-1/2 -translate-x-1/2 z-60 print:hidden"
        role="status"
        aria-live="polite"
      >
        <div
          class="alert shadow-lg"
          :class="toastKind === 'success' ? 'alert-success' : 'alert-error'"
        >
          <span>{{ toastMessage }}</span>
        </div>
      </div>
    </Teleport>
  </section>
</template>
