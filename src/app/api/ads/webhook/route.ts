// Stripe webhook — receives payment events and marks campaigns as paid.
// IMPORTANT: configure this URL in Stripe Dashboard → Webhooks.
// Verify the signing secret matches STRIPE_WEBHOOK_SECRET env var.
//
// Stripe sends the raw body — Next.js must NOT parse it as JSON before
// reaching this handler. We read as text and pass to constructEvent.
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyStripeWebhook } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing stripe-signature header" }, { status: 400 });
  }

  // Read raw body as text (Stripe requires the raw bytes for signature verification)
  const payload = await req.text();

  let event;
  try {
    event = await verifyStripeWebhook(payload, signature);
  } catch {
    // SECURITY: don't leak Stripe's internal signature error messages
    return NextResponse.json(
      { error: "invalid signature" },
      { status: 400 },
    );
  }

  // Handle the event types we care about
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const campaignId = session.metadata?.campaignId;
        if (!campaignId) break;

        // Idempotent — check if already processed
        const campaign = await db.adCampaign.findUnique({ where: { id: campaignId } });
        if (!campaign) break;
        if (campaign.paid) {
          // Already processed — return 200 OK (idempotent)
          return NextResponse.json({ received: true, idempotent: true });
        }

        await db.adCampaign.update({
          where: { id: campaignId },
          data: { paid: true, status: "APPROVED" },
        });

        await db.auditLog.create({
          data: {
            action: "AD_PAYMENT_RECEIVED",
            entity: "AdCampaign",
            entityId: campaignId,
            metadata: JSON.stringify({
              sessionId: session.id,
              amount: session.amount_total,
              currency: session.currency,
              advertiser: session.customer_email,
            }),
          },
        });
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as any;
        const campaignId = session.metadata?.campaignId;
        if (campaignId) {
          await db.adCampaign.updateMany({
            where: { id: campaignId, paid: false },
            data: { status: "REJECTED" },
          });
        }
        break;
      }
      default:
        // Unhandled event — acknowledge so Stripe doesn't retry
        break;
    }

    return NextResponse.json({ received: true, type: event.type });
  } catch (err) {
    // SECURITY: log full error server-side, return generic message to Stripe
    console.error("[stripe-webhook] handler failed:", err);
    return NextResponse.json(
      { error: "webhook handler failed" },
      { status: 500 },
    );
  }
}
