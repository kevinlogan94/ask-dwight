# Ask Dwight

**Conquer AI. Win Business. Fear Nothing.**

Ask Dwight is an AI-powered sales assistant designed to help sales professionals and teams close more deals, sharpen their outreach, and dominate their market. Built with Nuxt 3, Tailwind CSS v4, Nuxt UI, and OpenAI, Dwight delivers intense, actionable sales guidance in real time, with a unique survival-expert personality.

- **AI Sales Chatbot:** Get tailored sales advice, outreach strategies, and deal-closing tactics.
- **Dynamic Suggestions:** Dwight proactively offers next steps and sharp replies to keep you moving forward.
- **Sales-Obsessed Persona:** Every interaction is delivered with Dwight's intense, no-nonsense, survival-driven style.
- **Modern Stack:** Built using Nuxt 3, Tailwind CSS v4, Nuxt UI, @vueuse/motion, Netlify Forms, and nuxt-gtag for analytics.

---

> _"I'm Dwight. Selling is war, and I teach you how to win it without mercy. What goal can I help you crush today?"_

---

For more on Nuxt, see the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction).

## Setup

1. Install Supabase CLI:

```bash
scoop install supabase
```

2. Login to Supabase:

```bash
supabase login
```

3. Install dependencies:

```bash
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Deployment

### Netlify

The application automatically deploys to Netlify when changes are pushed to any branch. Each branch gets its own preview deployment URL.

### Supabase Functions

Deploy edge functions to Supabase:

```bash
supabase functions deploy hello-world --project-ref <your-project-ref>
```

Note: Replace `<your-project-ref>` with your Supabase project reference ID. You can find this in your project settings or in your `.env` file.

### Production Build

To build the application locally:

```bash
pnpm build
```

Locally preview the production build:

```bash
pnpm preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
