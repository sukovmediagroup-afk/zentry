import Link from "next/link";
import { Header } from "@/components/zentry/header";
import { MarketTicker } from "@/components/zentry/market-ticker";
import { Footer } from "@/components/zentry/footer";
import { DEMO_MARKET_TICKS, DEMO_VISITOR_COUNT } from "@/lib/demo-data";
import { fetchMarketTicks } from "@/lib/providers";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-static";
export const revalidate = 86400;

export const metadata: Metadata = buildMetadata({
  title: "Editorial Policy",
  description:
    "ARENA USA editorial policy — how we collect, classify, summarize, and publish news with AI assistance and human editorial oversight.",
  path: "/editorial-policy",
});

const LAST_UPDATED = "October 30, 2026";

export default async function EditorialPolicyPage() {
  const ticks = await fetchMarketTicks().catch(() => DEMO_MARKET_TICKS);

  return (
    <div className="min-h-screen flex flex-col">
      <Header visitorCount={DEMO_VISITOR_COUNT} />
      <MarketTicker items={ticks} />

      <article className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-amber-glow">Home</Link>
          <span>/</span>
          <span className="text-foreground/80">Editorial Policy</span>
        </nav>

        <header className="mb-8 pb-6 border-b border-bronze/15">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Editorial Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Last Updated:</strong> {LAST_UPDATED}
          </p>
        </header>

        <div className="prose-legal text-foreground/90 leading-relaxed space-y-6 text-sm sm:text-base">
          <Section title="1. Mission">
            <p>
              ARENA USA is committed to publishing accurate, original, and timely news for
              readers in the United States. We use AI agents to assist with classification and
              summarization, but every published article is reviewed by a human editor before
              it appears on the public site.
            </p>
          </Section>

          <Section title="2. Sources">
            <p>We only collect information from:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Official RSS feeds whose terms of service permit redistribution of headlines and summaries.</li>
              <li>Official APIs (government, regulatory, corporate press releases).</li>
              <li>Editorial submissions from our staff writers.</li>
              <li>Third-party parsers authenticated via our API (with admin-issued API keys).</li>
            </ul>
            <p className="mt-3">
              We do not scrape websites without permission. We do not bypass paywalls,
              authentication, or CAPTCHA. We do not republish entire copyrighted articles —
              only original summaries with attribution.
            </p>
          </Section>

          <Section title="3. AI Processing">
            <p>
              Our AI agents perform three tasks on every submitted article:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>
                <strong>Classification:</strong> Map the article to one of 16 categories with
                a confidence score (0-100%).
              </li>
              <li>
                <strong>Summarization:</strong> Generate a concise, original summary in
                American English — never copying entire sentences from the source.
              </li>
              <li>
                <strong>Duplicate detection:</strong> Compare against recent articles by
                content hash and title similarity.
              </li>
            </ul>
            <p className="mt-3">
              AI never invents quotes, statistics, names, dates, or sources. When the AI&apos;s
              confidence is low or evidence is insufficient, the article is held in the
              moderation queue for editor review rather than auto-published.
            </p>
          </Section>

          <Section title="4. Editorial Oversight">
            <p>
              Every article goes through a human editor before publication. Editors can:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Approve, reject, or schedule articles for future publication.</li>
              <li>Rewrite AI-generated titles, summaries, and excerpts.</li>
              <li>Override AI classification (change the primary category).</li>
              <li>Mark articles as <em>Breaking</em>, <em>Featured</em>, or <em>Pinned forever</em>.</li>
              <li>Add moderation notes explaining why an article was rejected.</li>
              <li>Archive or hard-delete articles.</li>
            </ul>
            <p className="mt-3">
              All editorial actions are logged in an immutable audit trail.
            </p>
          </Section>

          <Section title="5. Sensitivity Flags">
            <p>
              AI automatically flags sensitive content for extra review:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li><strong>Political content</strong> — elections, government, public policy.</li>
              <li><strong>Financial content</strong> — stocks, crypto, banking, commodities.</li>
              <li><strong>Health content</strong> — medical, wellness, fitness, evidence-based health.</li>
              <li><strong>Emergency content</strong> — natural disasters, public safety.</li>
              <li><strong>Public figures</strong> — reputationally sensitive content.</li>
            </ul>
            <p className="mt-3">
              Flagged articles are never auto-published, regardless of AI confidence. An editor
              must explicitly approve them.
            </p>
          </Section>

          <Section title="6. Retention Policy">
            <p>
              Public posts are kept in the live feed for <strong>48 hours</strong> after
              publication, then automatically archived. Archived articles remain searchable in
              the archive but no longer appear in the homepage feed.
            </p>
            <p className="mt-3">
              Editors can mark articles as <em>Pinned forever</em> to keep them in the live
              feed indefinitely. Pinned articles are typically breaking news, evergreen
              guides, or official announcements.
            </p>
          </Section>

          <Section title="7. Corrections">
            <p>
              If we publish an error, we correct it promptly. Corrections are made in-place
              with an editor&apos;s note appended to the article. Significant factual errors
              result in the article being unpublished and replaced with a correction notice.
            </p>
            <p className="mt-3">
              To report an error, email{" "}
              <a href="mailto:corrections@arena-usa.com" className="text-amber-glow hover:underline">
                corrections@arena-usa.com
              </a>
              .
            </p>
          </Section>

          <Section title="8. Independence">
            <p>
              ARENA USA is editorially independent. Advertisers and sponsors have no influence
              over editorial content. Sponsored content is clearly labeled. We do not accept
              paid placements in the news feed.
            </p>
          </Section>

          <Section title="9. AI Disclosure">
            <p>
              Articles that have been processed by AI agents display an <em>AI Summary</em>{" "}
              callout with a confidence score. Readers can see at a glance which parts of the
              article were AI-generated (the summary) versus human-written (the body).
            </p>
          </Section>

          <Section title="10. Feedback">
            <p>
              We welcome feedback on our editorial practices. Contact us at{" "}
              <a href="mailto:editorial@arena-usa.com" className="text-amber-glow hover:underline">
                editorial@arena-usa.com
              </a>
              .
            </p>
          </Section>
        </div>
      </article>

      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground mb-3 pt-6 border-t border-bronze/10 first:border-t-0 first:pt-0">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
