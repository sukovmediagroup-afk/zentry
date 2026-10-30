import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/seo";
import { slugSuffix } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/articles/[id]
 * Fetch a single article for the editor view.
 */
export async function GET(req: NextRequest, ctx: RouteContext) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;

  const article = await db.article.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true, slug: true, color: true } },
      author: { select: { id: true, name: true, email: true } },
      tags: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!article) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ article });
}

/**
 * PATCH /api/admin/articles/[id]
 * Update article fields. Body may include any subset of fields.
 * Status transitions: DRAFT → PENDING → PUBLISHED → ARCHIVED, REJECTED.
 *
 * Special transitions:
 * - "approve" → PENDING → PUBLISHED (sets publishedAt, expiresAt)
 * - "reject"  → any → REJECTED
 * - "archive" → PUBLISHED → ARCHIVED
 * - "unpublish" → PUBLISHED → DRAFT
 */
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  const existing = await db.article.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  // Whitelisted updatable fields — content & SEO only.
  // SECURITY: AI metadata (aiSummary, aiConfidence, moderationNotes) is
  // never directly writable via PATCH — only via explicit actions like
  // "approve" / "reject" to preserve audit trail integrity.
  const update: Record<string, unknown> = {};
  const allowed = [
    "title", "excerpt", "content", "coverImageUrl", "coverImageAlt",
    "isBreaking", "featured", "keepForever",
    "metaTitle", "metaDescription",
  ];
  for (const f of allowed) {
    if (f in body) update[f] = body[f];
  }

  // If title changed, regenerate slug (keep unique)
  if (typeof body.title === "string" && body.title !== existing.title) {
    update.title = body.title.trim().slice(0, 200);
    update.slug = `${slugify(update.title as string)}-${slugSuffix()}`;
  }

  // Reading minutes recalc if content changed
  if (typeof body.content === "string") {
    update.readingMinutes = Math.max(1, Math.ceil(body.content.split(/\s+/).length / 220));
  }

  // Category change: admin UI sends slug, we resolve to the actual categoryId
  if (typeof body.categoryId === "string") {
    const { CATEGORIES } = await import("@/lib/constants");
    const cat = CATEGORIES.find((c) => c.slug === body.categoryId);
    if (!cat) {
      return NextResponse.json({ error: `invalid category slug: ${body.categoryId}` }, { status: 422 });
    }
    const dbCat = await db.category.upsert({
      where: { slug: cat.slug },
      create: {
        name: cat.name, slug: cat.slug, description: cat.description,
        icon: cat.icon, color: cat.color,
        order: CATEGORIES.indexOf(cat),
      },
      update: {},
      select: { id: true },
    });
    update.categoryId = dbCat.id;
  }

  // Status transitions
  const action = body.action as string | undefined;
  const now = new Date();
  const PUBLIC_RETENTION_HOURS = 48;

  if (action === "approve") {
    if (existing.status !== "PENDING" && existing.status !== "DRAFT") {
      return NextResponse.json(
        { error: `cannot approve article in status ${existing.status}` },
        { status: 422 },
      );
    }
    update.status = "PUBLISHED";
    update.publishedAt = existing.publishedAt ?? existing.sourcePublishedAt ?? now;
    update.expiresAt = body.keepForever === true
      ? null
      : new Date((update.publishedAt as Date).getTime() + PUBLIC_RETENTION_HOURS * 3600 * 1000);
    update.archivedAt = null;
  } else if (action === "reject") {
    update.status = "REJECTED";
    update.publishedAt = null;
    update.expiresAt = null;
    if (typeof body.moderationNotes === "string") {
      update.moderationNotes = body.moderationNotes.slice(0, 1000);
    }
  } else if (action === "archive") {
    update.status = "ARCHIVED";
    update.archivedAt = now;
    update.expiresAt = null;
  } else if (action === "unpublish") {
    update.status = "DRAFT";
    update.publishedAt = null;
    update.expiresAt = null;
  } else if (action === "schedule") {
    // Schedule for future publication
    const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
    if (!scheduledAt || isNaN(scheduledAt.getTime())) {
      return NextResponse.json({ error: "scheduledAt must be a valid ISO date" }, { status: 422 });
    }
    if (scheduledAt < now) {
      return NextResponse.json({ error: "scheduledAt must be in the future" }, { status: 422 });
    }
    update.status = "SCHEDULED";
    update.publishedAt = scheduledAt;
    update.expiresAt = body.keepForever === true
      ? null
      : new Date(scheduledAt.getTime() + PUBLIC_RETENTION_HOURS * 3600 * 1000);
  } else if (typeof body.status === "string") {
    // Direct status update (admin override)
    const validStatuses = ["DRAFT", "PENDING", "PUBLISHED", "ARCHIVED", "REJECTED", "SCHEDULED"];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({ error: `invalid status: ${body.status}` }, { status: 422 });
    }
    update.status = body.status;
    if (body.status === "PUBLISHED" && !existing.publishedAt) {
      update.publishedAt = now;
      update.expiresAt = body.keepForever === true
        ? null
        : new Date(now.getTime() + PUBLIC_RETENTION_HOURS * 3600 * 1000);
    }
  }

  const updated = await db.article.update({
    where: { id },
    data: update,
    include: { category: { select: { name: true, slug: true, color: true } } },
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: `ARTICLE_${(action ?? "UPDATE").toUpperCase()}`,
      entity: "Article",
      entityId: id,
      metadata: JSON.stringify({
        before: existing.status,
        after: updated.status,
        fields: Object.keys(update),
      }),
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 64) ?? null,
    },
  });

  return NextResponse.json({ ok: true, article: updated });
}

/**
 * DELETE /api/admin/articles/[id]
 * Hard delete (admin only — irreversible).
 * For soft delete use the archive action via PATCH.
 */
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;

  const existing = await db.article.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  // Refuse to hard-delete PUBLISHED articles (use archive instead)
  if (existing.status === "PUBLISHED") {
    return NextResponse.json(
      { error: "cannot hard-delete a published article — use archive action instead" },
      { status: 422 },
    );
  }

  await db.article.delete({ where: { id } });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "ARTICLE_DELETE",
      entity: "Article",
      entityId: id,
      metadata: JSON.stringify({ title: existing.title, slug: existing.slug }),
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 64) ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
