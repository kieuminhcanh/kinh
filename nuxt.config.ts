// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    baseURL: process.env.NODE_ENV === 'production' ? '/kinh/' : '/',
    head: {
      title: 'Kinh Phật',
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: 'https://kieuminhcanh.github.io/kinh/favicon.ico',
        },
      ],
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
      nitroConfig?.prerender?.routes?.push('/kinh/kinh-dia-tang')
      nitroConfig?.prerender?.routes?.push('/kinh/kinh-dieu-phap-lien-hoa')
      nitroConfig?.prerender?.routes?.push('/kinh/kinh-duoc-su')
      nitroConfig?.prerender?.routes?.push('/kinh/kinh-pho-hien')
      nitroConfig?.prerender?.routes?.push('/kinh/nghi-thuc-cong-phu-khuya')
      nitroConfig?.prerender?.routes?.push('/kinh/khai-kinh')
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
  css: ['~/assets/css/main.scss'],
})
