import { watch } from "vue";
import { createI18n } from "vue-i18n";
import vi from "../../locales/vi.json";
import en from "../../locales/en.json";
import { useSettings } from "./composables/useSettings";

export type Locale = "vi" | "en";

const messages = { vi, en };

// Vite `define` does not propagate into VitePress' Node SSR render step,
// so vue-i18n's ESM bundler build references undefined globals at SSR time.
// Provide safe defaults on globalThis BEFORE `createI18n` runs.
const g = globalThis as Record<string, unknown>;
if (g.__VUE_PROD_DEVTOOLS__ === undefined) g.__VUE_PROD_DEVTOOLS__ = false;
if (g.__VUE_OPTIONS_API__ === undefined) g.__VUE_OPTIONS_API__ = true;
if (g.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ === undefined)
  g.__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false;
if (g.__INTLIFY_PROD_DEVTOOLS__ === undefined) g.__INTLIFY_PROD_DEVTOOLS__ = false;
if (g.__INTLIFY_JIT_COMPILATION__ === undefined) g.__INTLIFY_JIT_COMPILATION__ = false;
if (g.__INTLIFY_DROP_MESSAGE_COMPILER__ === undefined) g.__INTLIFY_DROP_MESSAGE_COMPILER__ = false;

/**
 * Detect default locale: respect saved setting, else navigator language, else 'vi'.
 */
function detectDefault(): Locale {
  if (typeof navigator === "undefined") return "vi";
  return navigator.language?.toLowerCase().startsWith("vi") ? "vi" : "en";
}

export function setupI18n() {
  const settings = useSettings();
  // First boot: locale = '' → pick smart default and persist
  if (!settings.value.locale) {
    settings.value.locale = detectDefault();
  }
  const i18n = createI18n({
    legacy: false,
    locale: settings.value.locale || "vi",
    fallbackLocale: "vi",
    messages,
  });
  // Keep i18n in sync with settings.locale (client only — settings persist on client)
  if (typeof window !== "undefined") {
    watch(
      () => settings.value.locale,
      (l) => {
        if (l) i18n.global.locale.value = l;
      },
    );
  }
  return i18n;
}
