import { ref, onBeforeUnmount } from "vue";

// Minimal types for the experimental Web Speech Recognition API.
// (lib.dom does not include them.)
interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
  resultIndex: number;
}
interface SpeechRecognitionErrorLike {
  error: string;
}
interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

export type VoiceCommand = "play" | "pause" | "resume" | "stop";

// Vietnamese phrase → command. Keys are normalized (lowercase, single spaces).
const PHRASE_MAP: { phrase: string; command: VoiceCommand }[] = [
  { phrase: "tạm dừng", command: "pause" }, // must precede "dừng"
  { phrase: "tiếp tục", command: "resume" },
  { phrase: "dừng", command: "stop" },
  { phrase: "đọc", command: "play" },
  { phrase: "phát", command: "play" },
];

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

function matchCommand(transcript: string): VoiceCommand | null {
  const t = normalize(transcript);
  for (const { phrase, command } of PHRASE_MAP) {
    if (t.includes(phrase)) return command;
  }
  return null;
}

export function useVoiceCommand(onCommand: (cmd: VoiceCommand) => void) {
  const Ctor = getRecognitionCtor();
  const isSupported = ref(Ctor !== null);
  const isListening = ref(false);

  let recognition: SpeechRecognitionLike | null = null;
  let manualStop = false;

  function createRecognition(): SpeechRecognitionLike | null {
    if (!Ctor) return null;
    const r = new Ctor();
    r.continuous = true;
    r.interimResults = false;
    r.lang = "vi-VN";
    r.onresult = (e) => {
      // Walk new final results since last index.
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i]?.[0]?.transcript ?? "";
        const cmd = matchCommand(transcript);
        if (cmd) onCommand(cmd);
      }
    };
    r.onerror = (e) => {
      // Fatal errors → end session. Otherwise let onend handle restart.
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        manualStop = true;
        isListening.value = false;
        isSupported.value = false; // hide button after permission denied
      }
    };
    r.onend = () => {
      // Browser auto-stops on silence/error → restart if user still wants to listen.
      if (!manualStop && isListening.value) {
        try {
          r.start();
        } catch {
          isListening.value = false;
        }
      } else {
        isListening.value = false;
      }
    };
    return r;
  }

  function start() {
    if (!isSupported.value) return;
    if (isListening.value) return;
    manualStop = false;
    recognition = createRecognition();
    if (!recognition) return;
    try {
      recognition.start();
      isListening.value = true;
    } catch {
      // Some browsers throw if start() is called rapidly after stop().
      isListening.value = false;
      recognition = null;
    }
  }

  function stop() {
    if (!recognition) {
      isListening.value = false;
      return;
    }
    manualStop = true;
    try {
      recognition.stop();
    } catch {
      // ignore
    }
    isListening.value = false;
    recognition = null;
  }

  function toggle() {
    if (isListening.value) stop();
    else start();
  }

  onBeforeUnmount(() => {
    if (recognition) {
      manualStop = true;
      try {
        recognition.abort();
      } catch {
        // ignore
      }
      recognition = null;
    }
  });

  return { isSupported, isListening, start, stop, toggle };
}
