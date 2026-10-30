# ARENA USA — AI-Powered American Media Platform

> Working title: **Zentry (ARENA USA Technology)** — an AI-curated digital media platform for U.S. readers, deployable on Vercel from a single GitHub repository.

## What this is

ARENA USA is a modern mass-media portal that uses **TypeScript Edge Runtime AI agents** (not Python bots) to collect, classify, summarize, and publish news across 16 editorial sections. The entire stack — frontend, API, AI pipeline, admin panel — runs on Next.js 16 and deploys to Vercel as a single unit.

## Phase 1 status — ✅ Vertical slice complete

This repository contains a **runnable Phase 1** that delivers:

- ✅ **Homepage** with market ticker, 16-category left nav, image-first feed, right sidebar (weather, horoscope, US events, ad slots, crypto donations), live visitor counter, breaking-news banner, retention notice.
- ✅ **Article pages** with SSR, JSON-LD `NewsArticle` schema, breadcrumbs, AI summary callout, related articles.
- ✅ **Category pages** with subcategory filtering.
- ✅ **Archive** + **Search** pages.
- ✅ **SEO infrastructure**: `sitemap.xml`, `robots.txt` (with AI crawler allowlist), `rss.xml`, OpenGraph + Twitter cards, schema.org JSON-LD (`NewsMediaOrganization`, `WebSite`, `NewsArticle`, `BreadcrumbList`).
- ✅ **Admin panel**: login (PBKDF2 + cookie session), dashboard with stats, articles manager, **API keys manager**, sources placeholder.
- ✅ **Public API** (`/api/articles`, `/api/categories`, `/api/heartbeat`, `/api/health`).
- ✅ **External ingest API** (`POST /api/ingest`) with API-key auth — third-party parsers can submit articles; AI agents auto-classify, summarize, and deduplicate.
- ✅ **TypeScript AI agents** (replaces Python workers): `classifyAgent`, `summarizeAgent`, `dedupeAgent`, `contentHashFor`.
- ✅ **API documentation** page at `/api/docs`.

## Architecture decisions

### Why TypeScript Edge Runtime instead of Python workers?

Vercel serverless functions have execution time limits and are not designed for long-running Python workers, schedulers, or Redis-backed queues. To deploy the entire project on Vercel from a single GitHub repository, ARENA USA implements all AI agents in TypeScript running on Next.js Route Handlers (`runtime = "nodejs"` for DB access, `runtime = "edge"` for lightweight inference).

Phase 2 will layer a Vercel AI SDK / `z-ai-web-dev-sdk` LLM call on top of the current extractive heuristics.

### Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 + shadcn/ui (New York) |
| Database | Prisma ORM + SQLite (dev) / PostgreSQL (prod) |
| Auth | PBKDF2 via SubtleCrypto + DB-backed sessions |
| AI | TypeScript Edge agents (Phase 2: Vercel AI SDK + z-ai-web-dev-sdk) |
| Hosting | Vercel (frontend + API + AI agents in one deploy) |
| Source control | GitHub |

## Local development

```bash
# 1. Install dependencies
bun install   # or: npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local — set ADMIN_EMAIL and ADMIN_PASSWORD

# 3. Push database schema
bun run db:push

# 4. Seed categories and admin
bun run scripts/seed.ts
bun run scripts/seed-articles.ts   # optional demo content

# 5. Run dev server
bun run dev   # → http://localhost:3000

# 6. Lint and type-check
bun run lint
npx tsc --noEmit
```

## Admin access

1. Visit `/admin/login`
2. Sign in with the credentials from your `.env.local` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`). On first request to `/api/admin/login`, a default admin user is auto-created from these env vars.

## Connecting a third-party parser

1. Sign in to `/admin/api-keys` and create a key with scope `ingest`.
2. Copy the raw key — it is shown **once**.
3. From your parser:

```bash
curl -X POST https://arena-usa.vercel.app/api/ingest \
  -H "Authorization: Bearer arena_xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "...",
    "text":  "...",
    "url":   "https://source-article-url",
    "categorySlug": "technology-ai",
    "autoPublish": false
  }'
