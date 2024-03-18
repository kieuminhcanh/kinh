import fs from 'fs'
const baseURL = '/kinh'
const isProduction = process.env.NODE_ENV === 'production'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    baseURL: isProduction ? `${baseURL}/` : '/',
    head: {
      title: 'Kinh Phật',
      link: [{ rel: 'icon', type: 'image/png', href: `${baseURL}/logo.png` }],
      meta: [
        { hid: 'og:title', name: 'og:title', content: 'Kinh Phật' },
        { hid: 'og:description', name: 'og:description', content: 'Nam mô Bổn Sư Thích Ca Mâu Ni Phật.' },
        { hid: 'og:image', name: 'og:image', content: 'https://kieuminhcanh.github.io/kinh/images/kinh-dieu-phap-lien-hoa.jpg' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },
  ssr: false,
  modules: ['@nuxt/content', 'vuetify-nuxt-module', '@vite-pwa/nuxt'],
  content: {
    documentDriven: true,
    // https://content.nuxtjs.org/api/configuration
    experimental: {
      clientDB: true,
    },
  },
  hooks: {
    async 'nitro:config'(nitroConfig) {
      if (nitroConfig.dev) {
        return
      }
      const files = await fs.readdirSync('content').map((file) => file.replaceAll('.md', ''))
      files.map((file) => {
        nitroConfig?.prerender?.routes?.push(`${baseURL}/${file}`)
      })
    },
  },
  vuetify: {
    vuetifyOptions: {
      theme: {
        defaultTheme: 'dark',
        themes: {
          dark: {
            colors: {
              background: '#111827',
              surface: '#1f2937',
            },
          },
        },
      },
    },
  },
  router: {
    options: {
      scrollBehaviorType: 'smooth',
    },
  },
  pwa: {
    // strategies: isProduction ? 'injectManifest' : 'generateSW',
    // srcDir: isProduction ? 'service-worker' : undefined,
    // filename: isProduction ? 'sw.ts' : undefined,
    registerType: 'autoUpdate',
    manifest: {
      name: 'Kinh',
      short_name: 'Kinh',
      theme_color: '#ffffff',
      scope: '/kinh/',
      start_url: '/kinh/',
      icons: [
        {
          src: 'logo-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'logo-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
    client: {
      installPrompt: true,
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
  },
  css: ['~/assets/css/main.scss'],
})
