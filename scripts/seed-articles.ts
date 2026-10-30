// Seed demo articles — copies demo-data into the database so /api/articles
// returns real published items in addition to the static demo feed shown on
// the homepage. Safe to re-run.
import { PrismaClient } from "@prisma/client";
import { DEMO_ARTICLES } from "../src/lib/demo-data";
import { CATEGORIES } from "../src/lib/constants";

const db = new PrismaClient();

async function main() {
  console.log("Seeding demo articles...");

  for (const a of DEMO_ARTICLES) {
    const category = CATEGORIES.find((c) => c.slug === a.categorySlug);
    if (!category) continue;

    const dbCat = await db.category.upsert({
      where: { slug: category.slug },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        color: category.color,
        order: CATEGORIES.indexOf(category),
      },
      update: {},
    });

    const publishedAt = new Date(a.publishedAt);
    const expiresAt = a.keepForever ? null : new Date(publishedAt.getTime() + 48 * 3600 * 1000);

    await db.article.upsert({
      where: { slug: a.slug },
      create: {
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        content: a.content,
        coverImageUrl: a.coverImageUrl,
        coverImageAlt: a.coverImageAlt,
        status: "PUBLISHED",
        featured: a.featured,
        isBreaking: a.isBreaking,
        keepForever: a.keepForever,
        readingMinutes: a.readingMinutes,
        aiSummary: a.aiSummary,
        aiConfidence: a.aiConfidence,
        sourceName: a.sourceName,
        sourceUrl: a.sourceUrl,
        sourcePublishedAt: publishedAt,
        retrievedAt: new Date(),
        publishedAt,
        expiresAt,
        categoryId: dbCat.id,
        contentHash: null,
      },
      update: {
        // refresh cover + content if changed
        excerpt: a.excerpt,
        content: a.content,
        coverImageUrl: a.coverImageUrl,
        aiSummary: a.aiSummary,
      },
    });
    console.log(`  ✓ ${a.slug}`);
  }

  console.log(`Seeded ${DEMO_ARTICLES.length} articles.`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
