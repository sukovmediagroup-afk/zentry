import Link from "next/link";
import { Search as SearchIcon, ArrowRight } from "lucide-react";
import { Header } from "@/components/zentry/header";
import { MarketTicker } from "@/components/zentry/market-ticker";
import { CategoryNav } from "@/components/zentry/category-nav";
import { ArticleCard, type ArticleCardData } from "@/components/zentry/article-card";
import { Footer } from "@/components/zentry/footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DEMO_ARTICLES, DEMO_MARKET_TICKS, DEMO_VISITOR_COUNT } from "@/lib/demo-data";
import { CATEGORIES } from "@/lib/constants";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Search",
  description: "Search across all ARENA USA publications, topics, and sources.",
  path: "/search",
});

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  let results: typeof DEMO_ARTICLES = [];
  if (query) {
    const lower = query.toLowerCase();
    results = DEMO_ARTICLES.filter((a) => {
      const haystack = [
        a.title,
        a.excerpt,
        a.content,
        a.categoryName,
        a.sourceName ?? "",
        ...a.tags,
      ].join(" ").toLowerCase();
      return haystack.includes(lower);
    });
  }

  const cardData: ArticleCardData[] = results.map((a) => ({
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
                <span className="text-foreground/80">Search</span>
              </nav>
              <h1 className="font-serif text-3xl font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="w-1.5 h-7 rounded-full bg-gradient-to-b from-amber-glow to-bronze" />
                Search
              </h1>
              <form className="flex gap-2">
                <div className="relative flex-1">
                  <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    name="q"
                    defaultValue={query}
                    placeholder="Search articles, topics, sources..."
                    className="pl-9 h-10 bg-graphite/60 border-bronze/20 focus-visible:border-amber-glow"
                    autoFocus
                  />
                </div>
                <Button type="submit" className="bg-bronze/30 text-amber-glow hover:bg-bronze/40 border border-bronze/40">
                  Search
                </Button>
              </form>
            </header>

            {query && (
              <p className="text-sm text-muted-foreground mb-4">
                {results.length === 0
                  ? "No results for"
                  : `${results.length} ${results.length === 1 ? "result" : "results"} for`}{" "}
                <span className="text-amber-glow font-medium">"{query}"</span>
              </p>
            )}

            {!query && (
              <div className="mb-8">
                <h2 className="font-serif text-sm font-bold uppercase tracking-wider text-amber-glow mb-3">
                  Popular topics
                </h2>
                <div className="flex flex-wrap gap-2">
                  {["AI", "Federal Reserve", "Tesla", "Remote Work", "Yosemite", "Salmon", "Smart Home", "Memorial Day"].map((tag) => (
                    <Link
                      key={tag}
                      href={`/search?q=${encodeURIComponent(tag)}`}
                      className="px-3 py-1 rounded-full text-xs border border-bronze/25 text-muted-foreground hover:text-amber-glow hover:border-amber-glow/50 transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.length === 0 && query && (
              <div className="py-12 text-center">
                <SearchIcon size={32} className="mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-4">Try a different keyword.</p>
                <Link href="/" className="text-amber-glow hover:underline text-sm inline-flex items-center gap-1">
                  Back to home <ArrowRight size={12} />
                </Link>
              </div>
            )}

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
