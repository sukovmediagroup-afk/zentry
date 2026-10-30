// ARENA USA — Stripe integration for ad campaign payments (Phase 2)
// Uses the official stripe npm package. The webhook verifies signatures.
// All amount/currency is set at order creation (immutable).

import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (stripeInstance) return stripeInstance;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  stripeInstance = new Stripe(key, {
    apiVersion: "2025-08-27.basil" as any,
    appInfo: { name: "ARENA USA", version: "0.1.0" },
  });
  return stripeInstance;
}

export interface AdCampaignOrder {
  campaignId: string;
  amount: number;       // cents in USD
  currency: string;     // "usd"
  advertiserEmail: string;
  campaignName: string;
}

/**
 * Create a Stripe Checkout Session for an ad campaign.
 * Returns the session URL the advertiser should be redirected to.
 */
export async function createCheckoutSession(order: AdCampaignOrder): Promise<{
  ok: true;
  sessionId: string;
  url: string;
} | {
  ok: false;
  error: string;
}> {
  const stripe = getStripe();
  if (!stripe) {
    return { ok: false, error: "Stripe not configured — set STRIPE_SECRET_KEY env var" };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: order.advertiserEmail,
      line_items: [{
        price_data: {
          currency: order.currency,
          product_data: {
            name: `Ad Campaign — ${order.campaignName}`,
            description: `ARENA USA advertising placement. Campaign ID: ${order.campaignId}`,
          },
          unit_amount: order.amount, // cents
        },
        quantity: 1,
      }],
      metadata: {
        campaignId: order.campaignId,
        campaignName: order.campaignName,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://arena-usa.vercel.app"}/admin/ads?session_id={CHECKOUT_SESSION_ID}&campaign_id=${order.campaignId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://arena-usa.vercel.app"}/admin/ads?cancelled=1&campaign_id=${order.campaignId}`,
    });

    return {
      ok: true,
      sessionId: session.id,
      url: session.url ?? "",
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "stripe session creation failed",
    };
  }
}

/**
 * Verify a Stripe webhook signature and parse the event.
 * Throws on invalid signature.
 */
export async function verifyStripeWebhook(
  payload: string | Buffer,
  signature: string,
): Promise<Stripe.Event> {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe not configured");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET not set");

  return stripe.webhooks.constructEvent(
    payload as Buffer,
    signature,
    secret,
  );
}
