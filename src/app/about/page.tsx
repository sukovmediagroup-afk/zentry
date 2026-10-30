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
  title: "About ARENA USA",
  description:
    "ARENA USA is an AI-powered American digital media platform. Trending news, finance, technology, lifestyle, and culture — curated by AI agents and reviewed by editors.",
  path: "/about",
});

export default async function AboutPage() {
  const ticks = await fetchMarketTicks().catch(() => DEMO_MARKET_TICKS);

  return (
    <div className="min-h-screen flex flex-col">
      <Header visitorCount={DEMO_VISITOR_COUNT} />
      <MarketTicker items={ticks} />

      <article className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-amber-glow">Home</Link>
          <span>/</span>
          <span className="text-foreground/80">About</span>
        </nav>

        <header className="mb-8 pb-6 border-b border-bronze/15">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-3">
            About ARENA USA
          </h1>
          <p className="text-sm text-muted-foreground">
            AI-powered American digital media — curated by AI agents, reviewed by editors.
          </p>
        </header>

        <div className="prose-legal text-foreground/90 leading-relaxed space-y-6 text-sm sm:text-base">
          <Section title="Our mission">
            <p>
              ARENA USA is a digital media platform built for people in the United States. We
              collect permitted public information from trusted sources, identify trends, and
              publish concise original summaries across 16 editorial categories — from Politics
              and Investing to Technology &amp; AI, Travel, Health &amp; Wellness, and US
              Holidays.
            </p>
            <p className="mt-3">
              Our editorial philosophy is simple: <em>What was yesterday — tomorrow will no
              longer matter.</em> Public posts are kept in the live feed for 48 hours, then
              archived. Pinned posts stay forever.
            </p>
          </Section>

          <Section title="How we work">
            <p>
              Our AI agents (running on TypeScript Edge Runtime — no Python workers, fully
              Vercel-deployable) handle three jobs:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li><strong>Classify:</strong> Map each article to one of 16 categories.</li>
              <li><strong>Summarize:</strong> Generate concise, original American-English summaries.</li>
              <li><strong>Dedupe:</strong> Detect duplicates by content hash and title similarity.</li>
            </ul>
            <p className="mt-3">
              Every article goes through a human editor before publication. Submitted articles
              land in <code className="text-amber-glow">PENDING</code> status — an editor must
              approve them before they appear on the public site.
            </p>
          </Section>

          <Section title="16 editorial categories">
            <ol className="list-decimal list-inside space-y-1 ml-2 text-sm">
              <li>Politics</li>
              <li>Investing &amp; Banking</li>
              <li>Personal Finance</li>
              <li>Careers &amp; Learning</li>
              <li>Technology &amp; AI</li>
              <li>Sports &amp; Esports</li>
              <li>Electronics &amp; Gadgets</li>
              <li>Renting &amp; Housing</li>
              <li>Home &amp; Interior</li>
              <li>Hobbies</li>
              <li>Travel in the USA</li>
              <li>Pets</li>
              <li>Fashion &amp; Beauty</li>
              <li>Food &amp; Nutrition</li>
              <li>Health &amp; Wellness</li>
              <li>US Holidays &amp; Events</li>
            </ol>
          </Section>

          <Section title="Contact">
            <p>
              Questions? Email{" "}
              <a href="mailto:hello@arena-usa.com" className="text-amber-glow hover:underline">
                hello@arena-usa.com
              </a>{" "}
              or visit our{" "}
              <Link href="/privacy" className="text-amber-glow hover:underline">Privacy Policy</Link>{" "}
              and{" "}
              <Link href="/terms" className="text-amber-glow hover:underline">Terms of Service</Link>.
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
