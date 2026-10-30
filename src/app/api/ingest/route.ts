import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyApiKey } from "@/lib/api-key";
import {
  classifyAgent,
  summarizeAgent,
  dedupeAgent,
  contentHashFor,
  type AgentInput,
} from "@/lib/agents";
import { classifyAgentLLM, summarizeAgentLLM } from "@/lib/agents-llm";
import { CATEGORIES, PROJECT_DEFAULTS } from "@/lib/constants";
import { slugify } from "@/lib/seo";
import { slugSuffix } from "@/lib/crypto";
import { validateImageUrl, safeHrefUrl } from "@/lib/url-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_TEXT_LENGTH = 100_000;
const PUBLIC_RETENTION_HOURS = PROJECT_DEFAULTS.publicRetentionHours;

/**
 * External ingest endpoint for third-party news parsers.
 *
 * POST /api/ingest
 * Headers:
 *   Authorization: Bearer arena_xxx          (required, scope: ingest)
 *   X-Source-Name: <string>                  (optional, overrides body)
 *   Idempotency-Key: <string>               (optional, recommended)
 *
 * Body (application/json):
 *   {
 *     "title": string,
 *     "text":  string,            (raw article body, min 80 chars)
 *     "url":   string,            (canonical source URL)
 *     "publishedAt": ISO8601,     (optional)
 *     "coverImageUrl": string,    (optional)
 *     "categorySlug": string,     (optional; auto-classified if missing)
 *     "tags": string[],           (optional)
 *     "autoPublish": boolean      (optional, default false → PENDING moderation)
 *   }
 *
 * Response:
 *   200 — { ok: true, articleId, slug, status, classification, duplicate }
 *   409 — duplicate, existing article returned
 *   422 — validation error
 *   401/403 — auth failures
 */
