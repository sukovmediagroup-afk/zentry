import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/admin", "/api/ingest", "/api/heartbeat"],
      },
      // Allow common crawler bots explicit friendly rules
      { userAgent: "Googlebot", allow: "/" },
      { userAgent: "Bingbot", allow: "/" },
      { userAgent: "DuckDuckBot", allow: "/" },
      { userAgent: "Applebot", allow: "/" },
      { userAgent: "GPTBot", allow: "/" }, // OpenAI crawler — useful for AI-powered search
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: "arena-usa.vercel.app",
  };
}
