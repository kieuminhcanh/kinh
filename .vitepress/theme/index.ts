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
      // Suppress the browser's context menu everywhere. On Android a long-press
      // on a kinh image opens a "Download / Share" menu, and a press on text
      // opens a selection toolbar — both distract elderly readers. The reader
      // has no text inputs (only a slider + dropdown) so blocking it app-wide
      // is safe. CSS user-select/touch-callout don't cover this; preventing
      // `contextmenu` does.
      document.addEventListener("contextmenu", (e) => e.preventDefault());
      // Disable pinch / double-tap zoom. The reader has its own font-size
      // controls (16–80px), so browser zoom is redundant and elderly users
      // often trigger it accidentally, ending up at an awkward scale. Tighten
      // VitePress's default viewport meta to lock the scale.
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute(
          "content",
          "width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no",
        );
      }
      // PWA registration handled by vite-plugin-pwa virtual module
      import("virtual:pwa-register")
        .then(({ registerSW }) => {
          registerSW({ immediate: true });
        })
        .catch(() => {});
    }
  },
} satisfies Theme;
