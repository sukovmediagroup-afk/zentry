import Link from "next/link";
import Image from "next/image";
import { Clock, Flame, Pin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CATEGORY_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface ArticleCardData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  categorySlug: string;
  categoryName: string;
  categoryColor: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  sourceName?: string;
  publishedAt: string | Date;
  readingMinutes: number;
  isBreaking?: boolean;
  featured?: boolean;
  keepForever?: boolean;
  aiSummary?: string;
  aiConfidence?: number;
}

function timeAgo(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface ArticleCardProps {
  article: ArticleCardData;
  variant?: "default" | "featured" | "compact" | "list";
  priority?: boolean;
}

export function ArticleCard({ article, variant = "default", priority }: ArticleCardProps) {
  const href = `/article/${article.slug}`;

  if (variant === "featured") {
    return (
      <Link
        href={href}
        className="arena-card-hover group relative block overflow-hidden rounded-xl border border-bronze/15 bg-graphite/40"
      >
        <div className="relative aspect-[16/9] overflow-hidden">
          {article.coverImageUrl ? (
            <Image
              src={article.coverImageUrl}
              alt={article.coverImageAlt ?? article.title}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-graphite to-espresso" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/40 to-transparent" />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <CategoryBadge name={article.categoryName} color={article.categoryColor} />
            {article.isBreaking && (
              <Badge className="bg-red-900/80 border border-red-500/40 text-red-100 hover:bg-red-900/80">
                <Flame size={10} className="mr-1" /> Breaking
              </Badge>
            )}
            {article.keepForever && (
              <Badge variant="outline" className="bg-espresso/80 border-bronze/30 text-amber-glow">
                <Pin size={10} className="mr-1" /> Pinned
              </Badge>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6">
          <h2 className="font-serif text-xl lg:text-2xl font-bold text-foreground leading-tight mb-2 group-hover:text-amber-glow transition-colors">
            {article.title}
          </h2>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{article.excerpt}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {article.sourceName && <span className="font-medium">{article.sourceName}</span>}
            <span className="flex items-center gap-1"><Clock size={11} /> {timeAgo(article.publishedAt)}</span>
            <span>·</span>
            <span>{article.readingMinutes} min read</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={href} className="arena-card-hover group flex gap-3 p-2 rounded-lg hover:bg-graphite/40 transition-colors">
        <div className="relative w-20 h-20 shrink-0 rounded-md overflow-hidden bg-graphite">
          {article.coverImageUrl && (
            <Image
              src={article.coverImageUrl}
              alt={article.coverImageAlt ?? article.title}
              fill
              sizes="80px"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="text-[10px] font-bold uppercase tracking-wider mb-1"
            style={{ color: article.categoryColor }}
          >
            {article.categoryName}
          </div>
          <h3 className="text-sm font-medium text-foreground leading-snug line-clamp-2 group-hover:text-amber-glow transition-colors">
            {article.title}
          </h3>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {timeAgo(article.publishedAt)}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "list") {
    return (
      <Link
        href={href}
        className="arena-card-hover group block p-4 rounded-lg border border-bronze/10 bg-graphite/30 hover:bg-graphite/50 transition-colors"
      >
        <div className="flex items-center gap-2 mb-2">
          <CategoryBadge name={article.categoryName} color={article.categoryColor} />
          {article.isBreaking && (
            <Badge className="bg-red-900/70 border border-red-500/40 text-red-100 hover:bg-red-900/70">
              <Flame size={10} className="mr-1" /> Breaking
            </Badge>
          )}
          {article.keepForever && (
            <Badge variant="outline" className="border-bronze/30 text-amber-glow">
              <Pin size={10} className="mr-1" /> Pinned
            </Badge>
          )}
        </div>
        <h3 className="font-serif text-lg font-bold text-foreground leading-tight mb-2 group-hover:text-amber-glow transition-colors">
          {article.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{article.excerpt}</p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {article.sourceName && <span className="font-medium">{article.sourceName}</span>}
          <span className="flex items-center gap-1"><Clock size={11} /> {timeAgo(article.publishedAt)}</span>
          <span>·</span>
          <span>{article.readingMinutes} min read</span>
          {article.aiConfidence && (
            <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] bg-bronze/15 text-amber-glow">
              AI {(article.aiConfidence * 100).toFixed(0)}%
            </span>
          )}
        </div>
      </Link>
    );
  }

  // default — image-first card
  return (
    <Link
      href={href}
      className="arena-card-hover group flex flex-col overflow-hidden rounded-xl border border-bronze/15 bg-graphite/40"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-graphite">
        {article.coverImageUrl ? (
          <Image
            src={article.coverImageUrl}
            alt={article.coverImageAlt ?? article.title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-graphite to-espresso" />
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <CategoryBadge name={article.categoryName} color={article.categoryColor} />
          {article.isBreaking && (
            <Badge className="bg-red-900/80 border border-red-500/40 text-red-100 hover:bg-red-900/80">
              <Flame size={10} className="mr-1" /> Breaking
            </Badge>
          )}
          {article.keepForever && (
            <Badge variant="outline" className="bg-espresso/70 border-bronze/30 text-amber-glow">
              <Pin size={10} className="mr-1" /> Pinned
            </Badge>
          )}
        </div>
      </div>
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-serif text-base lg:text-lg font-bold text-foreground leading-tight mb-2 line-clamp-3 group-hover:text-amber-glow transition-colors">
          {article.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{article.excerpt}</p>
        <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-bronze/10">
          {article.sourceName && <span className="font-medium truncate max-w-[120px]">{article.sourceName}</span>}
          <span className="ml-auto flex items-center gap-1"><Clock size={11} /> {timeAgo(article.publishedAt)}</span>
          <span>·</span>
          <span>{article.readingMinutes}m</span>
        </div>
      </div>
    </Link>
  );
}

function CategoryBadge({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
      style={{
        backgroundColor: `${color}25`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      {name}
    </span>
  );
}
