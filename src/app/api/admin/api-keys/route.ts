import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { generateApiKey, hashApiKey } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/api-keys
 * List all API keys (without revealing the raw key — only prefix).
 */
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const keys = await db.apiKey.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, keyPrefix: true, scopes: true,
      enabled: true, lastUsedAt: true, totalCalls: true,
      rateLimitPerMin: true, expiresAt: true, createdAt: true,
    },
  });
  return NextResponse.json({ apiKeys: keys });
}

/**
 * POST /api/admin/api-keys
 * Body: { name, scopes?, rateLimitPerMin?, expiresAt? }
 * Creates a new API key. The RAW key is returned exactly ONCE — never retrievable again.
 */
export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.name || typeof body.name !== "string" || body.name.trim().length < 3) {
    return NextResponse.json({ error: "name is required (min 3 chars)" }, { status: 422 });
  }

  const scopes = Array.isArray(body.scopes)
    ? body.scopes.join(" ")
    : typeof body.scopes === "string"
      ? body.scopes
      : "ingest";

  const rawKey = generateApiKey();
  const keyHash = await hashApiKey(rawKey);
  const keyPrefix = rawKey.slice(0, 12);

  const record = await db.apiKey.create({
    data: {
      name: body.name.trim().slice(0, 80),
      keyHash,
      keyPrefix,
      scopes,
      rateLimitPerMin: Math.min(parseInt(body.rateLimitPerMin ?? "60", 10) || 60, 600),
      enabled: true,
      ownerId: user.id,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    },
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "API_KEY_CREATE",
      entity: "ApiKey",
      entityId: record.id,
      metadata: JSON.stringify({ name: record.name, scopes }),
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 64) ?? null,
    },
  });

  // Return raw key — this is the ONLY time it is shown
  return NextResponse.json(
    {
      ok: true,
      apiKey: {
        id: record.id,
        name: record.name,
        key: rawKey,        // raw key — shown ONCE
        keyPrefix: record.keyPrefix,
        scopes: record.scopes,
        expiresAt: record.expiresAt,
        createdAt: record.createdAt,
      },
      warning:
        "Copy this key now — the full key cannot be retrieved later. Only the prefix will be shown in subsequent requests.",
    },
    {
      status: 201,
      headers: {
        // SECURITY: prevent intermediary proxies from caching the raw key
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
      },
    },
  );
}

/**
 * DELETE /api/admin/api-keys?id=xxx
 * Disable (soft-delete) an API key by setting enabled=false.
 */
export async function DELETE(req: NextRequest) {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 422 });

  await db.apiKey.update({
    where: { id },
    data: { enabled: false },
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "API_KEY_DISABLE",
      entity: "ApiKey",
      entityId: id,
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 64) ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
