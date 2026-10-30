import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  verifyPassword,
  createSession,
  destroySession,
  hashPassword,
  SESSION_COOKIE,
  ensureBootstrapAdmin,
} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// In-memory rate limiter per IP+email — protects against brute force.
// Resets every minute. For Vercel multi-instance, use Upstash Redis.
const attemptBuckets = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS_PER_MIN = 10;

function checkLoginRate(key: string): boolean {
  const now = Date.now();
  const bucket = attemptBuckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    attemptBuckets.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (bucket.count >= MAX_ATTEMPTS_PER_MIN) return false;
  bucket.count++;
  return true;
}

export async function POST(req: NextRequest) {
  // Make sure a default admin exists (created from env on first run)
  await ensureBootstrapAdmin();

  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!email || !password) {
    return NextResponse.json({ error: "email and password are required" }, { status: 422 });
  }

  // Rate limit per IP+email
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 64) ?? "unknown";
  const rateKey = `${ip}:${email}`;
  if (!checkLoginRate(rateKey)) {
    return NextResponse.json(
      { error: "too many login attempts — try again in a minute" },
      { status: 429 },
    );
  }

  const user = await db.user.findUnique({ where: { email } });

  // CRITICAL: always run a PBKDF2 verification (even for non-existent users)
  // to prevent user-enumeration via timing oracle. DUMMY_HASH is a valid
  // hash format, so verifyPassword runs in constant time.
  const passwordHash = user?.passwordHash ?? "pbkdf2$100000$00000000000000000000000000000000$0000000000000000000000000000000000000000000000000000000000000000";
  const ok = await verifyPassword(password, passwordHash);

  if (!user || !user.passwordHash || !ok) {
    return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  }

  const userAgent = req.headers.get("user-agent")?.slice(0, 256) ?? null;
  const token = await createSession(user.id, ip, userAgent);

  await db.auditLog.create({
    data: {
      userId: user.id,
      action: "LOGIN",
      entity: "User",
      entityId: user.id,
      ip,
      metadata: JSON.stringify({ userAgent }),
    },
  });

  const res = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

export async function DELETE(req: NextRequest) {
  // CRITICAL: invalidate the session in the DB, not just the cookie.
  // Otherwise a captured cookie remains valid for up to 7 days.
  const cookieValue = req.cookies.get(SESSION_COOKIE)?.value;
  if (cookieValue) {
    await destroySession(cookieValue);
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
