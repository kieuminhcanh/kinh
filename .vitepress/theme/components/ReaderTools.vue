<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from "vue";
import { useRoute, useData } from "vitepress";
import { useBookmarks, useReadingPositions } from "../composables/useBookmarks";
import { useTts } from "../composables/useTts";
import { useAutoScroll } from "../composables/useAutoScroll";
import { useFocusMode } from "../composables/useFocusMode";
import { useVoiceCommand, type VoiceCommand } from "../composables/useVoiceCommand";
import ReaderBottomBar from "./ReaderBottomBar.vue";

const route = useRoute();
const { page } = useData();
const { bookmarks, add, remove } = useBookmarks();
const positions = useReadingPositions();
const tts = useTts();
const autoScroll = useAutoScroll();
const focus = useFocusMode();

function handleVoiceCommand(cmd: VoiceCommand) {
  if (cmd === "play") {
    if (!tts.isPlaying.value && !tts.isPaused.value) toggleTts();
  } else if (cmd === "pause") {
    if (tts.isPlaying.value) tts.toggle();
  } else if (cmd === "resume") {
    if (tts.isPaused.value) tts.toggle();
  } else if (cmd === "stop") {
    tts.stop();
  }
}

const voice = useVoiceCommand(handleVoiceCommand);

const path = computed(() => route.path);
const title = computed(() => (page.value.title as string) || "Kinh");

const isBookmarked = computed(() =>
  bookmarks.value.some((b) => b.path === path.value && !b.anchor),
);

function toggleBookmark() {
  if (isBookmarked.value) remove(path.value);
  else add({ path: path.value, label: title.value });
}

// --- Reading position: save on scroll, restore on mount ---
let scrollTimer: ReturnType<typeof setTimeout> | null = null;

function saveScroll() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - doc.clientHeight;
  if (max <= 0) return;
  const pct = Math.min(1, Math.max(0, doc.scrollTop / max));
  positions.value = {
    ...positions.value,
    [path.value]: { path: path.value, scrollPct: pct, ts: Date.now() },
  };
}

function onScroll() {
  if (scrollTimer) clearTimeout(scrollTimer);
  scrollTimer = setTimeout(saveScroll, 400);
}

function restoreScroll() {
  const saved = positions.value[path.value];
  if (!saved || saved.scrollPct < 0.02) return;
  // Wait for content to render
  setTimeout(() => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    if (max > 0) window.scrollTo({ top: max * saved.scrollPct, behavior: "auto" });
  }, 150);
}

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  restoreScroll();
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
  tts.stop();
});

// Restore again on route change
watch(path, () => {
  tts.stop();
  autoScroll.stop();
  restoreScroll();
});

// --- TTS: read paragraphs in order ---
// 3-state behavior: idle → speak; playing → pause; paused → resume.
function toggleTts() {
  if (tts.isPlaying.value || tts.isPaused.value) {
    tts.toggle();
    return;
  }
  const article = document.querySelector(".vp-doc");
  if (!article) return;
  const paragraphs = Array.from(article.querySelectorAll("p, h2, h3, blockquote, pre"))
    .map((el) => (el.textContent || "").trim())
    .filter(Boolean);
  tts.speak(paragraphs.join(". "));
}

function stopTts() {
  tts.stop();
}

function toggleAutoScroll() {
  autoScroll.toggle();
}

function toggleFocus() {
  focus.toggle();
}

function toggleVoice() {
  voice.toggle();
}
</script>

<template>
  <ReaderBottomBar
    :is-bookmarked="isBookmarked"
    :is-playing="tts.isPlaying.value"
    :is-paused="tts.isPaused.value"
    :tts-supported="tts.isSupported.value"
    :auto-scroll-active="autoScroll.isActive.value"
    :voice-supported="voice.isSupported.value"
    :voice-listening="voice.isListening.value"
    @toggle-bookmark="toggleBookmark"
    @toggle-tts="toggleTts"
    @stop-tts="stopTts"
    @toggle-auto-scroll="toggleAutoScroll"
    @toggle-focus="toggleFocus"
    @toggle-voice="toggleVoice"
  />
</template>
