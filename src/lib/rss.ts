// ARENA USA — RSS feed parser & default registry
// Edge-safe: uses only Web APIs (fetch, DOMParser via simple regex fallback).
// Phase 2: replaces Python ingestion adapters with TypeScript Edge Runtime.

export interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate?: Date;
  guid?: string;
  author?: string;
  categories: string[];
  contentEncoded?: string;
}

export interface RssFeed {
  channelTitle: string;
  channelLink: string;
  channelDescription?: string;
  items: RssItem[];
}

// ────────────────────────────────────────────────────────────
//  Default permitted RSS sources (Phase 2)
//  Only feeds whose ToS allow redistribution of headlines + summaries.
//  Admins can extend this list via the /admin/sources panel.
// ────────────────────────────────────────────────────────────
export interface PermittedSource {
  slug: string;
  name: string;
  url: string;
  homepageUrl: string;
  defaultCategorySlug?: string;
  pollIntervalSec: number;
}

export const DEFAULT_PERMITTED_SOURCES: PermittedSource[] = [
  // Technology
  {
    slug: "hackernews",
    name: "Hacker News",
    url: "https://hnrss.org/frontpage",
    homepageUrl: "https://news.ycombinator.com",
    defaultCategorySlug: "technology-ai",
    pollIntervalSec: 600,
  },
  {
    slug: "techcrunch",
    name: "TechCrunch",
    url: "https://techcrunch.com/feed/",
    homepageUrl: "https://techcrunch.com",
    defaultCategorySlug: "technology-ai",
    pollIntervalSec: 600,
  },
  {
    slug: "the-verge",
    name: "The Verge",
    url: "https://www.theverge.com/rss/index.xml",
    homepageUrl: "https://www.theverge.com",
    defaultCategorySlug: "electronics-gadgets",
    pollIntervalSec: 600,
  },
  // Business / Investing
  {
    slug: "cnbc-top",
    name: "CNBC Top News",
    url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114",
    homepageUrl: "https://www.cnbc.com",
    defaultCategorySlug: "investing-banking",
    pollIntervalSec: 600,
  },
  // Science / General
  {
    slug: "nasa-breaking",
    name: "NASA Breaking News",
    url: "https://www.nasa.gov/rss/dyn/breaking_news.rss",
    homepageUrl: "https://www.nasa.gov",
    defaultCategorySlug: "technology-ai",
    pollIntervalSec: 600,
  },
  // Sports
  {
    slug: "espn-top",
    name: "ESPN Top News",
    url: "https://www.espn.com/espn/rss/news",
    homepageUrl: "https://www.espn.com",
    defaultCategorySlug: "sports-esports",
    pollIntervalSec: 600,
  },
];

// ────────────────────────────────────────────────────────────
//  RSS/XML parser — no external deps, runs on Edge Runtime.
//  Uses regex-based extraction (XML is regular enough for our purposes).
// ────────────────────────────────────────────────────────────
export function parseRssFeed(xml: string): RssFeed {
  // Strip namespaces & CDATA
  const clean = xml
    .replace(/<\?xml[^>]*\?>/, "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<atom:[^>]*\/>/g, "")
    .replace(/<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/g,
      (_, c) => `<contentEncoded>${c}</contentEncoded>`);

  // Channel metadata
  const channelTitle = extract(clean, "<title>", "</title>") ?? "Untitled feed";
  const channelLink = extract(clean, "<link>", "</link>") ?? "";
  const channelDescription = extract(clean, "<description>", "</description>");

  // Items
  const items: RssItem[] = [];
  const itemRegex = /<item[\s\S]*?<\/item>/g;
  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(clean)) !== null) {
    const block = match[0];
    const title = extract(block, "<title>", "</title>") ?? "";
    const link = extract(block, "<link>", "</link>") ?? extract(block, "<link[^>]*>", "</link>") ?? "";
    const description = extract(block, "<description>", "</description>") ?? "";
    const pubDateString = extract(block, "<pubDate>", "</pubDate>");
    const guid = extract(block, "<guid[^>]*>", "</guid>") ?? extract(block, "<guid>", "</guid>");
    const author = extract(block, "<dc:creator>", "</dc:creator>") ?? extract(block, "<author>", "</author>");
    const contentEncoded = extract(block, "<contentEncoded>", "</contentEncoded>");

    const categories: string[] = [];
    const catRegex = /<category[^>]*>([^<]+)<\/category>/g;
    let catMatch: RegExpExecArray | null;
    while ((catMatch = catRegex.exec(block)) !== null) {
      categories.push(catMatch[1].trim());
    }

    if (title && link) {
      items.push({
        title: title.trim(),
        link: link.trim(),
        description: stripHtml(description).trim().slice(0, 600),
        pubDate: pubDateString ? new Date(pubDateString) : undefined,
        guid: guid?.trim(),
        author: author?.trim(),
        categories,
        contentEncoded: contentEncoded ? stripHtml(contentEncoded).slice(0, 8000) : undefined,
      });
    }
  }

  return {
    channelTitle,
    channelLink,
    channelDescription,
    items,
  };
}

function extract(xml: string, start: string, end: string): string | undefined {
  const s = xml.indexOf(start);
  if (s < 0) return undefined;
  const e = xml.indexOf(end, s + start.length);
  if (e < 0) return undefined;
  return xml.slice(s + start.length, e);
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// ────────────────────────────────────────────────────────────
//  fetchFeed — fetches and parses an RSS feed.
//  Returns { feed, fetchedAt, error }.
// ────────────────────────────────────────────────────────────
export async function fetchFeed(url: string): Promise<{
  feed: RssFeed | null;
  error?: string;
  fetchedAt: Date;
}> {
  const fetchedAt = new Date();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "ArenaUSABot/1.0 (+https://arena-usa.vercel.app)",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
      },
      // Next.js fetch caching
      next: { revalidate: 0 },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return { feed: null, error: `HTTP ${res.status} ${res.statusText}`, fetchedAt };
    }
    const xml = await res.text();
    if (!xml.includes("<rss") && !xml.includes("<feed") && !xml.includes("<channel")) {
      return { feed: null, error: "Response is not a valid RSS/Atom feed", fetchedAt };
    }
    const feed = parseRssFeed(xml);
    if (feed.items.length === 0) {
      return { feed, error: "Feed parsed but contained no items", fetchedAt };
    }
    return { feed, fetchedAt };
  } catch (err) {
    return {
      feed: null,
      error: err instanceof Error ? err.message : "unknown fetch error",
      fetchedAt,
    };
  }
}
