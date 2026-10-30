import { NextRequest, NextResponse } from "next/server";
import { classifyAgent, type AgentInput } from "@/lib/agents";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/agent/classify
 * Body: AgentInput { rawTitle, rawText }
 * Returns: ClassifyResult
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

    const result = await classifyAgent(body);

    await db.agentRun.create({
      data: {
        agentType: "classify",
        status: "SUCCESS",
        input: JSON.stringify({ ...body, rawText: body.rawText.slice(0, 500) }),
        output: JSON.stringify(result),
        startedAt: new Date(),
        finishedAt: new Date(),
        triggeredBy: user.id,
        userId: user.id,
      },
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: "classify agent failed" },
      { status: 500 },
    );
  }
}
