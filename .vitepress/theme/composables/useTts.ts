import { useSpeechSynthesis } from "@vueuse/core";
import { computed, ref, shallowRef, watch } from "vue";
import { useSettings } from "./useSettings";

/**
 * Read article text using Web Speech API.
 * Voice and rate are reactive — backed by user settings.
 */
export function useTts() {
  const settings = useSettings();
  const text = ref("");
  const voice = shallowRef<SpeechSynthesisVoice | undefined>(undefined);

  const speech = useSpeechSynthesis(text, {
    lang: "vi-VN",
    rate: computed(() => settings.value.ttsRate),
    voice: voice as any, // useSpeechSynthesis typing requires non-undefined ref
  });

  const voices = ref<SpeechSynthesisVoice[]>([]);

  function loadVoices() {
    if (typeof window === "undefined") return;
    const all = window.speechSynthesis.getVoices();
    const vi = all.filter((v) => v.lang.startsWith("vi"));
    voices.value = vi.length ? vi : all;
    const saved = voices.value.find((v) => v.voiceURI === settings.value.ttsVoice);
    if (saved) voice.value = saved;
  }

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.addEventListener?.("voiceschanged", loadVoices);
    loadVoices();
  }

  watch(
    () => settings.value.ttsVoice,
    (uri) => {
      const v = voices.value.find((x) => x.voiceURI === uri);
      if (v) voice.value = v;
    },
  );

  function speak(content: string) {
    text.value = content;
    speech.speak();
  }

  function stop() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  function setVoice(uri: string) {
    settings.value.ttsVoice = uri;
  }

  const isPaused = computed(() => speech.status.value === "pause");

  return {
    voices,
    isPlaying: speech.isPlaying,
    isPaused,
    status: speech.status,
    isSupported: speech.isSupported,
    speak,
    stop,
    toggle: speech.toggle,
    setVoice,
  };
}
