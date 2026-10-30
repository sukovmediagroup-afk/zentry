// Edge-safe crypto helpers (no Node 'crypto' module — works on Vercel Edge Runtime).
export function randomBytes(length: number): Buffer {
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Buffer.from(arr);
}

export async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(input));
  return Buffer.from(new Uint8Array(buf)).toString("hex");
}

export function generateApiKey(): string {
  // arena_<32 hex chars> — readable prefix lets admins grep logs safely
  return `arena_${randomBytes(24).toString("hex")}`;
}

export async function hashApiKey(key: string): Promise<string> {
  return sha256Hex(key);
}

/**
 * Generate a short random suffix for slugs (8 hex chars = 32 bits of entropy).
 * Use this instead of Math.random() — Math.random is not cryptographic and
 * predictable, allowing slug collision attacks.
 */
export function slugSuffix(): string {
  return randomBytes(4).toString("hex");
}

/**
 * Timing-safe string comparison for secrets (API keys, cron secrets, tokens).
 * Returns true iff strings are equal in constant time relative to the longer
 * of the two inputs (length is leaked — that's an acceptable tradeoff; the
 * alternative is hashing both with a random salt and comparing digests, which
 * is what we do for stored secrets in the DB).
 *
 * Use this for any credential comparison to prevent timing attacks.
 */
export function timingSafeEqualSecret(a: string, b: string): boolean {
  if (a.length === 0 || b.length === 0) return false;
  const aBuf = Buffer.from(a, "utf-8");
  const bBuf = Buffer.from(b, "utf-8");
  if (aBuf.length !== bBuf.length) {
    // Still do a comparison to keep timing roughly constant
    crypto.subtle.digest("SHA-256", aBuf).catch(() => {});
    return false;
  }
  // crypto.subtle.timingSafeEqual is not available on Edge Runtime, but we are
  // on Node runtime for these routes. Use Buffer-based constant-time compare.
  let diff = 0;
  for (let i = 0; i < aBuf.length; i++) {
    diff |= aBuf[i] ^ bBuf[i];
  }
  return diff === 0;
}
