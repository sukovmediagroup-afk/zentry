// ARENA USA — Social distribution adapters (Telegram + Pinterest)
// All in TypeScript — no Python workers needed.
// Secrets stored as env vars; DB stores only the secret REFERENCE NAME.

import { db } from "./db";

export interface DistributionResult {
  ok: boolean;
  externalId?: string;     // telegram message_id, pinterest pin_id
  raw?: any;               // full API response for audit
  error?: string;
  retryable: boolean;
}

// ────────────────────────────────────────────────────────────
//  Telegram Bot API adapter
// ────────────────────────────────────────────────────────────

/**
 * Posts an article to a Telegram channel via Bot API.
 * Bot token is read from env var (TelegramDestination.botTokenRef is the var name).
 *
 * @param article Article to publish
 * @param dest TelegramDestination record
 * @returns DistributionResult
 */
export async function publishToTelegram(
  article: {
    title: string;
    excerpt?: string | null;
    aiSummary?: string | null;
    coverImageUrl?: string | null;
    slug: string;
  },
  dest: { id: string; botTokenRef: string; chatId: string },
): Promise<DistributionResult> {
  const token = process.env[dest.botTokenRef];
  if (!token) {
    return {
      ok: false,
      error: `Missing env var ${dest.botTokenRef} — admin must configure bot token`,
      retryable: false,
    };
  }

  // Compose message — concise summary + "Read more on ARENA USA"
  const summary = article.aiSummary ?? article.excerpt ?? "";
  const text =
    `📰 *${escapeMd(article.title)}*\n\n` +
    `${escapeMd(summary)}\n\n` +
    `👉 _Read more on ARENA USA_`;

  const canonical = `https://arena-usa.vercel.app/article/${article.slug}`;

  try {
    let result: DistributionResult;

    if (article.coverImageUrl) {
      // sendPhoto with caption
      const formData = new FormData();
      formData.append("chat_id", dest.chatId);
      formData.append("photo", article.coverImageUrl);
      formData.append("caption", text);
      formData.append("parse_mode", "MarkdownV2");
      formData.append("reply_markup", JSON.stringify({
        inline_keyboard: [[
          { text: "Read on ARENA USA ↗", url: canonical },
        ]],
      }));

      const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json();
      if (!data.ok) {
        return {
          ok: false,
          error: `Telegram error: ${data.description}`,
          raw: data,
          retryable: isRetryableTelegram(data.description),
        };
      }
      result = {
        ok: true,
        externalId: String(data.result?.message_id ?? ""),
        raw: data,
        retryable: false,
      };
    } else {
      // sendMessage only
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: dest.chatId,
          text,
          parse_mode: "MarkdownV2",
          reply_markup: { inline_keyboard: [[
            { text: "Read on ARENA USA ↗", url: canonical },
          ]] },
        }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await res.json();
      if (!data.ok) {
        return {
          ok: false,
          error: `Telegram error: ${data.description}`,
          raw: data,
          retryable: isRetryableTelegram(data.description),
        };
      }
      result = {
        ok: true,
        externalId: String(data.result?.message_id ?? ""),
        raw: data,
        retryable: false,
      };
    }

    return result;
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "unknown Telegram error",
      retryable: true, // network errors are usually retryable
    };
  }
}

