// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  app: { baseURL: process.env.NODE_ENV === 'production' ? '/kinh/' : '/' },
  ssr: false,
  modules: ['@nuxt/content', 'vuetify-nuxt-module'],
  // nitro: {
  //   prerender: {
  //     ignore: ['/kinh/'],
  //   },
  // },
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
      nitroConfig.prerender.routes.push('/kinh/kinh-dia-tang')
      nitroConfig.prerender.routes.push('/kinh/kinh-dieu-phap-lien-hoa')
      nitroConfig.prerender.routes.push('/kinh/kinh-duoc-su')
      nitroConfig.prerender.routes.push('/kinh/kinh-pho-hien')
      nitroConfig.prerender.routes.push('/kinh/nghi-thuc-cong-phu-khuya')
      nitroConfig.prerender.routes.push('/kinh/khai-kinh')
      return
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