export async function POST(req: NextRequest) {
  // 1. Authenticate via API key
  const auth = await verifyApiKey(req, "ingest");
  if (!auth.ok) return auth.response;
  const { ctx } = auth;

  // 2. Parse body
  let body: {
    title: string;
    text: string;
    url?: string;
    publishedAt?: string;
    coverImageUrl?: string;
    coverImageAlt?: string;
    categorySlug?: string;
    tags?: string[];
    autoPublish?: boolean;
    keepForever?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  // 3. Validate
  if (!body.title || body.title.trim().length < 5) {
    return NextResponse.json({ error: "title required (min 5 chars)" }, { status: 422 });
  }
  if (body.title.length > 500) {
    return NextResponse.json({ error: "title too long (max 500 chars)" }, { status: 422 });
  }
  if (!body.text || body.text.trim().length < 80) {
    return NextResponse.json({ error: "text required (min 80 chars)" }, { status: 422 });
  }
  if (body.text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json({ error: `text too large (max ${MAX_TEXT_LENGTH} chars)` }, { status: 413 });
  }

  // 3a. Validate URLs to prevent SSRF and XSS via javascript: scheme
  if (body.url) {
    const safeUrl = safeHrefUrl(body.url);
    if (!safeUrl) {
      return NextResponse.json({ error: "invalid source URL — must be http(s)" }, { status: 422 });
    }
    body.url = safeUrl;
  }
  if (body.coverImageUrl) {
    const imgCheck = await validateImageUrl(body.coverImageUrl);
    if (!imgCheck.ok) {
      return NextResponse.json(
        { error: `invalid coverImageUrl: ${imgCheck.error}` },
        { status: 422 },
      );
    }
  }

  const sourceName =
    req.headers.get("x-source-name") ??
    `parser:${ctx.name}`;

  const agentInput: AgentInput = {
    rawTitle: body.title,
    rawText: body.text,
    sourceUrl: body.url,
    sourceName,
    sourcePublishedAt: body.publishedAt,
  };

  // 4. Content hash for idempotency
  const contentHash = await contentHashFor(agentInput);

  // 5. Check for existing duplicate by contentHash
  const existingByHash = await db.article.findFirst({
    where: { contentHash },
    select: { id: true, title: true, slug: true, status: true },
  });
  if (existingByHash) {
    return NextResponse.json(
      {
        ok: true,
        duplicate: true,
        articleId: existingByHash.id,
        slug: existingByHash.slug,
        status: existingByHash.status,
        message: "duplicate content hash — no new article created",
      },
      { status: 200 },
    );
  }

  // 6. Run AI agents: classify, summarize, dedupe
  // Phase 2: try LLM-enhanced agents first; they fall back to extractive if SDK is unavailable.
  const [classification, summary] = await Promise.all([
    classifyAgentLLM(agentInput),
    summarizeAgentLLM(agentInput),
  ]);

  // Check existing articles for title-similarity duplicates
  const recent = await db.article.findMany({
    where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) } },
    select: { id: true, title: true, contentHash: true },
    take: 200,
  });
  const dedupe = await dedupeAgent(agentInput, recent);

  if (dedupe.is_duplicate && dedupe.matched_id) {
    return NextResponse.json(
      {
        ok: true,
        duplicate: true,
        articleId: dedupe.matched_id,
        matched_title: dedupe.matched_title,
        similarity: dedupe.similarity,
        message: dedupe.reason,
      },
      { status: 200 },
    );
  }

  // 7. Resolve category
  const slug = body.categorySlug ?? classification.primary_category;
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (!category) {
    return NextResponse.json(
      { error: `unknown category slug: ${slug}` },
      { status: 422 },
    );
  }

  // Persist category in DB if not seeded yet (Phase 2 will seed from constants)
  const dbCategory = await db.category.upsert({
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
    select: { id: true },
  });

  // 8. Decide status — never auto-publish unless explicitly allowed
  let status: "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED" = "PENDING";
  if (body.autoPublish === true && classification.moderation_recommendation === "publish") {
    status = "PUBLISHED";
  } else if (classification.moderation_recommendation === "reject") {
    status = "REJECTED";
  }

  // 9. Create article
  const now = new Date();
  const sourcePublishedAt = body.publishedAt ? new Date(body.publishedAt) : now;
  const publishedAt = status === "PUBLISHED" ? sourcePublishedAt : null;
  // Fix H14: previously always null — now properly set for PUBLISHED articles
  // unless keepForever is requested. PENDING articles don't get an expiry.
  const expiresAt = status === "PUBLISHED"
    ? (body.keepForever === true
        ? null
        : new Date((publishedAt ?? now).getTime() + PUBLIC_RETENTION_HOURS * 3600 * 1000))
    : null;

  const article = await db.article.create({
    data: {
      title: summary.proposed_title,
      slug: slugify(summary.proposed_title) + "-" + slugSuffix(),
      excerpt: summary.concise_summary.slice(0, 280),
      content: body.text,
      coverImageUrl: body.coverImageUrl,
      coverImageAlt: body.coverImageAlt,
      status,
      aiSummary: summary.concise_summary,
      aiConfidence: classification.editorial_confidence,
      aiCategories: JSON.stringify([
        classification.primary_category,
        ...classification.secondary_categories,
      ]),
      sensitivityFlags: JSON.stringify(classification.sensitivity_flags),
      moderationNotes: classification.reason_for_rejection,
      sourceName,
      sourceUrl: body.url,
      sourcePublishedAt,
      retrievedAt: now,
      contentHash,
      publishedAt,
      expiresAt,
      readingMinutes: Math.max(1, Math.ceil(body.text.split(/\s+/).length / 220)),
      categoryId: dbCategory.id,
    },
  });

  // 10. Audit log
  await db.auditLog.create({
    data: {
      userId: null,
      action: "INGEST_ARTICLE",
      entity: "Article",
      entityId: article.id,
      metadata: JSON.stringify({
        apiKey: ctx.name,
        sourceName,
        category: category.slug,
        moderation: classification.moderation_recommendation,
        duplicate: false,
      }),
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 64) ?? null,
    },
  });

  return NextResponse.json(
    {
      ok: true,
      duplicate: false,
      articleId: article.id,
      slug: article.slug,
      status: article.status,
      classification,
      summary,
      message:
        status === "PUBLISHED"
          ? "Article published to the live feed."
          : status === "REJECTED"
            ? "Article auto-rejected by moderation. See moderationNotes."
            : "Article created in PENDING status — an editor must approve before publication.",
    },
    { status: 201 },
  );
}

/**
 * GET /api/ingest
 * Returns documentation summary for the ingest endpoint.
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/ingest",
    method: "POST",
    auth: "Bearer arena_xxx (API key with scope 'ingest')",
    description:
      "Submit an article from a third-party parser. AI agents auto-classify and summarize; duplicate detection by content hash + title similarity.",
    fields: {
      title: "string (required, min 5 chars)",
      text: "string (required, min 80 chars)",
      url: "string (canonical source URL)",
      publishedAt: "ISO8601 (optional)",
      coverImageUrl: "string (optional)",
      categorySlug: "string (optional; auto-classified if missing)",
      tags: "string[] (optional)",
      autoPublish: "boolean (default false — articles default to PENDING moderation)",
    },
    response: {
      ok: "boolean",
      duplicate: "boolean",
      articleId: "string",
      slug: "string",
      status: "DRAFT | PENDING | PUBLISHED | REJECTED",
      classification: "ClassifyResult",
      summary: "SummarizeResult",
    },
  });
}
