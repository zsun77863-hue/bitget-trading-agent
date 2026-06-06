import { NextRequest, NextResponse } from "next/server";
import { fetchAllSkills, fetchSkill, SKILLS, type SkillName } from "@/lib/skills";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const symbol: string = body.symbol ?? "BTCUSDT";
    const prompt: string = body.prompt ?? "";
    const skill: SkillName | undefined = body.skill;
    if (skill && (SKILLS as readonly string[]).includes(skill)) {
      const out = await fetchSkill(skill, symbol, prompt);
      return NextResponse.json({ data: out });
    }
    const all = await fetchAllSkills(symbol, prompt);
    return NextResponse.json({ data: all });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "unknown" }, { status: 500 });
  }
}
