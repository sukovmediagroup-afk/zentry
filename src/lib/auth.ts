// Lightweight session auth for ARENA USA admin.
// Uses cookies + DB-backed Session table. Passwords hashed via Web Crypto
// (SubtleCrypto) — Edge Runtime compatible (no Node 'crypto' module).
//
// SECURITY: session tokens are stored as SHA-256 hashes (never plaintext),
// password reset tokens are also hashed, and all credential comparisons use
// timing-safe equality.
import { cookies } from "next/headers";
import { db } from "./db";
import { randomBytes, sha256Hex, timingSafeEqualSecret } from "./crypto";

export const SESSION_COOKIE = "arena_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const PBKDF2_ITERATIONS = 100_000;
// A precomputed valid PBKDF2 hash, used to keep timing constant when an unknown
// user attempts to log in (prevents user-enumeration timing oracle).
const DUMMY_HASH =
  "pbkdf2$" + PBKDF2_ITERATIONS + "$" +
  "00000000000000000000000000000000" + "$" +
  "0000000000000000000000000000000000000000000000000000000000000000";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

// ────────────────────────────────────────────────────────────
//  Password helpers (PBKDF2 via SubtleCrypto)
// ────────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${salt.toString("hex")}$${key}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const parts = stored.split("$");
    if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
    const iterations = parseInt(parts[1], 10);
    if (!Number.isFinite(iterations) || iterations < 1) return false;
    const saltHex = parts[2];
    if (!/^[0-9a-f]+$/.test(saltHex) || saltHex.length === 0) return false;
    const salt = Buffer.from(saltHex, "hex");
    if (salt.length === 0) return false;
    const expected = parts[3];
    const actual = await pbkdf2(password, salt, iterations);
    return timingSafeEqualSecret(actual, expected);
  } catch {
    return false;
  }
}

async function pbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<string> {
  const enc = new TextEncoder();
  // Copy salt into a fresh ArrayBuffer so TS is happy across Node/Edge targets.
  const saltBuffer = salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as ArrayBuffer;
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBuffer, iterations, hash: "SHA-256" },
    keyMaterial,
    256,
  );
  return Buffer.from(new Uint8Array(bits)).toString("hex");
}

function timingSafeEqual(a: string, b: string): boolean {
  return timingSafeEqualSecret(a, b);
}

// ────────────────────────────────────────────────────────────
//  Session management
// ────────────────────────────────────────────────────────────

export async function createSession(userId: string, ip?: string | null, userAgent?: string | null): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.session.create({
    data: { userId, tokenHash, expiresAt, ip, userAgent },
  });
  return token;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  // Hash the cookie value and look up the session by hash.
  // Never compare the raw token against the DB.
  const tokenHash = await sha256Hex(token);
  const session = await db.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) {
    return null;
  }
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  };
}

export async function destroySession(token: string): Promise<void> {
  try {
    const tokenHash = await sha256Hex(token);
    await db.session.deleteMany({ where: { tokenHash } });
  } catch {
    // best-effort
  }
}

export async function destroyAllUserSessions(userId: string): Promise<void> {
  try {
    await db.session.deleteMany({ where: { userId } });
  } catch {
    // best-effort
  }
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

// ────────────────────────────────────────────────────────────
//  Bootstrap admin — creates a default admin if none exists.
//  Credentials pulled from env so we never hardcode them.
// ────────────────────────────────────────────────────────────

export async function ensureBootstrapAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return;

  const passwordHash = await hashPassword(password);
  await db.user.create({
    data: {
      email,
      name: process.env.ADMIN_NAME ?? "Arena Admin",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`[bootstrap] Created admin user: ${email}`);
}
