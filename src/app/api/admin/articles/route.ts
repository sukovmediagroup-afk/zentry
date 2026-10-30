import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/seo";
import { slugSuffix } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/articles
 * List articles for the admin panel — includes DRAFT/PENDING/ARCHIVED.
 */
export async function GET(req: NextRequest) {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl;
  const status = url.searchParams.get("status");
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10) || 50, 200);

  const articles = await db.article.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true, title: true, slug: true, status: true,
      publishedAt: true, createdAt: true, sourceName: true,
      isBreaking: true, featured: true, keepForever: true,
      views: true, aiConfidence: true,
      category: { select: { name: true, slug: true, color: true } },
    },
  });

  return NextResponse.json({ articles, requestedBy: user.email });
}

/**
 * POST /api/admin/articles
 * Create a manual article (admin-authored, no source).
 * Body: { title, excerpt?, content, categorySlug, coverImageUrl?, ... }
 */
export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.title || !body?.content) {
    return NextResponse.json({ error: "title and content are required" }, { status: 422 });
  }

  const { CATEGORIES } = await import("@/lib/constants");
  const category = CATEGORIES.find((c) => c.slug === body.categorySlug);
  if (!category) {
    return NextResponse.json({ error: "invalid categorySlug" }, { status: 422 });
  }

  // Ensure category exists in DB
  const dbCat = await db.category.upsert({
    where: { slug: category.slug },
    create: {
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      color: category.color,
      order: CATEGORIES.findIndex((c) => c.slug === category.slug),
    },
    update: {},
  });

  const now = new Date();
  const published = body.status === "PUBLISHED";
  const publishedAt = published ? (body.publishedAt ? new Date(body.publishedAt) : now) : null;
  const expiresAt = published && !body.keepForever
    ? new Date((publishedAt ?? now).getTime() + 48 * 3600 * 1000)
    : null;

  const slugBase = slugify(body.title);
  const slug = `${slugBase}-${slugSuffix()}`;

  const article = await db.article.create({
    data: {
      title: body.title,
      slug,
      excerpt: body.excerpt ?? body.content.slice(0, 280),
      content: body.content,
      coverImageUrl: body.coverImageUrl,
      coverImageAlt: body.coverImageAlt,
      status: body.status ?? "DRAFT",
      featured: Boolean(body.featured),
      isBreaking: Boolean(body.isBreaking),
      keepForever: Boolean(body.keepForever),
      sourceName: "ARENA USA Editorial",
      sourceUrl: "https://arena-usa.vercel.app",
      sourcePublishedAt: publishedAt,
      retrievedAt: now,
      publishedAt,
      expiresAt,
      readingMinutes: Math.max(1, Math.ceil(body.content.split(/\s+/).length / 220)),
      authorId: user.id,
      categoryId: dbCat.id,
    },
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "ARTICLE_CREATE",
      entity: "Article",
      entityId: article.id,
      metadata: JSON.stringify({ title: body.title, status: article.status }),
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 64) ?? null,
    },
  });

  return NextResponse.json({ ok: true, article }, { status: 201 });
}
