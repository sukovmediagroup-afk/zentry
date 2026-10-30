import type { MetadataRoute } from "next";
import { PROJECT_DEFAULTS, CATEGORIES } from "@/lib/constants";
import { DEMO_ARTICLES } from "@/lib/demo-data";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    { path: "/", priority: 1.0, changeFrequency: "hourly" as const },
    { path: "/archive", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/search", priority: 0.4, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/editorial-policy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/api/docs", priority: 0.4, changeFrequency: "monthly" as const },
  ];

  const entries: MetadataRoute.Sitemap = [
    ...staticRoutes.map((r) => ({
      url: absoluteUrl(r.path),
      lastModified: r.path === "/" ? now : new Date(now.getTime() - 24 * 3600 * 1000),
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...CATEGORIES.map((c) => ({
      url: absoluteUrl(`/category/${c.slug}`),
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: 0.9,
    })),
    ...DEMO_ARTICLES.map((a) => ({
      url: absoluteUrl(`/article/${a.slug}`),
      lastModified: new Date(a.publishedAt),
      changeFrequency: "daily" as const,
      priority: a.featured ? 0.85 : 0.7,
    })),
  ];

  return entries;
}
