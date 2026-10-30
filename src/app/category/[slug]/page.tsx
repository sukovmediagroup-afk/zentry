import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ArrowRight } from "lucide-react";
import { Header } from "@/components/zentry/header";
import { MarketTicker } from "@/components/zentry/market-ticker";
import { CategoryNav } from "@/components/zentry/category-nav";
import { ArticleCard } from "@/components/zentry/article-card";
import { RightSidebar } from "@/components/zentry/right-sidebar";
import { Footer } from "@/components/zentry/footer";
import {
  DEMO_MARKET_TICKS,
  DEMO_VISITOR_COUNT,
} from "@/lib/demo-data";
import { fetchMarketTicks, fetchWeather, fetchUsEvents } from "@/lib/providers";
import { CATEGORIES, CATEGORY_MAP, ZODIAC_SIGNS } from "@/lib/constants";
import { db } from "@/lib/db";
import { toArticleCard, publicArticleWhere } from "@/lib/article-mapper";
import { buildMetadata, breadcrumbJsonLd, safeJsonLd } from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-static";
export const revalidate = 300;
export const fetchCache = "force-cache";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sub?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cat = CATEGORY_MAP[slug];
  if (!cat) return buildMetadata({ title: "Category not found" });
  return buildMetadata({
    title: cat.name,
    description: cat.description,
    path: `/category/${cat.slug}`,
    keywords: [cat.name, ...cat.subcategories],
  });
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { sub } = await searchParams;
  const category = CATEGORY_MAP[slug];
  if (!category) notFound();

  // Fetch live data in parallel — single batch (was 4 + 12 horoscope queries)
  const [liveTicks, weather, usEvents, dbArticles, horoscopeRows] = await Promise.all([
    fetchMarketTicks(),
    fetchWeather(),
    fetchUsEvents(),
    db.article.findMany({
      where: {
        ...publicArticleWhere(),
        category: { slug: category.slug },
      },
      orderBy: [{ isBreaking: "desc" }, { publishedAt: "desc" }],
      take: 30,
      include: { category: { select: { name: true, slug: true, color: true } } },
    }),
    db.horoscopeCache.findMany({ select: { sign: true, payload: true, updatedAt: true } }),
  ]);
  const ticks = liveTicks.length > 0 ? liveTicks : DEMO_MARKET_TICKS;

  // Build horoscopes from single batch query
  const horoscopes = ZODIAC_SIGNS.map((sign) => {
    const row = horoscopeRows.find((r) => r.sign === sign);
    let text = "";
    if (row) {
      try { text = JSON.parse(row.payload)?.text ?? ""; } catch {}
    }
    if (!text) {
      const seed = (sign + new Date().toDateString()).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const texts = ["A creative breakthrough arrives today.", "Curiosity opens an unexpected door.", "Patience is rewarded.", "Listen to your body.", "Energy returns.", "Small actions compound.", "A boundary is correct.", "Rest is productive.", "An old friend resurfaces.", "Financial clarity comes.", "A piece of news reframes.", "Conversation simplifies things."];
      text = texts[seed % texts.length];
    }
    return { sign, text };
  });

  // Filter by sub if provided
  let filteredArticles = dbArticles;
  if (sub) {
    const lower = sub.toLowerCase();
    filteredArticles = dbArticles.filter((a) => {
      const text = (a.title + " " + (a.excerpt ?? "")).toLowerCase();
      return text.includes(lower);
    });
  }

  const cardData = filteredArticles.map(toArticleCard);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: category.name, url: `/category/${category.slug}` },
          ])),
        }}
      />

      <div className="min-h-screen flex flex-col">
        <Header visitorCount={DEMO_VISITOR_COUNT} />
        <MarketTicker items={ticks} />

        <div className="mx-auto w-full max-w-[1600px] flex-1 px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_340px] gap-6">
            <div className="hidden lg:block">
              <div className="sticky top-20">
                <CategoryNav activeSlug={category.slug} />
              </div>
            </div>

            <main className="min-w-0">
              {/* Breadcrumb */}
              <nav className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Link href="/" className="hover:text-amber-glow">Home</Link>
                <ChevronRight size={12} />
                <span className="text-foreground/80">{category.name}</span>
              </nav>

              {/* Category header */}
              <header
                className="mb-6 p-5 rounded-xl border bg-gradient-to-br from-graphite/60 to-espresso"
                style={{ borderColor: `${category.color}40` }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-1.5 h-12 rounded-full shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="flex-1">
                    <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-1">
                      {category.name}
                    </h1>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>

                {/* Subcategories */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {category.subcategories.map((sc) => (
                    <Link
                      key={sc}
                      href={`/category/${category.slug}?sub=${encodeURIComponent(sc)}`}
                      className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                        sub === sc
                          ? "border-amber-glow text-amber-glow bg-bronze/20"
                          : "border-bronze/25 text-muted-foreground hover:text-amber-glow hover:border-amber-glow/50"
                      }`}
                    >
                      {sc}
                    </Link>
                  ))}
                </div>
              </header>

              {cardData.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-muted-foreground mb-4">No articles published in this section yet.</p>
                  <Link href="/" className="text-amber-glow hover:underline text-sm inline-flex items-center gap-1">
                    Back to home <ArrowRight size={12} />
                  </Link>
                </div>
              ) : (
                <>
                  {cardData[0] && (
                    <div className="mb-6">
                      <ArticleCard article={cardData[0]} variant="featured" priority />
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {cardData.slice(1).map((a, i) => (
                      <ArticleCard key={a.id} article={a} priority={i < 2} />
                    ))}
                  </div>
                </>
              )}
            </main>

            {/* RIGHT SIDEBAR — hidden on mobile */}
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
      </div>
    </>
  );
}
