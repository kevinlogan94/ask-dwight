// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Ask Dwight - Conquer AI. Win Business. Fear Nothing.',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'The Only Sales Tool That Can Outsell, Outwit, and Outweird the Competition.' },
        { name: 'keywords', content: 'AI sales assistant, sales automation, deal closing, AI for sales, sales optimization' },
        { name: 'robots', content: 'index, follow' },
        { name: 'author', content: 'Ask Dwight' },
        { property: 'og:title', content: 'Ask Dwight - Conquer AI. Win Business. Fear Nothing.' },
        { property: 'og:description', content: 'The Only Sales Tool That Can Outsell, Outwit, and Outweird the Competition.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://ask-dwight.com' },
        // { property: 'og:image', content: '/og-image.png' },
        // { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Ask Dwight - Conquer AI. Win Business. Fear Nothing.' },
        { name: 'twitter:description', content: 'The Only Sales Tool That Can Outsell, Outwit, and Outweird the Competition.' },
        // { name: 'twitter:image', content: '/og-image.png' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'canonical', href: 'https://ask-dwight.com' }
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