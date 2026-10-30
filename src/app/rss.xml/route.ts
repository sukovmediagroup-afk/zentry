import { DEMO_ARTICLES } from "@/lib/demo-data";
import { PROJECT_DEFAULTS } from "@/lib/constants";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({
    "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;",
  })[c]!);
}

export async function GET() {
  const items = [...DEMO_ARTICLES]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 50);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(PROJECT_DEFAULTS.siteName)}</title>
    <link>${absoluteUrl("/")}</link>
    <description>${escapeXml(PROJECT_DEFAULTS.siteDescription)}</description>
    <language>en-US</language>
    <atom:link href="${absoluteUrl("/rss.xml")}" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>10</ttl>
${items.map((a) => `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${absoluteUrl(`/article/${a.slug}`)}</link>
      <guid isPermaLink="true">${absoluteUrl(`/article/${a.slug}`)}</guid>
      <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
      <description>${escapeXml(a.excerpt)}</description>
      <category>${escapeXml(a.categoryName)}</category>
      <dc:creator>${escapeXml(a.sourceName ?? PROJECT_DEFAULTS.siteName)}</dc:creator>
    </item>`).join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600",
    },
  });
}