```

AI agents will auto-classify, summarize, and check for duplicates. By default the article lands in `PENDING` status — an editor must approve before publication.

Full API documentation: `/api/docs`

## Deployment to Vercel

1. Push this repository to GitHub.
2. In Vercel, **New Project** → import the repo.
3. Set environment variables (copy from `.env.example`):
   - `DATABASE_URL` — use Vercel Postgres, Neon, Supabase, or Railway (change Prisma `provider` from `sqlite` to `postgresql` in `prisma/schema.prisma`).
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` — strong production values.
   - `NEXT_PUBLIC_SITE_URL` — your Vercel URL.
4. Build command: `next build` (already configured).
5. After deploy: visit `/admin/login`, then run `bun run scripts/seed.ts` against the production database (or seed via a one-off Vercel function).

## Project structure

```
prisma/
  schema.prisma               # Full data model (User, Article, Category, Source, ApiKey, AgentRun, PublicationJob, VisitorSession, AdCampaign, DonationAddress, ...)
  seed.ts                     # Categories + admin
src/
  app/
    layout.tsx                # Root layout with metadata, fonts, theme
    page.tsx                  # Homepage — ticker + feed + sidebars
    globals.css               # ARENA USA design system (espresso + bronze)
    article/[slug]/           # Article detail page
    category/[slug]/          # Category landing page
    archive/                  # Archive (all past articles)
    search/                   # Search page
    sitemap.ts                # Dynamic sitemap
    robots.ts                 # robots.txt with AI crawler allowlist
    rss.xml/route.ts          # RSS feed
    admin/
      layout.tsx              # Authenticated admin shell
      page.tsx                # Dashboard
      login/                  # Login page
      articles/               # Articles manager + new + [id]
      api-keys/               # API key manager
      sources/                # Sources (Phase 2 placeholder)
    api/
      health/route.ts         # System health check
      heartbeat/route.ts      # Visitor counter
      categories/route.ts     # Public taxonomy API
      articles/route.ts       # Public feed API (48h retention)
      ingest/route.ts         # ⭐ External ingest (API-key auth)
      agent/
        summarize/route.ts    # AI summarize agent
        classify/route.ts     # AI classify agent
      admin/
        login/route.ts        # Admin session auth
        articles/route.ts     # Admin article CRUD
        api-keys/route.ts     # API key management
      docs/page.tsx           # Public API documentation
  components/
    zentry/                   # ARENA-specific UI: Header, MarketTicker, CategoryNav, ArticleCard, RightSidebar, VisitorCounter, Footer, AdminShell
    ui/                       # shadcn/ui base components
  lib/
    constants.ts              # 16 categories, ticker symbols, donations, zodiac
    seo.ts                    # Metadata + JSON-LD builders
    auth.ts                   # PBKDF2 + sessions
    crypto.ts                 # Edge-safe random + sha256
    api-key.ts                # API-key verification middleware
    agents.ts                 # ⭐ TypeScript AI agents (classify, summarize, dedupe)
    db.ts                     # Prisma client singleton
    demo-data.ts              # Phase 1 demo content
```

## Acceptance checklist (Phase 1)

- [x] Application builds without errors
- [x] Database schema pushes on a clean database
- [x] Homepage renders with all 16 sections, ticker, sidebars
- [x] Article pages render with JSON-LD structured data
- [x] Sitemap, robots.txt, RSS feed all return 200
- [x] Admin login + dashboard work
- [x] API key creation works (key shown once, hash stored)
- [x] External ingest endpoint accepts API-key auth
- [x] AI agents classify + summarize + deduplicate
- [x] Duplicate submission returns 200 with `duplicate: true`
- [x] Audit logs record admin actions
- [x] No TypeScript errors in `src/`
- [x] No ESLint errors

## What comes next — Phase 2

- Real RSS feed registry + 10-minute polling scheduler (TypeScript cron via Vercel Cron).
- Vercel AI SDK integration for higher-quality LLM summaries.
- Article approval workflow (`/admin/articles/[id]` editor).
- Telegram + Pinterest publication adapters (TypeScript, via official APIs).
- Real market data, weather, and event providers.
- 48-hour retention job.
- Stripe payments for ad campaigns.

## License

Proprietary — ARENA USA. All rights reserved.
