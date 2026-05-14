import { useLocalStorage } from "@vueuse/core";
import { watchEffect } from "vue";

export type Theme = "light" | "dark" | "sepia";
export type Locale = "vi" | "en" | "";
export type AutoScrollSpeed = "slow" | "normal" | "fast";

export type Settings = {
  theme: Theme;
  fontSize: number; // px, 16..28
  lineHeight: number; // 1.6..2.4
  gridColumns: 1 | 2 | 3;
  ttsRate: number; // 0.5..2
  ttsVoice: string; // voiceURI
  fontFamily: "serif" | "sans";
  locale: Locale; // '' = uninitialized, resolved on first boot
  autoScrollSpeed: AutoScrollSpeed;
  eyeRestEnabled: boolean; // spec 011: opt-in reminder every 25 min
};

const DEFAULT: Settings = {
  theme: "sepia",
  fontSize: 18,
  lineHeight: 1.8,
  gridColumns: 1,
  ttsRate: 1,
  ttsVoice: "",
  fontFamily: "serif",
  locale: "",
  autoScrollSpeed: "normal",
  eyeRestEnabled: false,
};

let _settings: ReturnType<typeof useLocalStorage<Settings>> | null = null;

export function useSettings() {
  if (!_settings) {
    _settings = useLocalStorage<Settings>("kinh:settings", DEFAULT, {
      mergeDefaults: true,
    });
    // A11y migration: silent bump legacy values below new floors.
    const s = _settings.value;
    if (s.fontSize < 16) s.fontSize = 16;
    if (s.lineHeight < 1.6) s.lineHeight = 1.6;
  }
  return _settings;
}

/**
 * Apply settings → DOM (CSS vars, data-theme).
 * Call once from theme enhanceApp in client.
 */
export function applySettings() {
  if (typeof document === "undefined") return;
  const settings = useSettings();
  watchEffect(() => {
    const s = settings.value;
    document.documentElement.setAttribute("data-theme", s.theme);
    document.documentElement.classList.toggle("dark", s.theme === "dark");
    const root = document.documentElement.style;
    root.setProperty("--reader-font-size", `${s.fontSize}px`);
    root.setProperty("--reader-line-height", String(s.lineHeight));
    root.setProperty(
      "--reader-font-family",
      s.fontFamily === "serif"
        ? `'Noto Serif', Georgia, serif`
        : `'Be Vietnam Pro', system-ui, sans-serif`,
    );
  });
}
