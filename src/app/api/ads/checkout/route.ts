// Create a Stripe Checkout Session for an ad campaign.
// Called by the advertiser dashboard after the admin pre-approves the campaign.
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { campaignId } = body;
  if (!campaignId) {
    return NextResponse.json({ error: "campaignId required" }, { status: 422 });
  }

  const campaign = await db.adCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) {
    return NextResponse.json({ error: "campaign not found" }, { status: 404 });
  }
  if (campaign.paid) {
    return NextResponse.json({ error: "campaign already paid", checkoutUrl: null }, { status: 409 });
  }

  const result = await createCheckoutSession({
    campaignId: campaign.id,
    amount: Math.round(campaign.priceUsd * 100), // to cents
    currency: "usd",
    advertiserEmail: campaign.advertiser,
    campaignName: campaign.name,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  // Store sessionId for audit
  await db.adCampaign.update({
    where: { id: campaign.id },
    data: { status: "PENDING" }, // awaiting payment
  });

  return NextResponse.json({
    ok: true,
    sessionId: result.sessionId,
    checkoutUrl: result.url,
  });
}
