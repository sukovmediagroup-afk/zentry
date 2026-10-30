import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/categories
 * Returns the canonical 16-category taxonomy for ARENA USA.
 */
export async function GET() {
  const cats = await db.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: {
      id: true, name: true, slug: true, description: true,
      icon: true, color: true, parentId: true, order: true, isFeatured: true,
    },
  });
  return NextResponse.json({ categories: cats });
}
