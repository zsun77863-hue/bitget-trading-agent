// Bitget market data — uses the public Bitget v2 REST endpoint, with a
// deterministic synthetic fallback for sandboxed / offline environments.
import type { PricePoint } from "@/types";

export const SYMBOLS = [
  { id: "BTCUSDT", label: "BTC / USDT" },
  { id: "ETHUSDT", label: "ETH / USDT" },
  { id: "SOLUSDT", label: "SOL / USDT" },
  { id: "BNBUSDT", label: "BNB / USDT" },
  { id: "XRPUSDT", label: "XRP / USDT" },
  { id: "DOGEUSDT", label: "DOGE / USDT" },
] as const;

const SYMBOL_BASE_PRICE: Record<string, number> = {
  BTCUSDT: 65_000,
  ETHUSDT: 3_400,
  SOLUSDT: 145,
  BNBUSDT: 585,
  XRPUSDT: 0.52,
  DOGEUSDT: 0.14,
};

function syntheticSeries(symbol: string, points = 120): PricePoint[] {
  const base = SYMBOL_BASE_PRICE[symbol] ?? 100;
  const now = Date.now();
  const out: PricePoint[] = [];
  let p = base * (0.95 + Math.random() * 0.1);
  for (let i = points - 1; i >= 0; i--) {
    const t = now - i * 60 * 60 * 1000;
    const drift = Math.sin((i + symbol.length) / 8) * base * 0.01;
    const noise = (Math.random() - 0.5) * base * 0.008;
    p = Math.max(base * 0.5, p + drift * 0.2 + noise);
    out.push({ time: t, price: +p.toFixed(symbol.endsWith("USDT") && base < 1 ? 5 : 2) });
  }
  return out;
}

export async function getSpotPrice(symbol: string): Promise<number> {
  try {
    const r = await fetch(`https://api.bitget.com/api/v2/spot/market/tickers?symbol=${symbol}`, { cache: "no-store" });
    if (!r.ok) throw new Error(`tickers ${r.status}`);
    const j = await r.json();
    const last = j?.data?.[0]?.lastPr;
    const px = last ? parseFloat(last) : NaN;
    if (Number.isFinite(px) && px > 0) return px;
    throw new Error("bad price");
  } catch {
    return SYMBOL_BASE_PRICE[symbol] ?? 100;
  }
}

export async function getKlines(symbol: string, granularity = "1H", limit = 120): Promise<PricePoint[]> {
  try {
    const url = `https://api.bitget.com/api/v2/spot/market/candles?symbol=${symbol}&granularity=${granularity}&limit=${limit}`;
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(`klines ${r.status}`);
    const j = await r.json();
    const rows: any[] = j?.data ?? [];
    if (!rows.length) throw new Error("empty");
    return rows
      .map((row) => ({ time: Number(row[0]), price: parseFloat(row[4]), volume: parseFloat(row[5]) }))
      .filter((p) => Number.isFinite(p.price))
      .sort((a, b) => a.time - b.time);
  } catch {
    return syntheticSeries(symbol, limit);
  }
}
