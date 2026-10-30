import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, ExternalLink, Pin, Flame, Tag as TagIcon } from "lucide-react";
import { Header } from "@/components/zentry/header";
import { MarketTicker } from "@/components/zentry/market-ticker";
import { CategoryNav } from "@/components/zentry/category-nav";
import { Footer } from "@/components/zentry/footer";
import { ArticleCard, type ArticleCardData } from "@/components/zentry/article-card";
import { Badge } from "@/components/ui/badge";
import {
  DEMO_ARTICLES,
  DEMO_MARKET_TICKS,
  DEMO_VISITOR_COUNT,
} from "@/lib/demo-data";
import { fetchMarketTicks } from "@/lib/providers";
import { CATEGORIES } from "@/lib/constants";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  buildMetadata,
  safeJsonLd,
} from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return DEMO_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = DEMO_ARTICLES.find((a) => a.slug === slug);
  if (!article) return buildMetadata({ title: "Article not found" });
  return buildMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/article/${article.slug}`,
    image: article.coverImageUrl,
    type: "article",
    publishedTime: new Date(article.publishedAt),
    author: article.sourceName,
    keywords: article.tags,
  });
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = DEMO_ARTICLES.find((a) => a.slug === slug);
  if (!article) notFound();

  const ticks = await fetchMarketTicks().catch(() => DEMO_MARKET_TICKS);

  const related = DEMO_ARTICLES
    .filter((a) => a.id !== article.id && a.categorySlug === article.categorySlug)
    .slice(0, 3);

  const category = CATEGORIES.find((c) => c.slug === article.categorySlug);

  const relatedCardData: ArticleCardData[] = related.map((a) => ({
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(articleJsonLd({
            title: article.title,
            description: article.excerpt,
            slug: article.slug,
            image: article.coverImageUrl,
            datePublished: new Date(article.publishedAt),
            dateModified: new Date(article.publishedAt),
            authorName: article.sourceName,
            categoryName: article.categoryName,
          })),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: article.categoryName, url: `/category/${article.categorySlug}` },
            { name: article.title, url: `/article/${article.slug}` },
          ])),
        }}
      />

      <div className="min-h-screen flex flex-col">
        <Header visitorCount={DEMO_VISITOR_COUNT} />
        <MarketTicker items={ticks} />

        <div className="mx-auto w-full max-w-[1600px] flex-1 px-4 lg:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
            <div className="hidden lg:block">
              <div className="sticky top-20">
                <CategoryNav activeSlug={article.categorySlug} />
              </div>
            </div>

            <article className="min-w-0">
              <nav className="mb-4 flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                <Link href="/" className="hover:text-amber-glow">Home</Link>
                <span>/</span>
                <Link href={`/category/${article.categorySlug}`} className="hover:text-amber-glow">
                  {article.categoryName}
                </Link>
                <span>/</span>
                <span className="text-foreground/80 truncate">{article.title}</span>
              </nav>

              <Link
                href={`/category/${article.categorySlug}`}
                className="inline-flex items-center gap-2 mb-3 group"
              >
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${article.categoryColor}25`,
                    color: article.categoryColor,
                    border: `1px solid ${article.categoryColor}40`,
                  }}
                >
                  {article.categoryName}
                </span>
                {article.isBreaking && (
                  <Badge className="bg-red-900/80 border border-red-500/40 text-red-100 hover:bg-red-900/80">
                    <Flame size={10} className="mr-1" /> Breaking
                  </Badge>
                )}
                {article.keepForever && (
                  <Badge variant="outline" className="border-bronze/30 text-amber-glow">
                    <Pin size={10} className="mr-1" /> Pinned forever
                  </Badge>
                )}
              </Link>

              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-[1.1] mb-4">
                {article.title}
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed mb-5">
                {article.excerpt}
              </p>

              <div className="flex flex-wrap items-center gap-3 pb-5 mb-6 border-b border-bronze/15 text-sm text-muted-foreground">
                {article.sourceName && (
                  <span className="flex items-center gap-1.5">
                    <span className="font-medium text-foreground">{article.sourceName}</span>
                    <ExternalLink size={12} />
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(article.publishedAt).toLocaleString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
                <span>·</span>
                <span>{article.readingMinutes} min read</span>
                {article.aiConfidence && (
                  <Badge variant="outline" className="ml-auto border-bronze/30 text-amber-glow text-[10px]">
                    AI confidence {(article.aiConfidence * 100).toFixed(0)}%
                  </Badge>
                )}
              </div>

              {article.coverImageUrl && (
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-6 border border-bronze/15">
                  <Image
                    src={article.coverImageUrl}
                    alt={article.coverImageAlt ?? article.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 1024px"
                    className="object-cover"
                  />
                </div>
              )}

              {article.aiSummary && (
                <div className="mb-6 p-4 rounded-lg border border-bronze/25 bg-gradient-to-br from-graphite/60 to-espresso">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-amber-glow to-bronze" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-glow">AI Summary</span>
                  </div>
                  <p className="text-sm md:text-base text-foreground/90 leading-relaxed italic">
                    "{article.aiSummary}"
                  </p>
                </div>
              )}

              <div className="prose-article text-foreground/90 leading-relaxed space-y-4 text-base">
                {renderMarkdown(article.content)}
              </div>

              {article.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-bronze/15">
                  <div className="flex items-center gap-2 mb-3">
                    <TagIcon size={14} className="text-amber-glow" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-glow">Topics</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
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

              <div className="mt-8 mb-2">
                <Link
                  href={`/category/${article.categorySlug}`}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-amber-glow"
                >
                  <ArrowLeft size={14} />
                  Back to {article.categoryName}
                </Link>
              </div>
            </article>
          </div>

          {relatedCardData.length > 0 && (
            <section className="mt-12 pt-8 border-t border-bronze/15">
              <h2 className="font-serif text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-glow to-bronze" />
                More from {category?.name ?? "this section"}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedCardData.map((a) => (
                  <ArticleCard key={a.id} article={a} variant="default" />
                ))}
              </div>
            </section>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}

function renderMarkdown(content: string): React.ReactNode {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length === 0) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="list-disc list-inside space-y-1.5">
        {listBuffer.map((item, i) => (
          <li key={i} className="text-foreground/90">{renderInline(item)}</li>
        ))}
      </ul>,
    );
    listBuffer = [];
  };

  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (!line) {
      flushList();
      return;
    }
    if (line.startsWith("#### ")) {
      flushList();
      blocks.push(<h4 key={i} className="font-serif text-lg font-bold text-foreground mt-2">{renderInline(line.slice(5))}</h4>);
    } else if (line.startsWith("### ")) {
      flushList();
      blocks.push(<h3 key={i} className="font-serif text-xl font-bold text-foreground mt-2">{renderInline(line.slice(4))}</h3>);
    } else if (line.startsWith("## ")) {
      flushList();
      blocks.push(<h2 key={i} className="font-serif text-2xl font-bold text-foreground mt-2">{renderInline(line.slice(3))}</h2>);
    } else if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
      flushList();
      blocks.push(<p key={i} className="font-bold text-foreground text-lg">{renderInline(line.slice(2, -2))}</p>);
    } else if (line.match(/^[-*]\s+/)) {
      listBuffer.push(line.replace(/^[-*]\s+/, ""));
    } else {
      flushList();
      blocks.push(<p key={i} className="text-foreground/90">{renderInline(line)}</p>);
    }
  });
  flushList();
  return blocks;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return <strong key={i} className="font-semibold text-foreground">{p.slice(2, -2)}</strong>;
    }
    if (p.startsWith("*") && p.endsWith("*")) {
      return <em key={i} className="italic">{p.slice(1, -1)}</em>;
    }
    return p;
  });
}
