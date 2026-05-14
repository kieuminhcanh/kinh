import { useColorMode, useLocalStorage } from "@vueuse/core";
import { watch, watchEffect } from "vue";

export type Theme = "light" | "dark" | "auto";
export type AutoScrollSpeed = "slow" | "normal" | "fast";

export type Settings = {
  theme: Theme;
  fontSize: number; // px, 16..60
  lineHeight: number; // 1.6..2.4
  gridColumns: 1 | 2 | 3;
  ttsRate: number; // 0.5..2
  ttsVoice: string; // voiceURI
  fontFamily: "serif" | "sans";
  autoScrollSpeed: AutoScrollSpeed;
};

const DEFAULT: Settings = {
  theme: "auto",
  fontSize: 18,
  lineHeight: 1.8,
  gridColumns: 1,
  ttsRate: 1,
  ttsVoice: "",
  fontFamily: "serif",
  autoScrollSpeed: "normal",
};

let _settings: ReturnType<typeof useLocalStorage<Settings>> | null = null;

export function useSettings() {
  if (!_settings) {
    _settings = useLocalStorage<Settings>("kinh:settings", DEFAULT, {
      mergeDefaults: true,
    });
    const s = _settings.value as Settings & { locale?: unknown };
    // A11y migration: silent bump legacy values below new floors.
    if (s.fontSize < 16) s.fontSize = 16;
    if (s.lineHeight < 1.6) s.lineHeight = 1.6;
    // Spec 016: drop sepia → migrate silently to auto.
    if ((s.theme as string) === "sepia") s.theme = "auto";
    // Locale dropped from persisted settings — always defaults to vi at runtime.
    if ("locale" in s) delete s.locale;
  }
  return _settings;
}

/**
 * Apply settings → DOM.
 *
 * Theme: piped into VitePress's own appearance store (VueUse `useColorMode`
 *   bound to localStorage key `vitepress-theme-appearance`). VitePress reads
 *   the same store internally and toggles `html.dark` accordingly. Two-way
 *   sync so the VPNav theme toggle and our SettingsDrawer stay aligned.
 * Reader CSS vars: written directly on documentElement.
 *
 * Call once from theme enhanceApp in the client.
 */
export function applySettings() {
  if (typeof document === "undefined") return;
  const settings = useSettings();

  // Bind to VitePress's storage. VueUse caches per storageKey → same ref
  // instance as the one VitePress uses internally.
  const mode = useColorMode({
    storageKey: "vitepress-theme-appearance",
    emitAuto: true,
    initialValue: settings.value.theme,
  });

  // settings → VitePress
  watch(
    () => settings.value.theme,
    (t) => {
      if (mode.value !== t) mode.value = t;
    },
    { immediate: true },
  );

  // VitePress (e.g. VPNav toggle) → settings
  watch(mode, (m) => {
    const next = (m === "dark" || m === "light" ? m : "auto") satisfies Theme;
    if (settings.value.theme !== next) settings.value.theme = next;
  });

  // Reader CSS vars
  watchEffect(() => {
    const s = settings.value;
    const root = document.documentElement.style;
    root.setProperty("--reader-font-size", `${s.fontSize}px`);
    // Unitless line-height multiplier — scales automatically with font-size.
    // User controls directly via slider (1.6..2.4); no auto floor so the
    // setting always takes effect.
    root.setProperty("--reader-line-height", String(s.lineHeight));
    root.setProperty(
      "--reader-font-family",
      s.fontFamily === "serif"
        ? `'Noto Serif', Georgia, serif`
        : `'Be Vietnam Pro', system-ui, sans-serif`,
    );
  });
}
