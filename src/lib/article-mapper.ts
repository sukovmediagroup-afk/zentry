// ARENA USA — DB article to UI card mapper.
// Used by all public pages (homepage, article/[slug], category/[slug], archive, search)
// to display articles from the database (not from hardcoded DEMO_ARTICLES).

import type { Article } from "@prisma/client";
import type { ArticleCardData } from "@/components/zentry/article-card";
import { CATEGORY_MAP } from "./constants";

// Article with category relation loaded (what we typically fetch from DB)
interface ArticleWithCategory extends Article {
  category?: { name: string; slug: string; color: string | null } | null;
}

// Article with category + tags loaded (for detail page)
interface ArticleWithTags extends Article {
  category?: { name: string; slug: string; color: string | null } | null;
  tags?: { name: string; slug: string }[];
}

// Prisma WhereInput type — kept loose to avoid pulling Prisma internals
type ArticleWhereInput = Record<string, unknown>;

/**
 * Maps a Prisma Article (with category) to the ArticleCardData shape
 * expected by the <ArticleCard> component.
 */
export function toArticleCard(a: ArticleWithCategory): ArticleCardData {
  // Resolve category — prefer DB-stored category, fallback to constants
  let categoryName = a.category?.name ?? "Technology & AI";
  let categoryColor = a.category?.color ?? "#9b4bc9";
  let categorySlug = a.category?.slug ?? "technology-ai";

  // If DB category is missing, look up canonical by AI-classified slug
  if (!a.category) {
    const aiCats = a.aiCategories ? safeParse(a.aiCategories) : [];
    const primarySlug = Array.isArray(aiCats) && aiCats.length > 0 ? aiCats[0] : undefined;
    if (primarySlug && CATEGORY_MAP[primarySlug]) {
      categoryName = CATEGORY_MAP[primarySlug].name;
      categoryColor = CATEGORY_MAP[primarySlug].color;
      categorySlug = primarySlug;
    }
  }

  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt ?? "",
    categorySlug,
    categoryName,
    categoryColor,
    coverImageUrl: a.coverImageUrl ?? undefined,
    coverImageAlt: a.coverImageAlt ?? undefined,
    sourceName: a.sourceName ?? undefined,
    publishedAt: a.publishedAt ?? a.createdAt,
    readingMinutes: a.readingMinutes,
    isBreaking: a.isBreaking,
    featured: a.featured,
    keepForever: a.keepForever,
    aiSummary: a.aiSummary ?? undefined,
    aiConfidence: a.aiConfidence ?? undefined,
  };
}

/**
 * Full article data for the article detail page — includes content + AI metadata.
 */
export interface ArticleDetailData extends ArticleCardData {
  content: string;
  sourceUrl?: string;
  sourcePublishedAt?: Date;
  retrievedAt?: Date;
  aiCategories: string[];
  sensitivityFlags: string[];
  moderationNotes?: string;
  status: string;
  views: number;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  tags: string[];
}

export function toArticleDetail(a: ArticleWithTags): ArticleDetailData {
  const card = toArticleCard(a);
  return {
    ...card,
    content: a.content,
    sourceUrl: a.sourceUrl ?? undefined,
    sourcePublishedAt: a.sourcePublishedAt ?? undefined,
    retrievedAt: a.retrievedAt ?? undefined,
    aiCategories: a.aiCategories ? safeParse(a.aiCategories) : [],
    sensitivityFlags: a.sensitivityFlags ? safeParse(a.sensitivityFlags) : [],
    moderationNotes: a.moderationNotes ?? undefined,
    status: a.status,
    views: a.views,
    metaTitle: a.metaTitle ?? undefined,
    metaDescription: a.metaDescription ?? undefined,
    keywords: a.keywords ?? undefined,
    tags: (a.tags ?? []).map((t) => t.name),
  };
}

function safeParse(s: string): any {
  try {
    return JSON.parse(s);
  } catch {
    return [];
  }
}

/**
 * Public retention window — articles older than this are not shown
 * in the public feed (unless keepForever or isBreaking).
 */
export const PUBLIC_RETENTION_HOURS = 48;

/**
 * Returns the "where" clause for Prisma queries that fetch only
 * publicly-visible articles (within retention window, PUBLISHED status).
 */
export function publicArticleWhere(): ArticleWhereInput {
  const cutoff = new Date(Date.now() - PUBLIC_RETENTION_HOURS * 3600 * 1000);
  return {
    status: "PUBLISHED",
    OR: [
      { publishedAt: { gte: cutoff } },
      { keepForever: true },
      { isBreaking: true },
    ],
  };
}

/**
 * Returns the where clause for the archive page — includes ALL published
 * and archived articles (archive shows historical content).
 */
export function archiveArticleWhere(): ArticleWhereInput {
  return {
    status: { in: ["PUBLISHED", "ARCHIVED"] },
  };
}
