// Seed script — populates the 16 ARENA USA categories and a demo admin.
// Safe to re-run: uses upsert.
import { PrismaClient } from "@prisma/client";
import { CATEGORIES } from "../src/lib/constants";

const db = new PrismaClient();

async function main() {
  console.log("Seeding ARENA USA taxonomy...");
  for (const cat of CATEGORIES) {
    await db.category.upsert({
      where: { slug: cat.slug },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        order: CATEGORIES.indexOf(cat),
        isFeatured: ["technology-ai", "investing-banking", "personal-finance"].includes(cat.slug),
      },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
      },
    });
    console.log(`  ✓ ${cat.slug}`);
  }

  // Bootstrap admin from env (optional — only if env vars are set)
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const { hashPassword } = await import("../src/lib/auth");
    const passwordHash = await hashPassword(password);
    await db.user.upsert({
      where: { email },
      create: {
        email,
        name: process.env.ADMIN_NAME ?? "Arena Admin",
        passwordHash,
        role: "ADMIN",
      },
      update: { passwordHash },
    });
    console.log(`  ✓ Admin user: ${email}`);
  } else {
    console.log("  ⚠ ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin bootstrap");
  }

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
