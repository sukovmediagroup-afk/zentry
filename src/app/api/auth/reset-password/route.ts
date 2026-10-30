// POST /api/auth/reset-password
// Body: { token, newPassword }
// Verifies token, updates password, invalidates all sessions.
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sha256Hex } from "@/lib/crypto";
import { hashPassword, destroyAllUserSessions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_PASSWORD_LENGTH = 8;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const token = String(body.token ?? "");
  const newPassword = String(body.newPassword ?? "");

  if (!token || token.length < 32) {
    return NextResponse.json({ error: "invalid or expired token" }, { status: 400 });
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json({ error: `password must be at least ${MIN_PASSWORD_LENGTH} characters` }, { status: 422 });
  }

  const tokenHash = await sha256Hex(token);
  const reset = await db.passwordReset.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  // CRITICAL: return the same generic error for "not found", "used", "expired"
  // to prevent an attacker from probing token state.
  if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
    return NextResponse.json({ error: "invalid or expired token" }, { status: 400 });
  }

  // Update password
  const passwordHash = await hashPassword(newPassword);
  await db.user.update({
    where: { id: reset.userId },
    data: { passwordHash, updatedAt: new Date() },
  });

  // Mark token as used
  await db.passwordReset.update({
    where: { id: reset.id },
    data: { usedAt: new Date() },
  });

  // Invalidate ALL sessions for this user (force re-login everywhere)
  await destroyAllUserSessions(reset.userId);

  await db.auditLog.create({
    data: {
      userId: reset.userId,
      action: "PASSWORD_RESET_COMPLETED",
      entity: "User",
      entityId: reset.userId,
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 64) ?? null,
    },
  });

  return NextResponse.json({
    ok: true,
    message: "Password updated successfully. Please sign in with your new password.",
  });
}
