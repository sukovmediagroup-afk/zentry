import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const campaigns = await db.adCampaign.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ campaigns });
}

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.advertiser || !body?.targetUrl) {
    return NextResponse.json({ error: "name, advertiser and targetUrl are required" }, { status: 422 });
  }

  // Validate targetUrl — prevents javascript: scheme XSS in admin panel
  let safeTargetUrl = "";
  try {
    const parsed = new URL(String(body.targetUrl));
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return NextResponse.json({ error: "targetUrl must use http or https" }, { status: 422 });
    }
    safeTargetUrl = String(body.targetUrl).slice(0, 1000);
  } catch {
    return NextResponse.json({ error: "targetUrl is not a valid URL" }, { status: 422 });
  }

  // Validate imageUrl if provided
  let safeImageUrl: string | null = null;
  if (body.imageUrl) {
    try {
      const parsed = new URL(String(body.imageUrl));
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return NextResponse.json({ error: "imageUrl must use http or https" }, { status: 422 });
      }
      safeImageUrl = String(body.imageUrl).slice(0, 1000);
    } catch {
      return NextResponse.json({ error: "imageUrl is not a valid URL" }, { status: 422 });
    }
  }

  const campaign = await db.adCampaign.create({
    data: {
      name: String(body.name).slice(0, 200),
      advertiser: String(body.advertiser).slice(0, 200),
      format: String(body.format ?? "sidebar").slice(0, 30),
      targetUrl: safeTargetUrl,
      imageUrl: safeImageUrl,
      priceUsd: Math.max(1, parseFloat(body.priceUsd ?? "0") || 0),
      startAt: body.startAt ? new Date(body.startAt) : new Date(),
      endAt: body.endAt ? new Date(body.endAt) : new Date(Date.now() + 7 * 24 * 3600 * 1000),
      paid: false,
      status: "PENDING",
    },
  });

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "AD_CAMPAIGN_CREATE",
      entity: "AdCampaign",
      entityId: campaign.id,
      metadata: JSON.stringify({ name: campaign.name, price: campaign.priceUsd }),
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 64) ?? null,
    },
  });

  return NextResponse.json({ ok: true, campaign }, { status: 201 });
}
