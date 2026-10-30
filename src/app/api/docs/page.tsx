import Link from "next/link";
import { Header } from "@/components/zentry/header";
import { MarketTicker } from "@/components/zentry/market-ticker";
import { Footer } from "@/components/zentry/footer";
import { DEMO_MARKET_TICKS, DEMO_VISITOR_COUNT } from "@/lib/demo-data";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = buildMetadata({
  title: "API Documentation",
  description: "ARENA USA public API. Submit articles, read the feed, integrate third-party parsers.",
  path: "/api/docs",
});

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header visitorCount={DEMO_VISITOR_COUNT} />
      <MarketTicker items={DEMO_MARKET_TICKS} />

      <div className="mx-auto w-full max-w-4xl flex-1 px-4 lg:px-6 py-8">
        <nav className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-amber-glow">Home</Link>
          <span>/</span>
          <span className="text-foreground/80">API Docs</span>
        </nav>

        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
          <span className="w-1.5 h-8 rounded-full bg-gradient-to-b from-amber-glow to-bronze" />
          API Documentation
        </h1>
        <p className="text-muted-foreground mb-8">
          ARENA USA exposes a small, stable public API. Authentication uses admin-issued API keys (Bearer tokens).
        </p>

        <div className="prose-docs space-y-8">
          <Section title="Authentication">
            <p>
              All write endpoints require an API key issued by an ARENA USA administrator. Keys are scoped
              (e.g. <Code>ingest</Code>, <Code>read</Code>) and rate-limited per minute.
            </p>
            <p>Send the key in one of three ways:</p>
            <Pre>{`# Authorization header (recommended)
curl -H "Authorization: Bearer arena_xxxxxxxx" https://arena-usa.vercel.app/api/ingest

# X-Api-Key header
curl -H "X-Api-Key: arena_xxxxxxxx" https://arena-usa.vercel.app/api/ingest

# Query string (less secure — only for quick testing)
curl "https://arena-usa.vercel.app/api/ingest?api_key=arena_xxxxxxxx"`}</Pre>
            <p>
              To obtain a key, an admin must sign in to the{" "}
              <Link href="/admin/api-keys" className="text-amber-glow hover:underline">API Keys panel</Link>{" "}
              and generate one. Keys are shown exactly once at creation.
            </p>
          </Section>

          <Section title="POST /api/ingest — Submit an article">
            <p>
              The core endpoint. Used by third-party news parsers to submit articles. ARENA USA AI agents
              auto-classify, summarize, and check for duplicates before storage.
            </p>
            <Pre>{`curl -X POST https://arena-usa.vercel.app/api/ingest \\
  -H "Authorization: Bearer arena_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Federal Reserve Holds Rates Steady",
    "text":  "The Federal Open Market Committee voted unanimously to maintain...",
    "url":   "https://example.com/source-article",
    "publishedAt": "2026-10-30T14:30:00Z",
    "coverImageUrl": "https://...",
    "categorySlug": "investing-banking",
    "tags": ["Federal Reserve", "Interest Rates"],
    "autoPublish": false
  }'`}</Pre>
            <p>Response (201 Created):</p>
            <Pre>{`{
  "ok": true,
  "duplicate": false,
  "articleId": "clk1abc...",
  "slug": "federal-reserve-holds-rates-steady-ab12",
  "status": "PENDING",
  "classification": {
    "primary_category": "investing-banking",
    "primary_category_name": "Investing & Banking",
    "subcategory": "Market Analysis",
    "editorial_confidence": 0.92,
    "moderation_recommendation": "publish"
  },
  "summary": {
    "proposed_title": "Federal Reserve Holds Rates Steady",
    "concise_summary": "The FOMC voted unanimously to maintain the federal funds rate...",
    "key_claims": ["..."]
  }
}`}</Pre>
            <p>Status values:</p>
            <ul className="list-disc list-inside space-y-1 text-foreground/90">
              <li><Code>PENDING</Code> — default; an editor must approve before publication (recommended).</li>
              <li><Code>PUBLISHED</Code> — only when <Code>autoPublish=true</Code> AND moderation recommendation is <Code>publish</Code>.</li>
              <li><Code>REJECTED</Code> — auto-rejected by moderation rules (sensitive content detected).</li>
            </ul>
            <p>
              Duplicate detection: if the same content hash or a very similar title already exists,
              the API returns 200 with <Code>{`"duplicate": true`}</Code> and the existing article ID. No new record is created.
            </p>
          </Section>

          <Section title="GET /api/articles — Public feed">
            <p>Returns published articles within the 48-hour retention window (or pinned forever).</p>
            <Pre>{`curl "https://arena-usa.vercel.app/api/articles?category=investing-banking&limit=20"`}</Pre>
            <p>Query parameters:</p>
            <ul className="list-disc list-inside space-y-1 text-foreground/90">
              <li><Code>category</Code> — filter by category slug (e.g. <Code>politics</Code>, <Code>technology-ai</Code>)</li>
              <li><Code>limit</Code> — page size, default 20, max 100</li>
              <li><Code>cursor</Code> — publishedAt ISO timestamp for pagination</li>
              <li><Code>includeBreaking</Code> — include breaking news (default <Code>true</Code>)</li>
            </ul>
          </Section>

          <Section title="GET /api/categories — Taxonomy">
            <p>Returns the canonical 16-category ARENA USA taxonomy.</p>
            <Pre>{`curl https://arena-usa.vercel.app/api/categories`}</Pre>
          </Section>

          <Section title="POST /api/heartbeat — Visitor counter">
            <p>
              Internal endpoint used by the live visitor counter. Sends a heartbeat every 30 seconds
              while the page is visible. Returns the count of sessions active in the last 60 seconds.
            </p>
            <Pre>{`POST /api/heartbeat
{ "sessionId": "s_...", "path": "/article/..." }

→ { "activeCount": 1284, "ok": true }`}</Pre>
          </Section>

          <Section title="GET /api/health — System status">
            <p>Public health check. Returns 503 if the database is unreachable.</p>
            <Pre>{`curl https://arena-usa.vercel.app/api/health`}</Pre>
          </Section>

          <Section title="Rate limits & error handling">
            <ul className="list-disc list-inside space-y-1 text-foreground/90">
              <li>Default rate limit: 60 requests per minute per API key (configurable).</li>
              <li>Exceeding the limit returns <Code>429 Too Many Requests</Code>.</li>
              <li>Invalid or disabled keys return <Code>401</Code> / <Code>403</Code>.</li>
              <li>Validation errors return <Code>422</Code> with a descriptive message.</li>
              <li>All write operations are logged in the audit trail.</li>
            </ul>
          </Section>

          <Section title="Edge Runtime compatibility">
            <p>
              ARENA USA AI agents run on TypeScript Edge Runtime inside Next.js route handlers —
              there are no Python workers. This means the entire platform (frontend + API + AI pipeline)
              deploys to Vercel from a single GitHub repository.
            </p>
            <p>
              Agents implemented in Phase 1:
            </p>
            <ul className="list-disc list-inside space-y-1 text-foreground/90">
              <li><Code>classifyAgent</Code> — maps raw text → category + moderation signal</li>
              <li><Code>summarizeAgent</Code> — generates concise original summary</li>
              <li><Code>dedupeAgent</Code> — content hash + title similarity check</li>
              <li><Code>contentHashFor</Code> — SHA-256 idempotency key</li>
            </ul>
            <p>
              Phase 2 will layer an LLM call (via Vercel AI SDK) on top of these extractive heuristics
              for higher-quality summaries and editorial decisions.
            </p>
          </Section>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-serif text-xl font-bold text-foreground border-b border-bronze/15 pb-2">{title}</h2>
      <div className="space-y-3 text-foreground/90 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="px-1.5 py-0.5 rounded bg-graphite/60 border border-bronze/15 text-amber-glow font-mono text-xs">{children}</code>;
}

function Pre({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto p-4 rounded-md bg-espresso border border-bronze/20 text-xs text-amber-glow/90 font-mono leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}
