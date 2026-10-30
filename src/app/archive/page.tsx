import Link from "next/link";
import { Header } from "@/components/zentry/header";
import { MarketTicker } from "@/components/zentry/market-ticker";
import { CategoryNav } from "@/components/zentry/category-nav";
import { ArticleCard } from "@/components/zentry/article-card";
import { Footer } from "@/components/zentry/footer";
import { DEMO_MARKET_TICKS, DEMO_VISITOR_COUNT } from "@/lib/demo-data";
import { fetchMarketTicks } from "@/lib/providers";
import { db } from "@/lib/db";
import { toArticleCard, archiveArticleWhere } from "@/lib/article-mapper";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-static";
export const revalidate = 600; // 10 min — archive doesn't change often
export const fetchCache = "force-cache";

export const metadata: Metadata = buildMetadata({
  title: "Archive",
  description: "Browse all past ARENA USA publications including articles kept forever.",
  path: "/archive",
});

export default async function ArchivePage() {
  const ticks = await fetchMarketTicks().catch(() => DEMO_MARKET_TICKS);

  // Fetch all published + archived articles from DB
  const dbArticles = await db.article.findMany({
    where: archiveArticleWhere(),
    orderBy: { publishedAt: "desc" },
    take: 100,
    include: { category: { select: { name: true, slug: true, color: true } } },
  }).catch(() => []);

  const cardData = dbArticles.map(toArticleCard);

  return (
    <div className="min-h-screen flex flex-col">
      <Header visitorCount={DEMO_VISITOR_COUNT} />
      <MarketTicker items={ticks} />

      <div className="mx-auto w-full max-w-[1600px] flex-1 px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
          <div className="hidden lg:block">
            <div className="sticky top-20">
              <CategoryNav />
            </div>
          </div>

          <main className="min-w-0">
            <header className="mb-6">
              <nav className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Link href="/" className="hover:text-amber-glow">Home</Link>
                <span>/</span>
                <span className="text-foreground/80">Archive</span>
              </nav>
              <h1 className="font-serif text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
                <span className="w-1.5 h-7 rounded-full bg-gradient-to-b from-amber-glow to-bronze" />
                Archive
              </h1>
              <p className="text-sm text-muted-foreground">
                Every published story. Pinned posts stay forever; everything else stays live in the feed for 48 hours, then moves here.
              </p>
            </header>

            {cardData.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-muted-foreground">No articles published yet.</p>
                <Link href="/" className="mt-4 inline-block text-amber-glow hover:underline text-sm">
                  Back to home
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {cardData.map((a, i) => (
                  <ArticleCard key={a.id} article={a} priority={i < 3} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
