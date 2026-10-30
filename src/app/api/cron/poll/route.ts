// Vercel Cron — polls all enabled RSS sources every 10 minutes.
// Configure in vercel.json:
//   { "crons": [{ "path": "/api/cron/poll", "schedule": "*/10 * * * *" }] }
//
// Auth: Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` header only.
// Query-string secret is intentionally NOT accepted (it would leak in CDN logs).

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fetchFeed, DEFAULT_PERMITTED_SOURCES } from "@/lib/rss";
import {
  classifyAgent,
  summarizeAgent,
  dedupeAgent,
  contentHashFor,
  type AgentInput,
} from "@/lib/agents";
import { classifyAgentLLM, summarizeAgentLLM } from "@/lib/agents-llm";
import { CATEGORIES } from "@/lib/constants";
import { slugify } from "@/lib/seo";
import { slugSuffix, timingSafeEqualSecret } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // Vercel Pro allows up to 300s; safe default 60s

const PUBLIC_RETENTION_HOURS = 48;

function verifyCronAuth(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const provided = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  return timingSafeEqualSecret(provided, cronSecret);
}

export async function POST(req: NextRequest) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return runPoll(req);
}

// GET also works (for Vercel Cron which uses GET by default)
export async function GET(req: NextRequest) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return runPoll(req);
}

