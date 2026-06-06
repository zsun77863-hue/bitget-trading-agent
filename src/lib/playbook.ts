// Playbook integration — converts natural language into a structured strategy
// using the Bitget Playbook endpoint. Falls back to a heuristic local parser
// when no API key is configured.
export interface ParsedStrategy {
  symbol: string;
  side: "buy" | "sell";
  notional: number; // USDT
  takeProfitPct: number;
  stopLossPct: number;
  reason: string;
  raw: string;
}

const SYMBOL_HINTS: Array<[RegExp, string]> = [
  [/btc|bitcoin|比特币/i, "BTCUSDT"],
  [/eth|ether|以太/i, "ETHUSDT"],
  [/sol|solana|索拉纳/i, "SOLUSDT"],
  [/bnb/i, "BNBUSDT"],
  [/xrp|ripple/i, "XRPUSDT"],
  [/doge|狗狗/i, "DOGEUSDT"],
];

function heuristicParse(prompt: string): ParsedStrategy {
  const lower = prompt.toLowerCase();
  let symbol = "BTCUSDT";
  for (const [re, sym] of SYMBOL_HINTS) if (re.test(lower)) { symbol = sym; break; }
  const sellWords = /sell|short|空|做空|卖出/i;
  const side: "buy" | "sell" = sellWords.test(lower) ? "sell" : "buy";
  const notionalMatch = lower.match(/(\$|usdt?\s*)?(\d{2,7})\s*(usdt|u|美元)?/i);
  const notional = notionalMatch ? Math.min(50_000, Math.max(50, parseInt(notionalMatch[2], 10))) : 500;
  const tpMatch = lower.match(/(?:tp|take[\s-]?profit|止盈)\s*[:=]?\s*(\d{1,2}(?:\.\d)?)%?/i);
  const slMatch = lower.match(/(?:sl|stop[\s-]?loss|止损)\s*[:=]?\s*(\d{1,2}(?:\.\d)?)%?/i);
  return {
    symbol,
    side,
    notional,
    takeProfitPct: tpMatch ? parseFloat(tpMatch[1]) : 5,
    stopLossPct: slMatch ? parseFloat(slMatch[1]) : 2.5,
    reason: side === "buy" ? "Bullish bias detected in prompt" : "Bearish bias detected in prompt",
    raw: prompt,
  };
}

export async function callPlaybook(prompt: string, apiKey: string | undefined): Promise<ParsedStrategy> {
  if (!apiKey) return heuristicParse(prompt);
  try {
    const base = process.env.AGENT_HUB_BASE_URL || "https://api.bitget.com";
    const res = await fetch(`${base}/v1/playbook/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Playbook-Key": apiKey },
      body: JSON.stringify({ prompt }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`playbook ${res.status}`);
    const j = (await res.json()) as Partial<ParsedStrategy>;
    const h = heuristicParse(prompt);
    return { ...h, ...j, raw: prompt };
  } catch {
    return heuristicParse(prompt);
  }
}
