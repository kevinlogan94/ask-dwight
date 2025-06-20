# Ask Dwight

**Conquer AI. Win Business. Fear Nothing.**

Ask Dwight is an AI-powered sales assistant designed to help sales professionals and teams close more deals, sharpen their outreach, and dominate their market. Built with Nuxt 3, Tailwind CSS v4, Nuxt UI Pro, and OpenAI, Dwight delivers intense, actionable sales guidance in real time, with a unique survival-expert personality.

## Features

- **AI Sales Chatbot:** Get tailored sales advice, outreach strategies, and deal-closing tactics.
- **Dynamic Suggestions:** Dwight proactively offers next steps and sharp replies to keep you moving forward.
- **Sales-Obsessed Persona:** Every interaction is delivered with Dwight's intense, no-nonsense, survival-driven style.
- **Modern Stack:** Built using Nuxt 3, Tailwind CSS v4, Nuxt UI Pro, @vueuse/motion, Supabase, and OpenAI.

---

> _"I'm Dwight. Selling is war, and I teach you how to win it without mercy. What goal can I help you crush today?"_

---

## Tech Stack

- **Frontend:** Nuxt 3, Tailwind CSS v4, Nuxt UI Pro
- **Database:** Supabase (PostgreSQL)
- **Edge Functions:** Supabase Edge Functions (Deno)
- **AI:** OpenAI API
- **Package Manager:** pnpm
- **Deployment:** Netlify (frontend), Supabase (backend)
- **Analytics:** nuxt-gtag

## Prerequisites

- Node.js 18+ 
- pnpm
- Supabase CLI
- OpenAI API key

## Initial Setup

### 1. Install Dependencies

```bash
# Install Supabase CLI (Windows with Scoop)
scoop install supabase

# Install Node dependencies
pnpm install
```

### 2. Authentication

```bash
# Login to Supabase
supabase login
```

### 3. Link to Supabase Project

```bash
# Link to your Supabase project
supabase link
```

## Environment Configuration

### Core Project Environment (`.env`)

Create `.env` in the root directory based on `.env.example`:

```bash
cp .env.example .env
# Then edit .env with your actual values
```

### Supabase Functions Environment (`supabase/functions/.env`)

Create `supabase/functions/.env` based on `supabase/functions/.env.example`:

```bash
cp supabase/functions/.env.example supabase/functions/.env
# Then edit supabase/functions/.env with your actual values
```

**Note:** For local development, update your main `.env` file with local Supabase URLs:
- `NUXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`
- Get the local anon key from `supabase status`

## Local Development

### Option 1: Full Local Stack (Recommended)

This runs everything locally - database, functions, and Nuxt app:

```bash
# 1. Start local Supabase (database)
supabase start

# 2. Serve Edge Functions locally
supabase functions serve

# 3. Get local credentials (in a new terminal)
supabase status
# Copy the anon key and update your .env with local URLs

# 4. Start Nuxt development server (in a new terminal)
pnpm dev
```

Your local setup will be available at:
- **Nuxt App:** http://localhost:3000
- **Supabase Studio:** http://localhost:54323
- **Edge Functions:** http://127.0.0.1:54321/functions/v1/

### Option 2: Functions Only Local

Run only Edge Functions locally while using production database:

```bash
# 1. Serve functions locally
supabase functions serve

# 2. Start Nuxt with production database
pnpm dev
```

### Option 3: Production Stack

Use production Supabase with local Nuxt development:

```bash
# Just start Nuxt (uses production Supabase URLs from .env)
pnpm dev
```

## Database Management

### Pulling Remote Schema

```bash
# Download production schema to local migrations
supabase db pull
```

### Making Schema Changes

```bash
# 1. Make changes in local Supabase Studio (http://localhost:54323)

# 2. Generate migration from local changes
supabase db diff --file your_feature_name

# 3. Apply to production
supabase db push
```

### Reset Local Database

```bash
# Reset local DB and apply all migrations
supabase db reset
```

## Edge Functions Development

### Serve Functions Locally

```bash
# Serve all functions
supabase functions serve

# Serve specific function
supabase functions serve chat-conversations
```

### Deploy Functions

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy chat-conversations
```

### Function Environment Variables

Functions automatically load environment variables from:
- `supabase/functions/.env` (local development)
- Supabase Dashboard > Edge Functions > Secrets (production)

## Available Scripts

```bash
# Development
pnpm dev              # Start Nuxt dev server
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm generate         # Generate static site

# Linting & Formatting
pnpm lint             # Run ESLint
pnpm format           # Format with Prettier

# Supabase
supabase start        # Start local Supabase
supabase stop         # Stop local Supabase
supabase status       # Check local Supabase status
supabase db reset     # Reset local database
```

## Project Structure

```
ask-dwight/
├── components/           # Vue components
├── composables/         # Vue composables
├── pages/              # Nuxt pages (auto-routed)
├── server/             # Nuxt server-side code
├── supabase/           # Supabase configuration
│   ├── functions/      # Edge Functions
│   │   ├── .env        # Functions environment variables
│   │   └── */          # Individual function directories
│   ├── migrations/     # Database migrations
│   └── config.toml     # Supabase configuration
├── .env                # Main environment variables
├── nuxt.config.ts      # Nuxt configuration
└── package.json        # Dependencies and scripts
```

## Deployment

### Frontend (Netlify)

The application automatically deploys to Netlify when changes are pushed to any branch. Each branch gets its own preview deployment URL.

### Backend (Supabase)

```bash
# Deploy database migrations
supabase db push

# Deploy Edge Functions
supabase functions deploy

# Set production secrets
supabase secrets set --env-file ./supabase/.env
```

## Troubleshooting

### Local Development Issues

**Database connection errors:**
- Ensure `supabase start` is running
- Check that `.env` has correct local URLs and anon key

**Function errors:**
- Verify `supabase/functions/.env` has required environment variables
- Check function logs with `supabase functions serve`

**Type generation:**
- Regenerate types with `supabase gen types typescript --local > types/supabase.ts`

### Common Commands

```bash
# Get local credentials
supabase status

# View function logs
supabase functions serve --debug

# Reset everything
supabase stop && supabase start

# Check what's gitignored
git check-ignore .env supabase/functions/.env
```

---

For more information:
- [Nuxt Documentation](https://nuxt.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Nuxt UI Pro Documentation](https://ui.nuxt.com/pro)
