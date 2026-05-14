import { ref, watch } from "vue";
import { createI18n } from "vue-i18n";
import vi from "../../locales/vi.json";
import en from "../../locales/en.json";

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
 * Runtime locale (NOT persisted). Default `vi` on every page load.
 * User can switch to `en` for the current session via SettingsDrawer;
 * reload restores `vi`. Intentional UX choice — Vietnamese is the canonical
 * language for the kinh content.
 */
export const currentLocale = ref<Locale>("vi");

export function setupI18n() {
  const i18n = createI18n({
    legacy: false,
    locale: "vi",
    fallbackLocale: "vi",
    messages,
  });
  // Sync runtime ref → i18n locale (no persistence layer).
  watch(
    currentLocale,
    (l) => {
      i18n.global.locale.value = l;
    },
    { immediate: true },
  );
  return i18n;
}
