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
      // PWA registration handled by vite-plugin-pwa virtual module
      import("virtual:pwa-register")
        .then(({ registerSW }) => {
          registerSW({ immediate: true });
        })
        .catch(() => {});
    }
  },
} satisfies Theme;
