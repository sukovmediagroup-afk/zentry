import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Public health check.
 *
 * SECURITY: returns minimal info — no version, no integration status,
 * no internal architecture hints. Detailed checks are for authenticated
 * admins only (would belong in /api/admin/health if needed).
 */
export async function GET() {
  let operational = false;
  try {
    await db.$queryRaw`SELECT 1`;
    operational = true;
  } catch {
    operational = false;
  }

  return NextResponse.json(
    { status: operational ? "operational" : "degraded" },
    { status: operational ? 200 : 503 },
  );
}
