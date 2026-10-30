import Link from "next/link";
import { Header } from "@/components/zentry/header";
import { MarketTicker } from "@/components/zentry/market-ticker";
import { CategoryNav } from "@/components/zentry/category-nav";
import { ArticleCard, type ArticleCardData } from "@/components/zentry/article-card";
import { Footer } from "@/components/zentry/footer";
import { DEMO_ARTICLES, DEMO_MARKET_TICKS, DEMO_VISITOR_COUNT } from "@/lib/demo-data";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = buildMetadata({
  title: "Archive",
  description: "Browse all past ARENA USA publications including articles kept forever.",
  path: "/archive",
});

export default function ArchivePage() {
  const sorted = [...DEMO_ARTICLES].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  const cardData: ArticleCardData[] = sorted.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    categorySlug: a.categorySlug,
    categoryName: a.categoryName,
    categoryColor: a.categoryColor,
    coverImageUrl: a.coverImageUrl,
    coverImageAlt: a.coverImageAlt,
    sourceName: a.sourceName,
    publishedAt: a.publishedAt,
    readingMinutes: a.readingMinutes,
    isBreaking: a.isBreaking,
    featured: a.featured,
    keepForever: a.keepForever,
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <Header visitorCount={DEMO_VISITOR_COUNT} />
      <MarketTicker items={DEMO_MARKET_TICKS} />

      <div className="mx-auto w-full max-w-[1600px] flex-1 px-4 lg:px-6 py-6">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {cardData.map((a, i) => (
                <ArticleCard key={a.id} article={a} priority={i < 3} />
              ))}
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
