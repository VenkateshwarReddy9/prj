# CareerCompass

AI-powered career guidance platform built with Next.js, Express, and Claude AI.

## What it does

- **Career Assessment** — 8-question adaptive assessment. Claude AI analyzes answers and generates a career archetype, headline, job recommendations, and skill roadmap.
- **Smart Job Matching** — Semantic search across Adzuna and JSearch job APIs, with Pinecone vector similarity ranking.
- **Resume Optimizer** — PDF upload, ATS compatibility scoring, and section-by-section AI feedback.
- **Interview Prep** — Role-specific question generation, live answer evaluation, and session history.
- **AI Career Coach** — Persistent chat sessions with streaming Claude responses.
- **Market Insights** — Salary percentiles, hiring trends, top skills and locations with Recharts visualizations.
- **Skill Roadmap** — Personalized learning roadmap with progress tracking and milestone badges.

## Architecture

```
careercompass/
├── apps/
│   ├── web/          # Next.js 14 App Router (Clerk auth, TanStack Query, Zustand, Recharts)
│   └── api/          # Express + TypeScript (Prisma, BullMQ, Socket.IO, Stripe)
├── packages/
│   ├── types/        # Shared TypeScript interfaces
│   ├── validators/   # Shared Zod schemas
│   └── constants/    # Plan limits, queue names, cache keys
```

**Key tech stack:**

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, Tailwind CSS, Framer Motion, Recharts |
| Auth | Clerk |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL (Prisma ORM) |
| Cache / Queue | Redis, BullMQ |
| AI | Anthropic Claude (claude-sonnet-4-6) |
| Real-time | Socket.IO |
| Payments | Stripe |
| Storage | Supabase |
| Observability | Sentry, Pino |
| CI/CD | GitHub Actions |

## Local development

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker + Docker Compose (for Postgres and Redis)

### Setup

```bash
# Clone and install
git clone <repo>
cd careercompass
pnpm install

# Start Postgres and Redis
docker-compose up -d postgres redis

# Copy environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# Edit both .env files with your keys (see Environment Variables below)

# Run database migrations
cd apps/api
pnpm exec prisma migrate dev

# Start the full stack
cd ../..
pnpm dev
```

The web app runs on http://localhost:3000 and the API on http://localhost:3001.

### Environment variables

**`apps/api/.env`**

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/careercompass
REDIS_URL=redis://localhost:6379
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
SUPABASE_URL=https://...supabase.co
SUPABASE_SERVICE_KEY=...
PINECONE_API_KEY=...
PINECONE_INDEX=careercompass
RESEND_API_KEY=re_...
ADZUNA_APP_ID=...
ADZUNA_API_KEY=...
JSEARCH_API_KEY=...
SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
PORT=3001
```

**`apps/web/.env.local`**

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Useful commands

```bash
pnpm dev          # Start all apps in watch mode (via Turborepo)
pnpm build        # Build all apps
pnpm typecheck    # TypeScript across all packages
pnpm lint         # ESLint across all packages
pnpm test         # Vitest unit + integration tests
```

## Subscription plans

| Plan | Price | Assessments | Job matches | Chat messages | Resume uploads |
|---|---|---|---|---|---|
| Free | $0 | 1 | 5 | 20 total | 1 |
| Starter | $19/mo | 3/mo | 20/mo | 100/mo | 3 |
| Pro | $49/mo | unlimited | unlimited | unlimited | 10 |
| Enterprise | custom | unlimited | unlimited | unlimited | unlimited |

## Deployment

- **Web**: Vercel — connect the repo and set env vars. `vercel.json` is pre-configured.
- **API**: Railway — import the repo, set env vars, and Railway auto-detects the `Dockerfile`.
- **Database**: Supabase (managed Postgres) or Railway Postgres add-on.
- **Redis**: Upstash (serverless Redis) or Railway Redis add-on.

## Project structure details

```
apps/api/src/
├── config/         # Env validation (Zod), Prisma client, Redis client, Supabase
├── lib/            # Errors, logger (Pino), cost calculator
├── middleware/     # Auth (Clerk), rate limiting, plan gating, validation, error handler
├── prompts/        # Claude prompt builders (assessment, chat, interview, resume ATS)
├── queues/         # BullMQ workers: assessment AI, resume parse
├── routes/         # Express route handlers for each feature domain
├── services/       # AI service (Anthropic), billing (Stripe), notifications, resume parsing
└── socket/         # Socket.IO server (real-time AI progress, notifications)

apps/web/src/
├── app/
│   ├── (auth)/     # Sign-in, sign-up, onboarding wizard
│   ├── (dashboard)/# All authenticated pages
│   └── (marketing)/# Landing page, pricing, about, blog
├── components/     # Shared UI components per feature domain
├── hooks/          # TanStack Query hooks, Socket.IO hook
└── lib/            # Axios API client, Zustand stores
```
