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
    // filename: isProduction ? 'sw.js' : undefined,
    registerType: 'autoUpdate',
    manifest: {
      id: '/kinh/',
      name: 'Kinh',
      short_name: 'Kinh',
      theme_color: '#ffffff',
      scope: `${baseURL}/`,
      start_url: `${baseURL}/`,
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
      runtimeCaching: [
        {
          urlPattern: new RegExp(`^http:\/\/kieuminhcanh\.test\/kinh\/.*`, 'i'),
          handler: 'NetworkFirst',
        },
      ],
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    devOptions: {
      enabled: false,
      suppressWarnings: true,
      navigateFallback: '/kinh/',
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
  },
  css: ['~/assets/css/main.scss'],
})
