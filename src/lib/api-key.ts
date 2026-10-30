// API-key authentication for ARENA USA external ingest endpoint.
// Third-party parsers send: Authorization: Bearer arena_xxx
// or: x-api-key: arena_xxx
//
// SECURITY: query-string `?api_key=` is intentionally NOT supported —
// it would leak into CDN/access logs and Referer headers.
import { NextRequest, NextResponse } from "next/server";
import { db } from "./db";
import { hashApiKey, timingSafeEqualSecret } from "./crypto";

export interface ApiKeyContext {
  keyId: string;
  name: string;
  scopes: string[];
}

// In-memory sliding-window rate limiter (per cold-start instance).
// On Vercel serverless this resets per instance, but it still caps abuse.
// For true per-key rate limiting across instances, use Upstash Redis.
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(keyId: string, limitPerMin: number): boolean {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(keyId);
  if (!bucket || bucket.resetAt < now) {
    rateLimitBuckets.set(keyId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (bucket.count >= limitPerMin) {
    return false;
  }
  bucket.count++;
  return true;
}

export async function verifyApiKey(req: NextRequest, requiredScope: string): Promise<{ ok: true; ctx: ApiKeyContext } | { ok: false; response: NextResponse }> {
  const raw = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "")
    ?? req.headers.get("x-api-key");

  if (!raw || !raw.startsWith("arena_") || raw.length < 16) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "missing or malformed API key", hint: "send 'Authorization: Bearer arena_xxx' or 'x-api-key: arena_xxx'" },
        { status: 401 },
      ),
    };
  }

  const keyHash = await hashApiKey(raw);
  const record = await db.apiKey.findUnique({
    where: { keyHash },
    select: {
      id: true, name: true, scopes: true, enabled: true,
      rateLimitPerMin: true, expiresAt: true, totalCalls: true,
    },
  });

  if (!record || !record.enabled) {
    return { ok: false, response: NextResponse.json({ error: "invalid or disabled API key" }, { status: 403 }) };
  }
  if (record.expiresAt && record.expiresAt < new Date()) {
    return { ok: false, response: NextResponse.json({ error: "API key expired" }, { status: 403 }) };
  }

  const scopes = record.scopes.split(/\s+/).filter(Boolean);
  if (!scopes.includes(requiredScope)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: `insufficient scope; required: '${requiredScope}', have: ${scopes.join(", ") || "(none)"}` },
        { status: 403 },
      ),
    };
  }

  // Enforce rate limit
  if (!checkRateLimit(record.id, record.rateLimitPerMin)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "rate limit exceeded", retryAfter: 60 },
        { status: 429 },
      ),
    };
  }

  // Best-effort usage tracking — fire and forget, never fail the request
  db.apiKey.update({
    where: { id: record.id },
    data: { lastUsedAt: new Date(), totalCalls: { increment: 1 } },
  }).catch(() => {});

  return {
    ok: true,
    ctx: { keyId: record.id, name: record.name, scopes },
  };
}
