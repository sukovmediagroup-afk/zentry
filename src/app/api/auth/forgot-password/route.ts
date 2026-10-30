// POST /api/auth/forgot-password
// Body: { email }
// Generates a reset token (hashed in DB), sends email with reset link.
// Always returns 200 (don't leak which emails exist).
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomBytes, sha256Hex } from "@/lib/crypto";
import { sendEmail, passwordResetEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RESET_TTL_HOURS = 1;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "valid email required" }, { status: 422 });
  }

  const user = await db.user.findUnique({ where: { email } });

  if (user) {
    // Generate reset token
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = await sha256Hex(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TTL_HOURS * 3600 * 1000);
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 64) ?? null;

    // Invalidate previous unused tokens for this user
    await db.passwordReset.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    await db.passwordReset.create({
      data: { userId: user.id, tokenHash, expiresAt, ip },
    });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://arena-usa.vercel.app";
    const resetUrl = `${baseUrl}/admin/reset-password?token=${rawToken}`;

    const emailPayload = passwordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
      expiresInHours: RESET_TTL_HOURS,
    });

    const result = await sendEmail(emailPayload);
    if (!result.ok) {
      console.error("[forgot-password] email send failed:", result.error);
      // Don't leak the failure — still return 200 to the user
    }

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "PASSWORD_RESET_REQUESTED",
        entity: "User",
        entityId: user.id,
        ip,
      },
    });
  }

  // Always return 200 — security best practice (don't reveal which emails exist)
  return NextResponse.json({
    ok: true,
    message: "If an account exists for that email, a reset link has been sent.",
  });
}
