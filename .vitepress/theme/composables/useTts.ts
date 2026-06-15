import { computed, ref, shallowRef, watch } from "vue";
import { useSettings } from "./useSettings";

type TtsStatus = "init" | "play" | "pause" | "end";

/**
 * Read article text using the Web Speech API.
 *
 * Long chapters (phẩm) are read by splitting the text into sentence-sized
 * chunks that are spoken sequentially through a queue, rather than handing the
 * engine one giant utterance. Android's Google TTS silently rejects an
 * utterance past its max input length — so a long phẩm would produce no audio
 * at all while short verse pages worked. Chunking keeps every utterance short
 * enough to play, and also sidesteps Chrome/Android's ~15s "silent pause" bug
 * (each chunk finishes well under the timeout; a keep-alive guards the rest).
 *
 * Voice and rate are read from user settings; a rate change applies from the
 * next chunk onward.
 */
export function useTts() {
  const settings = useSettings();
  // Feature flag: read-aloud is disabled for now to declutter the reader UI.
  // Android Google TTS reliability on long chapters was the trigger; flip this
  // to `true` to bring the speaker button + voice/rate settings back. Gating on
  // `isSupported` hides both the bottom-bar button and the settings section in
  // one place.
  const TTS_ENABLED = false;
  const supported =
    TTS_ENABLED &&
    typeof window !== "undefined" &&
    "speechSynthesis" in window;
  const isSupported = ref(supported);

  // 3-state machine consumed by the bottom bar (idle/playing/paused).
  const status = ref<TtsStatus>("init");
  const isPlaying = computed(() => status.value === "play");
  const isPaused = computed(() => status.value === "pause");

  const voices = ref<SpeechSynthesisVoice[]>([]);
  const selectedVoice = shallowRef<SpeechSynthesisVoice | undefined>(undefined);

  function loadVoices() {
    if (!supported) return;
    const all = window.speechSynthesis.getVoices();
    const vi = all.filter((v) => v.lang.startsWith("vi"));
    voices.value = vi.length ? vi : all;
    const saved = voices.value.find((v) => v.voiceURI === settings.value.ttsVoice);
    selectedVoice.value = saved;
  }

  if (supported) {
    window.speechSynthesis.addEventListener?.("voiceschanged", loadVoices);
    loadVoices();
  }

  watch(
    () => settings.value.ttsVoice,
    (uri) => {
      selectedVoice.value = voices.value.find((x) => x.voiceURI === uri);
    },
  );

  // --- sequential chunk queue ---
  let queue: string[] = [];
  let index = 0;
  // Generation token: invalidates in-flight `onend`/`onerror` callbacks from a
  // previous utterance after a new speak()/stop(), avoiding stale advances.
  let gen = 0;
  let keepAlive: ReturnType<typeof setInterval> | null = null;

  function clearKeepAlive() {
    if (keepAlive) {
      clearInterval(keepAlive);
      keepAlive = null;
    }
  }

  // Chrome/Android stalls synthesis after ~15s of continuous speech. A periodic
  // pause()+resume() "kick" while we're playing revives it without disturbing a
  // user-initiated pause (guarded on status === "play").
  function startKeepAlive() {
    clearKeepAlive();
    keepAlive = setInterval(() => {
      if (status.value === "play") {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);
  }

  /**
   * Split text into <=~160-char chunks on sentence boundaries, hard-splitting
   * any single sentence that is still too long on comma/space breaks.
   */
  function chunk(text: string): string[] {
    const MAX = 160;
    const sentences = text.match(/[^.!?…]+[.!?…]*\s*/g) ?? [text];
    const out: string[] = [];
    let cur = "";
    const flush = () => {
      const t = cur.trim();
      if (t) out.push(t);
      cur = "";
    };
    for (const s of sentences) {
      if (cur && (cur + s).length > MAX) flush();
      cur += s;
      while (cur.length > MAX + 40) {
        let cut = cur.lastIndexOf(",", MAX);
        if (cut < 60) cut = cur.lastIndexOf(" ", MAX);
        if (cut < 60) cut = MAX;
        const piece = cur.slice(0, cut).trim();
        if (piece) out.push(piece);
        cur = cur.slice(cut);
      }
    }
    flush();
    return out;
  }

  function speakNext(myGen: number) {
    if (myGen !== gen) return;
    if (index >= queue.length) {
      status.value = "end";
      clearKeepAlive();
      return;
    }
    const u = new SpeechSynthesisUtterance(queue[index]);
    u.lang = "vi-VN";
    u.rate = settings.value.ttsRate;
    if (selectedVoice.value) u.voice = selectedVoice.value;
    const advance = () => {
      if (myGen !== gen) return;
      index += 1;
      if (status.value === "play") speakNext(myGen);
    };
    u.onend = advance;
    u.onerror = advance;
    window.speechSynthesis.speak(u);
  }

  function speak(content: string) {
    if (!supported) return;
    gen += 1;
    const myGen = gen;
    window.speechSynthesis.cancel();
    queue = chunk(content);
    index = 0;
    if (!queue.length) {
      status.value = "end";
      return;
    }
    status.value = "play";
    // Android no-ops a speak() issued immediately after cancel(); let the
    // engine settle first.
    setTimeout(() => {
      if (myGen !== gen) return;
      startKeepAlive();
      speakNext(myGen);
    }, 60);
  }

  function stop() {
    if (!supported) return;
    gen += 1; // invalidate pending callbacks before cancelling
    status.value = "end";
    queue = [];
    index = 0;
    clearKeepAlive();
    window.speechSynthesis.cancel();
  }

  // Pause ⇄ resume (bottom bar 3-state toggle).
  function toggle() {
    if (!supported) return;
    if (status.value === "play") {
      window.speechSynthesis.pause();
      status.value = "pause";
    } else if (status.value === "pause") {
      window.speechSynthesis.resume();
      status.value = "play";
    }
  }

  function setVoice(uri: string) {
    settings.value.ttsVoice = uri;
  }

  return {
    voices,
    isPlaying,
    isPaused,
    status,
    isSupported,
    speak,
    stop,
    toggle,
    setVoice,
  };
}
