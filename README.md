![Ask Dwight](./public/og-image.png)

# Ask Dwight

**Your Sales-Specialized LLM**

Try Ask-Dwight now and boost your team's sales with AI-driven cold outreach, lead scoring, and follow-up strategies. Ask-Dwight uses a first-of-its-kind, sales-specialized large language model to improve your sales processes and elevate your team. Try it for free today.

Built with Nuxt 3, Tailwind CSS v4, Nuxt UI Pro, and OpenAI, Dwight delivers intense, actionable sales guidance in real time, with a unique survival-expert personality.

## Features

- **AI-Powered Sales Strategy:** Get instant, tailored sales advice, outreach scripts, and deal-closing tactics.
- **Actionable Chat UI:** Interact with chat responses through quick actions like **Copy** and **Feedback (Thumbs Up/Down)**.
- **Time-Saved Metrics:** Visualize the time you reclaim with AI-driven efficiency, keeping you focused on high-value tasks.
- **Dynamic Suggestions:** Dwight proactively offers the next best steps to keep your momentum.
- **Cloud Sync:** Seamlessly sync your conversations and data across devices.
- **Expert AI Persona:** Dwight delivers direct, concise, and data-driven sales intelligence—tailored for experts who value efficiency over fluff.

---

> _"Goal acquired. Here is the data-driven path to execution. Actionable, concise, and built for experts. What is our next objective?"_

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
├── app/                  # Nuxt 4 app directory
│   ├── components/       # Vue components
│   ├── composables/      # Vue composables & services
│   ├── pages/           # Nuxt pages (auto-routed)
│   ├── models/          # TypeScript models & types
│   ├── stores/          # Pinia stores
│   ├── utils/           # Utility functions
│   ├── plugins/         # Nuxt plugins
│   ├── assets/          # Static assets
│   ├── app.vue          # Root Vue component
│   └── app.config.ts    # App configuration
├── public/              # Public static files
├── supabase/            # Supabase configuration
│   ├── functions/       # Edge Functions
│   │   ├── .env         # Functions environment variables
│   │   └── */           # Individual function directories
│   ├── migrations/      # Database migrations
│   └── config.toml      # Supabase configuration
├── .env                 # Main environment variables
├── nuxt.config.ts       # Nuxt configuration
└── package.json         # Dependencies and scripts
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

- Regenerate types with `supabase gen types typescript --local > app/models/supabase.ts`

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
