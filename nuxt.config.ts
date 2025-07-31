// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: "Ask-Dwight App | Your Sales-Specialized LLM",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "Try Ask-Dwight now and boost your team's sales with AI-driven cold outreach, lead scoring, and follow-up strategies. Ask-Dwight uses a first-of-its-kind, sales-specialized large language model to improve your sales processes and elevate your team. Try it for free today." },
        {
          name: "keywords",
          content: "AI sales assistant, sales automation, deal closing, AI for sales, sales optimization",
        },
        { name: "robots", content: "index, follow" },
        { name: "author", content: "Ask-Dwight" },
        { property: "og:title", content: "Ask-Dwight App | Your Sales-Specialized LLM" },
        {
          property: "og:description",
          content: "Try Ask-Dwight now and boost your team's sales with AI-driven cold outreach, lead scoring, and follow-up strategies. Ask-Dwight uses a first-of-its-kind, sales-specialized large language model to improve your sales processes and elevate your team. Try it for free today.",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://ask-dwight.com" },
        { property: 'og:image', content: '/og-image.png' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: "twitter:title", content: "Ask-Dwight App | Your Sales-Specialized LLM" },
        {
          name: "twitter:description",
          content: "Try Ask-Dwight now and boost your team's sales with AI-driven cold outreach, lead scoring, and follow-up strategies. Ask-Dwight uses a first-of-its-kind, sales-specialized large language model to improve your sales processes and elevate your team. Try it for free today.",
        },
        { name: 'twitter:image', content: '/og-image.png' },
        { name: "apple-mobile-web-app-title", content: "Ask-Dwight" }
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicons/favicon.svg" },
        { rel: "apple-touch-icon", href: "/favicons/apple-touch-icon.png" },
        { rel: "icon", type: "image/png", sizes: "96x96", href: "/favicons/favicon-96x96.png" },
        { rel: "manifest", href: "/favicons/site.webmanifest" },
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" }, // Fallback for older browsers
        { rel: "canonical", href: "https://ask-dwight.com" },
      ],
    },
  },
  css: ["~/assets/main.css"],
  modules: [
    "@nuxt/ui-pro",
    "@nuxt/icon",
    "@vueuse/motion/nuxt",
    "@formkit/auto-animate",
    "nuxt-gtag",
    "@pinia/nuxt",
    "@nuxtjs/supabase",
    "@nuxt/image",
    "@nuxtjs/google-fonts",
  ],
  googleFonts: {
    families: {
      Fredoka: true,
    },
  },
  gtag: {
    id: process.env.NUXT_PUBLIC_GOOGLE_ANALYTICS_MEASUREMENT_ID,
    enabled: process.env.NODE_ENV === "production",
  },
  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/confirm',
      exclude: ['/auth', '/auth/**'],
    },
  },
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: "2025-04-05",
});
