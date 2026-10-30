import { NextRequest, NextResponse } from "next/server";
import { summarizeAgent, contentHashFor, type AgentInput } from "@/lib/agents";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/agent/summarize
 * Body: AgentInput { rawTitle, rawText, sourceUrl, sourcePublishedAt }
 * Returns: SummarizeResult
 *
 * Auth: admin session OR API key with scope "ingest" (verified in /api/ingest).
 * This route is called from the admin UI when previewing a draft article.
 */
export async function POST(req: NextRequest) {
  try {
    let user;
    try {
      user = await requireAdmin();
    } catch {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as AgentInput;
    if (!body.rawText || body.rawText.trim().length < 20) {
      return NextResponse.json(
        { error: "rawText must be at least 20 characters" },
        { status: 400 },
      );
    }

    const result = await summarizeAgent(body);
    const contentHash = await contentHashFor(body);

    // Record an AgentRun for auditability
    const run = await db.agentRun.create({
      data: {
        agentType: "summarize",
        status: "SUCCESS",
        input: JSON.stringify({ ...body, rawText: body.rawText.slice(0, 500) }),
        output: JSON.stringify(result),
        startedAt: new Date(),
        finishedAt: new Date(),
        triggeredBy: user.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ ...result, contentHash, runId: run.id });
  } catch (err) {
    return NextResponse.json(
      { error: "summarize agent failed" },
      { status: 500 },
    );
  }
}