function escapeMd(text: string): string {
  // Escape characters that have special meaning in MarkdownV2
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

function isRetryableTelegram(desc?: string): boolean {
  if (!desc) return true;
  const lower = desc.toLowerCase();
  // 429 Too Many Requests — retryable with backoff
  if (lower.includes("too many requests")) return true;
  if (lower.includes("timeout")) return true;
  if (lower.includes("flood control")) return true;
  // chat not found, bot blocked — not retryable
  if (lower.includes("chat not found")) return false;
  if (lower.includes("bot was blocked by the user")) return false;
  return true;
}

// ────────────────────────────────────────────────────────────
//  Pinterest API adapter
// ────────────────────────────────────────────────────────────

/**
 * Creates a Pin on a configured Pinterest board.
 * Uses Pinterest v5 API: POST https://api.pinterest.com/v5/pins
 */
export async function publishToPinterest(
  article: {
    title: string;
    excerpt?: string | null;
    aiSummary?: string | null;
    coverImageUrl?: string | null;
    coverImageAlt?: string | null;
    slug: string;
  },
  dest: { id: string; apiTokenRef: string; boardId: string },
): Promise<DistributionResult> {
  const token = process.env[dest.apiTokenRef];
  if (!token) {
    return {
      ok: false,
      error: `Missing env var ${dest.apiTokenRef} — admin must configure Pinterest token`,
      retryable: false,
    };
  }

  if (!article.coverImageUrl) {
    return {
      ok: false,
      error: "Pinterest requires a cover image URL",
      retryable: false,
    };
  }

  const canonical = `https://arena-usa.vercel.app/article/${article.slug}`;
  const description = (article.aiSummary ?? article.excerpt ?? article.title).slice(0, 500);

  try {
    const res = await fetch("https://api.pinterest.com/v5/pins", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        board_id: dest.boardId,
        title: article.title.slice(0, 100),
        description,
        link: canonical,
        alt_text: article.coverImageAlt ?? article.title.slice(0, 100),
        media_source: {
          source_type: "image_url",
          url: article.coverImageUrl,
        },
      }),
      signal: AbortSignal.timeout(20000),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        ok: false,
        error: `Pinterest API ${res.status}: ${data.message ?? data.error ?? "unknown"}`,
        raw: data,
        retryable: res.status === 429 || res.status >= 500,
      };
    }

    return {
      ok: true,
      externalId: String(data.id ?? ""),
      raw: data,
      retryable: false,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "unknown Pinterest error",
      retryable: true,
    };
  }
}

// ────────────────────────────────────────────────────────────
//  Job dispatcher — used by the social distribution cron + admin manual publish
// ────────────────────────────────────────────────────────────

export async function processPublicationJob(jobId: string): Promise<DistributionResult> {
  const job = await db.publicationJob.findUnique({
    where: { id: jobId },
    include: { article: true },
  });
  if (!job) {
    return { ok: false, error: "job not found", retryable: false };
  }

  // Mark processing
  await db.publicationJob.update({
    where: { id: jobId },
    data: { status: "PROCESSING" },
  });

  let result: DistributionResult;
  if (job.destination.startsWith("telegram:")) {
    const dest = await db.telegramDestination.findUnique({ where: { id: job.destinationId } });
    if (!dest || !dest.enabled) {
      result = { ok: false, error: "destination not found or disabled", retryable: false };
    } else {
      result = await publishToTelegram(job.article, dest);
    }
  } else if (job.destination.startsWith("pinterest:")) {
    const board = await db.pinterestBoard.findUnique({ where: { id: job.destinationId } });
    if (!board || !board.enabled) {
      result = { ok: false, error: "board not found or disabled", retryable: false };
    } else {
      result = await publishToPinterest(job.article, board);
    }
  } else {
    result = { ok: false, error: `unknown destination type: ${job.destination}`, retryable: false };
  }

  // Update job state
  const newAttempts = job.attempts + 1;
  if (result.ok) {
    await db.publicationJob.update({
      where: { id: jobId },
      data: {
        status: "SUCCESS",
        externalId: result.externalId,
        response: JSON.stringify(result.raw ?? {}),
        attempts: newAttempts,
        finishedAt: new Date(),
      },
    });
  } else if (result.retryable && newAttempts < job.maxAttempts) {
    // Exponential backoff: 30s, 2m, 8m, 30m, 2h
    const delaysMs = [30_000, 120_000, 480_000, 1_800_000, 7_200_000];
    const delay = delaysMs[Math.min(newAttempts - 1, delaysMs.length - 1)];
    await db.publicationJob.update({
      where: { id: jobId },
      data: {
        status: "PENDING",
        attempts: newAttempts,
        lastError: result.error,
        nextRetryAt: new Date(Date.now() + delay),
      },
    });
  } else {
    // Dead letter
    await db.publicationJob.update({
      where: { id: jobId },
      data: {
        status: "DEAD_LETTER",
        attempts: newAttempts,
        lastError: result.error,
        response: JSON.stringify(result.raw ?? {}),
        finishedAt: new Date(),
      },
    });
  }

  return result;
}
