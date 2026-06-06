import { NextRequest, NextResponse } from "next/server";
import { callPlaybook } from "@/lib/playbook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt: string = body.prompt ?? "";
    // The user's key has priority; fall back to env.
    const apiKey: string | undefined = body.apiKey || process.env.PLAYBOOK_API_KEY;
    const parsed = await callPlaybook(prompt, apiKey);
    return NextResponse.json({ data: parsed });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "unknown" }, { status: 500 });
  }
}
