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
  modules: ['@nuxt/ui', '@nuxt/icon'],
  compatibilityDate: '2024-11-01'
})