import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import Layout from "./Layout.vue";
import { applySettings } from "./composables/useSettings";
import { setupI18n } from "./i18n";
import "./style.css";

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.use(setupI18n());
    if (typeof window !== "undefined") {
      // Apply persisted user settings to DOM
      applySettings();
      // Suppress the browser's long-press context menu — on Android this is the
      // image "Download / Share" menu that pops up when a finger rests on a kinh
      // image (e.g. while auto-scrolling). CSS user-select/touch-callout don't
      // cover it; preventing `contextmenu` does. Real text inputs keep theirs.
      document.addEventListener("contextmenu", (e) => {
        const el = e.target as HTMLElement | null;
        if (el?.closest("input, textarea, [contenteditable]")) return;
        e.preventDefault();
      });
      // PWA registration handled by vite-plugin-pwa virtual module
      import("virtual:pwa-register")
        .then(({ registerSW }) => {
          registerSW({ immediate: true });
        })
        .catch(() => {});
    }
  },
} satisfies Theme;