async function runPoll(req: NextRequest): Promise<NextResponse> {
  const startedAt = Date.now();
  const stats = {
    sources_total: 0,
    sources_success: 0,
    sources_failed: 0,
    items_seen: 0,
    items_ingested: 0,
    items_duplicate: 0,
    items_rejected: 0,
    errors: [] as { source: string; error: string }[],
  };

  // 2. Ensure default sources exist in DB (idempotent)
  for (const src of DEFAULT_PERMITTED_SOURCES) {
    await db.source.upsert({
      where: { slug: src.slug },
      create: {
        name: src.name,
        slug: src.slug,
        type: "RSS",
        url: src.url,
        homepageUrl: src.homepageUrl,
        pollIntervalSec: src.pollIntervalSec,
        enabled: true,
        rateLimitPerMin: 30,
      },
      update: {
        url: src.url,
        homepageUrl: src.homepageUrl,
      },
    });
  }

  // 3. Pick sources to poll — enabled + due (lastPolled older than pollInterval)
  const now = new Date();
  const sources = await db.source.findMany({
    where: { enabled: true, type: "RSS" },
    take: 20, // Cap per run for safety
  });
  stats.sources_total = sources.length;

  // 4. Poll each source sequentially (avoid hammering upstream)
  for (const source of sources) {
    const dueAt = source.lastPolledAt
      ? new Date(source.lastPolledAt.getTime() + source.pollIntervalSec * 1000)
      : new Date(0);

    if (now < dueAt) {
      // Source not yet due — skip
      continue;
    }

    // Update lastPolledAt immediately to prevent re-entry
    await db.source.update({
      where: { id: source.id },
      data: { lastPolledAt: now },
    });

    const result = await fetchFeed(source.url);

    if (result.error || !result.feed) {
      stats.sources_failed++;
      stats.errors.push({ source: source.slug, error: result.error ?? "no feed" });
      await db.source.update({
        where: { id: source.id },
        data: { lastError: result.error ?? "no feed", lastErrorAt: now },
      });
      continue;
    }

    stats.sources_success++;
    await db.source.update({
      where: { id: source.id },
      data: { lastError: null, lastErrorAt: null, lastSuccessAt: now },
    });

    // Resolve default category for this source
    const permitted = DEFAULT_PERMITTED_SOURCES.find((s) => s.slug === source.slug);
    const defaultCatSlug = permitted?.defaultCategorySlug ?? "technology-ai";
    const defaultCategory = CATEGORIES.find((c) => c.slug === defaultCatSlug) ?? CATEGORIES[0];

    // 5. For each item — dedupe + classify + summarize + ingest
    for (const item of result.feed.items.slice(0, 20)) {
      stats.items_seen++;

      const agentInput: AgentInput = {
        rawTitle: item.title,
        rawText: item.contentEncoded ?? item.description ?? item.title,
        sourceUrl: item.link,
        sourceName: source.name,
        sourcePublishedAt: item.pubDate?.toISOString(),
      };

      const contentHash = await contentHashFor(agentInput);

      // Duplicate by content hash?
      const existing = await db.article.findFirst({
        where: { contentHash },
        select: { id: true, title: true },
      });
      if (existing) {
        stats.items_duplicate++;
        continue;
      }

      // Run AI agents — LLM-enhanced, with extractive fallback
      const [classification, summary] = await Promise.all([
        classifyAgentLLM(agentInput),
        summarizeAgentLLM(agentInput),
      ]);

      // Title similarity dedupe against recent articles
      const recent = await db.article.findMany({
        where: { createdAt: { gte: new Date(now.getTime() - 24 * 3600 * 1000) } },
        select: { id: true, title: true },
        take: 100,
      });
      const dedupe = await dedupeAgent(agentInput, recent);
      if (dedupe.is_duplicate) {
        stats.items_duplicate++;
        continue;
      }

      // Reject sensitive content
      if (classification.moderation_recommendation === "reject") {
        stats.items_rejected++;
        continue;
      }

      // Resolve category in DB
      const slug = classification.primary_category ?? defaultCatSlug;
      const cat = CATEGORIES.find((c) => c.slug === slug) ?? defaultCategory;
      const dbCat = await db.category.upsert({
        where: { slug: cat.slug },
        create: {
          name: cat.name, slug: cat.slug, description: cat.description,
          icon: cat.icon, color: cat.color,
          order: CATEGORIES.indexOf(cat),
        },
        update: {},
      });

      const publishedAt = item.pubDate ?? now;
      const expiresAt = new Date(publishedAt.getTime() + PUBLIC_RETENTION_HOURS * 3600 * 1000);

      // By default, RSS items stay PENDING for editor review.
      // If source is trusted (no sensitive flags, high confidence) and
      // publish_without_review is true in env, auto-publish.
      const autoPublishEnabled = process.env.AUTO_PUBLISH_FROM_RSS === "true";
      const shouldAutoPublish =
        autoPublishEnabled &&
        classification.moderation_recommendation === "publish" &&
        classification.editorial_confidence >= 0.7;

      await db.article.create({
        data: {
          title: summary.proposed_title,
          slug: slugify(summary.proposed_title) + "-" + slugSuffix(),
          excerpt: summary.concise_summary.slice(0, 280),
          content: agentInput.rawText,
          status: shouldAutoPublish ? "PUBLISHED" : "PENDING",
          aiSummary: summary.concise_summary,
          aiConfidence: classification.editorial_confidence,
          aiCategories: JSON.stringify([
            classification.primary_category,
            ...classification.secondary_categories,
          ]),
          sensitivityFlags: JSON.stringify(classification.sensitivity_flags),
          sourceName: source.name,
          sourceUrl: item.link,
          sourcePublishedAt: publishedAt,
          retrievedAt: now,
          contentHash,
          publishedAt: shouldAutoPublish ? publishedAt : null,
          expiresAt: shouldAutoPublish ? expiresAt : null,
          readingMinutes: Math.max(1, Math.ceil(agentInput.rawText.split(/\s+/).length / 220)),
          categoryId: dbCat.id,
        },
      });
      stats.items_ingested++;
    }

    // Update source stats
    await db.source.update({
      where: { id: source.id },
      data: { totalIngested: { increment: stats.items_ingested } },
    });
  }

  // 6. Archive expired articles (older than 48h, not keepForever)
  const cutoff = new Date(now.getTime() - PUBLIC_RETENTION_HOURS * 3600 * 1000);
  const archived = await db.article.updateMany({
    where: {
      status: "PUBLISHED",
      keepForever: false,
      publishedAt: { lt: cutoff },
    },
    data: { status: "ARCHIVED", archivedAt: now, expiresAt: null },
  });

  // 7. Publish SCHEDULED articles whose time has come
  const scheduled = await db.article.updateMany({
    where: {
      status: "SCHEDULED",
      publishedAt: { lte: now },
    },
    data: { status: "PUBLISHED" },
  });

  return NextResponse.json({
    ok: true,
    startedAt: new Date(startedAt).toISOString(),
    durationMs: Date.now() - startedAt,
    stats: { ...stats, archived_count: archived.count, scheduled_published: scheduled.count },
  });
}
