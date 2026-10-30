import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const PUBLIC_RETENTION_HOURS = 48;

/**
 * GET /api/articles
 * Public feed — returns published articles within the 48h retention window
 * (or pinned forever), with pagination and optional category filter.
 *
 * Query params:
 *  - category=<slug>      filter by category
 *  - limit=<int>           default 20, max 100
 *  - cursor=<iso8601>      publishedAt cursor (older)
 *  - includeBreaking=true  also include breaking news (default true)
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const category = url.searchParams.get("category");
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10) || 20, 100);
  const cursor = url.searchParams.get("cursor");
  const includeBreaking = url.searchParams.get("includeBreaking") !== "false";

  try {
    const retentionCutoff = new Date(Date.now() - PUBLIC_RETENTION_HOURS * 3600 * 1000);

    const articles = await db.article.findMany({
      where: {
        status: "PUBLISHED",
        ...(category ? { category: { slug: category } } : {}),
        OR: [
          { publishedAt: { gte: retentionCutoff } },
          { keepForever: true },
          ...(includeBreaking ? [{ isBreaking: true }] : []),
        ],
        ...(cursor ? { publishedAt: { lt: new Date(cursor) } } : {}),
      },
      orderBy: [{ isBreaking: "desc" }, { publishedAt: "desc" }],
      take: limit,
      select: {
        id: true, title: true, slug: true, excerpt: true,
        coverImageUrl: true, publishedAt: true, readingMinutes: true,
        isBreaking: true, featured: true, keepForever: true,
        aiSummary: true, aiConfidence: true,
        sourceName: true,
        category: { select: { name: true, slug: true, color: true } },
      },
    });

    const last = articles.length > 0 ? articles[articles.length - 1] : null;
    return NextResponse.json({
      articles,
      nextCursor: articles.length === limit && last?.publishedAt
        ? last.publishedAt.toISOString()
        : null,
      retentionHours: PUBLIC_RETENTION_HOURS,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "failed to fetch articles" },
      { status: 500 },
    );
  }
}
