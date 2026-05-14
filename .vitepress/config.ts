import { defineConfig } from "vitepress";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { kinhCatalog } from "./data/kinh";

/**
 * Auto-build sidebar entries for a multi-chapter kinh by scanning <slug>/ at repo root.
 */
function chaptersOf(slug: string) {
  const dir = join(process.cwd(), slug);
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "index.md")
    .sort();
  return files.map((file) => {
    const name = file.replace(/\.md$/, "");
    // Filename pattern: NN-pham-N-<slug>.md → derive label from slug
    // Use the number prefix as chapter label fallback; real titles set in frontmatter
    const num = parseInt(name.slice(0, 2), 10);
    const rest = name.slice(3).replace(/^pham-\d+-/, "");
    const label = `Phẩm ${num}: ${rest.replace(/-/g, " ")}`;
    return { text: label, link: `/${slug}/${name}` };
  });
}

const sidebar: Record<string, any> = {};
for (const k of kinhCatalog) {
  if (k.chapters) {
    sidebar[`/${k.slug}/`] = [
      {
        text: k.title,
        items: [{ text: "Mục lục", link: `/${k.slug}/` }, ...chaptersOf(k.slug)],
      },
    ];
  }
}

export default defineConfig({
  base: "/kinh/",
  title: "Kinh Phật",
  description: "Nam mô Bổn Sư Thích Ca Mâu Ni Phật.",
  lang: "vi",
  appearance: true,
  cleanUrls: true,
  srcExclude: ["**/README.md", "**/TODO.md", "**/AGENTS.md", ".ai/**"],
  lastUpdated: false,

  head: [
    ["link", { rel: "icon", type: "image/png", href: "/kinh/logo.png" }],
    ["meta", { name: "theme-color", content: "#1f2937" }],
    ["meta", { property: "og:title", content: "Kinh Phật" }],
    ["meta", { property: "og:description", content: "Nam mô Bổn Sư Thích Ca Mâu Ni Phật." }],
    [
      "meta",
      {
        property: "og:image",
        content: "https://kieuminhcanh.github.io/kinh/images/kinh-dieu-phap-lien-hoa.jpg",
      },
    ],
  ],

  themeConfig: {
    logo: "/logo.png",
    siteTitle: "Kinh",
    nav: [{ text: "Trang chủ", link: "/" }],
    sidebar,
    // Full-width reader: disable right outline aside ("Trên trang này").
    // Left sidebar still configured below so ChapterPagerTop can read
    // theme.sidebar data to compute prev/next; rendering hidden via CSS.
    aside: false,
    outline: false,
    docFooter: { prev: "Phẩm trước", next: "Phẩm sau" },
    darkModeSwitchLabel: "Giao diện",
    sidebarMenuLabel: "Mục lục",
    returnToTopLabel: "Lên đầu trang",
    externalLinkIcon: false,
  },

  vite: {
    define: {
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
      __INTLIFY_PROD_DEVTOOLS__: false,
      __INTLIFY_JIT_COMPILATION__: false,
      __INTLIFY_DROP_MESSAGE_COMPILER__: false,
    },
    plugins: [
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        manifest: {
          id: "/kinh/",
          name: "Kinh Phật",
          short_name: "Kinh",
          description: "Nam mô Bổn Sư Thích Ca Mâu Ni Phật.",
          theme_color: "#1f2937",
          background_color: "#ffffff",
          display: "standalone",
          scope: "/kinh/",
          start_url: "/kinh/",
          icons: [
            { src: "logo-192.png", sizes: "192x192", type: "image/png" },
            { src: "logo-512.png", sizes: "512x512", type: "image/png" },
          ],
        },
        workbox: {
          // Precache all static assets, including web fonts + JSON locale files.
          // Raise size cap so larger kinh HTML / hero images aren't skipped.
          globPatterns: ["**/*.{js,css,html,png,svg,ico,jpg,jpeg,webp,woff,woff2,ttf,json}"],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          cleanupOutdatedCaches: true,
          navigateFallback: "/kinh/",
          // Don't hijack non-navigation requests (assets, font CDN).
          navigateFallbackDenylist: [/^\/api\//, /\.[a-z0-9]+$/i],
          // Cache Google Fonts (CSS + woff2 files served from gstatic) so the
          // Vietnamese serif/sans typefaces remain available offline.
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-css",
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-webfonts",
                expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // Locally hosted /kinh/images/* — already covered by precache,
              // but use stale-while-revalidate as a safety net for any
              // image not picked up by globPatterns at build time.
              urlPattern: ({ request }) => request.destination === "image",
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "images",
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 90 },
              },
            },
          ],
        },
      }),
    ],
  },
});
