// SEO utilities for ARENA USA — JSON-LD, metadata helpers, slugify
import type { Metadata } from "next";
import { PROJECT_DEFAULTS } from "./constants";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function absoluteUrl(path: string): string {
  // Prefer runtime env var (set on Vercel), fall back to defaults
  const base = (process.env.NEXT_PUBLIC_SITE_URL || PROJECT_DEFAULTS.siteUrl).replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/**
 * Safe JSON-LD stringifier.
 *
 * CRITICAL: JSON.stringify does NOT escape `<` or `>`. If any field contains
 * `</script>`, the JSON-LD context breaks and an attacker can inject HTML/JS.
 * This helper replaces `<` with `\u003c` (and `>` for symmetry) so the output
 * is safe to embed in `<script type="application/ld+json">`.
 *
 * Also escapes U+2028 and U+2029 (line/paragraph separators) which break
 * JavaScript parsers in some legacy engines.
 */
export function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function buildMetadata(opts: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: Date;
  author?: string;
  keywords?: string[];
}): Metadata {
  const title = opts.title
    ? `${opts.title} | ${PROJECT_DEFAULTS.siteName}`
    : `${PROJECT_DEFAULTS.siteName} — AI-Powered American Media`;
  const description = opts.description ?? PROJECT_DEFAULTS.siteDescription;
  const url = absoluteUrl(opts.path ?? "/");
  const image = opts.image ?? absoluteUrl("/icon.svg");

  return {
    title,
    description,
    keywords: opts.keywords ?? [
      "US news", "American media", "AI news", "technology news",
      "politics", "investing", "personal finance", "ARENA USA",
      ...PROJECT_DEFAULTS.siteName.split(" "),
    ],
    authors: [{ name: opts.author ?? PROJECT_DEFAULTS.siteName }],
    creator: PROJECT_DEFAULTS.siteName,
    publisher: PROJECT_DEFAULTS.siteName,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: PROJECT_DEFAULTS.siteName,
      locale: PROJECT_DEFAULTS.siteLocale,
      type: opts.type ?? "website",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
      publishedTime: opts.publishedTime?.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      site: PROJECT_DEFAULTS.twitterHandle,
      creator: PROJECT_DEFAULTS.twitterHandle,
      title,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

// JSON-LD builders — feed structured data to Google & AI crawlers.
// Output is meant to be passed through safeJsonLd() before being embedded.
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    url: absoluteUrl("/"),
    name: PROJECT_DEFAULTS.siteName,
    description: PROJECT_DEFAULTS.siteDescription,
    publisher: { "@id": absoluteUrl("/#organization") },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/search?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "en-US",
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "@id": absoluteUrl("/#organization"),
    name: PROJECT_DEFAULTS.siteName,
    url: absoluteUrl("/"),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/logo.svg"),
      width: 512,
      height: 512,
    },
    sameAs: [
      "https://twitter.com/arenausa",
      "https://t.me/arenausa",
      "https://pinterest.com/arenausa",
    ],
    publishingPrinciples: absoluteUrl("/editorial-policy"),
    actionableFeedbackPolicy: absoluteUrl("/editorial-policy#feedback"),
    diversityPolicy: absoluteUrl("/editorial-policy#diversity"),
  };
}

export function articleJsonLd(article: {
  title: string;
  description?: string;
  slug: string;
  image?: string;
  datePublished?: Date | string;
  dateModified?: Date | string;
  authorName?: string;
  categoryName?: string;
}) {
  const dp = article.datePublished instanceof Date ? article.datePublished : article.datePublished ? new Date(article.datePublished) : undefined;
  const dm = article.dateModified instanceof Date ? article.dateModified : article.dateModified ? new Date(article.dateModified) : dp;
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.description,
    image: article.image ? [article.image] : undefined,
    datePublished: dp?.toISOString(),
    dateModified: (dm ?? dp)?.toISOString(),
    author: article.authorName
      ? { "@type": "Person", name: article.authorName }
      : { "@type": "Organization", name: PROJECT_DEFAULTS.siteName },
    publisher: { "@id": absoluteUrl("/#organization") },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/article/${article.slug}`),
    },
    articleSection: article.categoryName,
    inLanguage: "en-US",
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.url),
    })),
  };
}

export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 220));
}

/**
 * Validate a URL is safe to use in href attributes (prevents javascript: scheme).
 * Returns the URL if safe, empty string otherwise.
 */
export function safeHref(url: string | null | undefined): string {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
    return url;
  } catch {
    return "";
  }
}
