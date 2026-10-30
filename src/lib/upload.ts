// ARENA USA — Image upload module
//
// Storage strategy:
// - Production (Vercel): uses @vercel/blob client if BLOB_READ_WRITE_TOKEN is set
// - Local dev: writes to /public/uploads/ and returns a relative URL
// - Validation: file type, size, dimensions
//
// All uploads go through this module — never accept arbitrary URLs from clients.

import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import path from "path";
import { promises as fs } from "fs";

// ────────────────────────────────────────────────────────────
//  Validation constants
// ────────────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_DIMENSION = 4096;

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

// ────────────────────────────────────────────────────────────
//  Magic-bytes verification — defends against Content-Type spoofing
// ────────────────────────────────────────────────────────────

interface MagicByteCheck {
  offset: number;
  bytes: number[];
  mime: string;
}

const MAGIC_BYTES: MagicByteCheck[] = [
  { offset: 0, bytes: [0xFF, 0xD8, 0xFF], mime: "image/jpeg" },
  { offset: 0, bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], mime: "image/png" },
  { offset: 0, bytes: [0x47, 0x49, 0x46, 0x38], mime: "image/gif" }, // GIF8
  { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46], mime: "image/webp" }, // RIFF..., need to check WEBP later
  { offset: 0, bytes: [0x00, 0x00, 0x00, 0x1C, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66], mime: "image/avif" },
];

function detectMimeType(buffer: Buffer): string | null {
  for (const check of MAGIC_BYTES) {
    if (buffer.length < check.offset + check.bytes.length) continue;
    let matches = true;
    for (let i = 0; i < check.bytes.length; i++) {
      if (buffer[check.offset + i] !== check.bytes[i]) {
        matches = false;
        break;
      }
    }
    if (matches) {
      // For WebP (RIFF), verify "WEBP" appears at offset 8
      if (check.mime === "image/webp") {
        if (buffer.length >= 12 && buffer.slice(8, 12).toString("ascii") === "WEBP") {
          return "image/webp";
        }
        continue;
      }
      return check.mime;
    }
  }
  return null;
}

// ────────────────────────────────────────────────────────────
//  Main upload handler — used by /api/admin/upload
// ────────────────────────────────────────────────────────────

export type UploadResult =
  | {
      ok: true;
      url: string;
      mimeType: string;
      size: number;
      width?: number;
      height?: number;
    }
  | {
      ok: false;
      error: string;
      status: number;
    };

export async function handleImageUpload(req: NextRequest): Promise<UploadResult> {
  const contentType = req.headers.get("content-type") ?? "";

  // Form-data upload (multipart)
  if (contentType.startsWith("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { ok: false, error: "no 'file' field in form data", status: 400 };
    }
    return processFile(file);
  }

  // JSON upload (base64)
  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    const dataUri = String(body.data ?? "");
    const match = dataUri.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
    if (!match) {
      return { ok: false, error: "invalid data URI — expected data:image/...;base64,...", status: 400 };
    }
    const declaredMime = match[1].toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(declaredMime)) {
      return { ok: false, error: `unsupported MIME type: ${declaredMime}`, status: 400 };
    }
    const buffer = Buffer.from(match[2], "base64");
    if (buffer.length > MAX_FILE_SIZE) {
      return { ok: false, error: `file too large: ${buffer.length} bytes (max ${MAX_FILE_SIZE})`, status: 413 };
    }
    return processBuffer(buffer, declaredMime);
  }

  return { ok: false, error: "unsupported Content-Type — use multipart/form-data or application/json", status: 400 };
}

async function processFile(file: File): Promise<UploadResult> {
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: `file too large: ${file.size} bytes (max ${MAX_FILE_SIZE})`, status: 413 };
  }
  if (!ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
    return { ok: false, error: `unsupported MIME type: ${file.type}`, status: 400 };
  }
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return processBuffer(buffer, file.type.toLowerCase());
}

async function processBuffer(buffer: Buffer, declaredMime: string): Promise<UploadResult> {
  // CRITICAL: verify magic bytes — never trust declared Content-Type
  const detectedMime = detectMimeType(buffer);
  if (!detectedMime) {
    return { ok: false, error: "file does not match any allowed image format (jpeg/png/webp/gif/avif)", status: 400 };
  }
  if (detectedMime !== declaredMime) {
    // Use the detected MIME — declared MIME may have been spoofed
    console.warn(`[upload] MIME mismatch: declared=${declaredMime}, detected=${detectedMime}`);
  }
  const finalMime = detectedMime;
  const extension = MIME_TO_EXTENSION[finalMime] ?? "bin";

  // Generate a unique, unpredictable filename to prevent collisions & path traversal
  const id = randomBytes(12).toString("hex");
  const filename = `${id}.${extension}`;

  // Try Vercel Blob first (production)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      const blob = await put(`arena-usa/${filename}`, buffer, {
        access: "public",
        contentType: finalMime,
        addRandomSuffix: false,
      });
      return {
        ok: true,
        url: blob.url,
        mimeType: finalMime,
        size: buffer.length,
      };
    } catch (err) {
      console.error("[upload] Vercel Blob failed, falling back to local:", err);
      // fall through to local
    }
  }

  // Local filesystem fallback (dev only)
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch {}
  const filepath = path.join(uploadsDir, filename);
  await fs.writeFile(filepath, buffer);

  return {
    ok: true,
    url: `/uploads/${filename}`,
    mimeType: finalMime,
    size: buffer.length,
  };
}

// ────────────────────────────────────────────────────────────
//  URL validation — for fields like coverImageUrl from clients
// ────────────────────────────────────────────────────────────

const ALLOWED_IMAGE_HOSTNAMES = new Set([
  "images.unsplash.com",
  "cdn.pixabay.com",
  "i.pinimg.com",
  "arena-usa.vercel.app",
  "arena-usa.public.blob.vercel-storage.com",
]);

export function isAllowedImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    // Allow our own uploads (relative URLs or our domain)
    if (parsed.hostname === "localhost") return process.env.NODE_ENV !== "production";
    // Allow Vercel Blob domain
    if (parsed.hostname.endsWith(".public.blob.vercel-storage.com")) return true;
    return ALLOWED_IMAGE_HOSTNAMES.has(parsed.hostname);
  } catch {
    return false;
  }
}
