import Link from "next/link";
import { Sparkles, Clock, Pin, Flame, ArrowRight, CloudSun, Radio } from "lucide-react";
import { Header } from "@/components/zentry/header";
import { MarketTicker } from "@/components/zentry/market-ticker";
import { CategoryNav } from "@/components/zentry/category-nav";
import { ArticleCard } from "@/components/zentry/article-card";
import { RightSidebar } from "@/components/zentry/right-sidebar";
import { VisitorCounter } from "@/components/zentry/visitor-counter";
import { Footer } from "@/components/zentry/footer";
import { CATEGORIES, PROJECT_DEFAULTS, ZODIAC_SIGNS } from "@/lib/constants";
import {
  DEMO_MARKET_TICKS,
  DEMO_VISITOR_COUNT,
} from "@/lib/demo-data";
import { fetchMarketTicks, fetchWeather, fetchUsEvents } from "@/lib/providers";
import { websiteJsonLd, organizationJsonLd, safeJsonLd } from "@/lib/seo";
import { db } from "@/lib/db";
import { toArticleCard, publicArticleWhere } from "@/lib/article-mapper";

export const dynamic = "force-static";
export const revalidate = 60; // ISR — refresh every 60s (was 300s, too stale for news)
export const fetchCache = "force-cache";

export default async function HomePage() {
  // Fetch live data in parallel — providers fall back to demo on failure.
  // Horoscopes are cached in DB (one row per sign, refreshed daily).
  const [liveTicks, weather, usEvents, dbArticles, horoscopeRows] = await Promise.all([
    fetchMarketTicks(),
    fetchWeather(),
    fetchUsEvents(),
    // Fetch published articles (within 48h retention, or pinned forever, or breaking)
    db.article.findMany({
      where: publicArticleWhere(),
      orderBy: [{ isBreaking: "desc" }, { publishedAt: "desc" }],
      take: 12,
      include: { category: { select: { name: true, slug: true, color: true } } },
    }),
    // Single query to fetch all 12 horoscope rows at once (was 12 parallel queries)
    db.horoscopeCache.findMany({
      select: { sign: true, payload: true, updatedAt: true },
    }),
  ]);
  const ticks = liveTicks.length > 0 ? liveTicks : DEMO_MARKET_TICKS;

  // Build horoscopes from the single query result
  const horoscopes = ZODIAC_SIGNS.map((sign) => {
    const row = horoscopeRows.find((r) => r.sign === sign);
    let text = "";
    if (row) {
      try {
        text = JSON.parse(row.payload)?.text ?? "";
      } catch {}
    }
    // Fallback to fetchHoroscope (will create the row if missing)
    return { sign, text };
  }).map((h) => {
    if (!h.text) {
      // Compute synchronously without DB round-trip
      const seed = (h.sign + new Date().toDateString()).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const texts = [
        "A creative breakthrough arrives when you stop forcing it.",
        "A conversation you've been avoiding turns out to be simpler.",
        "Financial clarity comes from a single uncomfortable question.",
        "Rest is productive today. Your best idea arrives in stillness.",
        "An old friend resurfaces with a timely perspective.",
        "Small disciplined actions compound today.",
        "Your patience is being tested. The reward is real.",
        "A boundary you've been considering is correct.",
        "Curiosity opens an unexpected door today.",
        "Energy returns. Use it for the task you've postponed.",
        "Listen to your body. It has been telling you something.",
        "A piece of news reframes a long-standing assumption.",
      ];
      return { ...h, text: texts[seed % texts.length] };
    }
    return h;
  });

  // Map DB articles to UI card data
  const articles = dbArticles.map(toArticleCard);

  // If no articles in DB, fall back to a friendly empty state
  const featured = articles.filter((a) => a.featured);
  const breaking = articles.filter((a) => a.isBreaking);
  const regular = articles.filter((a) => !a.featured);
  const hero = featured[0] ?? articles[0];
  const featuredRest = featured.slice(1, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteJsonLd()) }}
      />

      <div className="min-h-screen flex flex-col">
        <Header visitorCount={DEMO_VISITOR_COUNT} />
        <MarketTicker items={ticks} />

        {/* Hero slogan */}
        <section className="border-b border-bronze/15 bg-gradient-to-b from-espresso to-graphite/40">
          <div className="mx-auto max-w-[1600px] px-4 lg:px-6 py-5 flex items-center justify-center gap-3">
            <Sparkles size={16} className="text-amber-glow shrink-0" />
            <p className="font-serif text-sm md:text-base italic text-foreground/90 text-center">
              {PROJECT_DEFAULTS.siteTagline}
            </p>
            <Sparkles size={16} className="text-amber-glow shrink-0 -scale-x-100" />
          </div>
        </section>

        <div className="mx-auto w-full max-w-[1600px] flex-1 px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          {/* Mobile compact sidebar — weather + donations inline */}
          <MobileCompactSidebar weather={weather} visitorCount={DEMO_VISITOR_COUNT} />

          <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_340px] gap-6">
            {/* LEFT NAV */}
            <div className="hidden lg:block">
              <div className="sticky top-20">
                <CategoryNav />
                <RetentionNotice />
              </div>
            </div>

            {/* MAIN FEED */}
            <main className="min-w-0">
              {breaking.length > 0 && (
                <div className="mb-6 flex items-center gap-3 px-3 py-2 rounded-md border border-red-500/30 bg-red-950/30">
                  <Flame size={14} className="text-red-400 shrink-0" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-300">Breaking</span>
                  <Link
                    href={`/article/${breaking[0].slug}`}
                    className="text-sm text-foreground/90 hover:text-amber-glow transition-colors truncate"
                  >
                    {breaking[0].title}
                  </Link>
                </div>
              )}

              {articles.length === 0 ? (
                <div className="py-20 text-center">
                  <Sparkles size={32} className="mx-auto mb-4 text-amber-glow/50" />
                  <h2 className="font-serif text-xl font-bold text-foreground mb-2">No articles published yet</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Articles appear here once an admin approves them in the editorial panel.
                  </p>
                  <Link href="/archive" className="text-amber-glow hover:underline text-sm inline-flex items-center gap-1">
                    Browse the archive <ArrowRight size={12} />
                  </Link>
                </div>
              ) : (
                <>
                  {hero && (
                    <section className="mb-8">
                      <SectionHeading title="Top Story" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ArticleCard article={hero} variant="featured" priority />
                        <div className="grid grid-rows-2 gap-4">
                          {featuredRest.map((a) => (
                            <ArticleCard key={a.id} article={a} variant="default" />
                          ))}
                        </div>
                      </div>
                    </section>
                  )}

                  {regular.length > 0 && (
                    <section className="mb-8">
                      <SectionHeading title="Latest News" link="/archive" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {regular.slice(0, 6).map((a, i) => (
                          <ArticleCard key={a.id} article={a} priority={i < 2} />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Featured categories strip */}
                  <section className="mb-8">
                    <SectionHeading title="Browse by Topic" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {CATEGORIES.slice(0, 8).map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/category/${cat.slug}`}
                          className="arena-card-hover group relative overflow-hidden rounded-lg border border-bronze/15 bg-graphite/30 p-4 h-24 flex flex-col justify-between"
                        >
                          <div
                            className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-15 blur-xl"
                            style={{ backgroundColor: cat.color }}
                          />
                          <div className="relative">
                            <div className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: cat.color }}>
                              {cat.subcategories[0] ?? "Topic"}
                            </div>
                            <h3 className="font-serif text-sm font-bold text-foreground leading-tight group-hover:text-amber-glow transition-colors">
                              {cat.name}
                            </h3>
                          </div>
                          <ArrowRight size={14} className="relative text-muted-foreground group-hover:text-amber-glow group-hover:translate-x-1 transition-all" />
                        </Link>
                      ))}
                    </div>
                  </section>

                  {regular.length > 6 && (
                    <section className="mb-4">
                      <SectionHeading title="More to Read" link="/archive" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {regular.slice(6).map((a) => (
                          <ArticleCard key={a.id} article={a} variant="list" />
                        ))}
                      </div>
                    </section>
                  )}

                  <div className="mt-8 flex justify-center">
                    <Link
                      href="/archive"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-bronze/30 text-amber-glow hover:bg-bronze/10 transition-colors text-sm font-medium"
                    >
                      Browse the archive
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </>
              )}
            </main>

            {/* RIGHT SIDEBAR — hidden on mobile (replaced by MobileCompactSidebar above) */}
            <div className="hidden lg:block">
              <RightSidebar
                weather={weather}
                horoscopes={horoscopes}
                events={usEvents}
                visitorCount={DEMO_VISITOR_COUNT}
              />
            </div>
          </div>
        </div>

        <Footer />
        <VisitorCounter initialCount={DEMO_VISITOR_COUNT} className="sr-only" aria-hidden />
      </div>
    </>
  );
}

function SectionHeading({ title, link }: { title: string; link?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <h2 className="font-serif text-base sm:text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-glow to-bronze" />
        {title}
      </h2>
      {link && (
        <Link href={link} className="text-xs text-muted-foreground hover:text-amber-glow flex items-center gap-1">
          View all <ArrowRight size={12} />
        </Link>
      )}
    </div>
  );
}

function RetentionNotice() {
  return (
    <div className="mt-6 p-3 rounded-md border border-bronze/15 bg-graphite/30">
      <div className="flex items-center gap-2 mb-1.5">
        <Clock size={13} className="text-amber-glow" />
        <span className="text-[10px] uppercase tracking-wider font-bold text-amber-glow">Retention</span>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Public posts are kept for <span className="text-foreground font-medium">48 hours</span>, then archived.
        Pinned posts <Pin size={10} className="inline text-amber-glow" /> stay forever.
      </p>
    </div>
  );
}

/**
 * Mobile compact sidebar — shows only weather + donations inline.
 * Visible only on screens < lg (1024px). On desktop the full sidebar
 * takes over (see grid layout).
 */
function MobileCompactSidebar({
  weather,
  visitorCount,
}: {
  weather: import("@/lib/providers").WeatherForecast;
  visitorCount: number;
}) {
  const today = weather.today;
  return (
    <div className="lg:hidden mb-4 flex items-center gap-3 p-3 rounded-lg border border-bronze/15 bg-graphite/30">
      <div className="flex items-center gap-2">
        <CloudSun size={20} className="text-amber-glow" />
        <div>
          <div className="text-xs text-muted-foreground">{weather.location}</div>
          <div className="font-serif text-lg font-bold text-foreground leading-none">
            {today.high}°F <span className="text-xs text-muted-foreground">/ {today.low}°F</span>
          </div>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-1.5 px-2.5 h-7 rounded-full bg-bronze/15 border border-bronze/25 text-[11px]">
        <Radio size={11} className="text-emerald-400" />
        <span className="text-foreground/80 font-medium tabular-nums">{visitorCount.toLocaleString()}</span>
        <span className="text-muted-foreground">live</span>
      </div>
    </div>
  );
}
