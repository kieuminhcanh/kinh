<script setup lang="ts">
import { onBeforeUnmount, toRef, watch } from "vue";
import { useRoute } from "vitepress";
import { useTts } from "../composables/useTts";
import { useAutoScroll } from "../composables/useAutoScroll";
import ReaderBottomBar from "./ReaderBottomBar.vue";

const route = useRoute();
const tts = useTts();
const autoScroll = useAutoScroll();

onBeforeUnmount(() => {
  tts.stop();
});

// Stop active playback/scroll when navigating between pages.
watch(toRef(route, "path"), () => {
  tts.stop();
  autoScroll.stop();
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
</script>

<template>
  <ReaderBottomBar
    :is-playing="tts.isPlaying.value"
    :is-paused="tts.isPaused.value"
    :tts-supported="tts.isSupported.value"
    :auto-scroll-active="autoScroll.isActive.value"
    @toggle-tts="toggleTts"
    @stop-tts="stopTts"
    @toggle-auto-scroll="toggleAutoScroll"
  />
</template>
