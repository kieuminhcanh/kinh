import fs from 'fs'
const baseURL = '/kinh'
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    baseURL: process.env.NODE_ENV === 'production' ? `${baseURL}/` : '/',
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
  modules: ['@nuxt/content', 'vuetify-nuxt-module'],
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
      scrollBehaviorType: 'smooth'
    }
  },
  css: ['~/assets/css/main.scss'],
})
