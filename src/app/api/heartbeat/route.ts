import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
const ACTIVE_WINDOW_SEC = 60; // sessions active in last 60s
const MAX_SESSIONS_PER_IP_PER_MIN = 5;

// In-memory rate limiter per IP — caps the number of distinct sessionIds
// a single IP can register per minute, preventing visitor-count inflation.
const ipBuckets = new Map<string, { count: number; resetAt: number; sessionIds: Set<string> }>();

/**
 * POST /api/heartbeat
 * Body: { sessionId, path }
 *
 * SECURITY:
 * - sessionId must be a string of 5-80 chars, starting with "s_"
 * - IP-based rate limit caps abuse: each IP can register only 5 distinct
 *   sessionIds per minute (heartbeats from the same session are always allowed).
 *
 * DELETE /api/heartbeat?sessionId=xxx
 * Best-effort cleanup on page unload.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const sessionId = String(body.sessionId ?? "").slice(0, 80);
    const path = String(body.path ?? "/").slice(0, 200);
    if (!sessionId.startsWith("s_") || sessionId.length < 5) {
      return NextResponse.json({ error: "invalid sessionId" }, { status: 400 });
    }

    // IP-based rate limit
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 64) ??
      req.headers.get("x-real-ip")?.slice(0, 64) ??
      "unknown";
    const now = Date.now();
    let bucket = ipBuckets.get(ip);
    if (!bucket || bucket.resetAt < now) {
      bucket = { count: 0, resetAt: now + 60_000, sessionIds: new Set() };
      ipBuckets.set(ip, bucket);
    }
    if (bucket.sessionIds.has(sessionId)) {
      // Same session — always allowed (heartbeats repeat every 30s)
    } else if (bucket.sessionIds.size >= MAX_SESSIONS_PER_IP_PER_MIN) {
      return NextResponse.json(
        { error: "too many sessions from this IP — try again later" },
        { status: 429 },
      );
    } else {
      bucket.sessionIds.add(sessionId);
    }

    const nowDate = new Date();
    const userAgent = req.headers.get("user-agent")?.slice(0, 256) ?? null;

    // Upsert session
    await db.visitorSession.upsert({
      where: { sessionId },
      create: {
        sessionId,
        ip,
        userAgent,
        path,
        lastSeenAt: nowDate,
      },
      update: { lastSeenAt: nowDate, path },
    });

    // Count active sessions in the active window
    const cutoff = new Date(nowDate.getTime() - ACTIVE_WINDOW_SEC * 1000);
    const active = await db.visitorSession.count({
      where: { lastSeenAt: { gte: cutoff } },
    });

    return NextResponse.json({ activeCount: active, ok: true });
  } catch {
    // Don't leak error details to the client
    return NextResponse.json({ error: "heartbeat failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("sessionId");
    if (!sessionId || !sessionId.startsWith("s_") || sessionId.length > 80) {
      return NextResponse.json({ ok: true });
    }

    // Mark as inactive instead of deleting (analytics keep a 24h record)
    await db.visitorSession.updateMany({
      where: { sessionId },
      data: { lastSeenAt: new Date(Date.now() - 10 * 60 * 1000) }, // 10 min ago
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
