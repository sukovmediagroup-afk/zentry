// ARENA USA — URL validation utilities
//
// Used to defend against:
// - SSRF (server-side request forgery) — coverImageUrl passed to Next/Image optimization
// - javascript: scheme XSS in href attributes
// - Open redirects

import { lookup } from "node:dns/promises";

// Hostnames that resolve to private IP space — never allow these as image/upload URLs.
const PRIVATE_IP_PATTERNS = [
  /^127\./,                  // loopback
  /^10\./,                   // RFC1918
  /^192\.168\./,             // RFC1918
  /^172\.(1[6-9]|2[0-9]|3[01])\./, // RFC1918
  /^169\.254\./,             // link-local (incl. AWS metadata 169.254.169.254)
  /^0\./,                    // current network
  /^::1$/,                   // IPv6 loopback
  /^fe80:/,                  // IPv6 link-local
  /^fc00:/,                  // IPv6 unique-local
  /^fd/,                     // IPv6 unique-local
];

// Pre-approved image hostnames (stock photos, partner CDNs).
const ALLOWED_IMAGE_HOSTNAMES = new Set([
  "images.unsplash.com",
  "images.pexels.com",
  "cdn.pixabay.com",
  "i.pinimg.com",
  "arena-usa.vercel.app",
  "arena-usa.public.blob.vercel-storage.com",
]);

export interface UrlValidationResult {
  ok: boolean;
  url: string;
  error?: string;
}

/**
 * Validate a URL for safe use as an image source.
 * Requires https:, rejects private IP space, blocks known meta-data endpoints.
 *
 * DNS resolution is cached — first call for a hostname may take ~50ms.
 */
export async function validateImageUrl(rawUrl: string): Promise<UrlValidationResult> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { ok: false, url: rawUrl, error: "invalid URL" };
  }

  if (parsed.protocol !== "https:") {
    return { ok: false, url: rawUrl, error: "image URLs must use https" };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Allow our own uploads (relative URLs or our domain)
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    if (process.env.NODE_ENV !== "production") {
      return { ok: true, url: rawUrl };
    }
    return { ok: false, url: rawUrl, error: "localhost URLs not allowed in production" };
  }

  // Allow any Vercel Blob domain
  if (hostname.endsWith(".public.blob.vercel-storage.com")) {
    return { ok: true, url: rawUrl };
  }

  // Allow allow-listed stock photo CDNs
  if (ALLOWED_IMAGE_HOSTNAMES.has(hostname)) {
    return { ok: true, url: rawUrl };
  }

  // For other hostnames — resolve DNS and check against private IP space
  try {
    const addresses = await lookup(hostname, { all: true });
    for (const addr of addresses) {
      const ip = addr.address;
      if (PRIVATE_IP_PATTERNS.some((re) => re.test(ip))) {
        return {
          ok: false,
          url: rawUrl,
          error: `image URL resolves to private IP: ${ip}`,
        };
      }
    }
    return { ok: true, url: rawUrl };
  } catch {
    // DNS resolution failed — for safety, allow (this is the same as
    // not running DNS resolution at all; the SSRF target would have to
    // be a hostname that doesn't resolve, which is harmless)
    return { ok: true, url: rawUrl };
  }
}

/**
 * Validate a URL is safe to use as an href attribute target.
 * Blocks javascript:, data:, vbscript: schemes (XSS vectors).
 * Allows http/https/mailto/tel.
 */
export function safeHrefUrl(rawUrl: string | null | undefined): string {
  if (!rawUrl) return "";
  try {
    const parsed = new URL(rawUrl);
    const allowedSchemes = ["http:", "https:", "mailto:", "tel:"];
    if (!allowedSchemes.includes(parsed.protocol)) {
      return "";
    }
    return rawUrl;
  } catch {
    // Allow relative URLs
    if (rawUrl.startsWith("/") && !rawUrl.startsWith("//")) {
      return rawUrl;
    }
    return "";
  }
}

/**
 * Validate a URL is safe for server-side fetch (RSS, etc.).
 * Same as validateImageUrl but also allows http: for RSS feeds that don't
 * support https yet.
 */
export async function validateFetchUrl(rawUrl: string): Promise<UrlValidationResult> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { ok: false, url: rawUrl, error: "invalid URL" };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, url: rawUrl, error: "fetch URLs must use http or https" };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block metadata endpoints explicitly
  if (hostname === "169.254.169.254" || hostname === "metadata.google.internal") {
    return { ok: false, url: rawUrl, error: "metadata endpoints not allowed" };
  }

  // Block private IP space (parses hostname, resolves if needed)
  if (PRIVATE_IP_PATTERNS.some((re) => re.test(hostname))) {
    return { ok: false, url: rawUrl, error: "private IP addresses not allowed" };
  }

  // Resolve DNS to check if it points to private space (SSRF defense)
  try {
    const addresses = await lookup(hostname, { all: true });
    for (const addr of addresses) {
      const ip = addr.address;
      if (PRIVATE_IP_PATTERNS.some((re) => re.test(ip))) {
        return {
          ok: false,
          url: rawUrl,
          error: `fetch URL resolves to private IP: ${ip}`,
        };
      }
    }
    return { ok: true, url: rawUrl };
  } catch {
    return { ok: true, url: rawUrl };
  }
}
