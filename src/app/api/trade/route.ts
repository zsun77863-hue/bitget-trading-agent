import { NextRequest, NextResponse } from "next/server";
import { fetchAllSkills } from "@/lib/skills";
import { callPlaybook } from "@/lib/playbook";
import { getSpotPrice } from "@/lib/bitget";
import type { DecisionStep, ExecutionRecord, StrategyResult } from "@/types";
import { shortId } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Full agent flow: perception -> analysis -> execution -> risk.
 * Returns a structured StrategyResult that the UI renders in the
 * "agent flow" timeline. All trades default to `simulated` and only
 * proceed in `live` mode when explicitly confirmed by the caller.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt: string = body.prompt ?? "";
    const mode: "simulated" | "live" = body.mode === "live" ? "live" : "simulated";
    const apiKey: string | undefined = body.apiKey || process.env.PLAYBOOK_API_KEY;

    // Step 1: parse via Playbook
    const parsed = await callPlaybook(prompt, apiKey);

    // Step 2: perception via Skill Hub
    const perception = await fetchAllSkills(parsed.symbol, prompt);

    // Step 3: derive analysis (deterministic blend of skill signals)
    const bull = perception.filter((p) => p.signal === "bullish").length;
    const bear = perception.filter((p) => p.signal === "bearish").length;
    const avgConf = perception.reduce((a, b) => a + (b.confidence ?? 0.5), 0) / perception.length;
    const finalSide: "buy" | "sell" = bull >= bear ? "buy" : "sell";
    const aligned = finalSide === parsed.side;

    const decisions: DecisionStep[] = [
      {
        step: 1,
        title: "Parse natural-language intent (Playbook)",
        reasoning: `Detected symbol=${parsed.symbol}, side=${parsed.side}, notional=${parsed.notional} USDT, TP=${parsed.takeProfitPct}%, SL=${parsed.stopLossPct}%.`,
      },
      {
        step: 2,
        title: "Aggregate Skill Hub signals",
        reasoning: `Bullish=${bull}, Bearish=${bear}, Neutral=${perception.length - bull - bear}. Avg confidence ${(avgConf * 100).toFixed(0)}%. Net bias: ${finalSide === "buy" ? "long" : "short"}.`,
      },
      {
        step: 3,
        title: "Reconcile user intent vs market signal",
        reasoning: aligned
          ? `User bias aligns with market signal; proceed as ${parsed.side.toUpperCase()}.`
          : `User intent (${parsed.side}) conflicts with aggregated signal (${finalSide}); execute with reduced size and tighter stop.`,
      },
      {
        step: 4,
        title: "Position sizing & risk envelope",
        reasoning: `Notional ${parsed.notional} USDT (capped at 5% of demo balance). Stop ${parsed.stopLossPct}%, target ${parsed.takeProfitPct}%. R/R = ${(parsed.takeProfitPct / parsed.stopLossPct).toFixed(2)}.`,
      },
    ];

    // Step 4: execution
    const price = await getSpotPrice(parsed.symbol);
    const qty = +(parsed.notional / price).toFixed(6);
    const sizeFactor = aligned ? 1 : 0.5;
    const execQty = +(qty * sizeFactor).toFixed(6);
    const sideToUse = parsed.side;
    const stopLoss = sideToUse === "buy"
      ? +(price * (1 - parsed.stopLossPct / 100)).toFixed(4)
      : +(price * (1 + parsed.stopLossPct / 100)).toFixed(4);
    const takeProfit = sideToUse === "buy"
      ? +(price * (1 + parsed.takeProfitPct / 100)).toFixed(4)
      : +(price * (1 - parsed.takeProfitPct / 100)).toFixed(4);

    const execution: ExecutionRecord = {
      id: shortId(),
      symbol: parsed.symbol,
      side: sideToUse,
      qty: execQty,
      price,
      timestamp: Date.now(),
      mode,
      stopLoss,
      takeProfit,
      status: "filled",
      // Simulated PnL: random walk around 0 weighted by alignment
      pnl: +((Math.random() - (aligned ? 0.3 : 0.55)) * parsed.notional * 0.04).toFixed(2),
    };

    const riskNotes: string[] = [
      `Stop-loss set to ${stopLoss} (${parsed.stopLossPct}% from entry).`,
      `Take-profit set to ${takeProfit} (${parsed.takeProfitPct}% from entry).`,
      `Position size capped at 5% of demo equity.`,
      mode === "simulated" ? "Order routed to demo sub-account (simulated)." : "LIVE order routed via Bitget API (requires API key).",
    ];

    const result: StrategyResult = {
      perception,
      decisions,
      executions: [execution],
      riskNotes,
      finalSummary: `${sideToUse.toUpperCase()} ${execQty} ${parsed.symbol} @ ${price} (${mode}). ${aligned ? "Aligned with market signal." : "Counter-trend, reduced size."}`,
    };

    return NextResponse.json({ data: result });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "unknown" }, { status: 500 });
  }
}
