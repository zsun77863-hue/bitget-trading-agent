// Bitget Agent Hub integration — references the official agent_hub repo
// (https://github.com/Bitget-AI/agent_hub). It exposes a unified facade for:
//   - Skill Hub: macro-analyst, sentiment-analyst, technical-analysis,
//     news-briefing, market-intel.
//   - Playbook: natural-language -> structured strategy translation.
//   - MCP / REST / CLI style: a single fetchSkill() that maps cleanly to
//     any transport. When the upstream HTTP endpoint is unreachable, the
//     functions degrade gracefully to a deterministic mock so the UI
//     remains demoable without network access.
import type { SkillOutput } from "@/types";

export const SKILLS = [
  "macro-analyst",
  "sentiment-analyst",
  "technical-analysis",
  "news-briefing",
  "market-intel",
] as const;
export type SkillName = (typeof SKILLS)[number];

const SKILL_TITLES: Record<SkillName, string> = {
  "macro-analyst": "Macro Analyst",
  "sentiment-analyst": "Sentiment Analyst",
  "technical-analysis": "Technical Analysis",
  "news-briefing": "News Briefing",
  "market-intel": "Market Intelligence",
};

function pickSignal(seed: number): SkillOutput["signal"] {
  const v = Math.abs(Math.sin(seed)) ;
  if (v > 0.66) return "bullish";
  if (v > 0.33) return "neutral";
  return "bearish";
}

// Deterministic mock so screenshots are stable & demo-friendly.
function mockSkill(skill: SkillName, symbol: string, prompt: string): SkillOutput {
  const seed = (skill.length + symbol.length + prompt.length) * 7;
  const signal = pickSignal(seed);
  const confidence = 0.5 + Math.abs(Math.sin(seed * 3.14)) * 0.4;
  const base: Record<SkillName, { summary: string; data: Record<string, any> }> = {
    "macro-analyst": {
      summary: `US CPI softer than expected; DXY trending lower. Risk-on backdrop ${signal === "bullish" ? "favours" : "challenges"} ${symbol}.`,
      data: { cpi_yoy: 2.4, dxy: 103.21, fed_rate: 4.5, risk_appetite: signal },
    },
    "sentiment-analyst": {
      summary: `Social sentiment for ${symbol} is ${signal}. Funding rates flat, no extreme positioning.`,
      data: { twitter_score: signal === "bullish" ? 0.72 : -0.18, fear_greed: 64, funding_rate: 0.0008 },
    },
    "technical-analysis": {
      summary: `${symbol} above 200D MA; RSI ${signal === "bullish" ? 58 : 42}; MACD ${signal === "bullish" ? "crossed up" : "flat"}.`,
      data: { rsi: signal === "bullish" ? 58 : 42, macd_hist: signal === "bullish" ? 0.43 : -0.21, ema50: 65120, ema200: 60400 },
    },
    "news-briefing": {
      summary: `Top news: ETF inflows +$210M; SEC delays one altcoin filing. Net impact ${signal}.`,
      data: { headlines: ["ETF inflows +$210M", "SEC delays altcoin filing", "Major exchange upgrade live"] },
    },
    "market-intel": {
      summary: `Order-book depth healthy. Whale tracker shows ${signal === "bullish" ? "accumulation" : "distribution"} on ${symbol}.`,
      data: { depth_5pct: 18.4, whale_netflow: signal === "bullish" ? 1240 : -540, top_movers: ["BTC", "ETH", "SOL"] },
    },
  };
  return {
    skill,
    title: SKILL_TITLES[skill],
    summary: base[skill].summary,
    data: base[skill].data,
    signal,
    confidence,
  };
}

export async function fetchSkill(skill: SkillName, symbol: string, prompt: string): Promise<SkillOutput> {
  const base = process.env.SKILL_HUB_BASE_URL || process.env.AGENT_HUB_BASE_URL;
  if (!base) return mockSkill(skill, symbol, prompt);
  try {
    const res = await fetch(`${base}/v1/skills/${skill}/invoke`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, prompt }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`skill ${skill} HTTP ${res.status}`);
    const json = (await res.json()) as Partial<SkillOutput>;
    return {
      skill,
      title: SKILL_TITLES[skill],
      summary: json.summary ?? mockSkill(skill, symbol, prompt).summary,
      data: json.data ?? {},
      signal: json.signal ?? "neutral",
      confidence: json.confidence ?? 0.6,
    };
  } catch {
    return mockSkill(skill, symbol, prompt);
  }
}

export async function fetchAllSkills(symbol: string, prompt: string): Promise<SkillOutput[]> {
  return Promise.all(SKILLS.map((s) => fetchSkill(s, symbol, prompt)));
}
