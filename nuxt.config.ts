// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Ask Dwight',
      meta: [
        { name: 'description', content: 'Ask Dwight - Your sales AI assistant' }
      ]
    }
  },
  css: [
    '~/assets/main.css'
  ],
  modules: [
    '@nuxt/ui', 
    '@nuxt/icon', 
    '@vueuse/motion/nuxt', 
    "@formkit/auto-animate",
    'nuxt-gtag'
  ],
  gtag: {
    id: process.env.NUXT_PUBLIC_GOOGLE_ANALYTICS_MEASUREMENT_ID
  },
  compatibilityDate: '2025-04-05'
})