// Vercel Cron — processes pending social distribution jobs every 5 minutes.
// Schedule in vercel.json: "*/5 * * * *"
// Auth: Authorization: Bearer <CRON_SECRET> header only (no query-string fallback).
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { processPublicationJob } from "@/lib/social";
import { timingSafeEqualSecret } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function verifyCronAuth(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const provided = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  return timingSafeEqualSecret(provided, cronSecret);
}

export async function GET(req: NextRequest) {
  if (!verifyCronAuth(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const stats = { processed: 0, succeeded: 0, failed: 0, retrying: 0, dead_lettered: 0 };

  // Pick up to 20 due PENDING or PROCESSING-stuck jobs
  const now = new Date();
  const jobs = await db.publicationJob.findMany({
    where: {
      OR: [
        { status: "PENDING", nextRetryAt: { lte: now } },
        { status: "PENDING", nextRetryAt: null },
      ],
    },
    take: 20,
    orderBy: { createdAt: "asc" },
  });

  for (const job of jobs) {
    stats.processed++;
    try {
      const result = await processPublicationJob(job.id);
      if (result.ok) stats.succeeded++;
      else if (result.retryable) stats.retrying++;
      else stats.dead_lettered++;
    } catch (err) {
      stats.failed++;
      await db.publicationJob.update({
        where: { id: job.id },
        data: { lastError: String(err).slice(0, 500) },
      });
    }
  }

  return NextResponse.json({
    ok: true,
    durationMs: Date.now() - startedAt,
    stats,
  });
}
